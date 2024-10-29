<script lang="ts">
	import Login from '$lib/components/auth/Login.svelte';
</script>

<div class="login-page">
	<h1>Welcome Back</h1>
	<Login />
</div>

<style>
	.login-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
	}
</style>
