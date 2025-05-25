<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div class="app">
	<Navbar />
	
	<main>
		{@render children()}
	</main>
	
	<Footer />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	
	main {
		flex: 1;
		padding-top: 0; /* Remove padding-top to allow hero section to start at the top */
		width: 100%;
	}
</style>
