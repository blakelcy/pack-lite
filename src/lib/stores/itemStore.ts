import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';

type Item = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ListItemInsert = Database['public']['Tables']['list_items']['Insert'];

interface ItemStore {
	items: Item[];
	loading: boolean;
	error: string | null;
}

function createItemStore() {
	const { subscribe, set, update } = writable<ItemStore>({
		items: [],
		loading: false,
		error: null
	});

	return {
		subscribe,

		async addItem(itemData: Omit<ItemInsert, 'user_id'>, listId?: string): Promise<Item | null> {
			update((store) => ({ ...store, loading: true, error: null }));

			try {
				// Get the current user
				const {
					data: { user }
				} = await supabase.auth.getUser();
				if (!user) throw new Error('User must be authenticated to create an item');

				// 1. Insert the item into the items table
				const { data: item, error: itemError } = await supabase
					.from('items')
					.insert({
						...itemData,
						user_id: (await supabase.auth.getUser()).data.user?.id,
						weight: itemData.weight,
						weight_unit: itemData.weight_unit
					})
					.select()
					.single();

				if (itemError) throw itemError;
				if (!item) throw new Error('Failed to create item');

				// 2. If a listId is provided, add it to the list
				if (listId) {
					const { error: listItemError } = await supabase.from('list_items').insert({
						item_id: item.id,
						list_id: listId,
						worn: itemData.worn,
						consumable: itemData.consumable,
						quantity: 1
					});

					if (listItemError) throw listItemError;
				}

				// 3. Trigger a recount of list items if needed
				if (listId) {
					await supabase.rpc('recalculate_all_list_counts');
				}

				// 4. Update the store
				update((store) => ({
					...store,
					items: [...store.items, item],
					loading: false
				}));

				return item;
			} catch (error) {
				console.error('Error adding item:', error);
				update((store) => ({
					...store,
					loading: false,
					error: error instanceof Error ? error.message : 'An error occurred'
				}));
				return null;
			}
		},

		// Fetch all items for the current user
		async fetchUserItems() {
			update((store) => ({ ...store, loading: true, error: null }));

			try {
				const { data: items, error } = await supabase
					.from('items')
					.select('*')
					.order('created_at', { ascending: false });

				if (error) throw error;

				update((store) => ({
					...store,
					items: items || [],
					loading: false
				}));
			} catch (error) {
				console.error('Error fetching items:', error);
				update((store) => ({
					...store,
					loading: false,
					error: error instanceof Error ? error.message : 'An error occurred'
				}));
			}
		},

		// Reset the store
		reset() {
			set({ items: [], loading: false, error: null });
		}
	};
}

export const itemStore = createItemStore();
