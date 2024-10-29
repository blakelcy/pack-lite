import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ cookies }) => {
	try {
		// Clear cookies
		cookies.delete('sb-access-token', { path: '/' });
		cookies.delete('sb-refresh-token', { path: '/' });

		return json({ success: true });
	} catch (error) {
		console.error('Sign out error:', error);
		return json({ success: false, error: 'Failed to sign out' }, { status: 500 });
	}
};
