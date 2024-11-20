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
				class="relative w-full h-14 flex justify-center p-1 text-sm font-medium text-white border border-primary-900 rounded-xl bg-primary-400 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
			>
				<div
					class="w-full h-full flex justify-center items-center border border-primary-900 rounded-lg uppercase"
				>
					Sign up with goolge
				</div>
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
				class="relative w-full h-14 flex justify-center p-1 text-sm font-medium text-white border border-secondary-900 rounded-xl bg-secondary-400 hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
			>
				<div
					class="w-full h-full flex justify-center items-center border border-secondary-900 rounded-lg uppercase"
				>
					Let me try it
				</div>
			</button>

			{#if error}
				<div class="text-red-600 text-sm text-center">
					{error}
				</div>
			{/if}
		</div>
	</div>
</div>
