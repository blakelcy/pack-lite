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
type ListItemResponse = {
	id: string;
	quantity: number | null;
	worn: boolean | null;
	consumable: boolean | null;
	item_id: string;
	list_id: string;
	created_at: string | null;
	updated_at: string | null;
	items: {
		id: string;
		name: string;
		description: string | null;
		weight: number | null;
		weight_unit: string | null;
		price: number | null;
		image_url: string | null;
		url: string | null;
		category_id: string | null;
		categories?: {
			id: string;
			name: string;
		} | null;
	} | null;
};

// Export the ListItem type that includes nested data
export type ListItemWithDetails = DBListItem & {
	items:
		| (DBItem & {
				categories?: DBCategory | null;
		  })
		| null;
};

export type ActiveListItems = Readable<ListItemWithDetails[]>;

// Export the grouped items type
export type GroupedItems = {
	[key: string]: ListItemWithDetails[];
};

interface ListState {
	activeListId: string | null;
	lists: Map<string, DBList>;
	listItems: Map<string, ListItemWithDetails[]>;
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
	updateListData: (
		listId: string,
		data: {
			name?: string;
			items?: ListItemWithDetails[];
		}
	) => void;
	initializeWithData: (list: DBList, items: ListItemWithDetails[]) => void; // Add this line
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
	let initialized = false;

	const activeList = derived<Readable<ListState>, DBList | null>({ subscribe }, ($state) => {
		if (!$state.activeListId) return null;
		const list = $state.lists.get($state.activeListId);
		return list || null;
	});

	const activeListItems = derived<Readable<ListState>, ListItemWithDetails[]>(
		{ subscribe },
		($state) => {
			console.log('Deriving activeListItems, state:', $state);
			if (!$state?.activeListId) return [];
			const items = $state.listItems.get($state.activeListId);
			console.log('Found items:', items);
			return items || [];
		}
	);

	// Define async functions outside return
	async function setActiveList(listId: string) {
		update((state) => ({ ...state, activeListId: listId }));

		// Only fetch if we haven't initialized OR if the data is old
		if (!initialized || needsRefresh(listId)) {
			await loadListDetails(listId);
		}
	}

	async function loadListDetails(listId: string) {
		console.log('Loading list details for:', listId);
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
                    id,
                    quantity,
                    worn,
                    consumable,
                    item_id,
                    list_id,
                    created_at,
                    updated_at,
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
                        categories (
                            id,
                            name
                        )
                    )
                `
					)
					.eq('list_id', listId)
					.order('created_at', { ascending: false })
			]);

			if (listResponse.error) throw listResponse.error;
			if (itemsResponse.error) throw itemsResponse.error;

			console.log('List items response:', itemsResponse.data);

			// Transform the response data to match our types
			const transformedItems = (itemsResponse.data as ListItemResponse[]).map((item) => ({
				...item,
				items: item.items
					? {
							...item.items,
							categories: item.items.categories || null
						}
					: null
			})) as ListItemWithDetails[];

			console.log('Transformed items:', transformedItems);

			update((state) => {
				const newLists = new Map(state.lists);
				const newListItems = new Map(state.listItems);

				newLists.set(listId, listResponse.data);
				newListItems.set(listId, transformedItems);

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

	async function addItemToList(listId: string, item: DBItem, listItemData: ListItemInsert) {
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

	function initializeWithData(list: DBList, items: ListItemWithDetails[]) {
		if (!initialized && list) {
			update((state) => {
				const newLists = new Map(state.lists);
				const newListItems = new Map(state.listItems);

				newLists.set(list.id, list);
				newListItems.set(list.id, items);

				return {
					...state,
					activeListId: list.id,
					lists: newLists,
					listItems: newListItems,
					loading: {
						lists: false,
						items: false
					}
				};
			});
			initialized = true;
		}
	}

	function updateListData(
		listId: string,
		data: {
			name?: string;
			items?: ListItemWithDetails[];
		}
	) {
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
		initialized = false;
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
		initializeWithData, // Add this line
		updateListData,
		reset
	};
}

export const listStore = createListStore();
export const activeListItems = derived(listStore, ($store) => {
	if (!$store.activeListId) return [];
	return $store.listItems.get($store.activeListId) || [];
});
