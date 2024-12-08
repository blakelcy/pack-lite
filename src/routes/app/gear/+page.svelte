<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { itemStore } from '$lib/stores/itemStore';
	import { onMount } from 'svelte';
	import { Plus, MagnifyingGlass, TShirt, Cookie, Package, Link } from 'phosphor-svelte';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';

	export let data: PageData;

	let isScrolled = false;
	let header: HTMLElement;
	let isCreatingItem = false;
	let searchQuery = '';
	let selectedFilters = {
		worn: false,
		consumable: false,
		category: 'all'
	};

	// Initialize store with server data
	onMount(() => {
		itemStore.updateItems(data.items);
	});

	$: items = $itemStore.items || [];
	$: loading = $itemStore.loading;

	// Filter items based on search and filters
	$: filteredItems = items.filter((item) => {
		const matchesSearch =
			!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesWorn = !selectedFilters.worn || item.worn;
		const matchesConsumable = !selectedFilters.consumable || item.consumable;
		const matchesCategory =
			selectedFilters.category === 'all' || item.category_id === selectedFilters.category;

		return matchesSearch && matchesWorn && matchesConsumable && matchesCategory;
	});

	function handleScroll() {
		isScrolled = window.scrollY > 10;
	}

	function handleItemClick(item: any) {
		// Implementation for item click handling
		console.log('Item clicked:', item);
	}
</script>

<svelte:window on:scroll={handleScroll} />

<div class="min-h-screen bg-white flex flex-col">
	<!-- Top Bar with Search -->
	<header
		bind:this={header}
		class="fixed top-0 right-0 left-0 z-10 bg-white
               transition-all duration-200
               {isScrolled ? 'shadow-md' : 'border-b'}"
	>
		<div class="px-4 py-3">
			<div class="relative flex-1 max-w-xl mx-auto">
				<MagnifyingGlass size={20} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
				<input
					type="search"
					placeholder="Search gear..."
					bind:value={searchQuery}
					class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
				/>
			</div>
		</div>

		<!-- Filter Bar -->
		<div class="px-4 py-2 border-t flex gap-2 overflow-x-auto">
			<button
				class="px-3 py-1.5 rounded-full border text-sm whitespace-nowrap
                       flex items-center gap-2
                       {selectedFilters.worn
					? 'bg-primary-50 border-primary-200 text-primary-700'
					: 'border-gray-200 text-gray-600'}"
				on:click={() => (selectedFilters.worn = !selectedFilters.worn)}
			>
				<TShirt size={16} />
				Worn
			</button>

			<button
				class="px-3 py-1.5 rounded-full border text-sm whitespace-nowrap
                       flex items-center gap-2
                       {selectedFilters.consumable
					? 'bg-primary-50 border-primary-200 text-primary-700'
					: 'border-gray-200 text-gray-600'}"
				on:click={() => (selectedFilters.consumable = !selectedFilters.consumable)}
			>
				<Cookie size={16} />
				Consumable
			</button>
		</div>
	</header>

	<div class="h-28" />
	<!-- Spacer for fixed header -->

	<!-- Main Content -->
	<main class="flex-1 px-4 py-6 mb-16">
		{#if loading}
			<div class="flex justify-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
			</div>
		{:else if !items.length}
			<div class="text-center py-12">
				<h2 class="text-xl font-medium text-gray-600 mb-4">No gear items yet</h2>
				<p class="text-gray-500 mb-8">
					Add your first piece of gear to start building your inventory!
				</p>
			</div>
		{:else if !filteredItems.length}
			<div class="text-center py-12">
				<h2 class="text-xl font-medium text-gray-600 mb-4">No matching items found</h2>
				<p class="text-gray-500 mb-8">Try adjusting your search terms or filters</p>
			</div>
		{:else}
			<div class="grid grid-cols-3 gap-2 md:grid-cols-6 lg:grid-cols-12">
				{#each filteredItems as item (item.id)}
					<div
						class="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer
                               hover:border-primary-500 transition-colors"
						on:click={() => handleItemClick(item)}
						on:keydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								handleItemClick(item);
							}
						}}
						role="button"
						tabindex="0"
					>
						<div class="flex flex-col">
							<!-- Item Image -->
							<div class="relative bg-primary-100 w-full aspect-square">
								{#if item.image_url}
									<img src={item.image_url} alt={item.name} class="w-full h-full object-cover" />
								{:else}
									<div class="w-full h-full bg-gray-100 flex items-center justify-center">
										<Package size={32} class="text-gray-400" />
									</div>
								{/if}

								<!-- Item badges -->
								{#if item.worn || item.consumable}
									<div class="absolute top-1 right-1 flex gap-1">
										{#if item.worn}
											<div class="bg-primary-500 text-white rounded-full p-1">
												<TShirt size={16} weight="fill" />
											</div>
										{/if}
										{#if item.consumable}
											<div class="bg-primary-500 text-white rounded-full p-1">
												<Cookie size={16} weight="fill" />
											</div>
										{/if}
									</div>
								{/if}
							</div>

							<!-- Item Details -->
							<div class="flex-1 p-2">
								<div class="mb-1">
									<h3 class="font-medium text-gray-900 text-sm truncate">
										{item.name}
									</h3>
								</div>

								<div class="flex justify-between items-start text-xs text-gray-600 mb-1">
									<div>{item.weight ?? 0} {item.weight_unit ?? 'oz'}</div>
									<div>${(item.price ?? 0).toFixed(2)}</div>
								</div>

								{#if item.url}
									<div class="w-full">
										<a
											href={item.url}
											target="_blank"
											rel="noopener noreferrer"
											class="px-2 py-1 text-xs border rounded-lg hover:bg-gray-50 flex items-center gap-1"
										>
											<Link size={12} />
											Link
										</a>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>

	<!-- Add Item FAB -->
	<button
		class="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-primary-500 text-white
               flex items-center justify-center shadow-lg hover:bg-primary-800
               transition-all duration-200 hover:scale-105 active:scale-95
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
               disabled:opacity-50 disabled:cursor-not-allowed"
		disabled={isCreatingItem}
		aria-label="Add new item"
	>
		{#if isCreatingItem}
			<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
		{:else}
			<Plus size={24} weight="regular" />
		{/if}
	</button>

	<!-- Bottom Navigation -->
	<BottomNav />
</div>
