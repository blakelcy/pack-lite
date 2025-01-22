<script lang="ts">
	import Toast from '$lib/components/helpers/Toast.svelte';
	import { fade } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import { activeTheme } from '$lib/stores/themeStore';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	// Set initial theme from server data
	$effect(() => {
		if (data.theme?.active) {
			activeTheme.set(data.theme.active);
		}
	});

	// Reactive style based on current theme data
	// Create background style string
	let backgroundStyle = $derived(
		`background-image: url(${data.theme?.background || '/images/background4.jpg'})`
	);

	// CSS classes to apply theme colors
	let themeClasses = $derived(
		`min-h-screen w-full ${
			$activeTheme ? `bg-themes-${$activeTheme}-primary text-themes-${$activeTheme}-secondary` : ''
		}`
	);
</script>

<div
	style={backgroundStyle}
	class="relative min-h-screen w-full bg-cover bg-center transition-all duration-700 ease-in-out"
	in:fade={{ duration: 300 }}
>
	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white/85"></div>

	<!-- Main content -->
	<div class="relative flex-1">
		{@render children?.()}
	</div>

	<!-- Toast notifications -->
	<Toast />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
