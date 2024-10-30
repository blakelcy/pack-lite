<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import type { PageData } from './$types';
	import { listStore } from '$lib/stores/listStore';
	import { onMount } from 'svelte';

	export let data: PageData;

	// Subscribe to the store
	$: ({ lists, loading } = $listStore);

	onMount(() => {
		listStore.fetchUserLists();
	});

	async function handleSignOut() {
		// ... your existing sign out code
	}

	async function handleCreateList() {
		try {
			const newList = await listStore.createNewList();
			await listStore.fetchUserLists(); // Refresh the lists
			await goto(`/app/lists/${newList.id}`);
		} catch (error) {
			if (error.message === 'User must be authenticated to create a list') {
				console.error('Please log in to create a list');
			} else {
				console.error('Failed to create list:', error);
			}
		}
	}
</script>

<div class="min-h-screen bg-white flex flex-col">
	<!-- Top Bar -->
	<header class="px-4 py-3 flex justify-between items-center border-b">
		<h1 class="text-xl font-semibold">My Lists</h1>
		<button class="p-2 text-primary-600 hover:text-primary-700" on:click={handleSignOut}>
			Sign Out
		</button>
	</header>

	<!-- Main Content -->
	<main class="flex-1 px-4 py-6">
		{#if loading}
			<div class="flex justify-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
			</div>
		{:else if lists.length === 0}
			<div class="text-center py-12">
				<h2 class="text-xl font-medium text-gray-600 mb-4">No gear lists yet</h2>
				<p class="text-gray-500 mb-8">
					Create your first gear list to start tracking your equipment!
				</p>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each lists as list}
					<button
						class="block p-4 rounded-lg border border-gray-200 hover:border-primary-500
                               hover:shadow-md transition-all bg-white text-left w-full"
						on:click={() => goto(`/app/lists/${list.id}`)}
					>
						<h3 class="font-medium mb-2">{list.name}</h3>
						<div class="text-sm text-gray-500 space-y-1">
							<p>{list.item_count || 0} items</p>
							<p>{list.total_weight || 0} oz total</p>
							<p class="text-xs">{new Date(list.created_at).toLocaleDateString()}</p>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</main>

	<!-- Floating Action Button -->
	<button
		class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-900 text-white flex items-center
               justify-center shadow-lg hover:bg-primary-700 transition-colors"
		on:click={handleCreateList}
	>
		<span class="text-2xl">+</span>
	</button>
</div>
