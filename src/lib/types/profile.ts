// src/lib/types/profile.ts
export type PackingFocus =
	| 'default'
	| 'alpine'
	| 'hiking'
	| 'camping'
	| 'biking'
	| 'photography'
	| 'travel'
	| 'business'
	| 'beach';

export interface ThemeColors {
	primary: string;
	secondary: string;
	accent: string;
	background: string;
	text: string;
}

export const themeColors: Record<PackingFocus, ThemeColors> = {
	default: {
		primary: '#4B5563', // gray-600
		secondary: '#374151', // gray-700
		accent: '#60A5FA', // blue-400
		background: '#F3F4F6', // gray-100
		text: '#1F2937' // gray-800
	},
	hiking: {
		primary: '#065F46', // emerald-800
		secondary: '#047857', // emerald-700
		accent: '#34D399', // emerald-400
		background: '#ECFDF5', // emerald-50
		text: '#064E3B' // emerald-900
	},
	alpine: {
		primary: '#1E40AF', // blue-800
		secondary: '#1D4ED8', // blue-700
		accent: '#60A5FA', // blue-400
		background: '#EFF6FF', // blue-50
		text: '#1E3A8A' // blue-900
	},
	travel: {
		primary: '#9333EA', // purple-600
		secondary: '#7E22CE', // purple-700
		accent: '#C084FC', // purple-400
		background: '#FAF5FF', // purple-50
		text: '#581C87' // purple-900
	},
	backpacking: {
		primary: '#B45309', // amber-700
		secondary: '#92400E', // amber-800
		accent: '#FBBF24', // amber-400
		background: '#FFFBEB', // amber-50
		text: '#78350F' // amber-900
	}
};
