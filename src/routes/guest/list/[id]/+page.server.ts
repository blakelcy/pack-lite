import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	// Check if we're in guest mode
	const isGuest = cookies.get('guest-session') === 'true';
	if (!isGuest) {
		throw redirect(303, '/login');
	}

	return {
		listId: params.id
	};
};
