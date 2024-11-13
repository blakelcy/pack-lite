<!-- src/lib/components/forms/NewItemForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { TShirt, Cookie } from 'phosphor-svelte';
	import { itemStore } from '$lib/stores/itemStore';
	import type { Database } from '$lib/database.types';
	import { listStore } from '$lib/stores/listStore';
	import { enhance } from '$app/forms';

	type ItemInsert = Database['public']['Tables']['items']['Insert'];

	const dispatch = createEventDispatcher();

	export let listId: string | undefined = undefined;
	export let mode: 'create' | 'edit' = 'create';
	export let initialData: {
		name: string;
		description: string;
		weight: string;
		weight_unit: WeightUnit;
		price: string;
		url: string;
		image_url: string;
		worn: boolean;
		consumable: boolean;
	} | null = null;

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

	// Helper function to format number to 2 decimal places
	function formatDecimal(value: string): string {
		const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
		if (isNaN(parsed)) return '0.00';
		return parsed.toFixed(2);
	}

	// Handle weight input with better validation
	function handleWeightInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		// Allow for decimal point and numbers only
		const sanitized = value.replace(/[^\d.]/g, '');

		// Prevent multiple decimal points
		const parts = sanitized.split('.');
		if (parts.length > 2) {
			weight = parts[0] + '.' + parts.slice(1).join('');
		} else {
			weight = sanitized;
		}
	}

	// Handle price input with better validation
	function handlePriceInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		// Allow for decimal point and numbers only
		const sanitized = value.replace(/[^\d.]/g, '');

		// Prevent multiple decimal points
		const parts = sanitized.split('.');
		if (parts.length > 2) {
			price = parts[0] + '.' + parts.slice(1).join('');
		} else {
			price = sanitized;
		}
	}

	// Format values on blur (when user finishes typing)
	function handleWeightBlur() {
		weight = formatDecimal(weight);
	}

	function handlePriceBlur() {
		price = formatDecimal(price);
	}

	$: if (mode === 'edit' && initialData) {
		name = initialData.name;
		description = initialData.description;
		weight = initialData.weight;
		weightUnit = initialData.weight_unit;
		price = initialData.price;
		link = initialData.url;
		imageUrl = initialData.image_url;
		isWorn = initialData.worn;
		isConsumable = initialData.consumable;
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

	function resetForm() {
		name = '';
		description = '';
		isWorn = false;
		isConsumable = false;
		weight = '0.00';
		price = '';
		link = '';
		imageUrl = '';
	}
</script>

<form
	method="POST"
	action={mode === 'create' ? '?/addItem' : '?/updateListItem'}
	use:enhance={() => {
		submitting = true;
		return async ({ result }) => {
			console.log('Form submission result:', result);
			if (result.type === 'success') {
				if (mode === 'create') {
					resetForm();
				}
				dispatch('success', result.data);
			} else {
				console.error(`Failed to ${mode} item:`, result);
			}
			submitting = false;
		};
	}}
	class="flex flex-col"
>
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
				on:input={() => console.log('Name input changed:', name)}
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
							on:input={handleWeightInput}
							on:blur={handleWeightBlur}
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
				<div class="flex gap-2">
					<div class="flex items-center px-3 text-gray-400">$</div>
					<input
						type="text"
						inputmode="decimal"
						id="price"
						bind:value={price}
						on:input={handlePriceInput}
						on:blur={handlePriceBlur}
						placeholder="0.00"
						class="w-full px-3 py-2 border rounded-lg bg-white focus:border-primary-500 focus-visible:border-primary-500 outline-primary-500"
					/>
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
	<!-- Hidden inputs for form data -->
	<input type="hidden" name="name" value={name} />
	<input type="hidden" name="description" value={description} />
	<input type="hidden" name="worn" value={isWorn.toString()} />
	<input type="hidden" name="consumable" value={isConsumable.toString()} />
	<input type="hidden" name="weight" value={weight} />
	<input type="hidden" name="weight_unit" value={weightUnit} />
	<input type="hidden" name="price" value={price} />
	<input type="hidden" name="url" value={link} />
	<input type="hidden" name="image_url" value={imageUrl} />
	{#if listId}
		<input type="hidden" name="listId" value={listId} />
	{/if}
	{#if mode === 'edit'}
		<input type="hidden" name="itemId" value={initialData?.id} />
		<input type="hidden" name="listItemId" value={initialData?.listItemId} />
	{/if}
	<!-- Submit Button -->
	<!-- Submit Button -->
	<div class="px-2 mb-4 w-full h-14">
		<button
			type="submit"
			class="w-full h-full p-1 text-center bg-primary-500 text-white font-medium
               border border-primary-900 rounded-xl hover:bg-primary-800
               disabled:opacity-50 disabled:cursor-not-allowed"
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
					{mode === 'create' ? 'ADD ITEM' : 'SAVE CHANGES'}
				{/if}
			</div>
		</button>
	</div>
</form>
