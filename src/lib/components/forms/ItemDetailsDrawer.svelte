<script lang="ts">
	import { self } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte';
	import { XCircle, Info } from 'phosphor-svelte';
	import NewItemForm from './NewItemForm.svelte';
	import type { ListItemWithDetails } from '$lib/stores/listStore';
	import { toast } from '$lib/stores/toastStore';
	import { fly } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	interface Props {
		item: ListItemWithDetails;
		listId: string;
		drawerElement: HTMLElement;
	}

	let { item, listId, drawerElement = $bindable() }: Props = $props();

	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);

	function handleClose() {
		dispatch('close');
	}

	async function handleRemoveFromList() {
		isDeleting = true;

		try {
			const res = await fetch(`?/removeItem`, {
				method: 'POST',
				body: new URLSearchParams({
					listItemId: item.id
				})
			});

			const result = await res.json();

			if (result.error) {
				throw new Error(result.error);
			}

			toast.show('Item removed from list', 'success');
			dispatch('itemRemoved');
			handleClose();
		} catch (error) {
			console.error('Error removing item:', error);
			toast.show('Failed to remove item', 'info');
		} finally {
			isDeleting = false;
			showDeleteConfirm = false;
		}
	}
</script>

<!-- Semi-transparent overlay -->
<div class="fixed inset-0 z-50" onclick={self(handleClose)}>
	<div
		class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
		transition:fly={{ duration: 200, y: 0, opacity: 1 }}
	></div>

	<!-- Drawer -->
	<div
		bind:this={drawerElement}
		class="absolute inset-x-0 bottom-0 bg-gray-50 rounded-t-xl overflow-hidden touch-none"
		style="transform: translateY(0)"
	>
		<div class="h-1 w-12 bg-gray-300 rounded-full mx-auto mt-3 mb-5"></div>

		<!-- Header -->
		<header class="px-4 pb-3 border-b bg-white">
			<div class="flex justify-between items-center mb-2">
				<h2 class="text-lg font-medium">Edit Item</h2>
				<button class="p-1 rounded-full hover:bg-gray-100" onclick={handleClose}>
					<XCircle size={24} />
				</button>
			</div>

			<!-- Simple info text about shared items -->
			<p class="text-sm text-gray-600 flex items-center gap-1">
				<Info size={16} />
				<span>Changes will affect all lists using this item</span>
			</p>
		</header>

		<!-- Form -->
		<div class="max-h-[85vh] overflow-y-auto">
			<NewItemForm
				mode="edit"
				{listId}
				initialData={{
					id: item.items?.id,
					listItemId: item.id,
					name: item.items?.name || '',
					description: item.items?.description || '',
					weight: item.items?.weight?.toString() || '0.00',
					weight_unit: item.items?.weight_unit || 'oz',
					price: item.items?.price?.toString() || '0.00',
					url: item.items?.url || '',
					image_url: item.items?.image_url || '',
					worn: item.worn || false,
					consumable: item.consumable || false
				}}
				on:success={(event) => {
					toast.show('Item updated successfully', 'success');
					dispatch('itemUpdated', event.detail);
					handleClose();
				}}
			/>

			<!-- Remove from List Button -->
			<div class="px-4 py-2 border-t bg-white">
				<button
					type="button"
					class="w-full p-4 text-red-600 font-medium rounded-lg border border-red-200
                           hover:bg-red-50 transition-colors"
					onclick={() => (showDeleteConfirm = true)}
				>
					Remove from List
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Delete Confirmation Dialog -->
{#if showDeleteConfirm}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
		onclick={self(() => (showDeleteConfirm = false))}
	>
		<div class="bg-white rounded-lg p-6 max-w-sm w-full">
			<h3 class="text-lg font-medium mb-4">Remove Item</h3>
			<p class="text-gray-600 mb-6">
				Are you sure you want to remove "{item.items?.name}" from this list? The item will remain in
				your gear inventory.
			</p>
			<div class="flex justify-end space-x-4">
				<button
					type="button"
					class="px-4 py-2 text-gray-600 hover:text-gray-800"
					onclick={() => (showDeleteConfirm = false)}
					disabled={isDeleting}
				>
					Cancel
				</button>
				<button
					type="button"
					class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
					onclick={handleRemoveFromList}
					disabled={isDeleting}
				>
					{#if isDeleting}
						<div
							class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
						></div>
					{:else}
						Remove
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
