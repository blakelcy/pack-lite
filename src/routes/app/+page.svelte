<!-- src/routes/app/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { Plus, MagnifyingGlass } from 'phosphor-svelte';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import { page } from '$app/stores';
	import { listStore } from '$lib/stores/listStore';

	export let data: PageData;
	export let form: ActionData;

	let isScrolled = false;
	let header: HTMLElement;
	let isCreatingList = false;
	let searchQuery = data.searchQuery;

	// Handle scroll events
	function handleScroll() {
		isScrolled = window.scrollY > 10;
	}

	// Handle search with URL updates
	function handleSearch() {
		const searchParams = new URLSearchParams($page.url.searchParams);
		if (searchQuery) {
			searchParams.set('q', searchQuery);
		} else {
			searchParams.delete('q');
		}
		goto(`?${searchParams.toString()}`, { replaceState: true });
	}

	// Handle list creation with progressive enhancement
	function handleCreateList() {
		if (isCreatingList) return;
		isCreatingList = true;
	}

	// Just modify your form enhancement slightly
	function handleEnhance() {
		isCreatingList = true;

		return async ({ result }) => {
			isCreatingList = false;
			if (result.type === 'success') {
				const { list } = result.data;
				// Optionally update the store before navigation
				listStore.fetchUserLists();
				goto(`/app/lists/${list.id}`);
			}
		};
	}

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

	function getRandomColor() {
		return legendColors[Math.floor(Math.random() * legendColors.length)];
	}
</script>

<svelte:window on:scroll={handleScroll} />

<div class="min-h-screen bg-white flex flex-col">
	<!-- Top Bar with Search -->
	<header
		bind:this={header}
		class="fixed top-0 right-0 left-0 px-4 py-3 flex items-center z-10
               transition-all duration-200
               {isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}"
	>
		<div class="relative flex-1 max-w-xl mx-auto">
			<MagnifyingGlass size={20} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
			<input
				type="search"
				placeholder="Search gear lists..."
				bind:value={searchQuery}
				on:input={() => handleSearch()}
				class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
			/>
		</div>
	</header>

	<div class="h-14" />

	<!-- Main Content -->
	<main class="flex-1 px-4 py-6 mb-16">
		{#if !data.lists?.length}
			<div class="text-center py-12">
				<h2 class="text-xl font-medium text-gray-600 mb-4">
					{searchQuery ? 'No matching lists found' : 'No gear lists yet'}
				</h2>
				<p class="text-gray-500 mb-8">
					{searchQuery
						? 'Try adjusting your search terms'
						: 'Create your first gear list to start tracking your equipment!'}
				</p>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.lists as list (list.id)}
					<button
						class="block p-4 rounded-lg border border-gray-200 hover:border-primary-500
                               bg-white text-left w-full relative overflow-hidden
                               hover:shadow-md transition-all group"
						on:click={() => goto(`/app/lists/${list.id}`)}
					>
						<div class="relative space-y-1">
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

							<div class="grid grid-cols-2 gap-4">
								<div class="flex items-center gap-3">
									<div class="w-3 h-3 rounded-sm {getRandomColor()} mt-1" />
									<div>
										<p class="text-sm font-medium text-gray-900">
											{list.item_count || 0}
										</p>
										<p class="text-xs text-gray-500 font-mono uppercase tracking-wider">Items</p>
									</div>
								</div>

								<div class="flex items-center gap-3">
									<div class="w-3 h-3 rounded-sm {getRandomColor()} mt-1" />
									<div>
										<p class="text-sm font-medium text-gray-900">
											{list.total_weight || 0} oz
										</p>
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

	<!-- Create List Form -->
	<form method="POST" action="?/createList" use:enhance={handleEnhance}>
		<button
			type="submit"
			class="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-primary-500 text-white
                   flex items-center justify-center shadow-lg hover:bg-primary-800
                   transition-all duration-200 hover:scale-105 active:scale-95
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed"
			disabled={isCreatingList}
			aria-label="Create new list"
		>
			{#if isCreatingList}
				<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
			{:else}
				<Plus size={24} weight="regular" />
			{/if}
		</button>
	</form>

	<!-- Bottom Navigation -->
	<BottomNav />
</div>
