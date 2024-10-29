<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import type { Unsubscribe } from '@supabase/supabase-js';

	onMount(() => {
		let unsubscribe: Unsubscribe | undefined;

		const initAuth = async () => {
			const {
				data: { session }
			} = await supabase.auth.getSession();

			if (session) {
				// Set/refresh the cookies whenever we have a valid session
				document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
				document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=3600; SameSite=Lax`;

				authStore.setUser(session.user);
			}

			const {
				data: { subscription }
			} = supabase.auth.onAuthStateChange(async (event, session) => {
				if (session) {
					// Update cookies on session change
					document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
					document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=3600; SameSite=Lax`;

					authStore.setUser(session.user);

					if (event === 'SIGNED_IN') {
						await goto('/dashboard');
					}
				} else {
					// Clear cookies on sign out
					document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
					document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

					authStore.setUser(null);

					if (event === 'SIGNED_OUT') {
						await goto('/login');
					}
				}
			});

			unsubscribe = subscription.unsubscribe;
		};

		initAuth();

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	});
</script>

<slot />
