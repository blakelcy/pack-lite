// src/app.d.ts
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			session: Session | null;
		}

		// Add layout data typing
		interface LayoutData {
			session: Session;
			user: User;
			preferences: UserPreferences | null; // Define UserPreferences interface based on your schema
		}

		interface PageData {
			session: Session;
			user: User;
			preferences: UserPreferences | null;
		}
	}
}

// Define your preferences interface based on your schema
interface UserPreferences {
	theme?: string;
	notifications?: boolean;
	// ... other preferences
}

export {};
