// src/lib/stores/themeStore.ts
import { type ThemeType } from '$lib/types/themes';
import { writable } from 'svelte/store';

export const activeTheme = writable<ThemeType>('default');

// Add function to persist theme selection
export function setTheme(theme: ThemeType) {
	activeTheme.set(theme);
	localStorage.setItem('userTheme', theme);
}

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
	const savedTheme = localStorage.getItem('userTheme') as ThemeType;
	if (savedTheme) {
		activeTheme.set(savedTheme);
	}
}
