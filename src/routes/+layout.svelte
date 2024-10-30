<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Unsubscribe } from '@supabase/supabase-js';

	export let data;

	let unsubscribe: Unsubscribe | undefined;

	// Initialize auth state when the component mounts
	onMount(() => {
		const initAuth = async () => {
			try {
				// First check server-provided session
				if (data.session) {
					console.log('Server session found, syncing with client');
					authStore.setUser(data.session.user);
				}

				// Then get client session
				const {
					data: { session: clientSession }
				} = await supabase.auth.getSession();

				if (clientSession) {
					console.log('Client session found, ensuring cookies are set');
					await fetch('/auth/session', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							access_token: clientSession.access_token,
							refresh_token: clientSession.refresh_token
						})
					});

					authStore.setUser(clientSession.user);
				}

				// Set up auth state change listener
				const {
					data: { subscription }
				} = supabase.auth.onAuthStateChange(async (event, session) => {
					console.log('Auth state change:', event, !!session);

					if (session) {
						// Update server cookies
						await fetch('/auth/session', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								access_token: session.access_token,
								refresh_token: session.refresh_token
							})
						});

						authStore.setUser(session.user);

						if (event === 'SIGNED_IN' && !$page.url.pathname.startsWith('/app')) {
							await goto('/app');
						}
					} else {
						// Clear server cookies
						await fetch('/auth/session', {
							method: 'DELETE'
						});

						authStore.setUser(null);

						if (event === 'SIGNED_OUT') {
							await goto('/login');
						}
					}
				});

				unsubscribe = subscription.unsubscribe;
			} catch (error) {
				console.error('Auth initialization error:', error);
				// Handle initialization errors gracefully
				authStore.setUser(null);
			}
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
