// src/lib/types/lists.ts

export interface Item {
	id: string;
	name: string;
	description?: string;
	weight: number;
	price?: number;
	category?: string;
	image_url?: string;
	link?: string;
	created_at: string;
}

export interface ListItem extends Item {
	worn: boolean;
	consumable: boolean;
	quantity: number;
	list_id: string;
}

export interface GearList {
	id: string;
	name: string;
	created_at: string;
	user_id: string;
	item_count: number;
	total_weight: number;
}

// Add this to your PageData interface in app.d.ts if not already present
declare global {
	namespace App {
		interface PageData {
			list?: GearList;
			listItems?: ListItem[];
		}
	}
}
