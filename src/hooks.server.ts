// hooks.server.ts
import { redirect, type Handle } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase';
import type { Session } from '@supabase/supabase-js';

// Define constants at the top for better maintainability
const PUBLIC_ROUTES = ['/auth/session', '/login', '/auth/callback'] as const;
const PROTECTED_ROUTES = ['/app', '/app/lists'] as const;

// Cookie configuration for consistency
const COOKIE_CONFIG = {
	path: '/',
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax',
	maxAge: 60 * 60 * 24 * 7 // 1 week
} as const;

async function handleSession(event: Parameters<Handle>[0]['event']): Promise<Session | null> {
	const accessToken = event.cookies.get('sb-access-token');
	const refreshToken = event.cookies.get('sb-refresh-token');

	if (!accessToken || !refreshToken) return null;

	try {
		const {
			data: { session },
			error
		} = await supabaseServer.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});

		if (error) throw error;

		// Update tokens if they've changed
		if (session) {
			if (session.access_token !== accessToken) {
				event.cookies.set('sb-access-token', session.access_token, COOKIE_CONFIG);
			}
			if (session.refresh_token !== refreshToken) {
				event.cookies.set('sb-refresh-token', session.refresh_token, COOKIE_CONFIG);
			}
			return session;
		} else {
			throw new Error('Session is null');
		}
	} catch (error) {
		console.error('Session error:', error);
		event.cookies.delete('sb-access-token', { path: '/' });
		event.cookies.delete('sb-refresh-token', { path: '/' });
		return null;
	}
}

function shouldSkipAuth(pathname: string): boolean {
	return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export const handle: Handle = async ({ event, resolve }) => {
	try {
		const { url, cookies } = event;

		// Add these debug logs here
		console.log('Hook running for path:', url.pathname);
		console.log('Is guest route:', url.pathname.startsWith('/guest'));
		console.log('Is guest session:', cookies.get('guest-session') === 'true');

		// Skip auth for public routes
		if (shouldSkipAuth(url.pathname)) {
			return resolve(event);
		}

		// Handle guest and auth session states
		const isGuestRoute = url.pathname.startsWith('/guest');
		const isGuestSession = cookies.get('guest-session') === 'true';
		const session = await handleSession(event);

		// Set locals
		event.locals = {
			session,
			supabase: supabaseServer,
			isGuest: isGuestSession,
			getSession: async () => session,
			getCurrentUser: async () => session?.user ?? null
		};

		// If logged in but no profile, redirect to onboarding
		// Skip this check for the onboarding page itself and public routes
		if (session?.user && !url.pathname.startsWith('/onboarding')) {
			const { data: profile } = await supabaseServer
				.from('profiles')
				.select('packing_focus')
				.eq('id', session.user.id)
				.single();

			if (!profile) {
				throw redirect(303, '/onboarding');
			}
		}

		// Root route redirection
		if (url.pathname === '/') {
			throw redirect(303, session ? '/app' : '/login');
		}

		// Route protection logic
		if (session) {
			if (isGuestRoute) {
				throw redirect(303, '/app');
			}
		} else if (!isGuestRoute && !isGuestSession) {
			if (isProtectedRoute(url.pathname)) {
				throw redirect(303, '/login');
			}
		}

		// Handle guest session
		if (isGuestRoute && !isGuestSession) {
			cookies.set('guest-session', 'true', {
				path: '/',
				maxAge: 60 * 60 * 24 // 24 hours
			});
		}

		const response = await resolve(event);

		// You could add response headers here if needed
		// response.headers.set('x-custom-header', 'value');

		return response;
	} catch (error) {
		if (error instanceof Response) {
			return error;
		}
		console.error('Hook error:', error);
		throw error;
	}
};
