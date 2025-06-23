<script>
  import { onMount } from 'svelte';
  
  const currentYear = new Date().getFullYear();
  
  // Content state
  let socialMedia = [];
  let contactInfo = null;
  let isLoading = true;
  
  // API base URL with correct port
  const API_BASE_URL = 'https://photo-showcase-api.vercel.app/api';
  
  // Helper function to get social media icon class
  function getSocialIconClass(platform) {
    const iconMap = {
      'facebook': 'fab fa-facebook',
      'instagram': 'fab fa-instagram',
      'twitter': 'fa-brands fa-x-twitter',
      'x': 'fa-brands fa-x-twitter',
      'pinterest': 'fab fa-pinterest',
      'youtube': 'fab fa-youtube',
      'linkedin': 'fab fa-linkedin'
    };
    
    return iconMap[platform.toLowerCase()] || 'fab fa-link';
  }
  
  // Fetch data for footer
  async function fetchFooterData() {
    isLoading = true;
    try {
      // Use only the complete endpoint for data
      const response = await fetch(`${API_BASE_URL}/about/complete`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }
      
      socialMedia = data.socialMedia || [];
      contactInfo = data.contact;
    } catch (err) {
      console.error('Failed to fetch footer data:', err);
      // No fallbacks - if API fails, data remains null/empty
    } finally {
      isLoading = false;
    }
  }
  
  onMount(() => {
    fetchFooterData();
  });
</script>

<footer class="bg-[#1a1a1a] text-white py-12 pb-4 w-full">
  <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
    <div class="text-center md:text-left">
      <h3 class="text-gray-100 mb-4 text-lg relative after:content-[''] after:absolute md:after:left-0 after:left-1/2 md:after:transform-none after:transform after:-translate-x-1/2 md:after:translate-x-0 after:bottom-[-8px] after:w-10 after:h-0.5 after:bg-primary">Capture Moments</h3>
      <p class="text-gray-400 leading-relaxed mb-2">Bringing your memories to life through stunning photography.</p>
    </div>
    
    <div class="text-center md:text-left">
      <h3 class="text-gray-100 mb-4 text-lg relative after:content-[''] after:absolute md:after:left-0 after:left-1/2 md:after:transform-none after:transform after:-translate-x-1/2 md:after:translate-x-0 after:bottom-[-8px] after:w-10 after:h-0.5 after:bg-primary">Quick Links</h3>
      <ul>
        <li class="mb-2"><a href="/" class="text-gray-400 hover:text-primary transition-colors">Home</a></li>
        <li class="mb-2"><a href="/about" class="text-gray-400 hover:text-primary transition-colors">About</a></li>
        <li class="mb-2"><a href="/services" class="text-gray-400 hover:text-primary transition-colors">Services</a></li>
        <li class="mb-2"><a href="/gallery" class="text-gray-400 hover:text-primary transition-colors">Gallery</a></li>
        <li class="mb-2"><a href="/book" class="text-gray-400 hover:text-primary transition-colors">Book Now</a></li>
      </ul>
    </div>
    
    <div class="text-center md:text-left">
      <h3 class="text-gray-100 mb-4 text-lg relative after:content-[''] after:absolute md:after:left-0 after:left-1/2 md:after:transform-none after:transform after:-translate-x-1/2 md:after:translate-x-0 after:bottom-[-8px] after:w-10 after:h-0.5 after:bg-primary">Connect With Us</h3>
      <div class="flex justify-center md:justify-start gap-4 mt-4">
        {#if isLoading}
          <!-- Loading placeholder for social media -->
          <div class="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full animate-pulse"></div>
          <div class="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full animate-pulse"></div>
          <div class="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full animate-pulse"></div>
        {:else if socialMedia && socialMedia.length > 0}
          <!-- Dynamically generated social media links -->
          {#each socialMedia.filter(sm => sm.isActive) as social}
            <a 
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label={social.platform} 
              class="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-primary rounded-full text-white hover:transform hover:-translate-y-1 transition-all"
            >
              <i class="{getSocialIconClass(social.platform)}"></i>
            </a>
          {/each}
        {/if}
      </div>
    </div>
    
    <div class="text-center md:text-left">
      <h3 class="text-gray-100 mb-4 text-lg relative after:content-[''] after:absolute md:after:left-0 after:left-1/2 md:after:transform-none after:transform after:-translate-x-1/2 md:after:translate-x-0 after:bottom-[-8px] after:w-10 after:h-0.5 after:bg-primary">Contact</h3>
      {#if isLoading}
        <!-- Loading placeholder for contact info -->
        <div class="h-4 bg-gray-700 w-3/4 rounded animate-pulse mb-3"></div>
        <div class="h-4 bg-gray-700 w-1/2 rounded animate-pulse"></div>
      {:else if contactInfo}
        <!-- Dynamically loaded contact information -->
        <p class="text-gray-400 leading-relaxed mb-2">
          Email: <a href="mailto:{contactInfo.email}" class="hover:text-primary transition-colors">{contactInfo.email}</a>
        </p>
        <p class="text-gray-400 leading-relaxed mb-2">Phone: {contactInfo.phone}</p>
        {#if contactInfo.address}
          <p class="text-gray-400 leading-relaxed mb-2">Address: {contactInfo.address}</p>
        {/if}
        {#if contactInfo.businessHours}
          <p class="text-gray-400 leading-relaxed mb-2">Hours: {contactInfo.businessHours}</p>
        {/if}
      {/if}
    </div>
  </div>
  
  <div class="text-center pt-8 mt-8 border-t border-gray-800 text-gray-500 text-sm">
    <p>&copy; {currentYear} Brasen Dawson. All rights reserved.</p>
  </div>
</footer>
