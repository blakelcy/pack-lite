<script lang="ts">
	import { supabase } from '$lib/supabase';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import type { Theme, ThemeType } from '$lib/types/themes';
	import { activeTheme, setTheme } from '$lib/stores/themeStore';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let loading = false;
	let themeLoading = false;
	let error: string | null = null;
	let themes: Theme[] = [];
	let unlockedThemes: Theme[] = [];

	async function loadThemes() {
		try {
			themeLoading = true;
			// get all themes

			const themesResponse = await supabase
				.from('themes')
				.select('*')
				.order('created_at', { ascending: true });

			if (themesResponse.error) throw themesResponse.error;

			// Then get user's unlocked themes
			const profileResponse = await supabase
				.from('profiles')
				.select('unlocked_themes')
				.eq('id', page.data.session?.user.id)
				.single();

			if (profileResponse.error) throw profileResponse.error;

			themes = themesResponse.data.sort((a, b) => {
				const aUnlocked = unlockedThemes.includes(a.id);
				const bUnlocked = unlockedThemes.includes(b.id);

				if (a.id === 'default') return -1;
				if (b.id === 'default') return 1;
				if (aUnlocked && !bUnlocked) return -1;
				if (!aUnlocked && bUnlocked) return 1;
				return 0;
			});

			unlockedThemes = profileResponse.data.unlocked_themes.map((themeId: string) =>
				themes.find((theme) => theme.id === themeId)
			);
		} catch (e) {
			console.error('Error loading themes:', e);
			error = e instanceof Error ? e.message : 'Failed to load themes';
		} finally {
			themeLoading = false;
		}
	}

	function switchTheme(themeId: ThemeType) {
		setTheme(themeId);
		console.log('Switched theme to:', themeId);
	}

	$: {
		if (page.data.session) {
			loadThemes();
		}
	}

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
			<h2 class="text-lg font-semibold mb-4">Theme Selection</h2>

			{#if themeLoading}
				<div class="flex justify-center py-4">
					<span
						class="inline-block animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"
					/>
				</div>
			{:else if error}
				<div class="text-red-500 text-sm">{error}</div>
			{:else}
				<div class="space-y-3">
					{#each themes as theme}
						{@const isUnlocked = unlockedThemes.some(
							(unlockedTheme) => unlockedTheme?.id === theme.id
						)}
						<button
							class="w-full p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors"
							class:border-blue-500={$activeTheme === theme.id}
							class:opacity-50={!isUnlocked}
							disabled={!isUnlocked}
							on:click={() => switchTheme(theme.id)}
						>
							<span class="capitalize">{theme.id}</span>
							<div class="flex items-center">
								{#if $activeTheme === theme.id}
									<span class="text-blue-500 mr-2">Active</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>

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

	<BottomNav />
</div>
