import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

interface AuthState {
	user: User | null;
	loading: boolean;
}

const createAuthStore = () => {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: true
	});

	return {
		subscribe,
		setUser: (user: User | null) => update((state) => ({ ...state, user, loading: false })),
		setLoading: (loading: boolean) => update((state) => ({ ...state, loading })),
		clear: () => set({ user: null, loading: false })
	};
};

export const authStore = createAuthStore();
