import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { access_token, refresh_token } = await request.json();

		if (access_token) {
			cookies.set('sb-access-token', access_token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 1 week
			});

			if (refresh_token) {
				cookies.set('sb-refresh-token', refresh_token, {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 7 // 1 week
				});
			}

			return json({ success: true });
		}

		return json({ success: false }, { status: 400 });
	} catch (error) {
		console.error('Session set error:', error);
		return json({ success: false }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	try {
		cookies.delete('sb-access-token', { path: '/' });
		cookies.delete('sb-refresh-token', { path: '/' });
		return json({ success: true });
	} catch (error) {
		console.error('Sign out error:', error);
		return json({ success: false, error: 'Failed to sign out' }, { status: 500 });
	}
};
