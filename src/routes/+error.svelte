<!-- src/routes/+error.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center">
		<h1 class="text-2xl font-bold mb-4">Error {$page.status}</h1>
		<p class="mb-4">{$page.error?.message}</p>
		<a href="/" class="text-blue-600 hover:underline"> Return home </a>
	</div>
</div>
