<script>
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import toast, { Toaster } from 'svelte-5-french-toast';
  import { writable } from 'svelte/store';
  
  // Create stores within regular script tag
  export const user = writable(null);
  export const isAuthenticated = writable(false);
  
  onMount(() => {
    // Check if user is logged in by looking for token
    if (browser) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Parse token to get user info (assuming JWT)
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          user.set({
            id: tokenData.userId,
            username: tokenData.username,
            role: tokenData.role,
            email: tokenData.email
          });
          isAuthenticated.set(true);
          
          // Check if redirected from register page
          if ($page.url.searchParams.get('registered') === 'true') {
            toast.success('Account registered successfully', { duration: 3000 });
          }
        } catch (e) {
          console.error('Invalid token format', e);
          localStorage.removeItem('token');
        }
      }
    }
  });
  
  // Function to handle logout
  function handleLogout() {
    if (browser) {
      localStorage.removeItem('token');
      user.set(null);
      isAuthenticated.set(false);
      
      toast.success('Logged out successfully', { duration: 3000 });
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  }

  let { children } = $props();

  // Use effect rune instead of reactive statement for home page class
  $effect(() => {
    if (typeof document !== 'undefined') {
      if ($page.url.pathname === '/') {
        document.body.classList.add('home-page');
      } else {
        document.body.classList.remove('home-page');
      }
    }
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<Toaster />

<div class="flex flex-col min-h-screen">
  <Navbar />
  
  <main class="flex-1 w-full pt-0">
    {@render children()}
  </main>
  
  <Footer />
</div>