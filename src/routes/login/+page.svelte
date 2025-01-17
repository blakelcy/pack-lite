<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	// Background configurations with matching button styles
	const backgrounds = [
		{
			desktop: '/images/background1.jpg',
			tablet: '/images/background1.jpg',
			mobile: '/images/background1.jpg',
			alt: 'Midjourney Created background of a valley floor at the base of a mountain.',
			buttonScheme: {
				google: 'bg-google-1 hover:bg-google-1',
				apple: 'bg-apple-1 hover:bg-apple-1'
			}
		},
		{
			desktop: '/images/background2.jpg',
			tablet: '/images/background2.jpg',
			mobile: '/images/background2.jpg',
			alt: 'Midjourney Created background of a valley floor at the base of a mountain.',
			buttonScheme: {
				google: 'bg-google-2 hover:bg-google-2',
				apple: 'bg-apple-2 hover:bg-apple-2'
			}
		},
		{
			desktop: '/images/background3.jpg',
			tablet: '/images/background3.jpg',
			mobile: '/images/background3.jpg',
			alt: 'Midjourney Created background of a valley floor at the base of a mountain.',
			buttonScheme: {
				google: 'bg-google-3 hover:bg-google-3',
				apple: 'bg-apple-3 hover:bg-apple-3'
			}
		},
		{
			desktop: '/images/background4.jpg',
			tablet: '/images/background4.jpg',
			mobile: '/images/background4.jpg',
			alt: 'Midjourney Created background of a valley floor at the base of a mountain.',
			buttonScheme: {
				google: 'bg-google-4 hover:bg-google-4',
				apple: 'bg-apple-4 hover:bg-apple-4'
			}
		}
	];

	let currentIndex = $state(0);
	let loading = false;
	let error: string | null = null;

	// Background rotation logic
	onMount(() => {
		const interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % backgrounds.length;
		}, 6000);

		return () => clearInterval(interval);
	});

	async function signInWithGoogle() {
		try {
			loading = true;
			error = null;

			const { data, error: signInError } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});

			if (signInError) throw signInError;

			// No need to set loading = false here as we're redirecting
		} catch (e) {
			console.error('Error:', e);
			error = e instanceof Error ? e.message : 'An error occurred during sign in';
			loading = false;
		}
	}
	async function signInWithApple() {
		try {
			loading = true;
			error = null;

			const { data, error: signInError } = await supabase.auth.signInWithOAuth({
				provider: 'apple',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});

			if (signInError) throw signInError;
		} catch (e) {
			console.error('Error:', e);
			error = e instanceof Error ? e.message : 'An error occurred during sign in';
			loading = false;
		}
	}
</script>

<div class="fixed inset-0 -z-10">
	{#each backgrounds as bg, index}
		<picture
			class="absolute inset-0 transition-opacity duration-1000 w-full h-full"
			class:opacity-100={index === currentIndex}
			class:opacity-0={index !== currentIndex}
		>
			<!-- Desktop image (1920x1080 recommended) -->
			<source media="(min-width: 1024px)" srcset={bg.desktop} />
			<!-- Tablet image (1024x1366 recommended) -->
			<source media="(min-width: 640px)" srcset={bg.tablet} />
			<!-- Mobile image (640x960 recommended) -->
			<img
				src={bg.mobile}
				alt={bg.alt}
				class="w-full h-full object-cover"
				aria-hidden={index !== currentIndex}
			/>
		</picture>
	{/each}
</div>
<div class="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8 backdrop-blur-sm bg-primary-700/15 p-8 rounded-xl">
		<div class="mt-4 space-y-4">
			<!-- <button
				type="button"
				on:click={signInWithApple}
				disabled={loading}
				class="relative w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-white {backgrounds[
					currentIndex
				].buttonScheme.apple}"
				aria-label="Sign in with Apple"
			>
				<span class="flex items-center">
					{#if loading}
						<div
							class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2"
							aria-hidden="true"
						/>
					{/if}
					<svg class="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
						<path
							fill="currentColor"
							d="M12.152,6.896c-0.948,0-2.415-1.078-3.96-1.04C6.084,5.894,4.63,6.839,3.757,8.337 c-1.784,3.084-0.463,7.633,1.255,10.141c0.852,1.232,1.852,2.605,3.164,2.557c1.277-0.049,1.755-0.818,3.292-0.818 c1.537,0,1.96,0.818,3.292,0.788c1.368-0.024,2.223-1.23,3.052-2.469c0.988-1.423,1.388-2.847,1.412-2.919 c-0.024-0.024-2.699-1.045-2.748-4.129c-0.024-2.582,2.127-3.821,2.223-3.869c-1.24-1.784-3.116-1.96-3.752-1.96 C13.368,6.896,12.566,6.896,12.152,6.896z M14.375,4.262c0.696-0.818,1.185-1.96,1.043-3.116c-1.036,0.024-2.248,0.696-2.969,1.514 c-0.648,0.744-1.23,1.96-1.067,3.092C12.535,5.801,13.682,5.081,14.375,4.262z"
						/>
					</svg>
					Continue with Apple
				</span>
			</button> -->
			<button
				type="button"
				on:click={signInWithGoogle}
				disabled={loading}
				class="relative w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-white {backgrounds[
					currentIndex
				].buttonScheme.google}"
				aria-label="Sign in with Google"
			>
				<span class="flex items-center">
					{#if loading}
						<div
							class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2"
							aria-hidden="true"
						/>
					{/if}
					<svg class="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
						<path
							fill="currentColor"
							d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
						/>
					</svg>
					Continue with Google
				</span>
			</button>
		</div>

		<div>
			<p class="text-center text-sm text-white">Choose your preferred sign in method</p>
		</div>

		{#if error}
			<div
				class="mt-4 p-4 rounded-lg bg-red-500/70 border border-red-500 text-white text-sm text-center"
				role="alert"
			>
				{error}
			</div>
		{/if}
	</div>
	<h1 class="absolute bottom-8 text-center text-3xl text-white font-heavyEquipment">Carry Light</h1>
</div>
