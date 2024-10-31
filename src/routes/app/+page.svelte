<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { listStore } from '$lib/stores/listStore';
	import { onMount } from 'svelte';
	import { Plus, Scales, Package } from 'phosphor-svelte';
	import { supabase } from '$lib/supabase';

	export let data: PageData;

	let isScrolled = false;
	let header: HTMLElement;
	let isCreatingList = false;

	// Subscribe to the store
	$: ({ lists, loading } = $listStore);

	onMount(() => {
		listStore.fetchUserLists();

		const handleScroll = () => {
			isScrolled = window.scrollY > 10;
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	async function handleSignOut() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error('Error signing out:', error.message);
		} else {
			goto('/');
		}
	}

	async function handleCreateList() {
		if (isCreatingList) return; // Prevent double clicks

		try {
			isCreatingList = true;
			const newList = await listStore.createNewList();

			// Navigate immediately after creation
			goto(`/app/lists/${newList.id}`);

			// Optional: Update the store in the background
			// This will ensure the list is there when they come back
			listStore.fetchUserLists();
		} catch (error) {
			if (error.message === 'User must be authenticated to create a list') {
				console.error('Please log in to create a list');
				// Add user notification here
			} else {
				console.error('Failed to create list:', error);
				// Add error notification here
			}
		} finally {
			isCreatingList = false;
		}
	}

	// Array of possible colors using Tailwind's color palette
	const legendColors = [
		'bg-red-500',
		'bg-blue-500',
		'bg-green-500',
		'bg-yellow-500',
		'bg-purple-500',
		'bg-pink-500',
		'bg-indigo-500',
		'bg-orange-500',
		'bg-teal-500',
		'bg-cyan-500'
	];

	// Function to get a random color from the array
	function getRandomColor() {
		return legendColors[Math.floor(Math.random() * legendColors.length)];
	}
</script>

<div class="min-h-screen bg-white flex flex-col">
	<!-- Top Bar -->
	<header
		bind:this={header}
		class="fixed top-0 right-0 left-0 px-4 py-3 flex justify-end items-center z-10
           transition-all duration-200
           {isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}"
	>
		<button
			class="p-2 text-primary-600 hover:text-primary-700 transition-colors"
			on:click={handleSignOut}
		>
			Sign Out
		</button>
	</header>
	<div class="h-14"></div>
	<!-- Main Content -->
	<main class="flex-1 px-4 py-6">
		{#if loading && lists.length === 0}
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
               bg-white text-left w-full relative overflow-hidden
               hover:shadow-md transition-all group"
						on:click={() => goto(`/app/lists/${list.id}`)}
					>
						<!-- Main content -->
						<div class="relative space-y-1">
							<!-- Header section with name and date -->
							<div class="flex justify-between items-center pb-3">
								<h3 class="font-medium text-lg text-gray-900">{list.name}</h3>
								<span
									class="text-xs text-primary-900 bg-gray-50 px-2 py-1 rounded font-mono"
									title="Creation Date"
								>
									{new Date(list.created_at).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric'
									})}
								</span>
							</div>

							<!-- Stats grid styled like a map legend -->
							<div class="grid grid-cols-2 gap-4">
								<div class="flex items-center gap-3">
									<!-- svelte-ignore element_invalid_self_closing_tag -->
									<div class="w-3 h-3 rounded-sm {getRandomColor()} mt-1" />
									<div>
										<p class="text-sm font-medium text-gray-900">{list.item_count || 0}</p>
										<p class="text-xs text-gray-500 font-mono uppercase tracking-wider">Items</p>
									</div>
								</div>

								<div class="flex items-center gap-3">
									<!-- svelte-ignore element_invalid_self_closing_tag -->
									<div class="w-3 h-3 rounded-sm {getRandomColor()} mt-1" />
									<div>
										<p class="text-sm font-medium text-gray-900">{list.total_weight || 0} oz</p>
										<p class="text-xs text-gray-500 font-mono uppercase tracking-wider">Weight</p>
									</div>
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</main>

	<!-- Floating Action Button -->
	<button
		class="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary-500 text-white
         flex items-center justify-center shadow-lg hover:bg-primary-800
         transition-all duration-200 hover:scale-105 active:scale-95
         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed"
		on:click={handleCreateList}
		disabled={isCreatingList}
		aria-label="Create new list"
	>
		{#if isCreatingList}
			<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
		{:else}
			<Plus size={24} weight="bold" />
		{/if}
	</button>
</div>
