import { writable } from 'svelte/store';

export type ToastType = 'success' | 'info';

interface Toast {
	message: string;
	type: ToastType;
}

function createToastStore() {
	const { subscribe, set } = writable<Toast | null>(null);

	function show(message: string, type: ToastType = 'info') {
		set({ message, type });
		setTimeout(() => {
			set(null);
		}, 3000);
	}

	function hide() {
		set(null);
	}

	return {
		subscribe,
		show,
		hide
	};
}

export const toast = createToastStore();
