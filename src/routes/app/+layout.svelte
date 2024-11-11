<script lang="ts">
	import Toast from '$lib/components/helpers/Toast.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<slot />
<Toast />
