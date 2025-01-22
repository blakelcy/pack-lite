<script lang="ts">
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Button } from '$lib/components/ui/button';
	import { cubicOut } from 'svelte/easing';

	type PackingFocus =
		| 'alpine'
		| 'hiking'
		| 'camping'
		| 'biking'
		| 'photography'
		| 'travel'
		| 'business'
		| 'beach';

	let selectedFocus: PackingFocus | undefined;

	const focusOptions = [
		{
			value: 'alpine',
			label: 'Alpine',
			description: 'Mountain climbing and alpine adventures',
			bgImage: '/images/background1.jpg'
		},
		{
			value: 'hiking',
			label: 'Hiking',
			description: 'Day hikes and trail adventures',
			bgImage: '/images/background5.jpg'
		},
		{
			value: 'camping',
			label: 'Camping',
			description: 'Outdoor overnight adventures',
			bgImage: '/images/background7.jpg'
		},

		{
			value: 'biking',
			label: 'Biking',
			description: 'Mountain Biking',
			bgImage: '/images/background11.jpg'
		},
		{
			value: 'photography',
			label: 'Photography',
			description: 'Photography and gear',
			bgImage: '/images/background10.jpg'
		},
		{
			value: 'beach',
			label: 'Beach',
			description: 'Beach and coastal adventures',
			bgImage: '/images/background6.jpg'
		},
		{
			value: 'travel',
			label: 'Travel',
			description: 'General travel and exploration',
			bgImage: '/images/background9.jpg'
		},
		{
			value: 'business',
			label: 'Business',
			description: 'Business trips and work travel',
			bgImage: '/images/background8.jpg'
		}
	];

	$: backgroundImage = selectedFocus
		? focusOptions.find((opt) => opt.value === selectedFocus)?.bgImage
		: '/images/background1.jpg';

	function scaleAndFade(node: HTMLElement, { delay = 0, duration = 200 }) {
		return {
			delay,
			duration,
			css: (t: number) => {
				const eased = cubicOut(t);
				return `
          opacity: ${t};
          transform: scale(${0.9 + eased * 0.1});
        `;
			}
		};
	}
</script>

<div
	class="relative min-h-screen w-full bg-cover bg-center transition-all duration-700 ease-in-out"
	style="background-image: url({backgroundImage})"
>
	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white/85"></div>

	<!-- Content -->
	<div class="relative min-h-screen w-full flex flex-col items-center justify-end p-4 pb-16">
		<form method="POST" class="max-w-md w-full space-y-12 px-8">
			<div class="text-center">
				<h1 class="text-3xl font-bold mb-2">What do you carry for?</h1>
				<p class="text-sm text-gray-600">
					Choose your theme for a more tailored experience.
					<br />You can always change this later.
				</p>
			</div>

			<RadioGroup
				value={selectedFocus}
				onValueChange={(value) => (selectedFocus = value as PackingFocus)}
			>
				<div class="flex flex-wrap gap-3 justify-center">
					{#each focusOptions as option}
						<div class="min-w-[150px]">
							<RadioGroupItem value={option.value} id={option.value} class="peer sr-only" />
							<label
								for={option.value}
								data-selected={selectedFocus === option.value}
								class={`
    flex items-center justify-center px-8 py-3 rounded-full shadow-sm border cursor-pointer
    transition-all duration-200 font-medium
    ${selectedFocus === option.value ? 'bg-[#56623B] text-white border-[#56623B]' : ''}
  `}
							>
								{option.label}
							</label>
						</div>
					{/each}
				</div>
			</RadioGroup>

			{#if selectedFocus}
				<input type="hidden" name="packingFocus" value={selectedFocus} />
				<div class="flex justify-center" transition:scaleAndFade={{ duration: 200 }}>
					<Button
						type="submit"
						variant="default"
						class="w-full py-6 text-lg font-medium rounded-lg bg-[#051422] hover:bg-[#051422]/90 shadow-lg"
					>
						LET'S GO!
					</Button>
				</div>
			{:else}<Button
					variant="default"
					class="w-full py-6 text-lg font-medium rounded-lg bg-transparent hover:bg-transparent"
				></Button>
			{/if}
		</form>
	</div>
</div>
