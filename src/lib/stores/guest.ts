import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

interface GuestList {
	id: string;
	name: string;
	created_at: string;
	item_count: number;
	total_weight: number;
}

interface GuestItem {
	id: string;
	name: string;
	description?: string;
	weight: number;
	weight_unit: string;
	price?: number;
	link?: string;
	worn: boolean;
	consumable: boolean;
	created_at: string;
}

interface GuestState {
	list: GuestList | null;
	items: GuestItem[];
	loading: boolean;
	error: string | null;
}

const GUEST_LIMITS = {
	MAX_ITEMS: 20
} as const;

function createGuestStore() {
	// Initialize from sessionStorage if available
	const initialState: GuestState = browser
		? (() => {
				const stored = sessionStorage.getItem('guestData');
				if (stored) {
					return JSON.parse(stored);
				}
				return {
					list: null,
					items: [],
					loading: false,
					error: null
				};
			})()
		: {
				list: null,
				items: [],
				loading: false,
				error: null
			};

	const { subscribe, set, update } = writable<GuestState>(initialState);

	// Save to sessionStorage whenever state changes
	subscribe((state) => {
		if (browser) {
			sessionStorage.setItem('guestData', JSON.stringify(state));
		}
	});

	return {
		subscribe,

		// Create a new list (only if none exists)
		createList: (name: string) => {
			update((state) => {
				if (state.list) {
					return { ...state, error: 'Guest users can only create one list' };
				}

				const newList: GuestList = {
					id: crypto.randomUUID(),
					name,
					created_at: new Date().toISOString(),
					item_count: 0,
					total_weight: 0
				};

				return {
					...state,
					list: newList,
					error: null
				};
			});
		},

		// Add item to the list
		addItem: (item: Omit<GuestItem, 'id' | 'created_at'>) => {
			update((state) => {
				if (!state.list) {
					return { ...state, error: 'No list exists' };
				}

				if (state.items.length >= GUEST_LIMITS.MAX_ITEMS) {
					return { ...state, error: 'Guest users can only add 20 items' };
				}

				const newItem: GuestItem = {
					...item,
					id: crypto.randomUUID(),
					created_at: new Date().toISOString()
				};

				const newItems = [...state.items, newItem];
				const totalWeight = newItems.reduce((sum, item) => sum + (item.weight || 0), 0);

				return {
					...state,
					items: newItems,
					list: {
						...state.list,
						item_count: newItems.length,
						total_weight: totalWeight
					},
					error: null
				};
			});
		},

		updateListName: (listId: string, newName: string) => {
			update((state) => {
				if (!state.list || state.list.id !== listId) {
					return state;
				}

				return {
					...state,
					list: {
						...state.list,
						name: newName
					}
				};
			});
		},

		updateItem: (itemId: string, updates: Partial<Omit<GuestItem, 'id' | 'created_at'>>) => {
			update((state) => {
				const itemIndex = state.items.findIndex((item) => item.id === itemId);
				if (itemIndex === -1) {
					return state;
				}

				const updatedItems = [...state.items];
				updatedItems[itemIndex] = {
					...updatedItems[itemIndex],
					...updates
				};

				const totalWeight = updatedItems.reduce((sum, item) => sum + (item.weight || 0), 0);

				return {
					...state,
					items: updatedItems,
					list: state.list
						? {
								...state.list,
								total_weight: totalWeight
							}
						: null
				};
			});
		},

		removeItem: (itemId: string) => {
			update((state) => {
				const newItems = state.items.filter((item) => item.id !== itemId);
				const totalWeight = newItems.reduce((sum, item) => sum + (item.weight || 0), 0);

				return {
					...state,
					items: newItems,
					list: state.list
						? {
								...state.list,
								item_count: newItems.length,
								total_weight: totalWeight
							}
						: null
				};
			});
		},

		// Export list data
		exportData: () => {
			return get({ subscribe });
		},

		// Clear all guest data
		clear: () => {
			if (browser) {
				sessionStorage.removeItem('guestData');
			}
			set({
				list: null,
				items: [],
				loading: false,
				error: null
			});
		}
	};
}

export const guestStore = createGuestStore();
