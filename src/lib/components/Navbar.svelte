<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  
  let isMenuOpen = false;
  let isProfileMenuOpen = false;
  let currentUser = null;
  let profilePicture = null;
  let isLoadingProfilePicture = false;
  
  // Check if user is logged in and fetch profile picture
  onMount(async () => {
    if (browser) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          currentUser = {
            username: tokenData.username,
            role: tokenData.role,
          };
          
          // Fetch user's profile picture
          await fetchProfilePicture(token);
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
    }
  });
  
  // Fetch profile picture from API
  async function fetchProfilePicture(token) {
    isLoadingProfilePicture = true;
    try {
      const response = await fetch('http://localhost:3000/api/profile/picture', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profilePicture) {
          profilePicture = data.profilePicture;
        }
      } else {
        console.error('Failed to fetch profile picture');
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    } finally {
      isLoadingProfilePicture = false;
    }
  }
  
  // Generate default avatar based on username using ui-avatars.com service
  function getDefaultAvatar(username) {
    // Always use the ui-avatars service instead of a local image
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=0D8ABC&color=fff`;
  }
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) isProfileMenuOpen = false;
  }
  
  function toggleProfileMenu() {
    isProfileMenuOpen = !isProfileMenuOpen;
  }
  
  function closeMenu() {
    isMenuOpen = false;
  }
  
  function closeProfileMenu() {
    isProfileMenuOpen = false;
  }
  
  function logout() {
    if (browser) {
      localStorage.removeItem('token');
      currentUser = null;
      window.location.href = '/';
    }
    closeProfileMenu();
  }
  
  // Fix the active link detection function
  function isActive(path) {
    if (!$page.url) return false;
    
    // Exact matching for specific routes
    if (path === '/about') {
      return $page.url.pathname === '/about';
    }
    
    // For other paths, use the startsWith logic
    return $page.url.pathname === path || 
           ($page.url.pathname.length > 1 && $page.url.pathname.startsWith(path + '/'));
  }
  
  // Check if we're on homepage or gallery page
  $: isHomeOrGallery = $page.url.pathname === '/' || $page.url.pathname === '/gallery';
</script>

<nav class="fixed top-0 left-0 w-full bg-transparent z-[1000] py-4 transition-colors duration-300">
  <div class="max-w-7xl mx-auto flex justify-between items-center px-8 py-2">
    <div class="flex items-center">
      <a href="/" on:click={closeMenu} class={isHomeOrGallery ? "text-white text-2xl font-bold tracking-wide" : "text-gray-800 text-2xl font-bold tracking-wide"}>Capture Moments</a>
    </div>
    
    <div class="flex items-center">
      <!-- Main Navigation -->
      <div class={`${isMenuOpen ? 'flex flex-col absolute top-16 left-0 w-full bg-black/90 py-12 z-50 h-[calc(100vh-4rem)]' : 'hidden'} md:flex md:items-center md:gap-8 md:static md:h-auto md:bg-transparent md:py-0 md:w-auto md:flex-row`}>
        <a 
          href="/" 
          class={`${isMenuOpen ? 'text-white text-xl font-medium py-6 mb-4 w-full text-center' : isHomeOrGallery ? 'text-gray-200' : 'text-gray-800'} hover:text-primary transition-colors duration-300 ${$page.url.pathname === '/' ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}
          on:click={closeMenu}
        >
          Home
        </a>
        <a 
          href="/gallery" 
          class={`${isMenuOpen ? 'text-white text-xl font-medium py-6 mb-4 w-full text-center' : isHomeOrGallery ? 'text-gray-200' : 'text-gray-800'} hover:text-primary transition-colors duration-300 ${$page.url.pathname === '/gallery' ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}
          on:click={closeMenu}
        >
          Gallery
        </a>
        <a 
          href="/services" 
          class={`${isMenuOpen ? 'text-white text-xl font-medium py-6 mb-4 w-full text-center' : isHomeOrGallery ? 'text-gray-200' : 'text-gray-800'} hover:text-primary transition-colors duration-300 ${$page.url.pathname === '/services' ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}
          on:click={closeMenu}
        >
          Services
        </a>
        <a 
          href="/about" 
          class={`${isMenuOpen ? 'text-white text-xl font-medium py-6 mb-4 w-full text-center' : isHomeOrGallery ? 'text-gray-200' : 'text-gray-800'} hover:text-primary transition-colors duration-300 ${$page.url.pathname === '/about' ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}
          on:click={closeMenu}
        >
          About
        </a>
        <a 
          href="/book" 
          class={`${isMenuOpen ? 'mt-6 mx-auto text-lg py-3 px-8' : 'py-2 px-5'} bg-primary text-white rounded font-semibold hover:bg-primary-dark transition-colors duration-300 ${$page.url.pathname === '/book' ? 'bg-primary-dark' : ''}`}
          on:click={closeMenu}
        >
          Book Now
        </a>
      </div>
      
      <!-- Profile Avatar - Added to the right of the main navigation -->
      <div class="relative ml-8">
        <button 
          on:click={toggleProfileMenu}
          class="flex items-center focus:outline-none"
          aria-label={currentUser ? `${currentUser.username}'s profile` : "Login"}
        >
          {#if isLoadingProfilePicture}
            <div class="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          {:else}
            <img 
              src={profilePicture || (currentUser ? getDefaultAvatar(currentUser.username) : getDefaultAvatar())}
              alt={currentUser?.username || "Profile"} 
              class="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md hover:border-primary transition-colors"
            />
          {/if}
        </button>
        
        <!-- Profile Dropdown Menu -->
        {#if isProfileMenuOpen}
          <div 
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
            on:mouseleave={closeProfileMenu}
            role="menu"
            tabindex="0"
          >
            {#if currentUser}
              <div class="px-4 py-2 border-b border-gray-100 flex items-center">
                <div class="mr-3">
                  <img 
                    src={profilePicture || getDefaultAvatar(currentUser.username)}
                    alt={currentUser.username} 
                    class="h-8 w-8 rounded-full object-cover"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{currentUser.username}</p>
                  <p class="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                </div>
              </div>
              <a 
                href="/profile" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                on:click={closeProfileMenu}
              >
                Your Profile
              </a>
              
              <!-- Role-specific dashboard links -->
              {#if currentUser.role === 'admin'}
                <a 
                  href="/admin/dashboard" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  on:click={closeProfileMenu}
                >
                  Admin Dashboard
                </a>
              {/if}
              
              {#if currentUser.role === 'photographer'}
                <a 
                  href="/photographer/dashboard" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  on:click={closeProfileMenu}
                >
                  Photographer Dashboard
                </a>
              {/if}
              
              <button 
                on:click={logout}
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            {:else}
              <a 
                href="/login" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                on:click={closeProfileMenu}
              >
                Login
              </a>
              <a 
                href="/register" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                on:click={closeProfileMenu}
              >
                Create Account
              </a>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- Mobile Menu Button -->
      <button 
        class="md:hidden flex items-center justify-center ml-4" 
        on:click={toggleMenu} 
        aria-label="Toggle menu"
      >
        <span class="flex flex-col justify-between h-6 w-7 cursor-pointer">
          <span class={`h-0.5 w-full ${isHomeOrGallery ? 'bg-white' : 'bg-gray-800'} rounded-lg transition-all duration-300 ${isMenuOpen ? 'transform translate-y-2.5 rotate-45' : ''}`}></span>
          <span class={`h-0.5 w-full ${isHomeOrGallery ? 'bg-white' : 'bg-gray-800'} rounded-lg transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span class={`h-0.5 w-full ${isHomeOrGallery ? 'bg-white' : 'bg-gray-800'} rounded-lg transition-all duration-300 ${isMenuOpen ? 'transform -translate-y-2.5 -rotate-45' : ''}`}></span>
        </span>
      </button>
    </div>
  </div>
</nav>

<script context="module">
  // Add scroll listener to change navbar background when scrolling
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('nav');
      if (window.scrollY > 50) {
        nav?.classList.add('bg-black/80');
        nav?.classList.add('backdrop-blur-md');
        nav?.classList.add('shadow-md');
      } else {
        nav?.classList.remove('bg-black/80');
        nav?.classList.remove('backdrop-blur-md');
        nav?.classList.remove('shadow-md');
      }
    });
  }
</script>
