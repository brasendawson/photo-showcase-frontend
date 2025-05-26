<script>
  import { onMount } from 'svelte';
  
  // Featured images for slideshow
  const slideshowImages = [
    {
      src: "https://source.unsplash.com/random/1920x800?wedding",
      alt: "Wedding Photography",
      title: "Wedding Moments",
      subtitle: "Capturing the most special day of your life"
    },
    {
      src: "https://source.unsplash.com/random/1920x800?portrait",
      alt: "Portrait Photography",
      title: "Portrait Sessions",
      subtitle: "Professional portraits that showcase your personality"
    },
    {
      src: "https://source.unsplash.com/random/1920x800?event",
      alt: "Event Photography",
      title: "Event Coverage",
      subtitle: "Documenting your special occasions"
    },
    {
      src: "https://source.unsplash.com/random/1920x800?landscape",
      alt: "Landscape Photography",
      title: "Nature & Landscapes",
      subtitle: "Breathtaking scenes from around the world"
    }
  ];
  
  // Gallery categories
  const categories = [
    "All",
    "Wedding",
    "Portrait",
    "Family",
    "Event",
    "Commercial",
    "Nature"
  ];
  
  // Gallery images
  const galleryImages = [
    {
      id: 1,
      src: "https://source.unsplash.com/random/600x600?wedding-ceremony",
      alt: "Wedding ceremony",
      category: "Wedding",
      title: "Wedding Ceremony"
    },
    {
      id: 2,
      src: "https://source.unsplash.com/random/600x600?wedding-couple",
      alt: "Wedding couple",
      category: "Wedding",
      title: "Couple Portraits"
    },
    {
      id: 3,
      src: "https://source.unsplash.com/random/600x600?corporate-portrait",
      alt: "Corporate portrait",
      category: "Portrait",
      title: "Corporate Headshot"
    },
    {
      id: 4,
      src: "https://source.unsplash.com/random/600x600?family-portrait",
      alt: "Family portrait",
      category: "Family",
      title: "Family Session"
    },
    {
      id: 5,
      src: "https://source.unsplash.com/random/600x600?conference",
      alt: "Conference event",
      category: "Event",
      title: "Corporate Conference"
    },
    {
      id: 6,
      src: "https://source.unsplash.com/random/600x600?product-photography",
      alt: "Product photography",
      category: "Commercial",
      title: "Product Showcase"
    },
    {
      id: 7,
      src: "https://source.unsplash.com/random/600x600?landscape-mountains",
      alt: "Mountain landscape",
      category: "Nature",
      title: "Mountain Vista"
    },
    {
      id: 8,
      src: "https://source.unsplash.com/random/600x600?wedding-reception",
      alt: "Wedding reception",
      category: "Wedding",
      title: "Reception Celebration"
    },
    {
      id: 9,
      src: "https://source.unsplash.com/random/600x600?portrait-woman",
      alt: "Woman portrait",
      category: "Portrait",
      title: "Studio Portrait"
    },
    {
      id: 10,
      src: "https://source.unsplash.com/random/600x600?children-family",
      alt: "Children family",
      category: "Family",
      title: "Children's Session"
    },
    {
      id: 11,
      src: "https://source.unsplash.com/random/600x600?graduation",
      alt: "Graduation event",
      category: "Event",
      title: "Graduation Ceremony"
    },
    {
      id: 12,
      src: "https://source.unsplash.com/random/600x600?real-estate",
      alt: "Real estate photography",
      category: "Commercial",
      title: "Real Estate Photography"
    },
    {
      id: 13,
      src: "https://source.unsplash.com/random/600x600?landscape-ocean",
      alt: "Ocean landscape",
      category: "Nature",
      title: "Ocean Sunset"
    },
    {
      id: 14,
      src: "https://source.unsplash.com/random/600x600?wedding-details",
      alt: "Wedding details",
      category: "Wedding",
      title: "Wedding Details"
    },
    {
      id: 15,
      src: "https://source.unsplash.com/random/600x600?portrait-man",
      alt: "Man portrait",
      category: "Portrait",
      title: "Outdoor Portrait"
    },
    {
      id: 16,
      src: "https://source.unsplash.com/random/600x600?party-event",
      alt: "Party event",
      category: "Event",
      title: "Birthday Celebration"
    }
  ];
  
  // State variables
  let currentSlide = 0;
  let selectedCategory = "All";
  let filteredImages = [];
  let isLightboxOpen = false;
  let lightboxImage = null;
  
  // Filter gallery images based on selected category
  $: {
    if (selectedCategory === "All") {
      filteredImages = galleryImages;
    } else {
      filteredImages = galleryImages.filter(img => img.category === selectedCategory);
    }
  }
  
  // Handle category selection
  function selectCategory(category) {
    selectedCategory = category;
  }
  
  // Open lightbox
  function openLightbox(image) {
    lightboxImage = image;
    isLightboxOpen = true;
    document.body.classList.add('overflow-hidden');
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
  
  // Auto-advance slideshow
  onMount(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>Photo Gallery | Capture Moments Photography</title>
  <meta name="description" content="Browse our photography gallery showcasing weddings, portraits, events, and more. See our professional photography work.">
</svelte:head>

<!-- Hero Slideshow Section -->
<section class="relative pt-20 h-[600px] overflow-hidden">
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
<section class="py-16 bg-bg-lighter">
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
    
    <!-- Gallery Grid -->
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
              <p class="text-sm text-gray-200">{image.category}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Empty state if no images match filter -->
    {#if filteredImages.length === 0}
      <div class="text-center py-12">
        <p class="text-text-muted text-lg">No images found in this category.</p>
        <button 
          class="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          on:click={() => selectCategory('All')}
        >
          View All Images
        </button>
      </div>
    {/if}
  </div>
</section>

<!-- Lightbox -->
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
        <p class="text-gray-300">{lightboxImage.category}</p>
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
