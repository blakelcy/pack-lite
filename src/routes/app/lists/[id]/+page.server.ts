import type { PageServerLoad } from './$types';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { Database } from '$lib/database.types';

type List = Database['public']['Tables']['lists']['Row'];
type Item = Database['public']['Tables']['items']['Row'];
type ListItem = Database['public']['Tables']['list_items']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const { supabase, session } = locals;

	if (!session) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Fetch the list with basic details
		const { data: list, error: listError } = await supabase
			.from('lists')
			.select('*')
			.eq('id', id)
			.eq('user_id', session.user.id)
			.single();

		if (listError || !list) {
			throw error(404, 'List not found');
		}

		// Fetch list items with their full details and category information
		const { data: listItemsWithDetails, error: itemsError } = await supabase
			.from('list_items')
			.select(
				`
                id,
                quantity,
                worn,
                consumable,
                items:item_id (
                    id,
                    name,
                    description,
                    weight,
                    weight_unit,
                    price,
                    image_url,
                    url,
                    category_id,
                    categories:category_id (
                        id,
                        name
                    )
                )
            `
			)
			.eq('list_id', id)
			.order('created_at', { ascending: false });

		if (itemsError) {
			console.error('Error fetching list items:', itemsError);
			throw error(500, 'Failed to load list items');
		}

		// Fetch all available categories for the user
		// These can be used when adding/editing items
		const { data: categories, error: categoriesError } = await supabase
			.from('categories')
			.select('*')
			.eq('user_id', session.user.id)
			.order('name', { ascending: true });

		if (categoriesError) {
			console.error('Error fetching categories:', categoriesError);
			throw error(500, 'Failed to load categories');
		}

		// Process items to include full details and handle missing data
		const processedItems =
			listItemsWithDetails?.map((listItem) => ({
				...listItem,
				item: listItem.items
					? {
							...listItem.items,
							weight: listItem.items.weight || 0,
							weight_unit: listItem.items.weight_unit || 'oz',
							price: listItem.items.price || 0,
							category: listItem.items.categories || null
						}
					: null
			})) || [];

		// Calculate totals
		const totalWeight = processedItems.reduce((sum, item) => {
			return sum + (item.item?.weight || 0);
		}, 0);

		return {
			list: {
				...list,
				total_weight: totalWeight,
				item_count: processedItems.length
			},
			listItems: processedItems,
			categories: categories || [], // All available categories for the user
			initialLoadTime: new Date().toISOString()
		};
	} catch (err) {
		console.error('Error in list detail load:', err);
		throw error(500, {
			message: 'Failed to load list details',
			code: err instanceof Error ? err.message : 'UNKNOWN_ERROR'
		});
	}
}) satisfies PageServerLoad;

