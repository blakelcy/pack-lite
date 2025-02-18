import { text } from '@sveltejs/kit';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				heavyEquipment: ['Heavy Equipment']
			},
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
				},
				secondary: {
					100: '#BEB8BD',
					200: '#A1999F',
					300: '#857A82',
					400: '#685A64',
					500: '#4B3B47',
					600: '#3F323C',
					700: '#332830',
					800: '#271F25',
					900: '#1B151A'
				},
				apple: {
					1: '#2B4F65',
					2: '#68939D',
					3: '#85B0C8',
					4: '#729AAE'
				},
				google: {
					1: '#A99C5A',
					2: '#56623B',
					3: '#6A775B',
					4: '#474726'
				}
			}
		}
	},
	plugins: []
};
