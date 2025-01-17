<script lang="ts">
	import { self } from 'svelte/legacy';

	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { guestStore } from '$lib/stores/guest';
	import GuestItemDetailsDrawer from '$lib/guest/GuestItemDetailsDrawer.svelte';
	import {
		CaretCircleLeft,
		Trash,
		XCircle,
		Package,
		TShirt,
		Cookie,
		Link,
		Download,
		PencilSimple
	} from 'phosphor-svelte';
	import { fly } from 'svelte/transition';
	import GuestNewItemForm from '$lib/guest/GuestNewItemForm.svelte';
	import html2canvas from 'html2canvas';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let isEditingName = $state(false);
	let showDeleteConfirm = $state(false);
	let showNewItemDrawer = $state(false);
	let showItemDetails = $state(false);
	let selectedItem: any = $state(null);
	let nameInputValue = $state('');

	// Subscribe to guest store
	let { list, items, error } = $derived($guestStore);

	// Drawer gesture handling
	let drawerElement: HTMLElement = $state();
	let isDragging = false;
	let startY = 0;
	let currentY = 0;
	const threshold = 150;

	// Group items by category (simplified version)
	let groupedItems = $derived({
		'All Items': items || []
	});

	function handleCloseDrawer() {
		showNewItemDrawer = false;
		if (showItemDetails) {
			showItemDetails = false;
			selectedItem = null;
		}
	}

	function startEditing() {
		isEditingName = true;
		nameInputValue = list?.name || '';
	}

	function handleNameUpdate() {
		if (!list || !nameInputValue.trim()) return;
		guestStore.updateListName(list.id, nameInputValue.trim());
		isEditingName = false;
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
	}

	function handleTouchEnd() {
		if (!isDragging) return;
		isDragging = false;
		if (currentY > threshold) {
			handleCloseDrawer();
		} else {
			drawerElement.style.transform = 'translateY(0)';
			drawerElement.style.transition = 'transform 0.2s ease-out';
		}
	}

	async function handleBack() {
		await goto('/guest/list');
	}

	function handleNewItem() {
		showNewItemDrawer = true;
	}

	function handleItemClick(item: any) {
		selectedItem = item;
		showItemDetails = true;
	}

	async function handleExport() {
		const exportContent = document.querySelector('.export-content');
		if (!exportContent) return;

		try {
			const canvas = await html2canvas(exportContent, {
				backgroundColor: '#ffffff',
				scale: 2, // Higher quality
				logging: false,
				useCORS: true,
				width: 800, // Fixed width for consistency
				height: exportContent.offsetHeight
			});

			const image = canvas.toDataURL('image/png');
			const a = document.createElement('a');
			a.href = image;
			a.download = `${list?.name || 'gear-list'}.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} catch (error) {
			console.error('Error exporting list:', error);
		}
	}

	async function handleDelete() {
		if (!list) return;
		guestStore.clear();
		await goto('/guest/list');
	}
</script>

<div class="min-h-screen bg-white flex flex-col">
	<!-- Top Bar -->
	<header class="px-4 py-3 flex items-center justify-between border-b">
		<button class="p-2 text-gray-900 hover:text-gray-800" onclick={handleBack}>
			<CaretCircleLeft size={24} weight="fill" />
		</button>

		<div class="flex-1 mx-4">
			{#if isEditingName}
				<div class="relative flex items-center justify-center">
					<input
						type="text"
						class="w-full px-2 py-1 text-lg font-medium text-center border-b
                       border-gray-300 focus:outline-none focus:border-primary-500"
						bind:value={nameInputValue}
						onblur={handleNameUpdate}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								handleNameUpdate();
							} else if (e.key === 'Escape') {
								isEditingName = false;
							}
						}}
						autofocus
					/>
				</div>
			{:else}
				<button
					class="w-full text-lg font-medium text-center hover:text-primary-600 relative group"
					onclick={startEditing}
				>
					<span class="relative">
						{list?.name || 'New List'}
						<PencilSimple
							size={16}
							weight="regular"
							class="absolute top-1/2 -translate-y-1/2 -left-6 text-gray-400 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200"
						/>
					</span>
				</button>
			{/if}
		</div>
		<button
			class="p-2 text-red-600 hover:text-red-700 text-sm font-medium"
			onclick={() => (showDeleteConfirm = true)}
		>
			<Trash size={20} weight="fill" />
		</button>
	</header>

	<!-- Stats Bar -->
	<div class="px-4 py-2 border-b flex justify-between text-sm text-gray-600">
		<span>{items?.length || 0} Items</span>
		<span>Total: {list?.total_weight || 0} oz</span>
	</div>

	<!-- Main Content -->
	<main class="flex-1 flex flex-col bg-gray-50">
		<!-- Guest Mode Notice -->
		<div class="p-4">
			<div class="bg-blue-50 p-4 rounded-lg">
				<p class="text-sm text-blue-700 text-center">
					Guest mode is limited to 20 items.
					<a href="/guest/profile" class="underline font-medium">Create an account</a>
					to save your list permanently.
				</p>
			</div>
		</div>
		{#if !items?.length}
			<div class="text-center text-gray-500 py-8">
				<h2 class="text-xl font-medium mb-2">Start by adding your first item</h2>
				<p class="text-sm mb-4">Limited to 20 items in guest mode</p>
			</div>
		{:else}
			<div class="flex-1 px-4 py-2">
				{#each Object.entries(groupedItems) as [category, categoryItems] (category)}
					<div class="mb-12">
						<div class="grid grid-cols-2 gap-2">
							{#each categoryItems as item (item.id)}
								<div
									class="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer
                                           hover:border-primary-500 transition-colors"
									onclick={() => handleItemClick(item)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleItemClick(item);
										}
									}}
									role="button"
									tabindex="0"
								>
									<div class="flex flex-col">
										<!-- Item Details -->
										<div class="flex-1 p-2">
											<div class="mb-1 flex justify-between">
												<h3 class="font-medium text-gray-900 text-sm truncate">
													{item.name}
												</h3>
												{#if item.worn || item.consumable}
													<div class="flex gap-1">
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

											<div class="flex justify-between items-start text-xs text-gray-600 mb-1">
												<div>{item.weight} {item.weight_unit ?? 'oz'}</div>
												<div>${(item.price || 0).toFixed(2)}</div>
											</div>

											{#if item.link}
												<div class="w-full">
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
												</div>
											{/if}
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
			class="p-1 text-center bg-white text-primary-500 font-medium border border-primary-900
                   rounded-xl hover:bg-primary-800"
			onclick={handleExport}
		>
			<div
				class="w-full h-full flex justify-center items-center gap-2 border border-white rounded-lg uppercase"
			>
				<Download size={20} />
				Save Image
			</div>
		</button>
		<button
			class="p-1 text-center bg-primary-500 text-white font-medium border border-primary-900
                   rounded-xl hover:bg-primary-800"
			onclick={handleNewItem}
		>
			<div
				class="w-full h-full flex justify-center items-center border border-primary-900 rounded-lg"
			>
				NEW ITEM ({items?.length || 0}/20)
			</div>
		</button>
	</nav>

	<!-- Delete Confirmation Dialog -->
	{#if showDeleteConfirm}
		<div
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
			onclick={self(() => (showDeleteConfirm = false))}
		>
			<div class="bg-white rounded-lg p-6 max-w-sm w-full">
				<h3 class="text-lg font-medium mb-4">Delete List</h3>
				<p class="text-gray-600 mb-6">
					Are you sure you want to delete "{list?.name}"? This action cannot be undone.
				</p>
				<div class="flex justify-end space-x-4">
					<button
						class="px-4 py-2 text-gray-600 hover:text-gray-800"
						onclick={() => (showDeleteConfirm = false)}
					>
						Cancel
					</button>
					<button
						class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
						onclick={handleDelete}
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- New Item Drawer -->
	{#if showNewItemDrawer}
		<div class="fixed inset-0 z-50" onclick={self(handleCloseDrawer)}>
			<div
				class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
				transition:fly={{ duration: 200, y: 0, opacity: 1 }}
			></div>

			<div
				bind:this={drawerElement}
				class="absolute inset-x-0 bottom-0 bg-gray-50 rounded-t-xl overflow-hidden touch-none"
				style="transform: translateY(0)"
				ontouchstart={handleTouchStart}
				ontouchmove={handleTouchMove}
				ontouchend={handleTouchEnd}
				ontouchcancel={handleTouchEnd}
			>
				<div class="h-1 w-12 bg-gray-300 rounded-full mx-auto mt-3 mb-5"></div>

				<header class="px-4 pb-3 border-b bg-white flex justify-between items-center">
					<h2 class="text-lg font-medium">Add Item ({items?.length || 0}/20)</h2>
					<button class="p-1 rounded-full hover:bg-gray-100" onclick={handleCloseDrawer}>
						<XCircle size={24} />
					</button>
				</header>

				<div class="max-h-[85vh] overflow-y-auto">
					<GuestNewItemForm
						on:success={() => {
							showNewItemDrawer = false;
						}}
					/>
				</div>
			</div>
		</div>
	{/if}

	<!-- Item Details Drawer -->
	{#if showItemDetails && selectedItem}
		<GuestItemDetailsDrawer
			item={selectedItem}
			bind:drawerElement
			on:close={() => {
				showItemDetails = false;
				selectedItem = null;
			}}
			on:itemUpdated={() => {
				// Handle item update in guest store
			}}
			on:itemRemoved={() => {
				guestStore.removeItem(selectedItem.id);
				showItemDetails = false;
				selectedItem = null;
			}}
		/>
	{/if}
</div>

<!-- Hidden Export Content -->
<div class="fixed -left-[9999px]">
	<div class="export-content bg-white" style="width: 800px;">
		<!-- Header -->
		<div class="p-4 border-b text-center">
			<h1 class="text-2xl font-medium">{list?.name || 'Gear List'}</h1>
		</div>

		<!-- Stats -->
		<div class="px-4 py-2 border-b flex justify-between text-sm text-gray-600">
			<span>{items?.length || 0} Items</span>
			<span>Total: {list?.total_weight || 0} oz</span>
		</div>

		<!-- Items Grid -->
		<div class="p-4">
			<div class="grid grid-cols-2 gap-2">
				{#each items || [] as item (item.id)}
					<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
						<div class="flex flex-col">
							<div class="flex-1 p-2">
								<div class="mb-1 flex justify-between">
									<h3 class="font-medium text-gray-900 text-sm truncate">
										{item.name}
									</h3>
									{#if item.worn || item.consumable}
										<div class="flex gap-1">
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

								<div class="flex justify-between items-start text-xs text-gray-600">
									<div>{item.weight} {item.weight_unit ?? 'oz'}</div>
									<div>${(item.price || 0).toFixed(2)}</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
