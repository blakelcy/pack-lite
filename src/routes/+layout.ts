// src/routes/+layout.ts
import type { LayoutLoad } from './$types';
import { supabase } from '$lib/supabase';
import { setUser, setLoading } from '$lib/stores/auth';

export const load: LayoutLoad = async ({ data }) => {
	// Initialize client state with server data
	if (data.session?.user) {
		setUser(data.session.user);
	}
	setLoading(false);

	return {
		...data,
		supabase
	};
};