export const actions = {
	// Update list name
	updateName: async ({ request, locals, params }) => {
		const { session, supabase } = locals;
		const { id } = params;

		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString();

		if (!name) {
			return fail(400, { error: 'Name is required' });
		}

		try {
			const { error: updateError } = await supabase
				.from('lists')
				.update({ name })
				.eq('id', id)
				.eq('user_id', session.user.id);

			if (updateError) throw updateError;

			return { success: true };
		} catch (err) {
			console.error('Error updating list name:', err);
			return fail(500, {
				error: 'Failed to update list name',
				details: err instanceof Error ? err.message : 'Unknown error'
			});
		}
	},

	addItem: async ({ request, locals, params }) => {
		console.log('Server addItem action started');
		const { session, supabase } = locals;
		const { id: listId } = params;

		if (!session) {
			console.log('No session found');
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();
			console.log('Received form data:', Object.fromEntries(formData));
			const itemData = {
				name: formData.get('name')?.toString(),
				description: formData.get('description')?.toString() || null,
				weight: parseFloat(formData.get('weight')?.toString() || '0'),
				weight_unit: formData.get('weight_unit')?.toString() || 'oz',
				price: parseFloat(formData.get('price')?.toString() || '0'),
				image_url: formData.get('image_url')?.toString() || null,
				url: formData.get('url')?.toString() || null
			};

			const worn = formData.get('worn') === 'true';
			const consumable = formData.get('consumable') === 'true';

			if (!itemData.name) {
				return fail(400, { error: 'Item name is required' });
			}

			// Call our new function
			const { data, error } = await supabase.rpc('add_item_to_list', {
				p_list_id: listId,
				p_user_id: session.user.id,
				p_item_data: itemData,
				p_worn: worn,
				p_consumable: consumable
			});

			if (error) {
				console.error('Error in add_item_to_list:', error);
				throw error;
			}

			return {
				success: true,
				data: { item: data }
			};
		} catch (err) {
			console.error('Error adding item:', err);
			return fail(500, {
				error: 'Failed to add item',
				details: err instanceof Error ? err.message : 'Unknown error'
			});
		}
	},

	// Remove item from list
	removeItem: async ({ request, locals, params }) => {
		const { session, supabase } = locals;
		const { id: listId } = params;

		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const listItemId = formData.get('listItemId')?.toString();

		if (!listItemId) {
			return fail(400, { error: 'List item ID is required' });
		}

		try {
			// Verify the list item belongs to this list and user
			const { data: listItem, error: verifyError } = await supabase
				.from('list_items')
				.select('id')
				.eq('id', listItemId)
				.eq('list_id', listId)
				.single();

			if (verifyError || !listItem) {
				return fail(404, { error: 'List item not found' });
			}

			// Remove the item from the list
			const { error: removeError } = await supabase
				.from('list_items')
				.delete()
				.eq('id', listItemId);

			if (removeError) throw removeError;

			// Trigger recount of list items
			await supabase.rpc('recalculate_all_list_counts');

			return { success: true };
		} catch (err) {
			console.error('Error removing item:', err);
			return fail(500, {
				error: 'Failed to remove item',
				details: err instanceof Error ? err.message : 'Unknown error'
			});
		}
	},

	// Update item quantities and properties in list
	updateListItem: async ({ request, locals, params }) => {
		const { session, supabase } = locals;
		const { id: listId } = params;

		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();
			const listItemId = formData.get('listItemId')?.toString();
			const itemId = formData.get('itemId')?.toString();

			if (!listItemId || !itemId) {
				return fail(400, { error: 'List item ID and Item ID are required' });
			}

			// List-specific properties
			const listItemData = {
				quantity: parseInt(formData.get('quantity')?.toString() || '1', 10),
				worn: formData.get('worn') === 'true',
				consumable: formData.get('consumable') === 'true'
			};

			// Core item properties
			const itemData = {
				name: formData.get('name')?.toString(),
				description: formData.get('description')?.toString() || null,
				weight: parseFloat(formData.get('weight')?.toString() || '0'),
				weight_unit: formData.get('weight_unit')?.toString() || 'oz',
				price: parseFloat(formData.get('price')?.toString() || '0'),
				url: formData.get('url')?.toString() || null,
				image_url: formData.get('image_url')?.toString() || null,
				updated_at: new Date().toISOString()
			};

			// Verify ownership and update both in a transaction
			const { data, error } = await supabase.rpc('update_list_item_and_details', {
				p_list_item_id: listItemId,
				p_item_id: itemId,
				p_user_id: session.user.id,
				p_list_item_data: listItemData,
				p_item_data: itemData
			});

			if (error) throw error;

			// Trigger recount of list items
			await supabase.rpc('recalculate_all_list_counts');

			return {
				success: true,
				data: { item: data }
			};
		} catch (err) {
			console.error('Error updating item:', err);
			return fail(500, {
				error: 'Failed to update item',
				details: err instanceof Error ? err.message : 'Unknown error'
			});
		}
	},

	deleteList: async ({ request, locals, params }) => {
		const { session, supabase } = locals;
		const { id } = params;

		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const listId = formData.get('listId')?.toString();

		if (!listId || listId !== id) {
			return fail(400, { error: 'Invalid list ID' });
		}

		try {
			// First verify the list belongs to the user
			const { data: existingList, error: checkError } = await supabase
				.from('lists')
				.select('id')
				.eq('id', listId)
				.eq('user_id', session.user.id)
				.single();

			if (checkError || !existingList) {
				return fail(404, { error: 'List not found or access denied' });
			}

			// Delete related list items first
			const { error: listItemsError } = await supabase
				.from('list_items')
				.delete()
				.eq('list_id', listId);

			if (listItemsError) throw listItemsError;

			// Then delete the list
			const { error: deleteError } = await supabase
				.from('lists')
				.delete()
				.eq('id', listId)
				.eq('user_id', session.user.id);

			if (deleteError) throw deleteError;

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
