<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { page } from '$app/stores';

	let processing = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			// The hash contains the access token after OAuth
			const hashParams = new URLSearchParams(window.location.hash.substring(1));
			const access_token = hashParams.get('access_token');

			if (!access_token) {
				console.error('No access token found');
				throw new Error('No access token found');
			}

			// Set the session with Supabase
			const {
				data: { session },
				error: sessionError
			} = await supabase.auth.setSession({
				access_token,
				refresh_token: hashParams.get('refresh_token') || ''
			});

			if (sessionError) throw sessionError;

			if (session) {
				// Set cookies via fetch request
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

				await goto('/dashboard');
			} else {
				throw new Error('No session established');
			}
		} catch (e) {
			console.error('Auth error:', e);
			error = e.message;
			processing = false;
			setTimeout(() => goto('/login'), 2000);
		}
	});
</script>

{#if processing}
	<div class="flex justify-center items-center min-h-screen">
		<p>Processing authentication...</p>
	</div>
{:else if error}
	<div class="flex justify-center items-center min-h-screen">
		<p class="text-red-600">Error: {error}</p>
		<p class="text-sm">Redirecting to login...</p>
	</div>
{/if}
