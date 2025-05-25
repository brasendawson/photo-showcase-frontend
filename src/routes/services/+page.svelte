<script>
  // Updated service data with six unique services
  const services = [
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
  </div>
</section>

<!-- Services Detail Section -->
{#each [0, 2, 4] as startIndex}
  <section class={`py-20 ${startIndex === 0 ? 'bg-white' : 'bg-bg-lighter'}`}>
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
        <!-- First column - Left image -->
        <div class="lg:col-span-1 md:col-span-1 col-span-1">
          <img 
            src={services[startIndex].image} 
            alt={`${services[startIndex].title} photography`} 
            class="rounded-lg shadow-image object-cover w-full h-[400px]"
          />
        </div>
        
        <!-- Second column - Left description -->
        <div class="lg:col-span-1 md:col-span-1 col-span-1">
          <h2 class="text-2xl font-bold text-text-dark mb-4 flex items-center">
            <i class="fas {services[startIndex].icon} mr-2"></i> {services[startIndex].title}
          </h2>
          <p class="text-lg text-text-light leading-relaxed">{services[startIndex].description}</p>
        </div>
        
        <!-- Third column - Right description -->
        <div class="lg:col-span-1 md:col-span-1 col-span-1">
          <h2 class="text-2xl font-bold text-text-dark mb-4 flex items-center">
            <i class="fas {services[startIndex + 1].icon} mr-2"></i> {services[startIndex + 1].title}
          </h2>
          <p class="text-lg text-text-light leading-relaxed">{services[startIndex + 1].description}</p>
        </div>
        
        <!-- Fourth column - Right image -->
        <div class="lg:col-span-1 md:col-span-1 col-span-1">
          <img 
            src={services[startIndex + 1].image} 
            alt={`${services[startIndex + 1].title} photography`} 
            class="rounded-lg shadow-image object-cover w-full h-[400px]"
          />
        </div>
        
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
          <p class="text-lg text-text-light leading-relaxed mb-6">{services[startIndex].description}</p>
        </div>
        <div class="block md:hidden col-span-1">
          <img 
            src={services[startIndex + 1].image} 
            alt={`${services[startIndex + 1].title} photography`} 
            class="rounded-lg shadow-image object-cover w-full h-[250px] mb-4"
          />
          <h2 class="text-2xl font-bold text-text-dark mb-2 flex items-center">
            <i class="fas {services[startIndex + 1].icon} mr-2"></i> {services[startIndex + 1].title}
          </h2>
          <p class="text-lg text-text-light leading-relaxed">{services[startIndex + 1].description}</p>
        </div>
      </div>
    </div>
  </section>
{/each}

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