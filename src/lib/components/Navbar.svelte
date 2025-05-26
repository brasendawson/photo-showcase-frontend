<script>
  import { page } from '$app/stores';
  let isMenuOpen = false;
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
  
  function closeMenu() {
    isMenuOpen = false;
  }
</script>

<nav class="fixed top-0 left-0 w-full bg-transparent z-[1000] py-4 transition-colors duration-300">
  <div class="max-w-7xl mx-auto flex justify-between items-center px-8 py-2">
    <div class="flex items-center">
      <a href="/" on:click={closeMenu} class="text-white text-2xl font-bold tracking-wide">Capture Moments</a>
    </div>
    
    <button 
      class="md:hidden flex items-center justify-center" 
      on:click={toggleMenu} 
      aria-label="Toggle menu"
    >
      <span class="flex flex-col justify-between h-6 w-7 cursor-pointer">
        <span class={`h-0.5 w-full bg-white rounded-lg transition-all duration-300 ${isMenuOpen ? 'transform translate-y-2.5 rotate-45' : ''}`}></span>
        <span class={`h-0.5 w-full bg-white rounded-lg transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
        <span class={`h-0.5 w-full bg-white rounded-lg transition-all duration-300 ${isMenuOpen ? 'transform -translate-y-2.5 -rotate-45' : ''}`}></span>
      </span>
    </button>
    
    <div class={`${isMenuOpen ? 'flex flex-col absolute top-16 left-0 w-full bg-black/90 py-8 z-50 h-[calc(100vh-4rem)]' : 'hidden'} md:flex md:items-center md:gap-8 md:static md:h-auto md:bg-transparent md:py-0 md:w-auto md:flex-row`}>
      <a 
        href="/" 
        class={`text-gray-200 hover:text-primary transition-colors duration-300 ${$page.url.pathname === '/' ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}
        on:click={closeMenu}
      >
        Home
      </a>
      <a 
        href="/gallery" 
        class={`text-gray-200 hover:text-primary transition-colors duration-300 ${$page.url.pathname === '/gallery' ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}
        on:click={closeMenu}
      >
        Gallery
      </a>
      <a 
        href="/services" 
        class={`text-gray-200 hover:text-primary transition-colors duration-300 ${$page.url.pathname === '/services' ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}
        on:click={closeMenu}
      >
        Services
      </a>
      <a 
        href="/pricing" 
        class={`text-gray-200 hover:text-primary transition-colors duration-300 ${$page.url.pathname === '/pricing' ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}
        on:click={closeMenu}
      >
        Pricing
      </a>
      <a 
        href="/about" 
        class={`text-gray-200 hover:text-primary transition-colors duration-300 ${$page.url.pathname === '/pricing' ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}
        on:click={closeMenu}
      >
        About
      </a>
      <a 
        href="/book" 
        class={`bg-primary text-white py-2 px-5 rounded font-semibold hover:bg-primary-dark transition-colors duration-300 ${$page.url.pathname === '/book' ? 'bg-primary-dark' : ''}`}
        on:click={closeMenu}
      >
        Book Now
      </a>
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
