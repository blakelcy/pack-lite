// src/lib/stores/listStore.ts
import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

// Types
interface List {
	id: string;
	name: string;
	total_weight: number;
	item_count: number;
	created_at: string;
	updated_at: string;
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

	return {
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

		updateListName: async (id: string, name: string) => {
			update((state) => ({ ...state, loading: true, error: null }));

			const { data, error } = await supabase
				.from('lists')
				.update({ name })
				.eq('id', id)
				.select()
				.single();

			if (error) {
				update((state) => ({ ...state, error, loading: false }));
				throw error;
			}

			// Update both the single list and the list in the lists array if it exists
			update((state) => ({
				...state,
				list: data,
				lists: state.lists.map((l) => (l.id === id ? { ...l, name } : l)),
				error: null,
				loading: false
			}));

			return data;
		},

		getList: async (id: string) => {
			update((state) => ({ ...state, loading: true, error: null }));

			const { data, error } = await supabase.from('lists').select().eq('id', id).single();

			if (error) {
				update((state) => ({ ...state, error, loading: false }));
				throw error;
			}

			update((state) => ({
				list: data,
				error: null,
				loading: false
			}));
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
}

export const listStore = createListStore();
