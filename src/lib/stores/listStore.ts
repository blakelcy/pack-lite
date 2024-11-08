import { writable, derived, type Readable } from 'svelte/store';
import type { PostgrestError } from '@supabase/supabase-js';
import type { GearList, ListItem } from '$lib/types/lists';
import { supabase } from '$lib/supabase';

// Define the exact shape of the Supabase response
interface ListItemResponse {
	item_id: string;
	list_id: string;
	worn: boolean | null;
	consumable: boolean | null;
	quantity: number | null;
	items: {
		id: string;
		name: string;
		description: string | null;
		weight: number | null;
		price: number | null;
		category_id: string | null;
		image_url: string | null;
		url: string | null;
		created_at: string;
		categories: {
			id: string;
			name: string;
		} | null;
	};
}

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

interface ListStore extends Readable<ListState> {
	activeList: Readable<GearList | null>;
	activeListItems: Readable<ListItem[]>;
	setActiveList: (listId: string) => Promise<void>;
	loadListDetails: (listId: string) => Promise<void>;
	updateListName: (listId: string, newName: string) => Promise<void>;
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

	// Fixed derived store definitions
	const activeList = derived<Readable<ListState>, GearList | null>({ subscribe }, ($state) => {
		if (!$state.activeListId) return null;
		const list = $state.lists.get($state.activeListId);
		return list || null; // Ensure we always return GearList | null
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

			const responseData = itemsResponse.data as unknown as ListItemResponse[];

			console.log('Response Data:', responseData);

			const transformedItems: ListItem[] = responseData.map((listItem) => ({
				id: listItem.item_id,
				list_id: listItem.list_id,
				name: listItem.items.name,
				description: listItem.items.description || undefined,
				weight: listItem.items.weight || 0,
				price: listItem.items.price || undefined,
				category: listItem.items.categories?.name || 'Uncategorized',
				image_url: listItem.items.image_url || undefined,
				link: listItem.items.url || undefined,
				created_at: listItem.items.created_at,
				worn: listItem.worn || false,
				consumable: listItem.consumable || false,
				quantity: listItem.quantity || 1
			}));

			console.log('Transformed Items:', transformedItems);

			update((state) => {
				const newLists = new Map(state.lists);
				const newListItems = new Map(state.listItems);

				newLists.set(listId, listResponse.data);
				newListItems.set(listId, transformedItems);

				console.log('Updated Store State:', {
					lists: newLists,
					listItems: newListItems
				});

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

	async function updateListName(listId: string, newName: string) {
		update((state) => {
			const newLists = new Map(state.lists);
			const list = newLists.get(listId);
			if (list) {
				newLists.set(listId, { ...list, name: newName });
			}
			return { ...state, lists: newLists };
		});

		try {
			const { error } = await supabase.from('lists').update({ name: newName }).eq('id', listId);

			if (error) throw error;
		} catch (error) {
			console.error('Error updating list name:', error);
			await loadListDetails(listId);
		}
	}

	function reset() {
		set({
			activeListId: null,
			lists: new Map(),
			listItems: new Map(),
			loading: {
				lists: false,
				items: false
			},
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
		updateListName,
		reset
	};
}

export const listStore = createListStore();
