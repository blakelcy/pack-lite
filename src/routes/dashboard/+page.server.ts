import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		if (!locals.session?.user) {
			throw redirect(303, '/login');
		}

		return {
			user: locals.session.user
		};
	} catch (e) {
		if (e instanceof Response) {
			throw e;
		}

		console.error('Dashboard load error:', e);
		throw error(500, {
			message: 'Failed to load dashboard'
		});
	}
};
