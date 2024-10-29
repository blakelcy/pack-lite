<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let data;

	onMount(() => {
		if (browser) {
			if (data.session) {
				console.log('Session exists, redirecting to dashboard');
				goto('/dashboard');
			} else {
				console.log('No session, redirecting to login');
				goto('/login');
			}
		}
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<p class="text-gray-600">Packr</p>
</div>
