import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Enable runes at root level
	runes: true,

	// Preprocess definition (only need this once)
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			$lib: './src/lib'
		}
	}
};

export default config;
