import { type ThemeType } from '$lib/types/themes';
import { writable } from 'svelte/store';

export const activeTheme = writable<ThemeType>('default');
