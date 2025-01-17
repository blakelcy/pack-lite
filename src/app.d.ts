// src/app.d.ts
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { ListItem, GearList } from '$lib/types/lists';

declare global {
	namespace App {
		// Locals represents server-side data available in hooks and server load functions
		interface Locals {
			supabase: SupabaseClient;
			session: Session | null;
			isGuest: boolean;
			// Add getSession helper for type safety
			getSession: () => Promise<Session | null>;
			// Add getCurrentUser helper
			getCurrentUser: () => Promise<User | null>;
		}

		// Error interface for consistent error handling across the app
		interface Error {
			message: string;
			code?: string;
			// Add status for HTTP error codes
			status?: number;
			// Add details for additional error information
			details?: Record<string, unknown>;
		}

		// PageData represents data available to pages
		interface PageData {
			// Make session nullable to match Locals
			session: Session | null;
			// Make user nullable for consistency
			user: User | null;
			preferences: UserPreferences | null;
			// Add loading state
			loading?: boolean;
			// Make list and listItems explicitly nullable
			list: GearList | null;
			listItems: ListItem[] | null;
		}

		// Expand UserPreferences with more specific types
		interface UserPreferences {
			theme: 'light' | 'dark' | 'system';
			notifications: {
				enabled: boolean;
				email: boolean;
				push: boolean;
			};
			// Add version for preference migrations if needed
			version: number;
			// Add lastUpdated for tracking
			lastUpdated: string;
			// Add other preferences with specific types
			defaultList?: string;
			language?: string;
			timezone?: string;
		}

		// Add Platform interface for adapter-specific context
		interface Platform {
			// Add any platform-specific properties
			env?: {
				SUPABASE_URL: string;
				SUPABASE_ANON_KEY: string;
				[key: string]: string | undefined;
			};
		}

		// Add PageState for shallow routing state
		interface PageState {
			modalOpen?: boolean;
			returnTo?: string;
			[key: string]: unknown;
		}
	}
}

// Ensure this is a proper module
export {};
