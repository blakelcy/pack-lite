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
</script>

<div
	class="relative min-h-screen w-full bg-cover bg-center transition-all duration-700 ease-in-out {$activeTheme}"
	in:fade={{ duration: 300 }}
>
	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-b from-transparent via-black to-black/85"></div>

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
