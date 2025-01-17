<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';

	let loading = false;
	let error: string | null = null;

	async function handleLogout() {
		try {
			loading = true;
			error = null;

			// First, clear the session from Supabase
			const { error: signOutError } = await supabase.auth.signOut();
			if (signOutError) throw signOutError;

			// Then clear the cookies via our endpoint
			const response = await fetch('/auth/session', {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to clear session');
			}

			// Redirect to login page
			await goto('/login');
		} catch (e) {
			console.error('Logout error:', e);
			error = e instanceof Error ? e.message : 'Failed to log out';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<div class="max-w-xl mx-auto p-4">
		<h1 class="text-2xl font-bold mb-6">Profile</h1>

		<div class="bg-white rounded-lg shadow p-6 mb-4">
			<button
				on:click={handleLogout}
				disabled={loading}
				class="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if loading}
					<span
						class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
					/>
				{/if}
				Sign Out
			</button>

			{#if error}
				<div class="mt-4 text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
					{error}
				</div>
			{/if}
		</div>
	</div>

	<BottomNav />
</div>
