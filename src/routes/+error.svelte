<script lang="ts">
	import { page } from '$app/stores';

	let status = $derived($page.status);
	let message = $derived($page.error?.message);
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center">
		<h1 class="text-2xl font-bold mb-4">Error {status}</h1>
		<p class="mb-4">{message}</p>
		<a href="/" class="text-blue-600 hover:underline">Return home</a>
	</div>
</div>
