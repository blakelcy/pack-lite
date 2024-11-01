<!-- src/lib/components/forms/NewItemForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { TShirt, Cookie } from 'phosphor-svelte';
	import { itemStore } from '$lib/stores/itemStore';
	import type { Database } from '$lib/types/database.types';

	type ItemInsert = Database['public']['Tables']['items']['Insert'];

	const dispatch = createEventDispatcher();

	export let listId: string | undefined = undefined;

	let name = '';
	let description = '';
	let isWorn = false;
	let isConsumable = false;
	let weight = '0.00';
	let price = '';
	let link = '';
	let imageUrl = '';
	let imageInput: HTMLInputElement;
	let submitting = false;

	async function handleSubmit() {
		if (!name.trim() || submitting) return;

		submitting = true;

		try {
			const itemData: Omit<ItemInsert, 'user_id'> = {
				name,
				description: description || null,
				worn: isWorn,
				consumable: isConsumable,
				weight: parseFloat(weight) || 0,
				price: parseFloat(price) || 0,
				url: link || null,
				image_url: imageUrl || null,
				weight_unit: 'oz'
			};

			const newItem = await itemStore.addItem(itemData, listId);

			if (newItem) {
				dispatch('submit', newItem);
			}
		} catch (error) {
			console.error('Error adding item:', error);
		} finally {
			submitting = false;
		}
	}

	function handleImageSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const reader = new FileReader();
			reader.onload = (e) => {
				imageUrl = e.target?.result as string;
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
</script>

<div class="flex flex-col">
	<!-- Image Upload -->
	<div class="bg-gray-200 aspect-square max-h-96 relative">
		{#if imageUrl}
			<img src={imageUrl} alt="Item preview" class="w-full h-full object-cover" />
		{:else}
			<button
				type="button"
				class="absolute inset-0 flex items-center justify-center"
				on:click={() => imageInput.click()}
			>
				<div class="w-24 h-24 border-2 border-gray-400 rounded-lg flex items-center justify-center">
					<span class="text-gray-400">+</span>
				</div>
			</button>
		{/if}
		<input
			bind:this={imageInput}
			type="file"
			accept="image/*"
			class="hidden"
			on:change={handleImageSelect}
		/>
	</div>

	<div class="p-4 space-y-4">
		<!-- Name -->
		<div>
			<label for="name" class="text-sm font-medium text-gray-900">Name</label>
			<input
				type="text"
				id="name"
				bind:value={name}
				required
				class="w-full px-3 py-2 border rounded-lg bg-white focus:border-primary-500 focus-visible:border-primary-500 outline-primary-500"
				placeholder="Name"
			/>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="text-sm font-medium text-gray-900">Description</label>
			<textarea
				id="description"
				bind:value={description}
				rows="3"
				class="w-full px-3 py-2 border rounded-lg bg-white resize-none focus:border-primary-500 focus-visible:border-primary-500 outline-primary-500"
				placeholder="Description"
			/>
		</div>

		<!-- Details Section -->
		<div>
			<h3 class="text-sm font-medium text-gray-900">Details</h3>

			<!-- Toggle Buttons -->
			<div class="flex gap-2 my-4">
				<button
					type="button"
					class="flex items-center justify-center grow gap-2 px-4 py-2 rounded-full border border-primary-100
                        {isWorn ? 'bg-primary-500 text-white ' : 'text-gray-500'}"
					on:click={() => (isWorn = !isWorn)}
				>
					<TShirt size={20} />
					<span>Worn</span>
				</button>

				<button
					type="button"
					class="flex items-center justify-center grow gap-2 px-4 py-2 rounded-full border border-primary-100
                        {isConsumable ? 'bg-primary-500 text-white' : 'text-gray-500'}"
					on:click={() => (isConsumable = !isConsumable)}
				>
					<Cookie size={20} />
					<span>Consumable</span>
				</button>
			</div>

			<div class="space-y-2">
				<!-- Weight Input -->
				<button
					class="w-full px-3 py-2 border rounded-lg bg-white text-left flex justify-between items-center"
					on:click={() => {
						/* Open weight picker */
					}}
				>
					<span>{weight} oz</span>
					<span class="text-gray-400">oz</span>
				</button>

				<!-- Price Input -->
				<button
					class="w-full px-3 py-2 border rounded-lg bg-white text-left flex justify-between items-center"
					on:click={() => {
						/* Open price picker */
					}}
				>
					<span>${price || '0.00'}</span>
					<span class="text-gray-400">$</span>
				</button>

				<!-- Link Input -->
				<button
					class="w-full px-3 py-2 border rounded-lg bg-white text-left flex justify-between items-center"
				>
					<span>Link</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Add Button -->
	<div class="px-2 mb-4 w-full h-14">
		<button
			type="button"
			class="w-full h-full p-1 text-center bg-primary-500 text-white font-medium border border-primary-900 rounded-xl hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
			on:click={handleSubmit}
			disabled={submitting}
		>
			<div
				class="w-full h-full flex justify-center items-center border border-primary-900 rounded-lg"
			>
				{#if submitting}
					<div
						class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"
					/>
				{:else}
					ADD ITEM
				{/if}
			</div>
		</button>
	</div>
</div>
