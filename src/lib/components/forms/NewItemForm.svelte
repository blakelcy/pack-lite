<!-- src/lib/components/forms/NewItemForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { TShirt, Cookie } from 'phosphor-svelte';
	import { itemStore } from '$lib/stores/itemStore';
	import type { Database } from '$lib/database.types';
	import { listStore } from '$lib/stores/listStore';

	type ItemInsert = Database['public']['Tables']['items']['Insert'];

	const dispatch = createEventDispatcher();

	export let listId: string | undefined = undefined;

	type WeightUnit = 'oz' | 'g' | 'kg' | 'lb';

	let name = '';
	let description = '';
	let isWorn = false;
	let isConsumable = false;
	let weight = '0.00';
	let weightUnit: WeightUnit = 'oz';
	let price = '';
	let link = '';
	let imageUrl = '';
	let imageInput: HTMLInputElement;
	let submitting = false;

	const weightUnits: WeightUnit[] = ['oz', 'g', 'lb', 'kg'];

	function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
		// First convert to grams as base unit
		let grams = value;
		switch (from) {
			case 'oz':
				grams = value * 28.3495;
				break;
			case 'lb':
				grams = value * 453.592;
				break;
			case 'kg':
				grams = value * 1000;
				break;
		}

		// Then convert to target unit
		switch (to) {
			case 'oz':
				return grams / 28.3495;
			case 'lb':
				return grams / 453.592;
			case 'kg':
				return grams / 1000;
			default:
				return grams;
		}
	}

	$: {
		// Format weight to 2 decimal places when input changes
		if (weight) {
			const parsed = parseFloat(weight);
			if (!isNaN(parsed)) {
				weight = parsed.toFixed(2);
			}
		}
	}

	$: {
		// Format price to 2 decimal places when input changes
		if (price) {
			const parsed = parseFloat(price);
			if (!isNaN(parsed)) {
				price = parsed.toFixed(2);
			}
		}
	}

	async function handleSubmit() {
		if (!name.trim() || submitting) return;
		submitting = true;

		try {
			const formData = new FormData();
			formData.append('name', name);
			formData.append('description', description || '');
			formData.append('worn', isWorn.toString());
			formData.append('consumable', isConsumable.toString());
			formData.append('weight', weight);
			formData.append('weight_unit', weightUnit);
			formData.append('price', price || '0');
			formData.append('url', link || '');
			formData.append('image_url', imageUrl || '');

			dispatch('submit', formData);
		} catch (error) {
			console.error('Error preparing item data:', error);
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
			<!-- svelte-ignore element_invalid_self_closing_tag -->
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
			<div class="flex gap-2 mb-4">
				<button
					type="button"
					class="flex items-center justify-center grow gap-2 px-4 py-2 rounded-lg border border-primary-100
                        {isWorn ? 'bg-primary-500 text-white ' : 'text-gray-500'}"
					on:click={() => (isWorn = !isWorn)}
				>
					<TShirt size={20} />
					<span>Worn</span>
				</button>

				<button
					type="button"
					class="flex items-center justify-center grow gap-2 px-4 py-2 rounded-lg border border-primary-100
                        {isConsumable ? 'bg-primary-500 text-white' : 'text-gray-500'}"
					on:click={() => (isConsumable = !isConsumable)}
				>
					<Cookie size={20} weight="fill" />
					<span>Consumable</span>
				</button>
			</div>

			<div class="space-y-2">
				<!-- Weight Input -->
				<div class="relative">
					<label for="weight" class="text-sm font-medium text-gray-900">Weight</label>
					<div class="flex flex-col gap-2">
						<input
							type="text"
							inputmode="decimal"
							id="weight"
							bind:value={weight}
							placeholder="0.00"
							class="w-full px-3 py-2 border rounded-lg bg-white focus:border-primary-500 focus-visible:border-primary-500 outline-primary-500"
						/>
						<!-- Weight Unit Toggle Chips -->
						<div class="flex gap-2 justify-between items-center">
							{#each weightUnits as unit}
								<button
									type="button"
									class="flex items-center justify-center grow px-4 py-2 rounded-full border border-primary-100
                        {weightUnit === unit ? 'bg-primary-500 text-white' : 'text-gray-500'}"
									on:click={() => {
										if (weightUnit !== unit && weight) {
											// Convert the value when changing units
											const value = parseFloat(weight);
											if (!isNaN(value)) {
												weight = convertWeight(value, weightUnit, unit).toFixed(2);
											}
										}
										weightUnit = unit;
									}}
								>
									{unit}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Price Input -->
				<div class="relative">
					<label for="price" class="text-sm font-medium text-gray-900">Price</label>
					<div class="flex gap-2">
						<div class="flex items-center px-3 text-gray-400">$</div>
						<input
							type="text"
							inputmode="decimal"
							id="price"
							bind:value={price}
							placeholder="0.00"
							class="w-full px-3 py-2 border rounded-lg bg-white focus:border-primary-500 focus-visible:border-primary-500 outline-primary-500"
						/>
					</div>
				</div>

				<!-- Link Input -->
				<div class="relative">
					<label for="link" class="text-sm font-medium text-gray-900">Link</label>
					<input
						type="url"
						id="link"
						bind:value={link}
						placeholder="Paste item URL"
						class="w-full px-3 py-2 border rounded-lg bg-white focus:border-primary-500 focus-visible:border-primary-500 outline-primary-500"
					/>
				</div>
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
					<!-- svelte-ignore element_invalid_self_closing_tag -->
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
