<script>
  import { onMount } from 'svelte';
  
  // State variables
  let currentSlide = 0;
  let selectedCategory = "All";
  let galleryImages = [];
  let filteredImages = [];
  let isLightboxOpen = false;
  let lightboxImage = null;
  let isLoading = true;
  let error = null;
  let slideshowImages = []; // Now empty, will be populated with featured photos
  
  // Pagination
  let currentPage = 1;
  let totalPages = 1;
  let totalPhotos = 0;
  const photosPerPage = 16;
  
  // Gallery categories based on API photo types
  const categories = [
    "All",
    "Portrait",
    "Wedding",
    "Event",
    "Commercial",
    "Landscape",
    "Family",
    "Other",
  ];
  
  // Fetch featured photos for slideshow
  async function fetchFeaturedPhotos() {
    try {
      // Fetch featured photos for the slideshow
      const response = await fetch('https://photo-showcase-api.vercel.app/api/photos/gallery?featured=true');
      
      if (!response.ok) {
        throw new Error('Failed to load featured photos');
      }
      
      const data = await response.json();
      
      // If we have featured photos, ensure we have one per type
      if (data.photos && data.photos.length > 0) {
        // Filter out photos with type 'other'
        const filteredPhotos = data.photos.filter(photo => 
          photo.type && photo.type.toLowerCase() !== 'other'
        );
        
        if (filteredPhotos.length > 0) {
          // Create a map to store one photo per type
          const photosByType = new Map();
          
          // Process all photos and keep only one per type
          filteredPhotos.forEach(photo => {
            const type = photo.type.toLowerCase();
            // Only add this photo if we don't already have one of this type
            // or if this photo is featured and the existing one is not
            if (!photosByType.has(type) || (photo.featured && !photosByType.get(type).featured)) {
              photosByType.set(type, photo);
            }
          });
          
          // Convert the map values to an array
          const selectedPhotos = Array.from(photosByType.values());
          
          // If we have photos after filtering
          if (selectedPhotos.length > 0) {
            slideshowImages = selectedPhotos.map(photo => ({
              src: photo.imageUrl,
              alt: photo.title,
              title: photo.title,
              type: photo.type.toLowerCase(), // Store type for debugging
              subtitle: photo.description || `${photo.type.charAt(0).toUpperCase() + photo.type.slice(1)} Photography`
            }));
            
            console.log('Slideshow images (one per type):', slideshowImages);
          } else {
            // Fall back to defaults if no suitable photos found
            useDefaultSlideshow();
          }
        } else {
          // Fall back to defaults if no non-'other' photos
          useDefaultSlideshow();
        }
      } else {
        // Fall back to defaults if no photos at all
        useDefaultSlideshow();
      }
    } catch (err) {
      console.error('Error fetching featured photos:', err);
      // Fall back to defaults
      useDefaultSlideshow();
    }
  }
  
  // Helper function to set up the default slideshow - updated to avoid using placeholder images
  function useDefaultSlideshow() {
    // Instead of using placeholder images, leave slideshow empty
    slideshowImages = [];
    
    // Show a message to the admin that no featured photos are available
    console.warn('No featured photos available for slideshow. Please add featured photos in the admin dashboard.');
    
    // Add a single default slide with a message instead of random images
    slideshowImages = [{
      src: "", // No image source
      alt: "No featured photos available",
      title: "Our Photography Portfolio",
      type: "default",
      subtitle: "Explore our gallery below"
    }];
  }

  // Fetch photos from API
  async function fetchPhotos() {
    isLoading = true;
    error = null;
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', photosPerPage.toString());
      
      // Add type filter if not "All"
      if (selectedCategory !== 'All') {
        params.append('type', selectedCategory.toLowerCase());
      }
      
      const response = await fetch(`https://photo-showcase-api.vercel.app/api/photos/gallery?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load gallery photos');
      }
      
      const data = await response.json();
      
      // Map the API response to our gallery format
      galleryImages = data.photos.map((photo, index) => ({
        id: photo.id || index + 1,
        src: photo.imageUrl,
        alt: photo.title,
        category: photo.type ? photo.type.charAt(0).toUpperCase() + photo.type.slice(1) : 'Other',
        title: photo.title,
        description: photo.description || '',
        photographerName: photo.photographerName
      }));
      
      totalPhotos = data.totalPhotos || galleryImages.length;
      totalPages = data.numOfPages || 1;
      
      // Apply filters
      updateFilteredImages();
      
    } catch (err) {
      console.error('Error fetching photos:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
  
  // Fetch single photo for lightbox
  async function fetchSinglePhoto(id) {
    try {
      const response = await fetch(`https://photo-showcase-api.vercel.app/api/photos/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load photo details');
      }
      
      const data = await response.json();
      
      // Update the lightbox image with full details
      lightboxImage = {
        id: data.photo.id,
        src: data.photo.imageUrl,
        alt: data.photo.title,
        title: data.photo.title,
        category: data.photo.type ? data.photo.type.charAt(0).toUpperCase() + data.photo.type.slice(1) : 'Other',
        description: data.photo.description,
        photographerName: data.photo.photographerName
      };
      
    } catch (err) {
      console.error('Error fetching photo details:', err);
      // If we fail to get details, keep using the basic info we already have
    }
  }
  
  // Filter gallery images based on selected category
  function updateFilteredImages() {
    if (selectedCategory === "All") {
      filteredImages = galleryImages;
    } else {
      filteredImages = galleryImages.filter(img => 
        img.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
  }
  
  // Handle category selection
  function selectCategory(category) {
    if (category !== selectedCategory) {
      selectedCategory = category;
      currentPage = 1; // Reset to first page when changing categories
      fetchPhotos();
    }
  }
  
  // Page navigation
  function goToPage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      currentPage = page;
      fetchPhotos();
      // Scroll back to gallery top
      const galleryElement = document.getElementById('gallery-section');
      if (galleryElement) {
        galleryElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  
  // Open lightbox
  async function openLightbox(image) {
    lightboxImage = image; // Set basic info immediately
    isLightboxOpen = true;
    document.body.classList.add('overflow-hidden');
    
    // Fetch full details if we have an ID
    if (image.id) {
      await fetchSinglePhoto(image.id);
    }
  }
  
  // Close lightbox
  function closeLightbox() {
    isLightboxOpen = false;
    document.body.classList.remove('overflow-hidden');
  }
  
  // Slideshow functionality
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slideshowImages.length;
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slideshowImages.length) % slideshowImages.length;
  }
  
  // Modified onMount to remove auto-advance slideshow
  onMount(async () => {
    // First fetch featured photos for slideshow
    await fetchFeaturedPhotos();
    
    // Then fetch regular gallery photos
    fetchPhotos();
  });
</script>

<svelte:head>
  <title>Photo Gallery | Capture Moments Photography</title>
  <meta name="description" content="Browse our photography gallery showcasing weddings, portraits, events, and more. See our professional photography work.">
</svelte:head>

<!-- Hero Slideshow Section -->
<section class="relative pt-20 h-screen overflow-hidden">
  {#each slideshowImages as image, i}
    <div 
      class="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center bg-no-repeat"
      style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('{image.src}');"
      class:opacity-0={i !== currentSlide}
      class:opacity-100={i === currentSlide}
    >
      <div class="flex items-center justify-center h-full">
        <div class="text-center text-white max-w-3xl px-8">
          <h1 class="text-5xl md:text-6xl font-bold mb-4">{image.title}</h1>
          <p class="text-xl md:text-2xl">{image.subtitle}</p>
        </div>
      </div>
    </div>
  {/each}
  
  <!-- Slideshow Navigation -->
  <button 
    class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center focus:outline-none transition-colors"
    on:click={prevSlide}
    aria-label="Previous slide"
  >
    <i class="fas fa-chevron-left"></i>
  </button>
  
  <button 
    class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center focus:outline-none transition-colors"
    on:click={nextSlide}
    aria-label="Next slide"
  >
    <i class="fas fa-chevron-right"></i>
  </button>
  
  <!-- Slideshow Indicators -->
  <div class="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
    {#each slideshowImages as _, i}
      <button 
        class={`w-3 h-3 rounded-full focus:outline-none transition-colors ${i === currentSlide ? 'bg-primary' : 'bg-white/50 hover:bg-white/80'}`}
        on:click={() => currentSlide = i}
        aria-label={`Go to slide ${i + 1}`}
      ></button>
    {/each}
  </div>
</section>

<!-- Gallery Section -->
<section id="gallery-section" class="py-16 bg-bg-lighter">
  <div class="max-w-7xl mx-auto px-4">
    <h2 class="text-4xl font-bold text-center text-text-dark mb-4">Our Photography Portfolio</h2>
    <p class="text-lg text-text-muted text-center max-w-3xl mx-auto mb-12">
      Browse through our collection of professional photography across various categories.
      Click on any image to view it in detail.
    </p>
    
    <!-- Category Filter -->
    <div class="flex flex-wrap justify-center gap-2 mb-12">
      {#each categories as category}
        <button 
          class={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-primary text-white' : 'bg-white text-text-dark hover:bg-gray-100'}`}
          on:click={() => selectCategory(category)}
        >
          {category}
        </button>
      {/each}
    </div>
    
    <!-- Loading State -->
    {#if isLoading}
      <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    <!-- Error State -->
    {:else if error}
      <div class="text-center py-12">
        <p class="text-red-500 text-lg mb-4">Error loading gallery: {error}</p>
        <button 
          class="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          on:click={() => fetchPhotos()}
        >
          Try Again
        </button>
      </div>
    <!-- Empty State -->
    {:else if filteredImages.length === 0}
      <div class="text-center py-12">
        <p class="text-text-muted text-lg">No images found in this category.</p>
        <button 
          class="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          on:click={() => selectCategory('All')}
        >
          View All Images
        </button>
      </div>
    <!-- Gallery Grid -->
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each filteredImages as image}
          <div 
            class="group relative overflow-hidden rounded-lg cursor-pointer aspect-square"
            on:click={() => openLightbox(image)}
            on:keydown={(e) => e.key === 'Enter' && openLightbox(image)}
            tabindex="0"
            role="button"
            aria-label={`View ${image.title}`}
          >
            <img 
              src={image.src} 
              alt={image.alt}
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div class="text-white">
                <h3 class="font-semibold">{image.title}</h3>
                <p class="text-sm text-gray-200">{image.photographerName}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="flex justify-center items-center mt-12 gap-2">
          <button 
            class="w-10 h-10 rounded-full flex items-center justify-center bg-white text-text-dark hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          {#each Array(totalPages) as _, i}
            {#if i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
              <button 
                class={`w-10 h-10 rounded-full flex items-center justify-center ${i + 1 === currentPage ? 'bg-primary text-white' : 'bg-white text-text-dark hover:bg-gray-100'}`}
                on:click={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            {:else if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) && totalPages > 5}
              <span class="px-1">...</span>
            {/if}
          {/each}
          
          <button 
            class="w-10 h-10 rounded-full flex items-center justify-center bg-white text-text-dark hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      {/if}
    {/if}
  </div>
</section>

<!-- Enhanced Lightbox -->
{#if isLightboxOpen && lightboxImage}
  <div 
    class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    on:click={closeLightbox}
    on:keydown={(e) => e.key === 'Escape' && closeLightbox()}
    role="dialog"
    aria-modal="true"
    aria-label="Image lightbox"
    tabindex="0"
  >
    <div 
      class="max-w-4xl max-h-[90vh] relative"
      on:click|stopPropagation={() => {}}
      on:keydown|stopPropagation={() => {}}
      role="presentation"
    >
      <img 
        src={lightboxImage.src} 
        alt={lightboxImage.alt}
        class="max-w-full max-h-[80vh] object-contain"
      />
      <div class="mt-4 text-white">
        <h3 class="text-xl font-semibold">{lightboxImage.title}</h3>
        {#if lightboxImage.description}
          <p class="text-gray-300 mt-1">{lightboxImage.description}</p>
        {/if}
        <div class="flex justify-between items-center mt-2">
          <p class="text-gray-400">Photo by: {lightboxImage.photographerName}</p>
          <span class="px-3 py-1 bg-primary/80 text-white text-xs rounded-full">{lightboxImage.category}</span>
        </div>
      </div>
      <button 
        class="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        on:click={closeLightbox}
        aria-label="Close lightbox"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
{/if}

<!-- Call to Action -->
<section class="py-16 bg-white">
  <div class="max-w-5xl mx-auto px-8 text-center">
    <h2 class="text-3xl font-bold text-text-dark mb-6">Want to Create Your Own Memories?</h2>
    <p class="text-lg text-text-light mb-8 max-w-3xl mx-auto">
      Like what you see? Book a photography session with us today and let's create your own stunning images.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a 
        href="/book" 
        class="inline-block py-3 px-8 bg-primary text-white rounded font-semibold hover:bg-primary-dark transition-colors duration-300"
      >
        Book a Session
      </a>
      <a 
        href="/services" 
        class="inline-block py-3 px-8 bg-transparent border-2 border-primary text-primary rounded font-semibold hover:bg-primary hover:text-white transition-colors duration-300"
      >
        View Our Services
      </a>
    </div>
  </div>
</section>
