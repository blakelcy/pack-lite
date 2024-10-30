<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { page } from '$app/stores';

	let processing = true;
	let error: string | null = null;

	// routes/auth/callback/+page.svelte
	onMount(async () => {
		try {
			console.log('Starting callback handling...');
			const hashParams = new URLSearchParams(window.location.hash.substring(1));
			const access_token = hashParams.get('access_token');

			console.log('Access token exists:', !!access_token);

			if (!access_token) {
				console.error('No access token found');
				throw new Error('No access token found');
			}

			console.log('Setting session...');
			const {
				data: { session },
				error: sessionError
			} = await supabase.auth.setSession({
				access_token,
				refresh_token: hashParams.get('refresh_token') || ''
			});

			console.log('Session result:', {
				hasSession: !!session,
				hasError: !!sessionError
			});

			if (sessionError) throw sessionError;

			if (session) {
				console.log('Setting cookies...');
				const response = await fetch('/auth/session', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						access_token: session.access_token,
						refresh_token: session.refresh_token
					})
				});

				console.log('Cookie set response:', response.status);

				console.log('Redirecting to /app...');
				await goto('/app');
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
