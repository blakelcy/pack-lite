<!-- src/lib/components/ListItemsView.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { Package, Link as LinkIcon } from 'phosphor-svelte';

	interface Props {
		listItems?: any[];
		totalWeight?: number;
	}

	let { listItems = [], totalWeight = 0 }: Props = $props();

	// Group items by category
	let groupedItems = $derived(listItems.reduce((acc, item) => {
		const category = item.category || 'Uncategorized';
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(item);
		return acc;
	}, {}));

	let showChart = $state(false);

	function handleShowChart() {
		showChart = !showChart;
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

{#if showChart}
	<div class="fixed inset-0 bg-white z-50">
		<div class="p-4 flex justify-between items-center border-b">
			<h2 class="text-lg font-medium">Chart Breakdown</h2>
			<button class="text-gray-600" onclick={() => (showChart = false)}> Done </button>
		</div>
		<div class="p-4">
			<!-- Chart placeholder - to be implemented -->
			<div class="aspect-square max-w-md mx-auto bg-gray-100 rounded-full">
				<!-- Chart will go here -->
			</div>
		</div>
	</div>
{:else}
	<div class="flex flex-col min-h-screen">
		<!-- Stats Header -->
		<div class="px-4 py-2 border-b flex justify-between text-sm text-gray-600">
			<span>{listItems.length} Items</span>
			<span>Total: {totalWeight} oz</span>
		</div>

		<!-- View Chart Button -->
		<div class="px-4 py-3 flex justify-center">
			<button
				class="bg-green-800 text-white px-6 py-2 rounded-lg font-medium text-sm
                       flex items-center gap-2 hover:bg-green-900 transition-colors"
				onclick={handleShowChart}
			>
				View Chart
			</button>
		</div>

		<!-- Main Content -->
		<div class="flex-1 px-4 py-2">
			{#each Object.entries(groupedItems) as [category, items]}
				<div class="mb-8">
					<h2 class="text-2xl font-bold mb-4">{category}</h2>
					<div class="grid gap-4">
						{#each items as item (item.id)}
							<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
								<div class="flex">
									<!-- Item Image -->
									<div class="relative w-24 h-24 flex-shrink-0">
										{#if item.image_url}
											<img
												src={item.image_url}
												alt={item.name}
												class="w-full h-full object-cover"
											/>
										{:else}
											<div class="w-full h-full bg-gray-100 flex items-center justify-center">
												<Package size={32} class="text-gray-400" />
											</div>
										{/if}

										{#if item.worn}
											<div class="absolute top-1 left-1 bg-white rounded-full p-1">
												<span class="sr-only">Worn Item</span>
												👕
											</div>
										{/if}

										{#if item.consumable}
											<div class="absolute top-1 right-1 bg-white rounded-full p-1">
												<span class="sr-only">Consumable Item</span>
												🍪
											</div>
										{/if}
									</div>

									<!-- Item Details -->
									<div class="flex-1 p-3">
										<div class="flex justify-between items-start mb-2">
											<h3 class="font-medium">{item.name}</h3>
											<div class="text-sm text-gray-500">
												${item.price?.toFixed(2) ?? '0.00'}
											</div>
										</div>

										<div class="text-sm text-gray-600 mb-2">
											{item.weight ?? 0} oz
										</div>

										<div class="flex gap-2">
											{#if item.link}
												<a
													href={item.link}
													target="_blank"
													rel="noopener noreferrer"
													class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50
                                                           flex items-center gap-1"
												>
													<LinkIcon size={16} />
													Link
												</a>
											{/if}
											<button class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">
												Details
											</button>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	/* Add any needed styles here */
</style>
