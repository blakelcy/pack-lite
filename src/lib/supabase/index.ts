// lib/supabase/index.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './types'; // You'll need to generate this

// Client-side client
export const createBrowserClient = () =>
	createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: {
			flowType: 'implicit',
			detectSessionInUrl: true,
			persistSession: true,
			autoRefreshToken: true
		}
	});

// Server-side client
export const createServerClient = () =>
	createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: {
			autoRefreshToken: true,
			persistSession: true
		}
	});

// Export a singleton instance for client-side use
export const supabase = createBrowserClient();
