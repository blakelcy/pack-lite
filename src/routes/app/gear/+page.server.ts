import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Database } from '$lib/database.types';

type Item = Database['public']['Tables']['items']['Row'];

export const load = (async ({ locals }) => {
	const { supabase, session } = locals;

	if (!session) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Fetch items with their category information
		const { data: items, error: itemsError } = await supabase
			.from('items')
			.select(
				`
                *,
                categories:category_id (
                    id,
                    name
                )
            `
			)
			.eq('user_id', session.user.id)
			.order('created_at', { ascending: false });

		if (itemsError) {
			console.error('Error fetching items:', itemsError);
			throw error(500, 'Failed to load items');
		}

		return {
			items: items || []
		};
	} catch (err) {
		console.error('Error in gear page load:', err);
		throw error(500, {
			message: 'Failed to load gear',
			code: err instanceof Error ? err.message : 'UNKNOWN_ERROR'
		});
	}
}) satisfies PageServerLoad;
