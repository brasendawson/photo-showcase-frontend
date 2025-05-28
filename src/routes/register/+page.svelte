<script>
  import toast from 'svelte-5-french-toast';
  import { enhance } from '$app/forms';

  let username = '';
  let email = '';
  let password = '';
  let loading = false;

  // Password strength state
  let passwordStrength = 0;
  let passwordRequirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };
  let showTooltip = false;

  // Check if password meets all requirements
  $: isPasswordStrong = passwordStrength === 5 && passwordRequirements.length;

  function checkPasswordStrength() {
    passwordRequirements.length = password.length >= 8;
    passwordRequirements.uppercase = /[A-Z]/.test(password);
    passwordRequirements.lowercase = /[a-z]/.test(password);
    passwordRequirements.number = /[0-9]/.test(password);
    passwordRequirements.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    passwordStrength = Object.values(passwordRequirements).filter(Boolean).length;
  }

  $: {
    if (password) {
      checkPasswordStrength();
    } else {
      passwordStrength = 0;
      passwordRequirements = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      };
    }
  }

  $: filledSegments = passwordStrength <= 2 ? (passwordStrength === 0 ? 0 : 1) : passwordStrength === 3 ? 2 : passwordStrength === 4 ? 3 : 4;
  
  $: strengthText = filledSegments === 0
    ? 'Password strength'
    : filledSegments === 1
    ? 'Bad Password'
    : filledSegments === 2
    ? 'Weak Password'
    : filledSegments === 3
    ? 'Almost There'
    : passwordRequirements.length
    ? 'Strong Password'
    : 'Almost There';

  $: strengthColor = filledSegments === 0
    ? 'text-gray-600'
    : filledSegments === 1
    ? 'text-red-500'
    : filledSegments === 2
    ? 'text-yellow-500'
    : filledSegments === 3
    ? 'text-blue-500'
    : passwordRequirements.length
    ? 'text-green-500'
    : 'text-blue-500';

  // Handle immediate loading state on form submission
  function handleFormSubmit() {
    loading = true;
  }

  function handleSubmit() {
    return async ({ result, update }) => {
      // Client-side validation
      if (!isPasswordStrong) {
        toast.error('Password must be Strong', { 
          duration: 3000
        });
        loading = false;
        return;
      }

      // Process the server response
      if (result.type === 'success') {
        toast.success('Registration successful! Please log in.', { 
          duration: 3000
        });
      } else if (result.type === 'failure') {
        toast.error(result.data.error, { 
          duration: 3000
        });
      }

      await update();
      loading = false;
    };
  }
</script>

<svelte:head>
  <title>Register | Capture Moments Photography</title>
  <meta name="description" content="Create an account with Capture Moments Photography">
</svelte:head>

<section class="pt-32 pb-20 bg-bg-light min-h-screen">
  <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
    <h1 class="text-3xl font-bold text-center mb-6">Create an Account</h1>
    
    <form method="POST" use:enhance={handleSubmit} on:submit={handleFormSubmit} class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input 
          type="text" 
          id="username" 
          name="username"
          bind:value={username} 
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          disabled={loading}
        />
      </div>
      
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email"
          bind:value={email} 
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          disabled={loading}
        />
      </div>
      
      <!-- Password field with strength indicator -->
      <div class="relative">
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div class="relative">
          <input
            type="password"
            id="password"
            name="password"
            bind:value={password}
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            required
            disabled={loading}
          />
          <div class="mt-2 flex gap-1">
            {#each Array(4) as _, i}
              <div
                class="flex-1 h-2 rounded-full"
                class:bg-gray-200={filledSegments === 0 || i >= filledSegments}
                class:bg-red-500={filledSegments > 0 && i < filledSegments && filledSegments === 1}
                class:bg-yellow-500={filledSegments > 0 && i < filledSegments && filledSegments === 2}
                class:bg-blue-500={filledSegments > 0 && i < filledSegments && filledSegments === 3}
                class:bg-green-500={filledSegments > 0 && i < filledSegments && filledSegments === 4 && passwordRequirements.length}
              ></div>
            {/each}
          </div>
          <div class="mt-1 flex items-center justify-end text-sm">
            <span class={strengthColor}>{strengthText}</span>
            <button
              type="button"
              on:mouseenter={() => (showTooltip = true)}
              on:mouseleave={() => (showTooltip = false)}
              class="ml-1 relative"
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {#if showTooltip}
                <div class="absolute z-10 right-0 mt-2 w-64 py-2 px-4 bg-white border rounded-lg shadow-lg text-sm text-gray-700 text-left">
                  <p class="font-semibold mb-1">Password Requirements:</p>
                  <ul class="list-disc pl-4 space-y-1">
                    <li class={passwordRequirements.length ? 'text-green-500' : 'text-gray-500'}>8+ characters</li>
                    <li class={passwordRequirements.uppercase ? 'text-green-500' : 'text-gray-500'}>Uppercase letter</li>
                    <li class={passwordRequirements.lowercase ? 'text-green-500' : 'text-gray-500'}>Lowercase letter</li>
                    <li class={passwordRequirements.number ? 'text-green-500' : 'text-gray-500'}>Number</li>
                    <li class={passwordRequirements.special ? 'text-green-500' : 'text-gray-500'}>Special character</li>
                  </ul>
                </div>
              {/if}
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <button 
          type="submit" 
          disabled={loading || !isPasswordStrong}
          class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </form>
    
    <div class="mt-4 text-center">
      <p class="text-sm text-gray-600">
        Already have an account? <a href="/login" class="text-primary hover:underline">Login here</a>
      </p>
    </div>
  </div>
</section>