import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ListItem } from '$lib/types/lists';

export const load = (async ({ params, locals }) => {
	const { supabase } = locals;
	console.log('Loading list with ID:', params.id);

	try {
		// Get the list
		const { data: list, error: listError } = await supabase
			.from('lists')
			.select('*')
			.eq('id', params.id)
			.single();

		console.log('List data:', list);
		if (listError) throw listError;
		if (!list) throw error(404, 'List not found');

		// Initial list items load - match the store's query structure
		const { data: listItems, error: itemsError } = await supabase
			.from('list_items')
			.select(
				`
                item_id,
                list_id,
                worn,
                consumable,
                quantity,
                items!inner (
                    id,
                    name,
                    description,
                    weight,
                    price,
                    category_id,
                    image_url,
                    url,
                    created_at,
                    categories (
                        id,
                        name
                    )
                )
            `
			)
			.eq('list_id', params.id);

		console.log('List items data:', listItems);
		if (itemsError) throw itemsError;

		// Transform the data to match your ListItem type
		const transformedItems = (listItems || []).map((item) => ({
			id: item.item_id,
			list_id: item.list_id,
			name: item.items.name,
			description: item.items.description || undefined,
			weight: item.items.weight || 0,
			price: item.items.price || undefined,
			category: item.items.categories?.name || 'Uncategorized',
			image_url: item.items.image_url || undefined,
			link: item.items.url || undefined,
			created_at: item.items.created_at,
			worn: item.worn || false,
			consumable: item.consumable || false,
			quantity: item.quantity || 1
		})) as ListItem[];

		console.log('Transformed items:', transformedItems);

		// Return the data
		return {
			list,
			listItems: transformedItems
		};
	} catch (err) {
		console.error('Error loading list:', err);
		throw error(500, 'Error loading list');
	}
}) satisfies PageServerLoad;
