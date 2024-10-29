<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	export let data;

	async function handleSignOut() {
		try {
			// First clear cookies via server
			const response = await fetch('/auth/session', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`Server responded with ${response.status}`);
			}

			// Then sign out from Supabase client
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			// Clear local auth store
			authStore.setUser(null);

			// Redirect to login
			await goto('/login');
		} catch (error) {
			console.error('Sign out error:', error);
			// Even if there's an error, try to redirect to login
			authStore.setUser(null);
			await goto('/login');
		}
	}

	$: user = data.user;
	$: metadata = user?.user_metadata || {};
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation Bar -->
	<nav class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16 items-center">
				<div class="flex items-center">
					{#if metadata.avatar_url}
						<img src={metadata.avatar_url} alt="Profile" class="h-8 w-8 rounded-full" />
					{/if}
					<span class="ml-3 text-lg font-semibold">
						Welcome, {metadata.full_name || user?.email || 'User'}
					</span>
				</div>
				<button
					on:click={handleSignOut}
					class="text-sm text-red-600 hover:text-red-700 font-medium"
				>
					Sign Out
				</button>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	{#if user}
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="bg-white shadow rounded-lg p-6">
				<h2 class="text-2xl font-bold mb-6">Profile Information</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Basic Information -->
					<div class="space-y-4">
						<div>
							<h3 class="text-sm font-medium text-gray-500">Full Name</h3>
							<p class="mt-1">{metadata.full_name || 'Not provided'}</p>
						</div>

						<div>
							<h3 class="text-sm font-medium text-gray-500">Email</h3>
							<p class="mt-1">{user.email}</p>
						</div>

						<div>
							<h3 class="text-sm font-medium text-gray-500">Account Created</h3>
							<p class="mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
						</div>
					</div>

					<!-- Additional Information -->
					<div class="space-y-4">
						<div>
							<h3 class="text-sm font-medium text-gray-500">Last Sign In</h3>
							<p class="mt-1">{new Date(user.last_sign_in_at).toLocaleString()}</p>
						</div>

						<div>
							<h3 class="text-sm font-medium text-gray-500">Provider</h3>
							<p class="mt-1 capitalize">{user.app_metadata?.provider || 'Not specified'}</p>
						</div>

						<div>
							<h3 class="text-sm font-medium text-gray-500">Authentication Status</h3>
							<p class="mt-1">
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
								>
									Authenticated
								</span>
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	{:else}
		<div class="flex justify-center items-center h-[calc(100vh-4rem)]">
			<div class="text-center">
				<h2 class="text-xl font-semibold text-gray-700">Loading...</h2>
			</div>
		</div>
	{/if}
</div>
