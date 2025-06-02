<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Content state
  let aboutContent = null;
  let socialMedia = [];
  let contactInfo = null;
  let isLoading = true;
  let error = null;
  
  // API base URL with correct port
  const API_BASE_URL = 'https://photo-showcase-api.vercel.app/api';

  // Fetch complete about page data (about content, social media, contact info)
  async function fetchAboutData() {
    isLoading = true;
    try {
      // Use the complete endpoint to get all data at once
      const response = await fetch(`${API_BASE_URL}/about/complete`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }
      
      // Set about content
      aboutContent = {
        id: data.about.id,
        title: data.about.title,
        description: data.about.content,
        isActive: data.about.isActive
      };
      
      // Set social media links
      socialMedia = data.socialMedia;
      
      // Set contact info
      contactInfo = data.contact;
      
      console.log('Fetched about data:', data);
    } catch (err) {
      console.error('Failed to fetch about data:', err);
      error = err.message;
      
      // Try individual endpoints if complete endpoint fails
      try {
        await Promise.all([
          fetchAboutContent(),
          fetchSocialMedia(),
          fetchContactInfo()
        ]);
      } catch (fallbackErr) {
        console.error('All API endpoints failed:', fallbackErr);
        // No fallback to localStorage - data must come from API
      }
    } finally {
      isLoading = false;
    }
  }

  // Fetch just about content as fallback
  async function fetchAboutContent() {
    try {
      const response = await fetch(`${API_BASE_URL}/about`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      
      aboutContent = {
        id: data.id,
        title: data.title,
        description: data.content,
        isActive: data.isActive
      };
      
      console.log('Fetched about content:', aboutContent);
    } catch (err) {
      console.error('Failed to fetch about content:', err);
      throw err;
    }
  }

  // Fetch just social media links as fallback
  async function fetchSocialMedia() {
    try {
      const response = await fetch(`${API_BASE_URL}/about/social`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      
      if (data.success && data.socialMedia) {
        socialMedia = data.socialMedia;
      }
      
      console.log('Fetched social media:', socialMedia);
    } catch (err) {
      console.error('Failed to fetch social media:', err);
      throw err;
    }
  }

  // Fetch just contact info as fallback
  async function fetchContactInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/about/contact`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      
      if (data.success && data.contactInfo) {
        contactInfo = data.contactInfo;
      }
      
      console.log('Fetched contact info:', contactInfo);
    } catch (err) {
      console.error('Failed to fetch contact info:', err);
      throw err;
    }
  }
  
  // Helper function to get social media icon class
  function getSocialIconClass(platform) {
    const iconMap = {
      'facebook': 'fab fa-facebook',
      'instagram': 'fab fa-instagram',
      'twitter': 'fab fa-twitter',
      'pinterest': 'fab fa-pinterest',
      'youtube': 'fab fa-youtube',
      'linkedin': 'fab fa-linkedin'
    };
    
    return iconMap[platform.toLowerCase()] || 'fab fa-link';
  }

  onMount(() => {
    // Initial fetch
    fetchAboutData();
  });
</script>

<div class="pt-24 pb-16 bg-gray-50 min-h-screen">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {#if isLoading}
      <div class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    {:else if error && !aboutContent}
      <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p class="font-bold">Error</p>
        <p>Failed to load about content: {error}</p>
        <button 
          on:click={fetchAboutData} 
          class="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    {:else if aboutContent}
      <!-- Display Mode -->
      <div class="about-content">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">{aboutContent.title}</h1>
          <div class="h-1 w-20 bg-primary mx-auto rounded"></div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 mb-10">
          <div class="prose max-w-none text-gray-600">
            {@html aboutContent.description}
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {#if contactInfo}
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-xl font-semibold text-gray-800 mb-4 relative after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:w-10 after:h-0.5 after:bg-primary">Contact Us</h3>
              <div class="mt-6">
                <div class="flex items-center mb-4 p-3 bg-gray-50 rounded-md">
                  <i class="fas fa-envelope text-primary mr-3"></i>
                  <a href="mailto:{contactInfo.email}" class="text-primary hover:underline">{contactInfo.email}</a>
                </div>
                <div class="flex items-center mb-4 p-3 bg-gray-50 rounded-md">
                  <i class="fas fa-phone text-primary mr-3"></i>
                  <span class="text-gray-700">{contactInfo.phone}</span>
                </div>
                {#if contactInfo.address}
                  <div class="flex items-center mb-4 p-3 bg-gray-50 rounded-md">
                    <i class="fas fa-map-marker-alt text-primary mr-3"></i>
                    <span class="text-gray-700">{contactInfo.address}</span>
                  </div>
                {/if}
                {#if contactInfo.businessHours}
                  <div class="flex items-center p-3 bg-gray-50 rounded-md">
                    <i class="fas fa-clock text-primary mr-3"></i>
                    <span class="text-gray-700">{contactInfo.businessHours}</span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
          
          {#if socialMedia && socialMedia.length > 0}
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-xl font-semibold text-gray-800 mb-4 relative after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:w-10 after:h-0.5 after:bg-primary">Follow Us</h3>
              <div class="mt-6 space-y-3">
                {#each socialMedia.filter(sm => sm.isActive) as social}
                  <a href={social.url} target="_blank" rel="noopener noreferrer" class="flex items-center p-3 bg-gray-50 rounded-md text-primary hover:bg-gray-100 transition-colors">
                    <i class="{getSocialIconClass(social.platform)} text-primary mr-3"></i>
                    {social.platform}
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
