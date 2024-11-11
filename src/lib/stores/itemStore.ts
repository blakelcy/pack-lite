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
