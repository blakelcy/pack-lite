<script lang="ts">
	import { goto } from '$app/navigation';
	import { Plus, MagnifyingGlass } from 'phosphor-svelte';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import { guestStore } from '$lib/stores/guest';

	let isCreatingList = $state(false);

	// Subscribe to guest store
	let { list, loading, error } = $derived($guestStore);

	// Handle list creation
	async function handleCreateList() {
		if (isCreatingList) return;
		try {
			isCreatingList = true;
			guestStore.createList('New List');
			// If list is created, navigate to its detail page
			if ($guestStore.list) {
				await goto(`/guest/list/${$guestStore.list.id}`);
			}
		} catch (e) {
			console.error('Error creating list:', e);
		} finally {
			isCreatingList = false;
		}
	}
</script>

<div class="min-h-screen bg-white flex flex-col">
	<!-- Top Bar with Title -->
	<header
		class="fixed top-0 right-0 left-0 px-4 py-3 flex items-center z-10
               bg-white shadow-sm border-b"
	>
		<div class="flex-1 text-center">
			<h1 class="text-lg font-medium">Welcome to Carry Lite!</h1>
		</div>
	</header>

	<div class="h-14"></div>

	<!-- Main Content -->
	<main class="flex-1 px-4 py-6 mb-16">
		<!-- Guest Mode Notice -->
		<div class="bg-blue-50 p-4 rounded-lg mb-6">
			<p class="text-sm text-blue-700">
				You're in guest mode. Your list will be available while this browser is open. Once closed
				the list will be deleted.
				<a href="/guest/profile" class="underline font-medium">Create an account</a>
				to save your data permanently.
			</p>
		</div>
		{#if loading}
			<div class="flex justify-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
			</div>
		{:else if !list}
			<div class="text-center py-12">
				<h2 class="text-xl font-medium text-gray-600 mb-4">Create your first gear list</h2>
				<p class="text-gray-500 mb-8">
					Tap the plus icon to create your list. Guest lists are limited to 20 items and will
					persist for your current session.
				</p>
			</div>
		{:else}
			<!-- Single List Display -->
			<button
				class="block w-full p-4 rounded-lg border border-gray-200 hover:border-primary-500
                       bg-white text-left relative overflow-hidden
                       hover:shadow-md transition-all group"
				onclick={() => goto(`/guest/list/${list.id}`)}
			>
				<div class="relative space-y-1">
					<div class="flex justify-between items-center pb-3">
						<h3 class="font-medium text-lg text-gray-900">{list.name}</h3>
						<span
							class="text-xs text-primary-900 bg-gray-50 px-2 py-1 rounded font-mono"
							title="Creation Date"
						>
							{new Date(list.created_at).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric'
							})}
						</span>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="flex items-center gap-3">
							<div class="w-3 h-3 rounded-sm bg-blue-500 mt-1"></div>
							<div>
								<p class="text-sm font-medium text-gray-900">
									{list.item_count || 0}
								</p>
								<p class="text-xs text-gray-500 font-mono uppercase tracking-wider">Items</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<div class="w-3 h-3 rounded-sm bg-green-500 mt-1"></div>
							<div>
								<p class="text-sm font-medium text-gray-900">
									{list.total_weight || 0} oz
								</p>
								<p class="text-xs text-gray-500 font-mono uppercase tracking-wider">Weight</p>
							</div>
						</div>
					</div>
				</div>
			</button>
		{/if}
	</main>

	{#if !list}
		<!-- Create List FAB -->
		<button
			type="button"
			class="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-primary-500 text-white
                   flex items-center justify-center shadow-lg hover:bg-primary-800
                   transition-all duration-200 hover:scale-105 active:scale-95
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed"
			disabled={isCreatingList}
			aria-label="Create new list"
			onclick={handleCreateList}
		>
			{#if isCreatingList}
				<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
			{:else}
				<Plus size={24} weight="regular" />
			{/if}
		</button>
	{/if}
</div>
