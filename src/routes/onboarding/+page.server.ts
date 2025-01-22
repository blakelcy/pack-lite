import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	// Redirect away if user already has a profile
	if (session?.user) {
		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('packing_focus')
			.eq('id', session.user.id)
			.single();

		if (profile) {
			throw redirect(303, '/app');
		}
	} else {
		// No session, redirect to login
		throw redirect(303, '/login');
	}
};

export const actions = {
	default: async ({ request, locals }) => {
		const session = await locals.getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const packingFocus = formData.get('packingFocus')?.toString();

		if (!packingFocus) {
			return fail(400, { message: 'Packing focus is required' });
		}

		try {
			// Create profile
			const { error } = await locals.supabase.from('profiles').insert({
				id: session.user.id,
				packing_focus: packingFocus,
				unlocked_themes: [packingFocus, 'default']
			});

			if (error) {
				console.error('Supabase error:', error);
				return fail(500, { message: 'Failed to create profile' });
			}

			// Success - redirect to app
			throw redirect(303, '/app');
		} catch (error) {
			if (error instanceof Response) {
				// This is our redirect, let it through
				throw error;
			}
			console.error('Profile creation error:', error);
			return fail(500, { message: 'Failed to create profile' });
		}
	}
} satisfies Actions;
