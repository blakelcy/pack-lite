// src/routes/app/lists/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { supabase, session } = locals;

	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const { data: list, error: listError } = await supabase
		.from('lists')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', session.user.id)
		.single();

	if (listError) {
		throw error(500, 'Error loading list');
	}

	if (!list) {
		throw error(404, 'List not found');
	}

	const { data: listItems = [], error: itemsError } = await supabase
		.from('list_items')
		.select(
			`
            *,
            item:items(*)
        `
		)
		.eq('list_id', params.id);

	if (itemsError) {
		throw error(500, 'Error loading list items');
	}

	return {
		list,
		listItems
	};
};
