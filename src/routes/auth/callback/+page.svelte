<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { page } from '$app/stores';
	import { guestStore } from '$lib/stores/guest';

	let processing = $state(true);
	let error: string | null = $state(null);

	async function migrateGuestData(session: any) {
		try {
			// Get migration flag and data from URL
			const params = new URLSearchParams(window.location.search);
			const shouldMigrate = params.get('migrate') === 'true';
			const guestDataString = params.get('guestData');

			if (!shouldMigrate || !guestDataString) return;

			const guestData = JSON.parse(decodeURIComponent(guestDataString));

			if (!guestData.list || !guestData.items.length) return;

			// Create the list
			const { data: newList, error: listError } = await supabase
				.from('lists')
				.insert({
					name: guestData.list.name,
					user_id: session.user.id,
					total_weight: guestData.list.total_weight,
					item_count: guestData.items.length
				})
				.select()
				.single();

			if (listError) throw listError;

			// Create items
			const itemsToCreate = guestData.items.map((item) => ({
				user_id: session.user.id,
				name: item.name,
				description: item.description,
				weight: item.weight,
				weight_unit: item.weight_unit,
				price: item.price,
				url: item.link
			}));

			const { data: createdItems, error: itemsError } = await supabase
				.from('items')
				.insert(itemsToCreate)
				.select();

			if (itemsError) throw itemsError;

			// Create list_items connections with worn/consumable flags
			const listItemsToCreate = createdItems.map((item, index) => ({
				list_id: newList.id,
				item_id: item.id,
				worn: guestData.items[index].worn,
				consumable: guestData.items[index].consumable,
				quantity: 1
			}));

			const { error: listItemsError } = await supabase.from('list_items').insert(listItemsToCreate);

			if (listItemsError) throw listItemsError;

			// Clear guest data after successful migration
			guestStore.clear();
		} catch (error) {
			console.error('Error migrating guest data:', error);
			// Continue with auth flow even if migration fails
		}
	}

	onMount(async () => {
		try {
			console.log('Starting callback handling...');
			const hashParams = new URLSearchParams(window.location.hash.substring(1));
			const access_token = hashParams.get('access_token');

			console.log('Access token exists:', !!access_token);

			if (!access_token) {
				console.error('No access token found');
				throw new Error('No access token found');
			}

			console.log('Setting session...');
			const {
				data: { session },
				error: sessionError
			} = await supabase.auth.setSession({
				access_token,
				refresh_token: hashParams.get('refresh_token') || ''
			});

			console.log('Session result:', {
				hasSession: !!session,
				hasError: !!sessionError
			});

			if (sessionError) throw sessionError;

			if (session) {
				console.log('Setting cookies...');

				// Add migration handling before setting cookies
				await migrateGuestData(session);

				const response = await fetch('/auth/session', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						access_token: session.access_token,
						refresh_token: session.refresh_token
					})
				});

				console.log('Cookie set response:', response.status);

				console.log('Redirecting to /app...');
				await goto('/app');
			} else {
				throw new Error('No session established');
			}
		} catch (e) {
			console.error('Auth error:', e);
			error = e.message;
			processing = false;
			setTimeout(() => goto('/login'), 2000);
		}
	});
</script>

{#if processing}
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<div class="text-center">
			<div
				class="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
			></div>
			<p class="text-gray-600">Calculating grams...</p>
		</div>
	</div>
{:else if error}
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<div class="text-center text-red-600">
			<p>Error: {error}</p>
			<p class="text-sm mt-2">Redirecting to login...</p>
		</div>
	</div>
{/if}
