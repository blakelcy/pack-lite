<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toast } from '$lib/stores/toastStore';
	import { CheckCircle, XCircle, Info } from 'phosphor-svelte';

	$: icon = $toast?.type === 'success' ? CheckCircle : $toast?.type === 'error' ? XCircle : Info;

	$: backgroundColor =
		$toast?.type === 'success'
			? 'bg-green-50'
			: $toast?.type === 'error'
				? 'bg-red-50'
				: 'bg-blue-50';

	$: textColor =
		$toast?.type === 'success'
			? 'text-green-800'
			: $toast?.type === 'error'
				? 'text-red-800'
				: 'text-blue-600';

	$: borderColor =
		$toast?.type === 'success'
			? 'border-green-200'
			: $toast?.type === 'error'
				? 'border-red-200'
				: 'border-blue-200';
</script>

{#if $toast}
	<div
		class="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
		transition:fade={{ duration: 200 }}
		role="alert"
	>
		<div
			class="flex items-center gap-2 px-4 py-2 rounded-lg border shadow-lg
                   {backgroundColor} {textColor} {borderColor}"
		>
			<svelte:component this={icon} size={20} weight="fill" />
			<p class="text-sm font-medium">{$toast.message}</p>
		</div>
	</div>
{/if}
