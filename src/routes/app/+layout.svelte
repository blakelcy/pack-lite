<script lang="ts">
	import Toast from '$lib/components/helpers/Toast.svelte';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
</script>

{@render children?.()}
<Toast />
