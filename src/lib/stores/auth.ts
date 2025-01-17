// src/lib/stores/auth.ts
import { browser } from '$app/environment';
import type { User } from '@supabase/supabase-js';
import { derived, writable } from 'svelte/store';

interface AuthState {
	user: User | null;
	loading: boolean;
	isGuest: boolean;
}

export const authStore = writable<AuthState>({
	user: null,
	loading: true,
	isGuest: browser ? sessionStorage.getItem('guestSession') === 'true' : false
});

// Create derived values
export const isGuest = derived(authStore, ($authStore) => $authStore.isGuest);
export const user = derived(authStore, ($authStore) => $authStore.user);
export const loading = derived(authStore, ($authStore) => $authStore.loading);

// Helper functions for state updates
export function setUser(newUser: User | null) {
	authStore.update((state) => ({
		...state,
		user: newUser,
		loading: false,
		isGuest: false
	}));
}

export function setLoading(isLoading: boolean) {
	authStore.update((state) => ({
		...state,
		loading: isLoading
	}));
}

export function setGuest() {
	if (browser) {
		sessionStorage.setItem('guestSession', 'true');
	}

	authStore.update((state) => ({
		...state,
		isGuest: true,
		loading: false,
		user: null
	}));
}

export function clearGuest() {
	if (browser) {
		sessionStorage.removeItem('guestSession');
	}

	authStore.update((state) => ({
		...state,
		isGuest: false
	}));
}

export function clearAuth() {
	if (browser) {
		sessionStorage.removeItem('guestSession');
	}

	authStore.set({
		user: null,
		loading: false,
		isGuest: false
	});
}

// Initialize state
export function initAuth() {
	if (browser) {
		const isGuestSession = sessionStorage.getItem('guestSession') === 'true';
		if (isGuestSession) {
			authStore.update((state) => ({
				...state,
				isGuest: true,
				loading: false
			}));
		}
	}
}

// Subscribe to auth changes
export function subscribeToAuth(callback: (state: AuthState) => void) {
	authStore.subscribe(callback);
}
