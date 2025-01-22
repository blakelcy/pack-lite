// routes/app/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Check for authentication
	if (!locals.session) {
		throw redirect(303, '/login');
	}

	// Get user's profile and theme
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('packing_focus, unlocked_themes')
		.eq('id', locals.session.user.id)
		.single();

	// Get theme background image
	const { data: theme } = await locals.supabase
		.from('themes')
		.select('*')
		.eq('id', profile?.packing_focus || 'default')
		.single();

	return {
		session: locals.session,
		user: locals.session.user,
		theme: {
			active: profile?.packing_focus || 'default',
			background: theme?.background_image || '/images/background4.jpg',
			unlocked: profile?.unlocked_themes || ['default']
		}
	};
};
