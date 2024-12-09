<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';

	let loading = false;
	let error: string | null = null;

	async function signInWithGoogle() {
		try {
			loading = true;
			console.log('Starting Google sign in...');

			const { data, error: signInError } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});

			if (signInError) throw signInError;
		} catch (e) {
			console.error('Error:', e);
			error = e.message;
			loading = false;
		}
	}
	async function continueAsGuest() {
		try {
			loading = true;
			// Set guest session in auth store
			authStore.setGuest();
			// Redirect to guest list page
			await goto('/guest/list');
		} catch (e) {
			console.error('Error continuing as guest:', e);
			error = e.message;
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-primary-500 py-12 px-4">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="text-center text-3xl font-extrabold text-white">Sign in to your account</h2>
		</div>
		<div class="mt-8 space-y-6">
			<button
				type="button"
				on:click={signInWithGoogle}
				disabled={loading}
				class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
			>
				{#if loading}
					<span class="absolute left-0 inset-y-0 flex items-center pl-3">
						<!-- Loading spinner -->
						<svg
							class="animate-spin h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</span>
					Processing...
				{:else}
					Sign in with Google
				{/if}
			</button>

			<!-- Guest button -->
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-white/10"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-primary-500 text-white/60">or</span>
				</div>
			</div>

			<button
				type="button"
				on:click={continueAsGuest}
				disabled={loading}
				class="w-full flex justify-center py-2 px-4 border border-white/20 text-sm font-medium rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
			>
				Continue as Guest
			</button>

			{#if error}
				<div class="text-red-600 text-sm text-center">
					{error}
				</div>
			{/if}
		</div>
	</div>
</div>
