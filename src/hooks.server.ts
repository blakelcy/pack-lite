import { redirect, type Handle } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		// Skip auth check for the session endpoint and login page
		if (event.url.pathname === '/auth/session' || event.url.pathname === '/login') {
			return resolve(event);
		}

		const accessToken = event.cookies.get('sb-access-token');
		const refreshToken = event.cookies.get('sb-refresh-token');

		let session = null;

		if (accessToken && refreshToken) {
			try {
				const { data, error: sessionError } = await supabaseServer.auth.setSession({
					access_token: accessToken,
					refresh_token: refreshToken
				});

				if (sessionError) {
					// Clear invalid tokens
					event.cookies.delete('sb-access-token', { path: '/' });
					event.cookies.delete('sb-refresh-token', { path: '/' });
				} else {
					session = data.session;
				}
			} catch (sessionError) {
				console.error('Session error:', sessionError);
				// Clear invalid tokens
				event.cookies.delete('sb-access-token', { path: '/' });
				event.cookies.delete('sb-refresh-token', { path: '/' });
			}
		}

		event.locals.session = session;

		// Protected routes
		const protectedRoutes = ['/dashboard'];
		const isProtectedRoute = protectedRoutes.some((route) => event.url.pathname.startsWith(route));

		if (isProtectedRoute && !session) {
			throw redirect(303, '/login');
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
