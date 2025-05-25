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

<nav>
  <div class="navbar-container">
    <div class="logo">
      <a href="/" on:click={closeMenu}>Capture Moments</a>
    </div>
    
    <button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu">
      <span class="hamburger-icon">
        <span class="bar" class:active={isMenuOpen}></span>
        <span class="bar" class:active={isMenuOpen}></span>
        <span class="bar" class:active={isMenuOpen}></span>
      </span>
    </button>
    
    <div class="nav-links" class:open={isMenuOpen}>
      <a 
        href="/" 
        class:active={$page.url.pathname === '/'}
        on:click={closeMenu}
      >
        Home
      </a>
      <a 
        href="/gallery" 
        class:active={$page.url.pathname === '/gallery'}
        on:click={closeMenu}
      >
        Gallery
      </a>
      <a 
        href="/services" 
        class:active={$page.url.pathname === '/services'}
        on:click={closeMenu}
      >
        Services
      </a>
      <a 
        href="/pricing" 
        class:active={$page.url.pathname === '/pricing'}
        on:click={closeMenu}
      >
        Pricing
      </a>
      <a 
        href="/book" 
        class:active={$page.url.pathname === '/book'}
        on:click={closeMenu}
        class="book-btn"
      >
        Book Now
      </a>
    </div>
  </div>
</nav>

<style>
  nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: transparent;
    z-index: 1000;
    padding: 1rem 0;
    transition: background-color 0.3s ease;
  }
  
  /* Add a background color when scrolling down */
  :global(body.scrolled) nav {
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 2rem;
  }
  
  .logo a {
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 700;
    text-decoration: none;
    letter-spacing: 1px;
  }
  
  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  
  .nav-links a {
    color: #e0e0e0;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    transition: color 0.3s ease;
    position: relative;
  }
  
  .nav-links a:hover {
    color: #e67e22;
  }
  
  .nav-links a.active {
    color: #e67e22;
  }
  
  .nav-links a.active::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #e67e22;
  }
  
  .book-btn {
    background-color: #e67e22;
    color: white !important;
    padding: 0.5rem 1.25rem;
    border-radius: 4px;
    font-weight: 600 !important;
    transition: background-color 0.3s ease !important;
  }
  
  .book-btn:hover {
    background-color: #d35400;
    color: white !important;
  }
  
  .menu-toggle {
    display: none;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  
  .hamburger-icon {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 24px;
    width: 30px;
    cursor: pointer;
  }
  
  .bar {
    height: 3px;
    width: 100%;
    background-color: white;
    border-radius: 10px;
    transition: all 0.3s ease-in-out;
  }
  
  .bar.active:nth-child(1) {
    transform: translateY(10px) rotate(45deg);
  }
  
  .bar.active:nth-child(2) {
    opacity: 0;
  }
  
  .bar.active:nth-child(3) {
    transform: translateY(-10px) rotate(-45deg);
  }
  
  @media (max-width: 768px) {
    .menu-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nav-links {
      position: fixed;
      top: 60px;
      left: 0;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 2rem 0;
      height: calc(100vh - 60px);
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
      z-index: 999;
    }
    
    .nav-links.open {
      transform: translateX(0);
    }
    
    .nav-links a {
      font-size: 1.2rem;
    }
    
    .nav-links a.active::after {
      display: none;
    }
  }
</style>

<script context="module">
  // Add scroll listener to change navbar background when scrolling
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    });
  }
</script>
