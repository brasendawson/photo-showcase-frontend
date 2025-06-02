<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import toast from 'svelte-5-french-toast';
  import { writable } from 'svelte/store';

  // Get data from page load function and form submission
  export let data;
  export const form = {};

  // Form state
  let username = '';
  let password = '';
  let loading = false;
  let redirectTo = data?.redirectTo || '/profile';

  async function handleLogin(event) {
    event.preventDefault();
    loading = true;

    try {
      const response = await fetch('https://photo-showcase-api.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token in localStorage
      if (browser) {
        localStorage.setItem('token', data.token);

        // Decode token to get user info
        try {
          const tokenParts = data.token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));

            // Determine redirect based on role
            let targetPath = redirectTo;
            if (payload.role === 'admin') {
              targetPath = '/admin/dashboard';
            } else if (payload.role === 'photographer') {
              targetPath = '/photographer/dashboard';
            }

            toast.success('Login successful!', { duration: 3000 });
            goto(targetPath);
          }
        } catch (tokenError) {
          console.error('Error parsing token:', tokenError);
          toast.error('Error processing login data', { duration: 3000 });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login', { duration: 3000 });
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login | Capture Moments Photography</title>
  <meta name="description" content="Login to your account to book photography sessions and manage your bookings">
</svelte:head>

<section class="pt-32 pb-20 bg-bg-light min-h-screen">
  <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
    <h1 class="text-3xl font-bold text-center mb-6">Login</h1>

    <form on:submit={handleLogin} class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          id="username"
          bind:value={username}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          disabled={loading}
        >
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          disabled={loading}
        >
      </div>

      <div>
        <button
          type="submit"
          class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>

    <div class="mt-4 text-center">
      <p class="text-sm text-gray-600">
        Don't have an account? <a href="/register" class="text-primary hover:underline">Register here</a>
      </p>
    </div>
  </div>
</section>