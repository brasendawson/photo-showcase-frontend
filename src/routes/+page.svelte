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
  
  // Sample gallery preview images
  const galleryPreview = [
    { src: "https://source.unsplash.com/random/600x400?wedding", alt: "Wedding Photography", category: "Wedding" },
    { src: "https://source.unsplash.com/random/600x400?portrait", alt: "Portrait Photography", category: "Portrait" },
    { src: "https://source.unsplash.com/random/600x400?family", alt: "Family Photography", category: "Family" },
    { src: "https://source.unsplash.com/random/600x400?event", alt: "Event Photography", category: "Event" }
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
  
  let currentTestimonialIndex = 0;
  
  function nextTestimonial() {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
  }
  
  function prevTestimonial() {
    currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
  }
  
  onMount(() => {
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
          <a href="/services" class="inline-block py-3 px-7 rounded font-semibold transition-all duration-300 cursor-pointer text-primary border-2 border-primary bg-transparent hover:bg-primary hover:text-white">Our Approach</a>
        </div>
      </div>
      <div class="flex-1 md:order-2 order-1">
        <img src="https://source.unsplash.com/random/600x800?photographer" alt="Photographer at work" class="w-full h-auto rounded-lg shadow-image" />
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
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {#each galleryPreview as image, i}
        <div class="relative overflow-hidden rounded-lg h-[300px] group">
          <img src={image.src} alt={image.alt} loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span>{image.category}</span>
          </div>
        </div>
      {/each}
    </div>
    
    <div class="text-center">
      <a href="/gallery" class="inline-block py-3 px-7 rounded font-semibold transition-all duration-300 cursor-pointer bg-primary text-white hover:bg-primary-dark">View Full Gallery</a>
    </div>
  </div>
</section>

<!-- Testimonials Section -->
<section class="py-20 bg-white">
  <div class="container max-w-7xl mx-auto px-8">
    <h2 class="text-4xl text-center mb-1 text-text-dark">Client Testimonials</h2>
    <p class="text-center text-lg text-text-muted mb-12">What our clients say about us</p>
    
    <div class="relative flex items-center max-w-4xl mx-auto">
      <button class="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer z-10 transition-colors hover:bg-primary-dark" on:click={prevTestimonial} aria-label="Previous testimonial">
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <div class="relative flex-1 overflow-hidden h-[300px]">
        {#each testimonials as testimonial, i}
          <div class={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-500 ${i === currentTestimonialIndex ? 'opacity-100' : 'opacity-0'}`}>
            <div class="bg-white p-8 rounded-lg shadow-card text-center max-w-xl">
              <div class="text-4xl text-primary mb-4">
                <i class="fas fa-quote-left"></i>
              </div>
              <p class="text-lg leading-relaxed text-text-light italic mb-6">{testimonial.quote}</p>
              <div class="flex items-center justify-center gap-4">
                <img src={testimonial.image} alt={testimonial.name} class="w-16 h-16 rounded-full object-cover" />
                <span class="font-semibold text-text-dark">{testimonial.name}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      <button class="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer z-10 transition-colors hover:bg-primary-dark" on:click={nextTestimonial} aria-label="Next testimonial">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    
    <div class="flex justify-center gap-2 mt-8">
      {#each testimonials as _, i}
        <button 
          class={`w-3 h-3 rounded-full border-none cursor-pointer transition-colors ${i === currentTestimonialIndex ? 'bg-primary' : 'bg-gray-300'}`}
          on:click={() => currentTestimonialIndex = i}
          aria-label={`Go to testimonial ${i + 1}`}
        ></button>
      {/each}
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
