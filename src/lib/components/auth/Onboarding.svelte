<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import Login from './Login.svelte';

	const slides = [
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>`,
			title: 'Track Your Gear',
			description: 'Easily log and organize all your hiking and camping equipment in one place'
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>`,
			title: 'Monitor Weight',
			description:
				'Keep track of your pack weight and optimize your load for better hiking experiences'
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>`,
			title: 'Share Lists',
			description:
				'Share your gear lists with friends or the community to compare and get inspiration'
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>`,
			title: 'Join the Community',
			description: 'Connect with other hikers and discover new gear recommendations'
		}
	];

	let currentSlide = 0;
	let showLogin = false;
	let touchStart = 0;
	let touchEnd = 0;
	let slideDirection = 1;
	let autoplayTimer: ReturnType<typeof setInterval>;
	let isTransitioning = false;

	const handleSkip = () => {
		if (autoplayTimer) clearInterval(autoplayTimer);
		showLogin = true;
	};

	const handleGetStarted = () => {
		if (autoplayTimer) clearInterval(autoplayTimer);
		showLogin = true;
	};

	function resetTimer() {
		if (autoplayTimer) {
			clearInterval(autoplayTimer);
		}

		autoplayTimer = setInterval(() => {
			if (!showLogin && currentSlide < slides.length - 1 && !isTransitioning) {
				nextSlide();
			}
		}, 6666);
	}

	onMount(() => {
		resetTimer();
		return () => {
			if (autoplayTimer) clearInterval(autoplayTimer);
		};
	});

	function handleTouchStart(e: TouchEvent) {
		touchStart = e.touches[0].clientX;
	}

	function handleTouchMove(e: TouchEvent) {
		touchEnd = e.touches[0].clientX;
	}

	function handleTouchEnd() {
		const swipeDistance = touchEnd - touchStart;
		if (Math.abs(swipeDistance) > 50 && !isTransitioning) {
			if (swipeDistance > 0 && currentSlide > 0) {
				slideDirection = -1;
				currentSlide--;
				resetTimer();
			} else if (swipeDistance < 0 && currentSlide < slides.length - 1) {
				slideDirection = 1;
				currentSlide++;
				resetTimer();
			}
		}
	}

	function nextSlide() {
		if (isTransitioning) return;

		if (currentSlide < slides.length - 1) {
			isTransitioning = true;
			slideDirection = 1;
			currentSlide++;
			resetTimer();
			setTimeout(() => {
				isTransitioning = false;
			}, 300);
		}
	}
</script>

<div
	class="min-h-screen bg-gray-50 relative overflow-hidden"
	on:touchstart={handleTouchStart}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
>
	<div class="relative min-h-screen">
		{#if !showLogin}
			<div class="flex flex-col min-h-screen" out:fade={{ duration: 200 }}>
				{#if currentSlide < slides.length - 1}
					<div class="absolute top-4 right-4 z-10">
						<button class="text-sm text-gray-600 hover:text-gray-900" on:click={handleSkip}>
							Skip
						</button>
					</div>
				{/if}

				<div class="flex-1 flex flex-col">
					<div class="flex-1 relative">
						<div class="absolute inset-0">
							{#key currentSlide}
								<div
									class="absolute inset-0 flex items-center justify-center px-6"
									in:fly|local={{ x: 100 * slideDirection, duration: 300, easing: cubicOut }}
									out:fly|local={{ x: -100 * slideDirection, duration: 300, easing: cubicOut }}
								>
									<div class="w-full max-w-md">
										<div class="flex justify-center mb-8 text-primary-500">
											{@html slides[currentSlide].icon}
										</div>
										<h2 class="text-2xl font-bold text-center mb-4">
											{slides[currentSlide].title}
										</h2>
										<p class="text-center text-gray-600">
											{slides[currentSlide].description}
										</p>
									</div>
								</div>
							{/key}
						</div>
					</div>

					<div class="p-6 space-y-6">
						<div class="flex gap-2 justify-center">
							{#each slides as _, index}
								<button
									class="h-2 rounded-full transition-all duration-300 {index === currentSlide
										? 'bg-primary-500 w-4'
										: 'bg-gray-300 w-2 hover:bg-primary-200'}"
									on:click={() => {
										if (!isTransitioning) {
											slideDirection = index > currentSlide ? 1 : -1;
											currentSlide = index;
											resetTimer();
										}
									}}
								/>
							{/each}
						</div>

						{#if currentSlide === slides.length - 1}
							<button
								class="w-full bg-primary-600 text-white rounded-lg py-3 px-4 font-medium
                                       hover:bg-primary-700 transition-colors transform hover:scale-105 duration-200"
								on:click={handleGetStarted}
							>
								Get Started
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if showLogin}
			<div class="absolute inset-0 bg-gray-50" in:fly={{ y: 500, duration: 500, easing: cubicOut }}>
				<slot>
					<Login />
				</slot>
			</div>
		{/if}
	</div>
</div>
