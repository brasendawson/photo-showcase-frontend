<script>
  import { onMount } from 'svelte';
  
  // State variables for admin services
  let services = []; // Will be populated from API
  let isLoadingServices = true;
  let serviceError = null;
  
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
  
  // Function to fetch services from the admin API
  async function fetchServices() {
    isLoadingServices = true;
    serviceError = null;
    
    try {
      const response = await fetch('https://photo-showcase-api.vercel.app/api/services');
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      
      if (data.services && Array.isArray(data.services)) {
        // Format the services for our UI
        services = data.services
          // Only include active services
          .filter(service => service.isActive === true)
          .map(service => {
            // Only use the imageUrl directly from the service data
            // No fallbacks to external images
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
              image: service.imageUrl, // Use only the actual uploaded image
              icon: getIconForService(service.name)
            };
          });
        
        console.log('Fetched services with images:', services);
      } else {
        throw new Error('Invalid service data format');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      serviceError = err.message;
      services = []; // Set to empty array instead of using fallbacks
    } finally {
      isLoadingServices = false;
    }
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
  {#if services.length === 0}
    <!-- Improved empty state UI when no services are available -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-8 text-center">
        <div class="bg-bg-lighter py-16 px-8 rounded-lg shadow-sm">
          <i class="fas fa-camera-retro text-6xl text-gray-300 mb-4"></i>
          <h2 class="text-2xl font-bold text-text-dark mb-4">No Services Available Yet</h2>
          <p class="text-text-muted max-w-lg mx-auto mb-8">
            Our services are currently being updated. Please check back soon or contact us directly for more information about our photography packages.
          </p>
          <a 
            href="/contact" 
            class="inline-block py-3 px-8 bg-primary text-white rounded font-semibold hover:bg-primary-dark transition-colors duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  {:else}
    <!-- Services Detail Section - Only show if we have services -->
    {#each Array(Math.floor(services.length / 2) + (services.length % 2)) as _, i}
      {@const startIndex = i * 2}
      {#if startIndex < services.length}
        <section class={`py-20 ${i % 2 === 0 ? 'bg-white' : 'bg-bg-lighter'}`}>
          <div class="max-w-7xl mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              <!-- First column - Left image -->
              <div class="lg:col-span-1 md:col-span-1 col-span-1 hidden md:block">
                {#if services[startIndex].image}
                  <img 
                    src={services[startIndex].image} 
                    alt={`${services[startIndex].title} photography`} 
                    class="rounded-lg shadow-image object-cover w-full h-[400px]"
                  />
                {:else}
                  <div class="rounded-lg shadow-image bg-gray-100 w-full h-[400px] flex items-center justify-center">
                    <i class="fas {services[startIndex].icon} text-5xl text-gray-300"></i>
                  </div>
                {/if}
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
                  {#if services[startIndex + 1].image}
                    <img 
                      src={services[startIndex + 1].image} 
                      alt={`${services[startIndex + 1].title} photography`} 
                      class="rounded-lg shadow-image object-cover w-full h-[400px]"
                    />
                  {:else}
                    <div class="rounded-lg shadow-image bg-gray-100 w-full h-[400px] flex items-center justify-center">
                      <i class="fas {services[startIndex + 1].icon} text-5xl text-gray-300"></i>
                    </div>
                  {/if}
                </div>
              {:else}
                <!-- If we have an odd number of services, add empty columns to maintain layout -->
                <div class="lg:col-span-2 md:col-span-1 col-span-1 hidden md:block"></div>
              {/if}
              
              <!-- Mobile-only layout -->
              <div class="block md:hidden col-span-1">
                {#if services[startIndex].image}
                  <img 
                    src={services[startIndex].image} 
                    alt={`${services[startIndex].title} photography`} 
                    class="rounded-lg shadow-image object-cover w-full h-[250px] mb-4"
                  />
                {:else}
                  <div class="rounded-lg shadow-image bg-gray-100 w-full h-[250px] flex items-center justify-center mb-4">
                    <i class="fas {services[startIndex].icon} text-5xl text-gray-300"></i>
                  </div>
                {/if}
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
                  {#if services[startIndex + 1].image}
                    <img 
                      src={services[startIndex + 1].image} 
                      alt={`${services[startIndex + 1].title} photography`} 
                      class="rounded-lg shadow-image object-cover w-full h-[250px] mb-4"
                    />
                  {:else}
                    <div class="rounded-lg shadow-image bg-gray-100 w-full h-[250px] flex items-center justify-center mb-4">
                      <i class="fas {services[startIndex + 1].icon} text-5xl text-gray-300"></i>
                    </div>
                  {/if}
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