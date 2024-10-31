<!-- src/routes/app/lists/[id]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { listStore } from '$lib/stores/listStore';
	import { onMount } from 'svelte';

	export let data: PageData;
	let isEditingName = false;
	let showDeleteConfirm = false;
	let listItems = data.listItems || [];

	// Create a reactive list variable that updates when either data.list or $listStore.list changes
	$: list = $listStore.list || data.list;
	$: listItems = data.listItems || [];

	onMount(async () => {
		await listStore.getList(data.list.id);
	});

	async function handleNameUpdate(newName: string) {
		if (!list) return;

		try {
			await listStore.updateListName(list.id, newName);
			isEditingName = false;
			await listStore.getList(list.id);
		} catch (error) {
			console.error('Error updating list name:', error);
		}
	}
	async function handleBack() {
		// Reset the store before navigation
		listStore.reset();
		await goto('/app');
	}

	function handleNewItem() {
		// Implement new item functionality
		console.log('New item clicked');
	}

	function handleMyGear() {
		goto('/app/items');
	}
	async function handleDelete() {
		if (!list) return;

		try {
			await listStore.deleteList(list.id);
			await goto('/app');
		} catch (error) {
			console.error('Error deleting list:', error);
		}
	}
</script>

<div class="min-h-screen bg-white flex flex-col">
	<!-- Top Bar -->
	<header class="px-4 py-3 flex items-center justify-between border-b">
		<button class="p-2 text-gray-600 hover:text-gray-800" on:click={handleBack}>
			<svg
				class="w-6 h-6"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
		</button>

		<div class="flex-1 mx-4">
			{#if isEditingName}
				<input
					type="text"
					class="w-full px-2 py-1 text-lg font-medium text-center border-b border-gray-300 focus:outline-none focus:border-primary-500"
					value={list.name}
					on:blur={(e) => handleNameUpdate(e.currentTarget.value)}
					on:keydown={(e) => e.key === 'Enter' && handleNameUpdate(e.currentTarget.value)}
					autofocus
				/>
			{:else}
				<button
					class="w-full text-lg font-medium text-center hover:text-primary-600"
					on:click={() => (isEditingName = true)}
				>
					{list.name}
				</button>
			{/if}
		</div>

		<button
			class="p-2 text-red-600 hover:text-red-700 text-sm font-medium"
			on:click={() => (showDeleteConfirm = true)}
		>
			Delete
		</button>
	</header>

	<!-- Stats Bar -->
	<div class="px-4 py-2 border-b flex justify-between text-sm text-gray-600">
		<span>{listItems.length} Items</span>
		<span>Total: {list?.total_weight ?? 0} oz</span>
	</div>

	<!-- Main Content -->
	<main class="flex-1 flex flex-col items-center justify-center px-6 bg-gray-50">
		{#if listItems.length === 0}
			<div class="text-center text-gray-500">
				<h2 class="text-xl font-medium mb-2">Start by adding your first item</h2>
				<p class="text-sm mb-4">You can organize into categories later</p>
			</div>
		{:else}
			<!-- Add your list items display here -->
		{/if}
	</main>

	<!-- Bottom Navigation -->
	<nav class="border-t grid grid-cols-2">
		<button
			class="py-4 text-center text-gray-600 hover:text-primary-600 font-medium"
			on:click={handleMyGear}
		>
			MY GEAR
		</button>
		<button
			class="py-4 text-center bg-primary-900 text-white font-medium hover:bg-primary-800"
			on:click={handleNewItem}
		>
			NEW ITEM
		</button>
	</nav>

	{#if showDeleteConfirm}
		<div
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
			on:click|self={() => (showDeleteConfirm = false)}
		>
			<div class="bg-white rounded-lg p-6 max-w-sm w-full">
				<h3 class="text-lg font-medium mb-4">Delete List</h3>
				<p class="text-gray-600 mb-6">
					Are you sure you want to delete "{list?.name}"? This action cannot be undone.
				</p>
				<div class="flex justify-end space-x-4">
					<button
						class="px-4 py-2 text-gray-600 hover:text-gray-800"
						on:click={() => (showDeleteConfirm = false)}
					>
						Cancel
					</button>
					<button
						class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
						on:click={handleDelete}
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
