// src/app.d.ts
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { ListItem, GearList } from '$lib/types/lists';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			session: Session | null;
		}

		interface PageData {
			session: Session;
			user: User;
			preferences: UserPreferences | null;
			list?: GearList;
			listItems?: ListItem[];
		}

		interface UserPreferences {
			theme?: string;
			notifications?: boolean;
			// ... other preferences
		}
	}
}

export {};
