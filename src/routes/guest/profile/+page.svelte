<script lang="ts">
	import { goto } from '$app/navigation';
	import { guestStore } from '$lib/stores/guest';
	import { supabase } from '$lib/supabase';
	import { authStore } from '$lib/stores/auth';
	import { CaretCircleLeft } from 'phosphor-svelte';

	let loading = $state(false);
	let error: string | null = $state(null);

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
		<button class="p-2 text-gray-900 hover:text-gray-800" onclick={handleBack}>
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
				onclick={handleSignup}
				disabled={loading}
				class="relative w-full h-14 flex justify-center p-1 text-sm font-medium text-white border border-primary-900 rounded-xl bg-primary-400 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
			>
				<div
					class="w-full h-full flex justify-center items-center border border-primary-900 rounded-lg uppercase"
				>
					Sign up with goolge
				</div>
			</button>

			{#if error}
				<div class="text-red-600 text-sm text-center">
					{error}
				</div>
			{/if}
		</div>
	</main>
</div>
