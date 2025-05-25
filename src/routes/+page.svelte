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
  
  // Sample services data
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
<section class="hero">
  <div class="hero-content">
    <h1>Capturing Life's Beautiful Moments</h1>
    <p>Professional photography services that tell your unique story</p>
    <div class="hero-buttons">
      <a href="/gallery" class="btn btn-primary">View Gallery</a>
      <a href="/book" class="btn btn-secondary">Book a Session</a>
    </div>
  </div>
</section>

<!-- About Section -->
<section class="about">
  <div class="container">
    <div class="about-content">
      <div class="about-text">
        <h2>About Capture Moments</h2>
        <p>We are passionate about freezing time through our lenses. With years of experience and a creative eye, we transform ordinary moments into extraordinary memories.</p>
        <p>Our approach combines technical expertise with artistic vision to deliver photographs that you'll cherish for a lifetime.</p>
        <a href="/services" class="btn btn-outline">Our Approach</a>
      </div>
      <div class="about-image">
        <img src="https://source.unsplash.com/random/600x800?photographer" alt="Photographer at work" />
      </div>
    </div>
  </div>
</section>

<!-- Services Section -->
<section class="services">
  <div class="container">
    <h2>Our Services</h2>
    <p class="section-subtitle">Professional photography for all your special moments</p>
    
    <div class="services-grid">
      {#each services as service}
        <div class="service-card">
          <div class="service-icon">
            <i class="fas {service.icon}"></i>
          </div>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
        </div>
      {/each}
    </div>
    
    <div class="services-cta">
      <a href="/services" class="btn btn-primary">View All Services</a>
    </div>
  </div>
</section>

<!-- Gallery Preview Section -->
<section class="gallery-preview">
  <div class="container">
    <h2>Featured Work</h2>
    <p class="section-subtitle">A glimpse of our photography portfolio</p>
    
    <div class="gallery-grid">
      {#each galleryPreview as image, i}
        <div class="gallery-item">
          <img src={image.src} alt={image.alt} loading="lazy" />
          <div class="gallery-overlay">
            <span>{image.category}</span>
          </div>
        </div>
      {/each}
    </div>
    
    <div class="gallery-cta">
      <a href="/gallery" class="btn btn-primary">View Full Gallery</a>
    </div>
  </div>
</section>

<!-- Testimonials Section -->
<section class="testimonials">
  <div class="container">
    <h2>Client Testimonials</h2>
    <p class="section-subtitle">What our clients say about us</p>
    
    <div class="testimonial-slider">
      <button class="slider-arrow prev" on:click={prevTestimonial} aria-label="Previous testimonial">
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <div class="testimonial-container">
        {#each testimonials as testimonial, i}
          <div class="testimonial" class:active={i === currentTestimonialIndex}>
            <div class="testimonial-content">
              <div class="quote-icon">
                <i class="fas fa-quote-left"></i>
              </div>
              <p class="quote-text">{testimonial.quote}</p>
              <div class="testimonial-author">
                <img src={testimonial.image} alt={testimonial.name} />
                <span>{testimonial.name}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      <button class="slider-arrow next" on:click={nextTestimonial} aria-label="Next testimonial">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    
    <div class="testimonial-indicators">
      {#each testimonials as _, i}
        <button 
          class="indicator" 
          class:active={i === currentTestimonialIndex} 
          on:click={() => currentTestimonialIndex = i}
          aria-label={`Go to testimonial ${i + 1}`}
        ></button>
      {/each}
    </div>
  </div>
</section>

<!-- Call to Action Section -->
<section class="cta">
  <div class="container">
    <h2>Ready to Book Your Session?</h2>
    <p>Let's create beautiful memories together</p>
    <a href="/book" class="btn btn-large">Book Now</a>
  </div>
</section>

<style>
  :global(body) {
    font-family: 'Playfair Display', serif;
  }
  
  /* Hero Section */
  .hero {
    height: 100vh;
    min-height: 600px;
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://source.unsplash.com/random/1920x1080?photography');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    margin-top: 0;
    padding-top: 0;
  }
  
  .hero-content {
    max-width: 800px;
    padding: 3rem 2rem 0 2rem; /* Increased top padding to create more space from navbar */
    margin-top: 2rem; /* Add margin to push content down a bit */
  }
  
  .hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  .hero p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  }
  
  .hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
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
  
  /* Container */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  /* Section Styles */
  section {
    padding: 5rem 0;
  }
  
  h2 {
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
  
  /* About Section */
  .about {
    background-color: #f9f9f9;
  }
  
  .about-content {
    display: flex;
    align-items: center;
    gap: 4rem;
  }
  
  .about-text {
    flex: 1;
  }
  
  .about-text h2 {
    text-align: left;
    margin-bottom: 1.5rem;
  }
  
  .about-text p {
    margin-bottom: 1.5rem;
    line-height: 1.6;
    color: #555;
  }
  
  .about-image {
    flex: 1;
    position: relative;
  }
  
  .about-image img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  /* Services Section */
  .services {
    background-color: white;
  }
  
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .service-card {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition: transform 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .service-card:hover {
    transform: translateY(-10px);
  }
  
  .service-icon {
    font-size: 2.5rem;
    color: #e67e22;
    margin-bottom: 1.5rem;
  }
  
  .service-card h3 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    color: #333;
  }
  
  .service-card p {
    color: #666;
    line-height: 1.6;
  }
  
  .services-cta {
    text-align: center;
    margin-top: 1rem;
  }
  
  /* Gallery Preview */
  .gallery-preview {
    background-color: #f5f5f5;
  }
  
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  
  .gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    height: 300px;
  }
  
  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .gallery-item:hover img {
    transform: scale(1.1);
  }
  
  .gallery-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    padding: 1rem;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .gallery-item:hover .gallery-overlay {
    opacity: 1;
  }
  
  .gallery-cta {
    text-align: center;
  }
  
  /* Testimonials */
  .testimonials {
    background-color: white;
  }
  
  .testimonial-slider {
    position: relative;
    display: flex;
    align-items: center;
    margin: 0 auto;
    max-width: 900px;
  }
  
  .testimonial-container {
    position: relative;
    flex: 1;
    overflow: hidden;
    height: 300px;
  }
  
  .testimonial {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  .testimonial.active {
    opacity: 1;
  }
  
  .testimonial-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    text-align: center;
    max-width: 600px;
  }
  
  .quote-icon {
    font-size: 2rem;
    color: #e67e22;
    margin-bottom: 1rem;
  }
  
  .quote-text {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #555;
    font-style: italic;
    margin-bottom: 1.5rem;
  }
  
  .testimonial-author {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  
  .testimonial-author img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .testimonial-author span {
    font-weight: 600;
    color: #333;
  }
  
  .slider-arrow {
    background: #e67e22;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    z-index: 2;
    transition: background 0.3s ease;
  }
  
  .slider-arrow:hover {
    background: #d35400;
  }
  
  .testimonial-indicators {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 2rem;
  }
  
  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #ddd;
    border: none;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .indicator.active {
    background-color: #e67e22;
  }
  
  /* Call to Action */
  .cta {
    background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://source.unsplash.com/random/1920x1080?camera');
    background-size: cover;
    background-position: center;
    color: white;
    text-align: center;
  }
  
  .cta h2 {
    color: white;
    margin-bottom: 1rem;
  }
  
  .cta p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
  
  /* Responsive Styles */
  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2.5rem;
    }
    
    .hero p {
      font-size: 1.2rem;
    }
    
    .about-content {
      flex-direction: column;
      gap: 2rem;
    }
    
    .about-text {
      order: 2;
    }
    
    .about-image {
      order: 1;
    }
    
    .services-grid {
      grid-template-columns: 1fr;
    }
    
    .gallery-grid {
      grid-template-columns: 1fr;
    }
    
    h2 {
      font-size: 2rem;
    }
    
    .hero-buttons {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
