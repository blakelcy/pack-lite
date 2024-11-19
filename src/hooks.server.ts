// hooks.server.ts
import { redirect, type Handle } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		// Always exclude these routes from any processing
		const publicRoutes = ['/auth/session', '/login', '/auth/callback'];
		if (publicRoutes.some((route) => event.url.pathname.startsWith(route))) {
			return resolve(event);
		}

		// Guest route handling
		const isGuestRoute = event.url.pathname.startsWith('/guest');
		const isGuestSession = event.cookies.get('guest-session') === 'true';

		// Token handling for authenticated users
		const accessToken = event.cookies.get('sb-access-token');
		const refreshToken = event.cookies.get('sb-refresh-token');

		let session = null;

		if (accessToken && refreshToken) {
			try {
				const {
					data: { session: newSession },
					error: sessionError
				} = await supabaseServer.auth.setSession({
					access_token: accessToken,
					refresh_token: refreshToken
				});

				if (sessionError) {
					console.error('Session refresh error:', sessionError);
					// Clear invalid tokens
					event.cookies.delete('sb-access-token', { path: '/' });
					event.cookies.delete('sb-refresh-token', { path: '/' });
				} else {
					session = newSession;

					// Update cookies with new tokens if they're different
					if (newSession?.access_token !== accessToken) {
						event.cookies.set('sb-access-token', newSession.access_token, {
							path: '/',
							httpOnly: true,
							secure: process.env.NODE_ENV === 'production',
							sameSite: 'lax',
							maxAge: 60 * 60 * 24 * 7 // 1 week
						});
					}

					if (newSession?.refresh_token !== refreshToken) {
						event.cookies.set('sb-refresh-token', newSession.refresh_token, {
							path: '/',
							httpOnly: true,
							secure: process.env.NODE_ENV === 'production',
							sameSite: 'lax',
							maxAge: 60 * 60 * 24 * 7 // 1 week
						});
					}
				}
			} catch (error) {
				console.error('Session validation error:', error);
				// Clear invalid tokens
				event.cookies.delete('sb-access-token', { path: '/' });
				event.cookies.delete('sb-refresh-token', { path: '/' });
			}
		}

		event.locals.session = session;
		event.locals.supabase = supabaseServer;

		// Root route handling
		if (event.url.pathname === '/') {
			if (session) {
				throw redirect(303, '/app');
			} else {
				throw redirect(303, '/login');
			}
		}

		// Route protection logic
		if (session) {
			// Authenticated users shouldn't access guest routes
			if (isGuestRoute) {
				throw redirect(303, '/app');
			}
		} else if (!isGuestRoute && !isGuestSession) {
			// Non-authenticated users must use guest routes or be in a guest session
			const protectedRoutes = ['/app', '/app/lists'];
			const isProtectedRoute = protectedRoutes.some((route) =>
				event.url.pathname.startsWith(route)
			);

			if (isProtectedRoute) {
				throw redirect(303, '/login');
			}
		}

		// Handle guest session creation
		if (isGuestRoute && !isGuestSession) {
			event.cookies.set('guest-session', 'true', {
				path: '/',
				maxAge: 60 * 60 * 24 // 24 hours
			});
		}

		return resolve(event);
	} catch (e) {
		console.error('Hook error:', e);
		if (e instanceof Response) {
			return e;
		}
		throw e;
	}
};
