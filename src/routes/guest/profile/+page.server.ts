import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check if we're in guest mode
	const isGuest = cookies.get('guest-session') === 'true';
	if (!isGuest) {
		throw redirect(303, '/login');
	}

	return {};
};
