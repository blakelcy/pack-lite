<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	import { listStore } from '$lib/stores/listStore';
	import NewItemForm from '$lib/components/forms/NewItemForm.svelte';
	import { onMount } from 'svelte';
	import {
		CaretCircleLeft,
		Trash,
		XCircle,
		ChartDonut,
		Link,
		Package,
		TShirt,
		Cookie
	} from 'phosphor-svelte';
	import { fly } from 'svelte/transition';
	import type { ListItem } from '$lib/types/lists';

	export let data: PageData;
	// svelte-ignore export_let_unused
	export let form: ActionData;

	let isEditingName = false;
	let showDeleteConfirm = false;
	let showNewItemDrawer = false;
	let showChart = false;
	let nameUpdatePending = false;

	// Drawer gesture handling
	let drawerElement: HTMLElement;
	let isDragging = false;
	let startY = 0;
	let currentY = 0;
	const threshold = 150;

	// Use server-loaded data as initial values
	$: list = $listStore.activeList || data.list;
	$: listItems = $listStore.activeListItems || data.listItems || [];
	$: loading = $listStore?.loading?.items || false;

	// Update the grouped items type
	type GroupedItems = {
		[key: string]: ListItem[];
	};

	// Safe grouping with null check and default empty array
	$: groupedItems = (listItems || []).reduce<GroupedItems>((acc, item) => {
		const category = item?.category || 'Uncategorized';
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(item);
		return acc;
	}, {});

	onMount(async () => {
		console.log('Component mounting with data:', data);
		if (data.list?.id) {
			try {
				await listStore.setActiveList(data.list.id);
			} catch (error) {
				console.error('Error setting active list:', error);
			}
		}
	});

	function handleNameUpdate(newName: string) {
		const form = new FormData();
		form.append('name', newName);

		// Optimistically update the UI
		if (list) {
			list = { ...list, name: newName };
		}

		// Submit the form
		fetch(`?/updateName`, {
			method: 'POST',
			body: form
		})
			.then(async (response) => {
				const result = await response.json();
				if (!result.success) {
					// Revert optimistic update if failed
					if (list && data.list) {
						list = { ...list, name: data.list.name };
					}
				}
				isEditingName = false;
			})
			.catch((error) => {
				console.error('Error updating list name:', error);
				// Revert optimistic update
				if (list && data.list) {
					list = { ...list, name: data.list.name };
				}
				isEditingName = false;
			});
	}

	async function handleBack() {
		// Reset the store before navigation
		listStore.reset();
		await goto('/app');
	}

	function handleCloseDrawer() {
		showNewItemDrawer = false;
	}

	function handleTouchStart(e: TouchEvent) {
		isDragging = true;
		startY = e.touches[0].clientY;
		currentY = 0;
		drawerElement.style.transition = 'none';
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;

		const deltaY = e.touches[0].clientY - startY;
		currentY = Math.max(0, deltaY);

		drawerElement.style.transform = `translateY(${currentY}px)`;
		const opacity = Math.max(0.5 - (currentY / threshold) * 0.5, 0);
		drawerElement.parentElement
			?.querySelector('.bg-black')
			?.setAttribute('style', `opacity: ${opacity}`);
	}

	function handleTouchEnd() {
		if (!isDragging) return;
		isDragging = false;

		if (currentY > threshold) {
			handleCloseDrawer();
		} else {
			drawerElement.style.transform = 'translateY(0)';
			drawerElement.style.transition = 'transform 0.2s ease-out';
			drawerElement.parentElement
				?.querySelector('.bg-black')
				?.setAttribute('style', 'opacity: 0.5');
		}
	}

	function handleNewItem() {
		showNewItemDrawer = true;
	}

	function handleAddItem(event: CustomEvent) {
		const itemData = event.detail;

		// Create a hidden form and submit it
		const form = new FormData();
		// Add all item data to form
		Object.entries(itemData).forEach(([key, value]) => {
			form.append(key, value.toString());
		});

		return {
			action: '?/addItem',
			data: form,
			callback: async ({ result }) => {
				if (result.type === 'success') {
					showNewItemDrawer = false;
					// Refresh the list data after successful addition
					await listStore.loadListDetails(list.id);
				} else {
					console.error('Failed to add item:', result);
					// Could add error notification here
				}
			}
		};
	}

	async function updateListItem(listItemId: string, updates: Partial<ListItem>) {
		const form = new FormData();
		form.append('listItemId', listItemId);

		Object.entries(updates).forEach(([key, value]) => {
			form.append(key, value.toString());
		});

		try {
			const response = await fetch('?/updateListItem', {
				method: 'POST',
				body: form
			});

			const result = await response.json();
			if (!result.success) {
				console.error('Failed to update item:', result.error);
			}
		} catch (error) {
			console.error('Error updating item:', error);
		}
	}

	function handleMyGear() {
		goto('/app/gear');
	}

	async function handleDelete() {
		if (!list) return;

		const form = new FormData();
		form.append('listId', list.id);

		try {
			const response = await fetch('?/removeItem', {
				method: 'POST',
				body: form
			});

			const result = await response.json();
			if (result.success) {
				await goto('/app');
			} else {
				console.error('Failed to delete list:', result.error);
			}
		} catch (error) {
			console.error('Error deleting list:', error);
		}
	}
