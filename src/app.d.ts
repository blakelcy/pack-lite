declare global {
	namespace App {
		interface Locals {
			session: import('@supabase/supabase-js').Session | null;
		}
	}
}

export {};
