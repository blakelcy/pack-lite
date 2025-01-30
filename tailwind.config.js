import { fontFamily } from 'tailwindcss/defaultTheme';

const themes = {
	default: {
		primary: '#56623B',
		secondary: '#051422',
		accent: '#94A684'
	},
	alpine: {
		primary: '#2C3E50',
		secondary: '#ECF0F1',
		accent: '#3498DB'
	},
	hiking: {
		primary: '#2E5339',
		secondary: '#8B4513',
		accent: '#DAA520'
	},
	camping: {
		primary: '#654321',
		secondary: '#228B22',
		accent: '#DEB887'
	},
	biking: {
		primary: '#D35400',
		secondary: '#2C3E50',
		accent: '#E67E22'
	},
	photography: {
		primary: '#2C3E50',
		secondary: '#7F8C8D',
		accent: '#E74C3C'
	},
	beach: {
		primary: '#1ABC9C',
		secondary: '#3498DB',
		accent: '#F1C40F'
	},
	travel: {
		primary: '#8E44AD',
		secondary: '#2980B9',
		accent: '#F39C12'
	},
	business: {
		primary: '#34495E',
		secondary: '#2980B9',
		accent: '#E74C3C'
	}
};

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				heavyEquipment: ['Heavy Equipment']
			},
			colors: {
				google: {
					1: '#70715C',
					2: '#827F5A',
					3: '#7D493B',
					4: '#918573'
				},
				apple: {
					1: '#2B4F65',
					2: '#68939D',
					3: '#85B0C8',
					4: '#729AAE'
				},
				// Theme colors
				themes,
				// shadcn required colors
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	}
};

export default config;
