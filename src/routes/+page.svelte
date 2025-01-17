<script lang="ts">
	import { goto } from '$app/navigation';

	// Redirect to login on root
	$effect(() => {
		goto('/login');
	});
</script>
