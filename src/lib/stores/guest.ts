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
					try {
						return JSON.parse(stored);
					} catch (e) {
						console.error('Error parsing stored guest data:', e);
						return {
							list: null,
							items: [],
							loading: false,
							error: null
						};
					}
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

	const store = writable<GuestState>(initialState);

	// Save to sessionStorage whenever state changes
	if (browser) {
		store.subscribe((state) => {
			sessionStorage.setItem('guestData', JSON.stringify(state));
		});
	}

	function getState() {
		return get(store);
	}

	return {
		subscribe: store.subscribe,
		set: store.set,

		createList: (name: string) => {
			const state = getState();
			if (state.list) {
				store.update((s) => ({ ...s, error: 'Guest users can only create one list' }));
				return false;
			}

			const newList: GuestList = {
				id: crypto.randomUUID(),
				name,
				created_at: new Date().toISOString(),
				item_count: 0,
				total_weight: 0
			};

			store.update((s) => ({
				...s,
				list: newList,
				error: null
			}));
			return true;
		},

		addItem: (item: Omit<GuestItem, 'id' | 'created_at'>) => {
			const state = getState();
			if (!state.list) {
				store.update((s) => ({ ...s, error: 'No list exists' }));
				return false;
			}

			if (state.items.length >= GUEST_LIMITS.MAX_ITEMS) {
				store.update((s) => ({ ...s, error: 'Guest users can only add 20 items' }));
				return false;
			}

			const newItem: GuestItem = {
				...item,
				id: crypto.randomUUID(),
				created_at: new Date().toISOString()
			};

			store.update((s) => {
				const newItems = [...s.items, newItem];
				const totalWeight = newItems.reduce((sum, item) => sum + (item.weight || 0), 0);

				return {
					...s,
					items: newItems,
					list: s.list
						? {
								...s.list,
								item_count: newItems.length,
								total_weight: totalWeight
							}
						: null,
					error: null
				};
			});
			return true;
		},

		updateListName: (listId: string, newName: string) => {
			store.update((s) => {
				if (!s.list || s.list.id !== listId) return s;

				return {
					...s,
					list: {
						...s.list,
						name: newName
					}
				};
			});
		},

		updateItem: (itemId: string, updates: Partial<Omit<GuestItem, 'id' | 'created_at'>>) => {
			store.update((s) => {
				const itemIndex = s.items.findIndex((item) => item.id === itemId);
				if (itemIndex === -1) return s;

				const updatedItems = [...s.items];
				updatedItems[itemIndex] = {
					...updatedItems[itemIndex],
					...updates
				};

				const totalWeight = updatedItems.reduce((sum, item) => sum + (item.weight || 0), 0);

				return {
					...s,
					items: updatedItems,
					list: s.list
						? {
								...s.list,
								total_weight: totalWeight
							}
						: null
				};
			});
		},

		removeItem: (itemId: string) => {
			store.update((s) => {
				const newItems = s.items.filter((item) => item.id !== itemId);
				const totalWeight = newItems.reduce((sum, item) => sum + (item.weight || 0), 0);

				return {
					...s,
					items: newItems,
					list: s.list
						? {
								...s.list,
								item_count: newItems.length,
								total_weight: totalWeight
							}
						: null
				};
			});
		},

		exportData: () => {
			return getState();
		},

		clear: () => {
			if (browser) {
				sessionStorage.removeItem('guestData');
			}
			store.set({
				list: null,
				items: [],
				loading: false,
				error: null
			});
		}
	};
}

export const guestStore = createGuestStore();
