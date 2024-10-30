import { text } from '@sveltejs/kit';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				transparent: 'transparent',
				current: 'currentColor',
				white: '#ffffff',
				text: '#1b1b1b',
				primary: {
					100: '#B8C4BA',
					200: '#99A99C',
					300: '#798F7D',
					400: '#5A745F',
					500: '#3A5A40',
					600: '#314C36',
					700: '#273D2C',
					800: '#1E2F21',
					900: '#152017'
				}
			}
		}
	},
	plugins: []
};