</script>

<div class="min-h-screen bg-white flex flex-col">
	{#if loading && !list}
		<div class="flex-1 flex items-center justify-center">
			<div
				class="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full"
			/>
		</div>
	{:else if !list}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-gray-500">List not found</p>
		</div>
	{:else}
		<!-- Top Bar -->
		<header class="px-4 py-3 flex items-center justify-between border-b">
			<button class="p-2 text-gray-900 hover:text-gray-800" on:click={handleBack}>
				<CaretCircleLeft size={24} weight="fill" />
			</button>

			<div class="flex-1 mx-4">
				{#if isEditingName}
					<form
						method="POST"
						action="?/updateName"
						use:enhance={() => {
							nameUpdatePending = true;
							return async ({ result }) => {
								nameUpdatePending = false;
								if (result.type === 'success') {
									isEditingName = false;
								}
							};
						}}
					>
						<input
							type="text"
							name="name"
							class="w-full px-2 py-1 text-lg font-medium text-center border-b border-gray-300 focus:outline-none focus:border-primary-500"
							value={list.name}
							disabled={nameUpdatePending}
							on:blur={(e) => e.currentTarget.form?.requestSubmit()}
							on:keydown={(e) => e.key === 'Enter' && e.currentTarget.form?.requestSubmit()}
							autofocus
						/>
					</form>
					<!-- <input
						type="text"
						class="w-full px-2 py-1 text-lg font-medium text-center border-b border-gray-300 focus:outline-none focus:border-primary-500"
						value={list.name}
						on:blur={(e) => handleNameUpdate(e.currentTarget.value)}
						on:keydown={(e) => e.key === 'Enter' && handleNameUpdate(e.currentTarget.value)}
						autofocus
					/> -->
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
				<Trash size={20} weight="fill" />
			</button>
		</header>

		<!-- Stats Bar -->
		<div class="px-4 py-2 border-b flex justify-between text-sm text-gray-600">
			<span>{listItems.length} Items</span>
			<span>Total: {list?.total_weight ?? 0} oz</span>
		</div>

		<!-- Chart Toggle -->
		{#if listItems.length > 0}
			<div class="px-4 py-3 flex justify-center">
				<button
					class="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium text-sm
                       flex items-center gap-2 hover:bg-green-900 transition-colors"
					on:click={() => (showChart = !showChart)}
				>
					<ChartDonut size={20} weight="fill" />
					View Chart
				</button>
			</div>
		{/if}

		<!-- Main Content -->
		<main class="flex-1 flex flex-col bg-gray-50">
			{#if loading}
				<div class="flex justify-center items-center py-8">
					<div
						class="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full"
					/>
				</div>
			{:else if !listItems.length}
				<div class="text-center text-gray-500 py-8">
					<h2 class="text-xl font-medium mb-2">Start by adding your first item</h2>
					<p class="text-sm mb-4">You can organize into categories later</p>
				</div>
			{:else}
				<div class="flex-1 px-4 py-2">
					{#each Object.entries(groupedItems) as [category, items]}
						<div class="mb-12">
							<h2 class="text-2xl font-bold mb-3 px-2">{category}</h2>
							<div class="grid grid-cols-3 gap-2">
								{#each items as item (`${item.list_id}-${item.id}`)}
									<!-- Item card content -->
									<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
										<div class="flex flex-col">
											<!-- Item Image -->
											<div class="relative bg-primary-100 w-full aspect-square">
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

											<!-- Item Details - Simplified for mobile -->
											<div class="flex-1 p-2">
												<!-- Reduced padding -->
												<div class="mb-1">
													<!-- Reduced margin -->
													<h3 class="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
												</div>

												<div class="flex justify-between items-start text-xs text-gray-600 mb-1">
													<div>{item.weight ?? 0} oz</div>
													<div>${item.price?.toFixed(2) ?? '0.00'}</div>
												</div>

												<div class="w-full">
													<!-- Reduced gap -->
													{#if item.link}
														<a
															href={item.link}
															target="_blank"
															rel="noopener noreferrer"
															class="px-2 py-1 text-xs border rounded-lg hover:bg-gray-50
                                                           flex items-center gap-1"
														>
															<Link size={12} />
															Link
														</a>
													{/if}
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</main>

		<!-- Bottom Navigation -->
		<nav class="fixed bottom-4 px-2 w-full h-14 grid gap-3 grid-cols-2">
			<button
				class="p-1 text-center bg-white text-primary-500 font-medium border border-primary-900 rounded-xl hover:bg-primary-800"
				on:click={handleMyGear}
				><div class="w-full h-full flex justify-center items-center border border-white rounded-lg">
					MY GEAR
				</div>
			</button>
			<button
				class="p-1 text-center bg-primary-500 text-white font-medium border border-primary-900 rounded-xl hover:bg-primary-800"
				on:click={handleNewItem}
			>
				<div
					class="w-full h-full flex justify-center items-center border border-primary-900 rounded-lg"
				>
					NEW ITEM
				</div>
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
					<form
						method="POST"
						action="?/deleteList"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									await goto('/app');
								} else {
									// Handle error case
									console.error('Failed to delete list:', result);
									// Could add toast notification here
								}
							};
						}}
					>
						<input type="hidden" name="listId" value={list.id} />
						<div class="flex justify-end space-x-4">
							<button
								type="button"
								class="px-4 py-2 text-gray-600 hover:text-gray-800"
								on:click={() => (showDeleteConfirm = false)}
							>
								Cancel
							</button>
							<button
								type="submit"
								class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
							>
								Delete
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		{#if showNewItemDrawer}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 z-50" on:click|self={handleCloseDrawer}>
				<!-- Semi-transparent overlay -->
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<div
					class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
					transition:fly={{ duration: 200, y: 0, opacity: 1 }}
				/>

				<!-- Drawer -->
				<div
					bind:this={drawerElement}
					class="absolute inset-x-0 bottom-0 bg-gray-50 rounded-t-xl overflow-hidden touch-none"
					style="transform: translateY(0)"
					on:touchstart={handleTouchStart}
					on:touchmove={handleTouchMove}
					on:touchend={handleTouchEnd}
					on:touchcancel={handleTouchEnd}
				>
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<div class="h-1 w-12 bg-gray-300 rounded-full mx-auto mt-3 mb-5" />

					<!-- Header -->
					<header class="px-4 pb-3 border-b bg-white flex justify-between items-center">
						<h2 class="text-lg font-medium">Add Item</h2>
						<button class="p-1 rounded-full hover:bg-gray-100" on:click={handleCloseDrawer}>
							<XCircle size={24} />
						</button>
					</header>

					<!-- Form -->
					<div class="max-h-[85vh] overflow-y-auto">
						<NewItemForm listId={list.id} on:submit={handleAddItem} />
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
