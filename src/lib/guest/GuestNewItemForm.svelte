<script lang="ts">
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte';
	import { TShirt, Cookie } from 'phosphor-svelte';
	import { guestStore } from '$lib/stores/guest';

	const dispatch = createEventDispatcher();

	interface Props {
		mode?: 'create' | 'edit';
		initialData?: any;
	}

	let { mode = 'create', initialData = null }: Props = $props();

	type WeightUnit = 'oz' | 'g' | 'kg' | 'lb';

	let name = $state('');
	let description = $state('');
	let isWorn = $state(false);
	let isConsumable = $state(false);
	let weight = $state('0.00');
	let weightUnit: WeightUnit = $state('oz');
	let price = $state('');
	let link = $state('');
	let submitting = $state(false);

	const weightUnits: WeightUnit[] = ['oz', 'g', 'lb', 'kg'];

	// Initialize form with data if in edit mode
	run(() => {
		if (mode === 'edit' && initialData) {
			name = initialData.name;
			description = initialData.description || '';
			weight = initialData.weight?.toString() || '0.00';
			weightUnit = initialData.weight_unit || 'oz';
			price = initialData.price?.toString() || '';
			link = initialData.link || '';
			isWorn = initialData.worn || false;
			isConsumable = initialData.consumable || false;
		}
	});

	function formatDecimal(value: string): string {
		const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
		if (isNaN(parsed)) return '0.00';
		return parsed.toFixed(2);
	}

	function handleWeightInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = input.value;
		const sanitized = value.replace(/[^\d.]/g, '');
		const parts = sanitized.split('.');
		if (parts.length > 2) {
			weight = parts[0] + '.' + parts.slice(1).join('');
		} else {
			weight = sanitized;
		}
	}

	function handlePriceInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = input.value;
		const sanitized = value.replace(/[^\d.]/g, '');
		const parts = sanitized.split('.');
		if (parts.length > 2) {
			price = parts[0] + '.' + parts.slice(1).join('');
		} else {
			price = sanitized;
		}
	}

	function handleWeightBlur() {
		weight = formatDecimal(weight);
	}

	function handlePriceBlur() {
		price = formatDecimal(price);
	}

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

	async function handleSubmit() {
		if (!name.trim()) return;

		submitting = true;
		try {
			const itemData = {
				name,
				description,
				weight: parseFloat(formatDecimal(weight)),
				weight_unit: weightUnit,
				price: parseFloat(formatDecimal(price)),
				link,
				worn: isWorn,
				consumable: isConsumable
			};

			if (mode === 'edit' && initialData) {
				guestStore.updateItem(initialData.id, itemData);
			} else {
				guestStore.addItem(itemData);
			}

			dispatch('success', itemData);
		} catch (error) {
			console.error('Error saving item:', error);
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex flex-col">
	<div class="p-4 space-y-4">
		<!-- Name -->
		<div>
			<label for="name" class="text-sm font-medium text-gray-900">Name</label>
			<input
				type="text"
				id="name"
				bind:value={name}
				required
				class="w-full px-3 py-2 border rounded-lg bg-white focus:border-primary-500
                       focus-visible:border-primary-500 outline-primary-500"
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
				class="w-full px-3 py-2 border rounded-lg bg-white resize-none focus:border-primary-500
                       focus-visible:border-primary-500 outline-primary-500"
				placeholder="Description"
			></textarea>
		</div>

		<!-- Details Section -->
		<div>
			<h3 class="text-sm font-medium text-gray-900 mb-4">Details</h3>

			<!-- Toggle Buttons -->
			<div class="flex gap-2 mb-4">
				<button
					type="button"
					class="flex items-center justify-center grow gap-2 px-4 py-2 rounded-lg border border-primary-100
                           {isWorn ? 'bg-primary-500 text-white' : 'text-gray-500'}"
					onclick={() => (isWorn = !isWorn)}
				>
					<TShirt size={20} />
					<span>Worn</span>
				</button>

				<button
					type="button"
					class="flex items-center justify-center grow gap-2 px-4 py-2 rounded-lg border border-primary-100
                           {isConsumable ? 'bg-primary-500 text-white' : 'text-gray-500'}"
					onclick={() => (isConsumable = !isConsumable)}
				>
					<Cookie size={20} weight="fill" />
					<span>Consumable</span>
				</button>
			</div>

			<div class="space-y-4">
				<!-- Weight Input -->
				<div>
					<label for="weight" class="text-sm font-medium text-gray-900">Weight</label>
					<div class="flex flex-col gap-2">
						<input
							type="text"
							inputmode="decimal"
							id="weight"
							bind:value={weight}
							oninput={handleWeightInput}
							onblur={handleWeightBlur}
							placeholder="0.00"
							class="w-full px-3 py-2 border rounded-lg bg-white focus:border-primary-500
                                   focus-visible:border-primary-500 outline-primary-500"
						/>
						<!-- Weight Unit Toggle Chips -->
						<div class="flex gap-2">
							{#each weightUnits as unit}
								<button
									type="button"
									class="flex-1 px-4 py-2 rounded-full border border-primary-100
                                           {weightUnit === unit
										? 'bg-primary-500 text-white'
										: 'text-gray-500'}"
									onclick={() => {
										if (weightUnit !== unit && weight) {
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
				<div>
					<label for="price" class="text-sm font-medium text-gray-900">Price</label>
					<div class="flex gap-2 items-center">
						<div class="flex items-center px-3 text-gray-400">$</div>
						<input
							type="text"
							inputmode="decimal"
							id="price"
							bind:value={price}
							oninput={handlePriceInput}
							onblur={handlePriceBlur}
							placeholder="0.00"
							class="w-full px-3 py-2 border rounded-lg bg-white focus:border-primary-500
                                   focus-visible:border-primary-500 outline-primary-500"
						/>
					</div>
				</div>

				<!-- Link Input -->
				<div>
					<label for="link" class="text-sm font-medium text-gray-900">Link</label>
					<input
						type="url"
						id="link"
						bind:value={link}
						placeholder="Paste item URL"
						class="w-full px-3 py-2 border rounded-lg bg-white focus:border-primary-500
                               focus-visible:border-primary-500 outline-primary-500"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Submit Button -->
	<div class="px-2 mb-4 w-full h-14">
		<button
			type="button"
			class="w-full h-full p-1 text-center bg-primary-500 text-white font-medium
                   border border-primary-900 rounded-xl hover:bg-primary-800
                   disabled:opacity-50 disabled:cursor-not-allowed"
			onclick={handleSubmit}
			disabled={submitting}
		>
			<div
				class="w-full h-full flex justify-center items-center border border-primary-900 rounded-lg"
			>
				{#if submitting}
					<div
						class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
					></div>
				{:else}
					{mode === 'create' ? 'ADD ITEM' : 'SAVE CHANGES'}
				{/if}
			</div>
		</button>
	</div>
</div>
