import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ListItem } from '$lib/types/lists'; // Add this import

// src/routes/app/lists/[id]/+page.server.ts
export const load = (async ({ params, locals }) => {
	const { supabase } = locals;

	try {
		// Get the list
		const { data: list, error: listError } = await supabase
			.from('lists')
			.select('*')
			.eq('id', params.id)
			.single();

		if (listError) throw listError;
		if (!list) throw error(404, 'List not found');

		// Get the list items with joined items and categories
		const { data: listItems, error: itemsError } = await supabase
			.from('list_items')
			.select(
				`
                item_id,
                list_id,
                worn,
                consumable,
                quantity,
                items (
                    id,
                    name,
                    description,
                    weight,
                    price,
                    category_id,
                    image_url,
                    url,
                    created_at,
                    categories:categories (
                        id,
                        name
                    )
                )
            `
			)
			.eq('list_id', params.id);

		if (itemsError) throw itemsError;

		// Transform the data to flatten the item properties
		const transformedItems = (listItems || []).map((listItem) => ({
			id: listItem.item_id, // Keep the original item id
			list_id: listItem.list_id, // Add list_id
			name: listItem.items.name,
			description: listItem.items.description,
			weight: listItem.items.weight,
			price: listItem.items.price,
			category: listItem.items?.categories?.name || 'Uncategorized',
			image_url: listItem.items.image_url,
			link: listItem.items.url,
			created_at: listItem.items.created_at,
			worn: listItem.worn || false,
			consumable: listItem.consumable || false,
			quantity: listItem.quantity || 1
		})) satisfies ListItem[];

		return {
			list,
			listItems: transformedItems
		};
	} catch (err) {
		console.error('Error loading list:', err);
		throw error(500, 'Error loading list');
	}
}) satisfies PageServerLoad;
