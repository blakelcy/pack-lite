import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

declare global {
	namespace App {
		interface Locals {
			session: Session | null;
			supabase: SupabaseClient<Database>;
		}

		interface PageData {
			session: Session | null;
		}
	}
}

export {};
