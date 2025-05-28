<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import toast from 'svelte-5-french-toast';
  import { onMount } from 'svelte';

  let isLoggingOut = false;
  let error = null;
  let isLoggedIn = false;

  // State for confirmation modal
  let showConfirmation = true;

  onMount(() => {
    // Check if user has a token
    if (browser) {
      const token = localStorage.getItem('token');
      isLoggedIn = !!token;
    }
  });

  // Cancel logout
  function cancelLogout() {
    showConfirmation = false;
    goto('/');
  }

  // Logout function
  async function handleLogout() {
    if (!browser) return;
    
    isLoggingOut = true;
    error = null;
    
    try {
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      toast.success('Logged out successfully', { duration: 3000 });
      showConfirmation = false;
      
      // Redirect after successful logout
      setTimeout(() => {
        goto('/');
      }, 1500);
      
    } catch (err) {
      console.error('Logout error:', err);
      error = 'Failed to log out. Please try again.';
      toast.error(error, { duration: 3000 });
      isLoggingOut = false;
    }
  }
</script>

<svelte:head>
  <title>Logout | Capture Moments Photography</title>
  <meta name="description" content="Log out from your account">
</svelte:head>

<section class="pt-32 pb-20 bg-bg-light min-h-screen">
  {#if isLoggedIn && showConfirmation}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Confirm Logout</h3>
        
        {#if error}
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        {/if}
        
        <p class="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
        
        <div class="flex justify-end space-x-3">
          <button 
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            on:click={cancelLogout}
            disabled={isLoggingOut}
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            on:click={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  {:else if !isLoggedIn}
    <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
      <h1 class="text-3xl font-bold text-center mb-6">Not Logged In</h1>
      <p class="text-gray-600 mb-8">You are not currently logged in.</p>
      <a 
        href="/login" 
        class="inline-block w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300 text-center"
      >
        Login
      </a>
    </div>
  {/if}
</section>