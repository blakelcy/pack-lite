import { writable, derived } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

interface AuthState {
	user: User | null;
	loading: boolean;
	isGuest: boolean;
}

const createAuthStore = () => {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: true,
		isGuest: false
	});

	// Create a derived store for easy guest checking
	const isGuest = derived({ subscribe }, ($state) => $state.isGuest);

	return {
		subscribe,
		setUser: (user: User | null) =>
			update((state) => ({ ...state, user, loading: false, isGuest: false })),
		setLoading: (loading: boolean) => update((state) => ({ ...state, loading })),
		setGuest: () => {
			// Create guest session in sessionStorage
			sessionStorage.setItem('guestSession', 'true');
			update((state) => ({ ...state, isGuest: true, loading: false, user: null }));
		},
		clearGuest: () => {
			sessionStorage.removeItem('guestSession');
			update((state) => ({ ...state, isGuest: false }));
		},
		clear: () => {
			sessionStorage.removeItem('guestSession');
			set({ user: null, loading: false, isGuest: false });
		},
		// Helper to check guest status on app init
		initGuest: () => {
			const isGuest = sessionStorage.getItem('guestSession') === 'true';
			if (isGuest) {
				update((state) => ({ ...state, isGuest: true, loading: false }));
			}
		}
	};
};

export const authStore = createAuthStore();
