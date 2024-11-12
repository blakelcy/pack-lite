import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';

type Item = Database['public']['Tables']['items']['Row'];

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
		async addItem(itemData: Omit<ItemInsert, 'user_id'>, listId?: string): Promise<Item | null> {
			update((store) => ({ ...store, loading: true, error: null }));

			try {
				const { data: userData } = await supabase.auth.getUser();
				if (!userData.user) throw new Error('User not authenticated');

				// Insert the item
				const { data: item, error: itemError } = await supabase
					.from('items')
					.insert({
						...itemData,
						user_id: userData.user.id
					})
					.select()
					.single();

				if (itemError) throw itemError;
				if (!item) throw new Error('Failed to create item');

				// Update the store
				update((store) => ({
					...store,
					items: [item, ...store.items],
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
		updateItems(newItems: Item[]) {
			update((store) => ({
				...store,
				items: newItems
			}));
		},
		// Reset the store
		reset() {
			set({ items: [], loading: false, error: null });
		}
	};
}

export const itemStore = createItemStore();
