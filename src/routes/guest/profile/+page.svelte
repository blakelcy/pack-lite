<script lang="ts">
	import { goto } from '$app/navigation';
	import { guestStore } from '$lib/stores/guest';
	import { supabase } from '$lib/supabase';
	import { authStore } from '$lib/stores/auth';
	import { CaretCircleLeft } from 'phosphor-svelte';

	let loading = false;
	let error: string | null = null;

	async function handleBack() {
		await goto('/guest/list');
	}

	async function handleSignup() {
		try {
			loading = true;
			// Get the guest data before signing in
			const guestData = guestStore.exportData();

			// Sign in with Google
			const { data, error: signInError } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback?migrate=true&guestData=${encodeURIComponent(JSON.stringify(guestData))}`
				}
			});

			if (signInError) throw signInError;
		} catch (e) {
			console.error('Error:', e);
			error = e.message;
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-white flex flex-col">
	<!-- Header -->
	<header class="px-4 py-3 flex items-center justify-between border-b">
		<button class="p-2 text-gray-900 hover:text-gray-800" on:click={handleBack}>
			<CaretCircleLeft size={24} weight="fill" />
		</button>
		<h1 class="flex-1 text-lg font-medium text-center">Create Account</h1>
		<div class="w-10"></div>
		<!-- Spacer to center the title -->
	</header>

	<!-- Main Content -->
	<main class="flex-1 p-4">
		<div class="max-w-md mx-auto space-y-6">
			<!-- Info Card -->
			<div class="bg-blue-50 p-4 rounded-lg">
				<h2 class="font-medium text-blue-900 mb-2">Why Create an Account?</h2>
				<ul class="space-y-2 text-sm text-blue-800">
					<li>✓ Save your lists permanently</li>
					<li>✓ Create unlimited lists</li>
					<li>✓ Access from any device</li>
					<li>✓ Share lists with others</li>
				</ul>
			</div>

			<!-- Current List Info -->
			{#if $guestStore.list}
				<div class="bg-gray-50 p-4 rounded-lg">
					<h3 class="font-medium text-gray-900 mb-2">Current Guest List</h3>
					<div class="text-sm text-gray-600">
						<p><strong>{$guestStore.list.name}</strong></p>
						<p>{$guestStore.items.length} items</p>
						<p>Will be migrated to your new account</p>
					</div>
				</div>
			{/if}

			<!-- Sign Up Button -->
			<button
				type="button"
				on:click={handleSignup}
				disabled={loading}
				class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg
                       text-white bg-primary-600 hover:bg-primary-700 focus:outline-none
                       focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if loading}
					<div
						class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
					/>
				{:else}
					Continue with Google
				{/if}
			</button>

			{#if error}
				<div class="text-red-600 text-sm text-center">
					{error}
				</div>
			{/if}
		</div>
	</main>
</div>
