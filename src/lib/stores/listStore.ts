// src/lib/stores/listStore.ts
import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

// Enhanced Types
type DBList = Database['public']['Tables']['lists']['Row'];
type DBItem = Database['public']['Tables']['items']['Row'];
type DBListItem = Database['public']['Tables']['list_items']['Row'];
// Types

interface ListItem extends DBItem {
	worn: boolean;
	consumable: boolean;
	quantity: number;
	category?: string;
}
interface List extends DBList {
	items?: ListItem[];
}

interface ListState {
	list: List | null;
	error: PostgrestError | null;
	loading: boolean;
	lists: List[];
}

function createListStore() {
	const { subscribe, set, update } = writable<ListState>({
		list: null,
		error: null,
		loading: false,
		lists: [] // Add this
	});

	const store = {
		subscribe,
		createNewList: async () => {
			update((state) => ({ ...state, loading: true, error: null }));

			// Get the current user's ID
			const {
				data: { user }
			} = await supabase.auth.getUser();

			if (!user) {
				const error = new Error('User must be authenticated to create a list');
				update((state) => ({ ...state, error, loading: false }));
				throw error;
			}

			const { data, error } = await supabase
				.from('lists')
				.insert([
					{
						name: 'Enter List Name',
						total_weight: 0,
						item_count: 0,
						user_id: user.id // Include the user_id
					}
				])
				.select()
				.single();

			if (error) {
				update((state) => ({ ...state, error, loading: false }));
				throw error;
			}

			update((state) => ({
				list: data,
				error: null,
				loading: false
			}));

			return data;
		},
		fetchUserLists: async () => {
			update((state) => ({ ...state, loading: true, error: null }));

			const {
				data: { user }
			} = await supabase.auth.getUser();

			if (!user) {
				const error = new Error('User must be authenticated to fetch lists');
				update((state) => ({ ...state, error, loading: false }));
				throw error;
			}

			const { data, error } = await supabase
				.from('lists')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });

			if (error) {
				update((state) => ({ ...state, error, loading: false }));
				throw error;
			}

			update((state) => ({
				...state,
				lists: data,
				error: null,
				loading: false
			}));

			return data;
		},

		updateListItem: async (listId: string, itemId: string, updates: Partial<DBListItem>) => {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const { error } = await supabase
					.from('list_items')
					.update(updates)
					.eq('list_id', listId)
					.eq('item_id', itemId);

				if (error) throw error;

				// Refresh the list to get updated data
				await this.getList(listId);
			} catch (error) {
				update((state) => ({
					...state,
					error: error as PostgrestError,
					loading: false
				}));
				throw error;
			}
		},

		getList: async function (id: string) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const [listResponse, itemsResponse] = await Promise.all([
					supabase.from('lists').select().eq('id', id).single(),
					supabase
						.from('list_items')
						.select(
							`
                    id,  // Make sure to select list_items.id
                    item_id,
                    worn,
                    consumable,
                    quantity,
                    items:items (
                        *,
                        categories:categories (
                            id,
                            name
                        )
                    )
                `
						)
						.eq('list_id', id)
				]);

				if (listResponse.error) throw listResponse.error;
				if (itemsResponse.error) throw itemsResponse.error;

				const transformedItems =
					itemsResponse.data?.map((listItem) => ({
						id: listItem.id, // Use list_item.id instead of item.id
						item_id: listItem.item_id,
						...listItem.items,
						worn: listItem.worn || false,
						consumable: listItem.consumable || false,
						quantity: listItem.quantity || 1,
						category: listItem.items?.categories?.name || 'Uncategorized'
					})) || [];

				const listWithItems = {
					...listResponse.data,
					items: transformedItems
				};

				update((state) => ({
					...state,
					list: listWithItems,
					error: null,
					loading: false
				}));

				return listWithItems;
			} catch (error) {
				update((state) => ({
					...state,
					error: error as PostgrestError,
					loading: false
				}));
				throw error;
			}
		},
		// Add a method to handle new items
		addItemToList: async function (
			listId: string,
			item: DBItem,
			listItemData: Partial<DBListItem>
		) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				// Add the item to list_items
				const { error: listItemError } = await supabase.from('list_items').insert({
					list_id: listId,
					item_id: item.id,
					worn: listItemData.worn || false,
					consumable: listItemData.consumable || false,
					quantity: listItemData.quantity || 1
				});

				if (listItemError) throw listItemError;

				// Refresh list data
				await this.getList(listId);

				// Update counts using your database function
				await supabase.rpc('recalculate_all_list_counts');
			} catch (error) {
				update((state) => ({
					...state,
					error: error as PostgrestError,
					loading: false
				}));
				throw error;
			}
		},
		removeItemFromList: async (listId: string, itemId: string) => {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const { error } = await supabase
					.from('list_items')
					.delete()
					.eq('list_id', listId)
					.eq('item_id', itemId);

				if (error) throw error;

				// Refresh the list to get updated data
				await this.getList(listId);
			} catch (error) {
				update((state) => ({
					...state,
					error: error as PostgrestError,
					loading: false
				}));
				throw error;
			}
		},

		deleteList: async (id: string) => {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				// Delete the list
				const { error } = await supabase.from('lists').delete().eq('id', id);

				if (error) throw error;

				// Get updated lists after deletion
				const {
					data: { user }
				} = await supabase.auth.getUser();

				if (!user) throw new Error('User must be authenticated');

				const { data: updatedLists, error: listsError } = await supabase
					.from('lists')
					.select('*')
					.eq('user_id', user.id)
					.order('created_at', { ascending: false });

				if (listsError) throw listsError;

				update((state) => ({
					list: null,
					lists: updatedLists || [],
					error: null,
					loading: false
				}));
			} catch (error) {
				update((state) => ({ ...state, error, loading: false }));
				throw error;
			}
		},
		reset: () => {
			set({
				list: null,
				error: null,
				loading: false,
				lists: [] // Make sure to reset lists as well
			});
		}
	};
	return store;
}

export const listStore = createListStore();
