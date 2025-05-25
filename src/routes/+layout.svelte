<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div class="flex flex-col min-h-screen">
	<Navbar />
	
	<main class="flex-1 w-full pt-0">
		{@render children()}
	</main>
	
	<Footer />
</div>
