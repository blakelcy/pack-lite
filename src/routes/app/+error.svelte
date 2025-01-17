<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="error-container">
	<h1>
		{$page.status}: {#if $page.error}{$page.error.message}{/if}
	</h1>
	<!-- Add your error UI here -->
</div>
