import { writable, derived, type Readable } from 'svelte/store';
import type { PostgrestError } from '@supabase/supabase-js';
import type { GearList, Item, ListItem } from '$lib/types/lists';
import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';

// Define base types from Database
type DBItem = Database['public']['Tables']['items']['Row'];
type DBList = Database['public']['Tables']['lists']['Row'];
type DBListItem = Database['public']['Tables']['list_items']['Row'];
type DBCategory = Database['public']['Tables']['categories']['Row'];

// Define the exact shape of the Supabase response
// interface ListItemResponse {
// 	item_id: string;
// 	list_id: string;
// 	worn: boolean | null;
// 	consumable: boolean | null;
// 	quantity: number | null;
// 	items: {
// 		id: string;
// 		name: string;
// 		description: string | null;
// 		weight: number | null;
// 		price: number | null;
// 		category_id: string | null;
// 		image_url: string | null;
// 		url: string | null;
// 		created_at: string;
// 		categories: {
// 			id: string;
// 			name: string;
// 		} | null;
// 	};
// }

// Export the ListItem type that includes nested data
export type ListItemWithDetails = DBListItem & {
	items:
		| (DBItem & {
				categories?: DBCategory | null;
		  })
		| null;
};

// Export the grouped items type
export type GroupedItems = {
	[key: string]: ListItemWithDetails[];
};

interface ListState {
	activeListId: string | null;
	lists: Map<string, GearList>;
	listItems: Map<string, ListItem[]>;
	loading: {
		lists: boolean;
		items: boolean;
	};
	error: PostgrestError | null;
}

interface ListItemInsert {
	worn: boolean;
	consumable: boolean;
	quantity: number;
}

interface ListStore extends Readable<ListState> {
	activeList: Readable<DBList | null>;
	activeListItems: Readable<ListItemWithDetails[]>;
	setActiveList: (listId: string) => Promise<void>;
	loadListDetails: (listId: string) => Promise<void>;
	fetchUserLists: () => Promise<void>;
	addItemToList: (listId: string, item: DBItem, listItemData: ListItemInsert) => Promise<void>;
	updateListData: (listId: string, data: { name?: string; items?: ListItemWithDetails[] }) => void;
	reset: () => void;
}

function createListStore(): ListStore {
	const { subscribe, set, update } = writable<ListState>({
		activeListId: null,
		lists: new Map(),
		listItems: new Map(),
		loading: {
			lists: false,
			items: false
		},
		error: null
	});

	const activeList = derived<Readable<ListState>, GearList | null>({ subscribe }, ($state) => {
		if (!$state.activeListId) return null;
		const list = $state.lists.get($state.activeListId);
		return list || null;
	});

	const activeListItems = derived<Readable<ListState>, ListItem[]>({ subscribe }, ($state) => {
		if (!$state.activeListId) return [];
		return $state.listItems.get($state.activeListId) || [];
	});

	// Define async functions outside return
	async function setActiveList(listId: string) {
		update((state) => ({ ...state, activeListId: listId }));
		await loadListDetails(listId);
	}

	async function loadListDetails(listId: string) {
		update((state) => ({
			...state,
			loading: { ...state.loading, items: true },
			error: null
		}));

		try {
			const [listResponse, itemsResponse] = await Promise.all([
				supabase.from('lists').select('*').eq('id', listId).single(),
				supabase
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
					.eq('list_id', listId)
			]);

			console.log('List Response:', listResponse);
			console.log('Items Response:', itemsResponse);

			if (listResponse.error) throw listResponse.error;
			if (itemsResponse.error) throw itemsResponse.error;

			const listItems = itemsResponse.data as unknown as ListItemWithDetails[];

			update((state) => {
				const newLists = new Map(state.lists);
				const newListItems = new Map(state.listItems);

				newLists.set(listId, listResponse.data);
				newListItems.set(listId, listItems);

				return {
					...state,
					lists: newLists,
					listItems: newListItems,
					loading: { ...state.loading, items: false },
					error: null
				};
			});
		} catch (error) {
			console.error('Error loading list details:', error);
			update((state) => ({
				...state,
				loading: { ...state.loading, items: false },
				error: error as PostgrestError
			}));
		}
	}

	async function fetchUserLists() {
		update((state) => ({
			...state,
			loading: { ...state.loading, lists: true },
			error: null
		}));

		try {
			const { data: lists, error } = await supabase
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
				.order('created_at', { ascending: false });

			if (error) throw error;

			update((state) => ({
				...state,
				lists: new Map(lists.map((list) => [list.id, list])),
				loading: { ...state.loading, lists: false }
			}));
		} catch (error) {
			console.error('Error fetching lists:', error);
			update((state) => ({
				...state,
				loading: { ...state.loading, lists: false },
				error: error as PostgrestError
			}));
		}
	}

	async function addItemToList(listId: string, item: Item, listItemData: ListItemInsert) {
		update((state) => ({
			...state,
			loading: { ...state.loading, items: true },
			error: null
		}));

		try {
			// Create the list_items association
			const { error: listItemError } = await supabase.from('list_items').insert({
				list_id: listId,
				item_id: item.id,
				worn: listItemData.worn,
				consumable: listItemData.consumable,
				quantity: listItemData.quantity
			});

			if (listItemError) throw listItemError;

			// Trigger a recount of list items
			await supabase.rpc('recalculate_list_counts', { list_id: listId });

			// Reload the list details to get updated counts and items
			await loadListDetails(listId);
		} catch (error) {
			console.error('Error adding item to list:', error);
			update((state) => ({
				...state,
				loading: { ...state.loading, items: false },
				error: error as PostgrestError
			}));
		}
	}

	function updateListData(listId: string, data: { name?: string; items?: ListItem[] }) {
		update((state) => {
			const newLists = new Map(state.lists);
			const newListItems = new Map(state.listItems);

			if (data.name && newLists.has(listId)) {
				const list = newLists.get(listId)!;
				newLists.set(listId, { ...list, name: data.name });
			}

			if (data.items) {
				newListItems.set(listId, data.items);
			}

			return {
				...state,
				lists: newLists,
				listItems: newListItems
			};
		});
	}

	function reset() {
		set({
			activeListId: null,
			lists: new Map(),
			listItems: new Map(),
			loading: { lists: false, items: false },
			error: null
		});
	}

	// Return store methods and subscriptions
	return {
		subscribe,
		activeList,
		activeListItems,
		setActiveList,
		loadListDetails,
		fetchUserLists,
		addItemToList,
		updateListData,
		reset
	};
}

export const listStore = createListStore();
