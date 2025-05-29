<script>
  import { onMount } from 'svelte';
  
  // State variables for admin services
  let services = []; // Will be populated from API
  let isLoadingServices = true;
  let serviceError = null;
  let serviceImages = {}; // To store fetched images
  
  // Type to icon mapping
  const typeIcons = {
    'wedding': 'fa-ring',
    'portrait': 'fa-camera-retro',
    'event': 'fa-calendar-days',
    'commercial': 'fa-building',
    'landscape': 'fa-mountain',
    'family': 'fa-users',
    'other': 'fa-camera'
  };
  
  // Function to determine icon based on service name
  function getIconForService(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('wedding')) return 'fa-ring';
    if (nameLower.includes('portrait')) return 'fa-camera-retro';
    if (nameLower.includes('event')) return 'fa-calendar-days';
    if (nameLower.includes('commercial')) return 'fa-building';
    if (nameLower.includes('landscape') || nameLower.includes('nature')) return 'fa-mountain';
    if (nameLower.includes('family') || nameLower.includes('group') || nameLower.includes('team')) return 'fa-users';
    return 'fa-camera'; // Default icon
  }
  
  // Function to fetch photos by type to use for services
  async function fetchServiceImages() {
    try {
      // We're fetching FEATURED photos from the gallery API
      // This gets photos that the admin has marked as "featured"
      const response = await fetch('http://localhost:3000/api/photos/gallery?featured=true');
      
      if (!response.ok) {
        throw new Error('Failed to load service images');
      }
      
      const data = await response.json();
      
      // Create a map that will store one image URL for each photo type
      const imageMap = {};
      
      // If we have photos, process them
      if (data.photos && data.photos.length > 0) {
        // Go through each photo returned by the API
        data.photos.forEach(photo => {
          if (photo.type && photo.imageUrl) {
            const type = photo.type.toLowerCase();
            // Only store the first image we find for each type
            // This ensures we have at most one image per type (wedding, portrait, etc.)
            if (!imageMap[type]) {
              imageMap[type] = photo.imageUrl;
            }
          }
        });
      }
      
      // Return the map of type -> imageUrl pairs
      return imageMap;
    } catch (err) {
      console.error('Error fetching service images:', err);
      return {}; // Return empty object on error
    }
  }
  
  // Function to fetch services from the admin API
  async function fetchServices() {
    isLoadingServices = true;
    serviceError = null;
    
    try {
      // First fetch images to use with services
      serviceImages = await fetchServiceImages();
      
      const response = await fetch('http://localhost:3000/api/services');
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      
      if (data.services && Array.isArray(data.services)) {
        // Format the services for our UI
        services = data.services
          // Only include active services
          .filter(service => service.isActive !== false)
          .map(service => {
            // Determine the best image to use for this service
            const serviceName = service.name.toLowerCase();
            let imageUrl = null;
            
            // MATCHING LOGIC: Try to match service name to a photo type
            // We look for keywords in the service name to determine what type of photo to use
            const typeKey = 
              serviceName.includes('wedding') ? 'wedding' : 
              serviceName.includes('portrait') ? 'portrait' :
              serviceName.includes('event') ? 'event' :
              serviceName.includes('commercial') ? 'commercial' :
              serviceName.includes('nature') || serviceName.includes('landscape') ? 'landscape' :
              serviceName.includes('family') || serviceName.includes('group') ? 'family' : 
              'other';
            
            // Use image from our fetched images map, or fall back to unsplash
            // This is where we connect the service to a photo of the same type
            imageUrl = serviceImages[typeKey] || 
                      `https://source.unsplash.com/random/600x800?${typeKey}`;
            
            return {
              id: service.id,
              title: service.name,
              description: service.description || 'Professional photography service tailored to your needs.',
              price: service.price,
              duration: service.duration,
              features: [
                `Duration: ${service.duration || 'Flexible'}`,
                `Price: ${typeof service.price === 'number' ? `GH₵${service.price.toFixed(2)}` : service.price || 'Contact for pricing'}`,
                "Professional equipment & editing",
                "High-resolution digital files",
                "Online gallery delivery"
              ],
              image: imageUrl,
              icon: getIconForService(service.name)
            };
          });
        
        console.log('Fetched services:', services);
      } else {
        throw new Error('Invalid service data format');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      serviceError = err.message;
      // Use the existing hardcoded services as fallback
      useFallbackServices();
    } finally {
      isLoadingServices = false;
    }
  }
  
  // Fallback to default services if API fails
  function useFallbackServices() {
    services = [
      {
        id: 1,
        title: "Wedding Photography",
        description: "Comprehensive coverage of your special day from preparation to reception. We capture all the emotions, details, and special moments that make your wedding unique.",
        features: [
          "Pre-wedding consultation & planning",
          "Multiple photographers available",
          "Full-day coverage options",
          "Professional editing & retouching",
          "Online gallery & digital downloads"
        ],
        image: "https://source.unsplash.com/random/600x800?wedding-bride",
        icon: "fa-ring"
      },
      {
        id: 2,
        title: "Portrait Sessions",
        description: "Professional portrait photography for individuals, couples, families, and corporate headshots. Studio or location-based shoots customized to your preferences.",
        features: [
          "Style consultation before session",
          "Multiple outfit changes",
          "Indoor studio or outdoor locations",
          "Professional lighting equipment",
          "Selection of digital & print options"
        ],
        image: "https://source.unsplash.com/random/600x800?portrait-outdoor",
        icon: "fa-camera-retro"
      },
      {
        id: 3,
        title: "Event Coverage",
        description: "Dynamic photography for corporate events, parties, conferences, and social gatherings. We document the atmosphere, key moments, and interactions throughout your event.",
        features: [
          "Pre-event walkthrough & planning",
          "Candid and staged photography",
          "VIP & speaker coverage",
          "Quick turnaround time",
          "Custom packages for event size"
        ],
        image: "https://source.unsplash.com/random/600x800?corporate-event",
        icon: "fa-calendar-days"
      },
      {
        id: 4,
        title: "Commercial Photography",
        description: "Professional imagery for businesses, products, real estate, and marketing campaigns. Enhance your brand with high-quality visual content.",
        features: [
          "Brand style consistency",
          "Product photography with styling",
          "Architectural & real estate shots",
          "Food & lifestyle photography",
          "Commercial usage rights included"
        ],
        image: "https://source.unsplash.com/random/600x800?real-estate",
        icon: "fa-building"
      },
      {
        id: 5,
        title: "Nature & Landscape",
        description: "Breathtaking landscape photography capturing the beauty of natural environments. Perfect for home decor, office spaces, or gifts.",
        features: [
          "Seasonal landscape collections",
          "Limited edition fine art prints",
          "Custom sizing options",
          "Framing & mounting services",
          "Location photography workshops"
        ],
        image: "https://source.unsplash.com/random/600x800?landscape-mountains",
        icon: "fa-mountain"
      },
      {
        id: 6,
        title: "Group & Team Photography",
        description: "Professional group photos for teams, organizations, schools, and large families. We ensure everyone looks their best with careful composition.",
        features: [
          "Organization & posing expertise",
          "Large group management",
          "Multiple arrangement options",
          "Indoor or outdoor settings",
          "Retouching & group enhancements"
        ],
        image: "https://source.unsplash.com/random/600x800?team-photo",
        icon: "fa-users"
      }
    ];
  }
  
  onMount(() => {
    fetchServices();
  });
</script>

<svelte:head>
  <title>Our Services | Capture Moments Photography</title>
  <meta name="description" content="Professional photography services including weddings, portraits, events, commercial, nature, and group sessions. Capture your special moments with us.">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<!-- Hero Section -->
<section class="pt-32 pb-20 bg-bg-light">
  <div class="max-w-7xl mx-auto px-8">
    <h1 class="text-5xl md:text-6xl font-bold text-center text-text-dark mb-6">Our Services</h1>
    <p class="text-xl text-text-muted text-center max-w-3xl mx-auto mb-12">
      We offer a comprehensive range of photography services to meet all your needs.
      Each service is tailored to deliver exceptional quality and a personalized experience.
    </p>
    
    {#if isLoadingServices}
      <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    {:else if serviceError}
      <div class="text-center py-8">
        <p class="text-red-500 mb-4">Error loading services: {serviceError}</p>
        <button 
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          on:click={fetchServices}
        >
          Try Again
        </button>
      </div>
    {/if}
  </div>
</section>

{#if !isLoadingServices && !serviceError}
  <!-- Services Detail Section - Only show if we have services -->
  {#each Array(Math.floor(services.length / 2) + (services.length % 2)) as _, i}
    {@const startIndex = i * 2}
    {#if startIndex < services.length}
      <section class={`py-20 ${i % 2 === 0 ? 'bg-white' : 'bg-bg-lighter'}`}>
        <div class="max-w-7xl mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            <!-- First column - Left image -->
            <div class="lg:col-span-1 md:col-span-1 col-span-1 hidden md:block">
              <img 
                src={services[startIndex].image} 
                alt={`${services[startIndex].title} photography`} 
                class="rounded-lg shadow-image object-cover w-full h-[400px]"
              />
            </div>
            
            <!-- Second column - Left description -->
            <div class="lg:col-span-1 md:col-span-1 col-span-1 hidden md:block">
              <h2 class="text-2xl font-bold text-text-dark mb-4 flex items-center">
                <i class="fas {services[startIndex].icon} mr-2"></i> {services[startIndex].title}
              </h2>
              <p class="text-lg text-text-light leading-relaxed">{services[startIndex].description}</p>
              {#if services[startIndex].price}
                <p class="text-primary font-bold mt-2">GH₵{parseFloat(services[startIndex].price).toFixed(2)}</p>
              {/if}
              {#if services[startIndex].duration}
                <p class="text-sm text-text-muted mt-1">Duration: {services[startIndex].duration}</p>
              {/if}
            </div>
            
            <!-- Only show right columns if we have a second service -->
            {#if startIndex + 1 < services.length}
              <!-- Third column - Right description -->
              <div class="lg:col-span-1 md:col-span-1 col-span-1 hidden md:block">
                <h2 class="text-2xl font-bold text-text-dark mb-4 flex items-center">
                  <i class="fas {services[startIndex + 1].icon} mr-2"></i> {services[startIndex + 1].title}
                </h2>
                <p class="text-lg text-text-light leading-relaxed">{services[startIndex + 1].description}</p>
                {#if services[startIndex + 1].price}
                  <p class="text-primary font-bold mt-2">GH₵{parseFloat(services[startIndex + 1].price).toFixed(2)}</p>
                {/if}
                {#if services[startIndex + 1].duration}
                  <p class="text-sm text-text-muted mt-1">Duration: {services[startIndex + 1].duration}</p>
                {/if}
              </div>
              
              <!-- Fourth column - Right image -->
              <div class="lg:col-span-1 md:col-span-1 col-span-1 hidden md:block">
                <img 
                  src={services[startIndex + 1].image} 
                  alt={`${services[startIndex + 1].title} photography`} 
                  class="rounded-lg shadow-image object-cover w-full h-[400px]"
                />
              </div>
            {:else}
              <!-- If we have an odd number of services, add empty columns to maintain layout -->
              <div class="lg:col-span-2 md:col-span-1 col-span-1 hidden md:block"></div>
            {/if}
            
            <!-- Mobile-only layout -->
            <div class="block md:hidden col-span-1">
              <img 
                src={services[startIndex].image} 
                alt={`${services[startIndex].title} photography`} 
                class="rounded-lg shadow-image object-cover w-full h-[250px] mb-4"
              />
              <h2 class="text-2xl font-bold text-text-dark mb-2 flex items-center">
                <i class="fas {services[startIndex].icon} mr-2"></i> {services[startIndex].title}
              </h2>
              <p class="text-lg text-text-light leading-relaxed mb-2">{services[startIndex].description}</p>
              {#if services[startIndex].price}
                <p class="text-primary font-bold mb-1">GH₵{parseFloat(services[startIndex].price).toFixed(2)}</p>
              {/if}
              {#if services[startIndex].duration}
                <p class="text-sm text-text-muted mb-6">Duration: {services[startIndex].duration}</p>
              {/if}
            </div>
            
            {#if startIndex + 1 < services.length}
              <div class="block md:hidden col-span-1">
                <img 
                  src={services[startIndex + 1].image} 
                  alt={`${services[startIndex + 1].title} photography`} 
                  class="rounded-lg shadow-image object-cover w-full h-[250px] mb-4"
                />
                <h2 class="text-2xl font-bold text-text-dark mb-2 flex items-center">
                  <i class="fas {services[startIndex + 1].icon} mr-2"></i> {services[startIndex + 1].title}
                </h2>
                <p class="text-lg text-text-light leading-relaxed mb-2">{services[startIndex + 1].description}</p>
                {#if services[startIndex + 1].price}
                  <p class="text-primary font-bold mb-1">GH₵{parseFloat(services[startIndex + 1].price).toFixed(2)}</p>
                {/if}
                {#if services[startIndex + 1].duration}
                  <p class="text-sm text-text-muted">Duration: {services[startIndex + 1].duration}</p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </section>
    {/if}
  {/each}
{/if}

<!-- Call to Action Section -->
<section class="py-20 bg-cover bg-center text-white text-center" style="background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://source.unsplash.com/random/1920x1080?camera');">
  <div class="max-w-7xl mx-auto px-8">
    <h2 class="text-4xl font-bold mb-6">Ready to Capture Your Moments?</h2>
    <p class="text-xl mb-10 max-w-3xl mx-auto">
      Let's discuss your photography needs and create a custom package that's perfect for you.
      Contact us today to start planning your photo session.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a 
        href="/book" 
        class="inline-block py-3 px-8 bg-primary text-white rounded font-semibold hover:bg-primary-dark transition-colors duration-300"
      >
        Book a Session
      </a>
      <a 
        href="/pricing" 
        class="inline-block py-3 px-8 bg-transparent border-2 border-white text-white rounded font-semibold hover:bg-white/10 transition-colors duration-300"
      >
        View Pricing
      </a>
    </div>
  </div>
</section>