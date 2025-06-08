<script>
  import { onMount } from 'svelte';
  
  // Sample testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      quote: "The photos captured our wedding day perfectly. Every emotion, every moment preserved beautifully!",
      image: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      name: "David Thompson",
      quote: "The family photoshoot exceeded our expectations. The kids were comfortable and the photos are amazing!",
      image: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    {
      name: "Emma Wilson",
      quote: "My graduation photos are stunning! Professional, creative, and delivered on time.",
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];
  
  // Sample services data with shorter descriptions
  const services = [
    {
      title: "Wedding Photography",
      icon: "fa-heart",
      description: "Elegant and timeless photography for your special day."
    },
    {
      title: "Portrait Sessions",
      icon: "fa-user",
      description: "Personalized portraits that capture your unique personality."
    },
    {
      title: "Family Photography",
      icon: "fa-users",
      description: "Creating beautiful family memories to cherish forever."
    },
    {
      title: "Event Coverage",
      icon: "fa-calendar",
      description: "Complete documentation of your special events and celebrations."
    }
  ];
  
  // Replace static gallery preview with fetched photos
  let galleryPreview = [];
  let isLoadingPreview = true;
  let previewError = null;
  
  // Function to fetch featured photos for the homepage preview
  async function fetchFeaturedPreview() {
    isLoadingPreview = true;
    previewError = null;
    
    try {
      // Fetch only featured photos from the API - limit to exactly 4
      const response = await fetch('https://photo-showcase-api.vercel.app/api/photos/gallery?featured=true&limit=4');
      
      if (!response.ok) {
        throw new Error('Failed to load featured photos');
      }
      
      const data = await response.json();
      
      // Only use photos that were actually uploaded by admin (will have valid imageUrl)
      if (data.photos && data.photos.length > 0) {
        // Filter out any photos without proper imageUrl
        const validPhotos = data.photos.filter(photo => 
          photo.imageUrl && 
          typeof photo.imageUrl === 'string' && 
          photo.imageUrl.trim() !== ''
        );
        
        if (validPhotos.length > 0) {
          // Map API response to our gallery preview format
          galleryPreview = validPhotos.slice(0, 4).map(photo => ({
            id: photo.id,
            src: photo.imageUrl,
            alt: photo.title || 'Gallery photo',
            category: photo.type ? photo.type.charAt(0).toUpperCase() + photo.type.slice(1) : 'Other'
          }));
          
          console.log(`Showing ${galleryPreview.length} featured photos from admin uploads`);
        } else {
          // Empty array if no valid photos found
          galleryPreview = [];
          console.log('No valid featured photos found');
        }
      } else {
        // Empty array if no photos returned from API
        galleryPreview = [];
        console.log('No featured photos returned from API');
      }
    } catch (err) {
      console.error('Error fetching featured preview:', err);
      previewError = err.message;
      galleryPreview = []; // Set to empty array instead of using fallbacks
    } finally {
      isLoadingPreview = false;
    }
  }
  
  let currentTestimonialIndex = 0;
  
  function nextTestimonial() {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
  }
  
  function prevTestimonial() {
    currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
  }
  
  onMount(() => {
    // Fetch featured photos for preview
    fetchFeaturedPreview();
    
    // Existing testimonial rotation
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>Capture Moments | Professional Photography</title>
  <meta name="description" content="Professional photography services for weddings, portraits, family sessions, and events. Capture your special moments with us.">
</svelte:head>

<!-- Hero Section -->
<section class="h-screen min-h-[600px] bg-cover bg-center bg-fixed flex items-center justify-center text-center text-white mt-0 pt-0" style="background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://res.cloudinary.com/dornqaxya/image/upload/photo-showcase/ew8spazgxat0rr0mjxta.png');">
  <div class="max-w-3xl px-8 pt-12 mt-8">
    <h1 class="text-5xl md:text-6xl mb-4 font-bold drop-shadow-lg">Capturing Life's Beautiful Moments</h1>
    <p class="text-xl md:text-2xl mb-8 drop-shadow-md">Professional photography services that tell your unique story</p>
    <div class="flex flex-col md:flex-row gap-4 justify-center">
      <a href="/gallery" class="inline-block py-3 px-7 rounded font-semibold transition-all duration-300 cursor-pointer bg-primary text-white hover:bg-primary-dark">View Gallery</a>
      <a href="/book" class="inline-block py-3 px-7 rounded font-semibold transition-all duration-300 cursor-pointer bg-transparent text-white border-2 border-white hover:bg-white/10">Book a Session</a>
    </div>
  </div>
</section>

<!-- About Section -->
<section class="py-20 bg-bg-light">
  <div class="container max-w-7xl mx-auto px-8">
    <div class="flex flex-col md:flex-row items-center gap-16">
      <div class="flex-1 md:order-1 order-2">
        <h2 class="text-4xl mb-6 text-text-dark md:text-left text-center">About Capture Moments</h2>
        <p class="mb-6 leading-relaxed text-text-light">We are passionate about freezing time through our lenses. With years of experience and a creative eye, we transform ordinary moments into extraordinary memories.</p>
        <p class="mb-6 leading-relaxed text-text-light">Our approach combines technical expertise with artistic vision to deliver photographs that you'll cherish for a lifetime.</p>
        <div class="md:text-left text-center">
          <a href="/services" class="inline-block py-3 px-7 rounded font-semibold transition-all duration-300 cursor-pointer text-primary border-2 border-primary bg-transparent hover:bg-primary hover:text-white">Our Services</a>
        </div>
      </div>
      <div class="flex-1 md:order-2 order-1">
        <img src="https://res.cloudinary.com/dornqaxya/image/upload/photo_at_work_uivynf.jpg" alt="Photographer at work" class="w-full h-auto rounded-lg shadow-image" />
      </div>
    </div>
  </div>
</section>

<!-- Services Section -->
<section class="py-20 bg-white">
  <div class="container max-w-7xl mx-auto px-8">
    <h2 class="text-4xl text-center mb-1 text-text-dark">Our Services</h2>
    <p class="text-center text-lg text-text-muted mb-12">Professional photography for all your special moments</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {#each services as service}
        <div class="bg-white p-8 rounded-lg shadow-card text-center transition-transform duration-300 hover:-translate-y-2 h-full flex flex-col justify-center items-center">
          <div class="text-5xl text-primary mb-6">
            <i class="fas {service.icon}"></i>
          </div>
          <h3 class="text-2xl mb-4 text-text-dark">{service.title}</h3>
          <p class="text-text-light leading-relaxed">{service.description}</p>
        </div>
      {/each}
    </div>
    
    <div class="text-center">
      <a href="/services" class="inline-block py-3 px-7 rounded font-semibold transition-all duration-300 cursor-pointer bg-primary text-white hover:bg-primary-dark">View All Services</a>
    </div>
  </div>
</section>

<!-- Gallery Preview Section -->
<section class="py-20 bg-bg-lighter">
  <div class="container max-w-7xl mx-auto px-8">
    <h2 class="text-4xl text-center mb-1 text-text-dark">Featured Work</h2>
    <p class="text-center text-lg text-text-muted mb-12">A glimpse of our photography portfolio</p>
    
    {#if isLoadingPreview}
      <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    {:else if previewError}
      <div class="text-center py-8 mb-8">
        <p class="text-red-500 mb-4">Error loading featured photos</p>
        <button 
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          on:click={fetchFeaturedPreview}
        >
          Try Again
        </button>
      </div>
    {:else if galleryPreview.length === 0}
      <div class="text-center py-12 mb-8">
        <p class="text-text-muted mb-4">No featured photos available yet.</p>
        <p class="text-sm text-text-light mb-6">Our admin is working on adding some amazing featured photos. Check back soon!</p>
        <a href="/gallery" class="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
          View Full Gallery
        </a>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-{Math.min(galleryPreview.length, 4)} gap-6 mb-12">
        {#each galleryPreview as image, i}
          <div class="relative overflow-hidden rounded-lg h-[300px] group">
            <img src={image.src} alt={image.alt} loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span>{image.category}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    
    <div class="text-center">
      <a href="/gallery" class="inline-block py-3 px-7 rounded font-semibold transition-all duration-300 cursor-pointer bg-primary text-white hover:bg-primary-dark">View Full Gallery</a>
    </div>
  </div>
</section>

<!-- Call to Action Section -->
<section class="py-20 bg-cover bg-center text-white text-center" style="background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://source.unsplash.com/random/1920x1080?camera');">
  <div class="container max-w-7xl mx-auto px-8">
    <h2 class="text-4xl text-white mb-4">Ready to Book Your Session?</h2>
    <p class="text-xl mb-8">Let's create beautiful memories together</p>
    <a href="/book" class="inline-block py-4 px-10 text-lg rounded font-semibold transition-all duration-300 cursor-pointer bg-primary text-white hover:bg-primary-dark">Book Now</a>
  </div>
</section>

<style>
  :global(body) {
    font-family: 'Playfair Display', serif;
  }
  
  /* Button Styles */
  .btn {
    display: inline-block;
    padding: 0.8rem 1.8rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .btn-primary {
    background-color: #e67e22;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #d35400;
  }
  
  .btn-secondary {
    background-color: transparent;
    color: white;
    border: 2px solid white;
  }
  
  .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .btn-outline {
    color: #e67e22;
    border: 2px solid #e67e22;
    background: transparent;
  }
  
  .btn-outline:hover {
    background-color: #e67e22;
    color: white;
  }
  
  .btn-large {
    padding: 1rem 2.5rem;
    font-size: 1.2rem;
  }
  
  /* Section Styles */
  .section-title {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .section-subtitle {
    text-align: center;
    font-size: 1.2rem;
    color: #777;
    margin-bottom: 3rem;
  }
  
  /* Responsive Styles */
  @media (max-width: 768px) {
    .hero-buttons {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
