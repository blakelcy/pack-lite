<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toast } from '$lib/stores/toastStore';
	import { CheckCircle, Info } from 'phosphor-svelte';

	$: icon = $toast?.type === 'success' ? CheckCircle : Info;

	$: backgroundColor = $toast?.type === 'success' ? 'bg-primary-500' : 'bg-blue-50';
	$: textColor = $toast?.type === 'success' ? 'text-white' : 'text-blue-600';
	$: borderColor = $toast?.type === 'success' ? 'border-primary-900' : 'border-blue-200';
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
