// src/routes/app/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ locals, url }) => {
	// We know session exists because of the hooks protection
	const session = locals.session;
	const searchQuery = url.searchParams.get('q')?.toLowerCase() || '';

	try {
		const { data: lists, error: listsError } = await locals.supabase
			.from('lists')
			.select(
				`
                id,
                name,
                created_at,
                item_count,
                total_weight
            `
			)
			.eq('user_id', session?.user.id)
			.order('created_at', { ascending: false });

		if (listsError) {
			console.error('Database error:', listsError);
			throw error(500, 'Failed to load lists');
		}

		// Handle search on the server side
		const filteredLists =
			searchQuery && lists
				? lists.filter((list) => list.name.toLowerCase().includes(searchQuery))
				: lists;

		return {
			lists: filteredLists || [],
			searchQuery
		};
	} catch (err) {
		console.error('Error loading lists:', err);
		throw error(500, 'Failed to load lists');
	}
}) satisfies PageServerLoad;

export const actions = {
	createList: async ({ locals }) => {
		const session = locals.session;
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const { data: list, error: listError } = await locals.supabase
				.from('lists')
				.insert({
					user_id: session.user.id,
					name: 'New List',
					item_count: 0,
					total_weight: 0
				})
				.select()
				.single();

			if (listError) {
				console.error('List creation error:', listError);
				if (listError.code === '42501') {
					return fail(403, {
						error: 'Permission denied. Please check database permissions.',
						details: listError.message
					});
				}
				return fail(500, {
					error: 'Failed to create list',
					details: listError.message
				});
			}

			return { success: true, list };
		} catch (err) {
			console.error('Error creating list:', err);
			return fail(500, {
				error: 'Failed to create list',
				details: err instanceof Error ? err.message : 'Unknown error'
			});
		}
	},

	deleteList: async ({ request, locals }) => {
		const session = locals.session;
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const listId = formData.get('listId')?.toString();

		if (!listId) {
			return fail(400, { error: 'List ID is required' });
		}

		try {
			// First verify the list belongs to the user
			const { data: existingList, error: checkError } = await locals.supabase
				.from('lists')
				.select('id')
				.eq('id', listId)
				.eq('user_id', session.user.id)
				.single();

			if (checkError || !existingList) {
				return fail(404, { error: 'List not found or access denied' });
			}

			// Proceed with deletion
			const { error: deleteError } = await locals.supabase
				.from('lists')
				.delete()
				.eq('id', listId)
				.eq('user_id', session.user.id);

			if (deleteError) {
				console.error('List deletion error:', deleteError);
				return fail(500, {
					error: 'Failed to delete list',
					details: deleteError.message
				});
			}

			return { success: true };
		} catch (err) {
			console.error('Error deleting list:', err);
			return fail(500, {
				error: 'Failed to delete list',
				details: err instanceof Error ? err.message : 'Unknown error'
			});
		}
	}
} satisfies Actions;
