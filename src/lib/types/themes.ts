// src/lib/types/themes.ts
export type ThemeType =
	| 'default'
	| 'alpine'
	| 'hiking'
	| 'camping'
	| 'biking'
	| 'photography'
	| 'travel'
	| 'business'
	| 'beach';

export interface Theme {
	id: ThemeType;
	background_image: string;
	created_at?: string;
	user_id?: string;
}
