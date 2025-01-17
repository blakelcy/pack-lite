<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { setUser, clearAuth } from '$lib/stores/auth';

	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();

	let unsubscribe = $state<(() => void) | undefined>();

	// Keep your existing syncSession function
	async function syncSession(session: App.PageData['session']) {
		if (!session) {
			await fetch('/auth/session', { method: 'DELETE' });
			return;
		}

		await fetch('/auth/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				access_token: session.access_token,
				refresh_token: session.refresh_token
			})
		});
	}

	// Keep your existing handleAuthChange function
	async function handleAuthChange(event: string, session: App.PageData['session']) {
		console.log('Auth state change:', event, !!session);

		await syncSession(session);

		if (session?.user) {
			setUser(session.user);

			if (event === 'SIGNED_IN' && !$page.url.pathname.startsWith('/app')) {
				await goto('/app');
			}
		} else {
			clearAuth();

			if (event === 'SIGNED_OUT') {
				await goto('/login');
			}
		}
	}

	$effect(() => {
		(async () => {
			try {
				// Initialize with server session
				if (data.session?.user) {
					setUser(data.session.user);
					await syncSession(data.session);
				}

				// Check client session
				const {
					data: { session: clientSession }
				} = await supabase.auth.getSession();
				if (clientSession) {
					await handleAuthChange('INITIAL', clientSession);
				}

				// Set up auth state change listener
				const {
					data: { subscription }
				} = supabase.auth.onAuthStateChange(handleAuthChange);
				unsubscribe = subscription.unsubscribe;
			} catch (error) {
				console.error('Auth initialization error:', error);
				clearAuth();
			}
		})();

		// Cleanup when effect is destroyed
		return () => {
			unsubscribe?.();
		};
	});
</script>

{#if data.preferences?.theme}
	<div class="app" data-theme={data.preferences.theme}>
		{@render children()}
	</div>
{:else}
	{@render children()}
{/if}
