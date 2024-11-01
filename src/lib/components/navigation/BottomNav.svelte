<!-- src/lib/components/BottomNav.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { List, Package, User } from 'phosphor-svelte';

	// Active tab handling - updated to handle root /app as lists
	$: path = $page.url.pathname;
	$: activeTab =
		path === '/app' || path.includes('/lists')
			? 'lists'
			: path.includes('/gear')
				? 'gear'
				: path.includes('/profile')
					? 'profile'
					: 'lists';
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-white border-t z-10">
	<div class="max-w-4xl mx-auto px-4">
		<div class="flex justify-around py-2">
			<a
				href="/app"
				class="flex flex-col items-center p-2 {activeTab === 'lists'
					? 'text-primary-600'
					: 'text-gray-600'}"
			>
				<List size={24} weight={activeTab === 'lists' ? 'fill' : 'regular'} />
				<span class="text-xs mt-1">Lists</span>
			</a>

			<a
				href="/app/gear"
				class="flex flex-col items-center p-2 {activeTab === 'gear'
					? 'text-primary-600'
					: 'text-gray-600'}"
			>
				<Package size={24} weight={activeTab === 'gear' ? 'fill' : 'regular'} />
				<span class="text-xs mt-1">Gear</span>
			</a>

			<a
				href="/app/profile"
				class="flex flex-col items-center p-2 {activeTab === 'profile'
					? 'text-primary-600'
					: 'text-gray-600'}"
			>
				<User size={24} weight={activeTab === 'profile' ? 'fill' : 'regular'} />
				<span class="text-xs mt-1">Profile</span>
			</a>
		</div>
	</div>
</nav>
