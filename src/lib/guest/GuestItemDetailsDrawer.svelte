<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { XCircle } from 'phosphor-svelte';
	import GuestNewItemForm from './GuestNewItemForm.svelte';
	import { guestStore } from '$lib/stores/guest';
	import { fly } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let item: any;
	export let drawerElement: HTMLElement;

	let showDeleteConfirm = false;

	function handleClose() {
		dispatch('close');
	}

	function handleRemoveFromList() {
		guestStore.removeItem(item.id);
		dispatch('itemRemoved');
		handleClose();
	}
</script>

<!-- Semi-transparent overlay -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed inset-0 z-50" on:click|self={handleClose}>
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
	>
		<div class="h-1 w-12 bg-gray-300 rounded-full mx-auto mt-3 mb-5" />

		<!-- Header -->
		<header class="px-4 pb-3 border-b bg-white">
			<div class="flex justify-between items-center">
				<h2 class="text-lg font-medium">Edit Item</h2>
				<button class="p-1 rounded-full hover:bg-gray-100" on:click={handleClose}>
					<XCircle size={24} />
				</button>
			</div>
		</header>

		<!-- Form -->
		<div class="max-h-[85vh] overflow-y-auto">
			<GuestNewItemForm
				mode="edit"
				initialData={{
					id: item.id, // Important: Pass the ID for updating
					name: item.name,
					description: item.description || '',
					weight: item.weight?.toString() || '0.00',
					weight_unit: item.weight_unit || 'oz',
					price: item.price?.toString() || '0.00',
					link: item.link || '',
					worn: item.worn || false,
					consumable: item.consumable || false
				}}
				on:success={() => {
					dispatch('itemUpdated');
					handleClose();
				}}
			/>

			<!-- Remove from List Button -->
			<div class="px-4 py-2 border-t bg-white">
				<button
					type="button"
					class="w-full p-4 text-red-600 font-medium rounded-lg border border-red-200
                           hover:bg-red-50 transition-colors"
					on:click={() => (showDeleteConfirm = true)}
				>
					Remove Item
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Delete Confirmation Dialog -->
{#if showDeleteConfirm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
		on:click|self={() => (showDeleteConfirm = false)}
	>
		<div class="bg-white rounded-lg p-6 max-w-sm w-full">
			<h3 class="text-lg font-medium mb-4">Remove Item</h3>
			<p class="text-gray-600 mb-6">
				Are you sure you want to remove "{item.name}"? This cannot be undone.
			</p>
			<div class="flex justify-end space-x-4">
				<button
					type="button"
					class="px-4 py-2 text-gray-600 hover:text-gray-800"
					on:click={() => (showDeleteConfirm = false)}
				>
					Cancel
				</button>
				<button
					type="button"
					class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
					on:click={handleRemoveFromList}
				>
					Remove
				</button>
			</div>
		</div>
	</div>
{/if}
