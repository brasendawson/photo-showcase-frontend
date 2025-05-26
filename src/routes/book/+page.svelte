<script>
  // Form data
  let formData = {
    fullName: '',
    email: '',
    phone: '',
    shootType: '',
    date: '',
    time: '',
    location: '',
    details: ''
  };
  
  // For validation
  let errors = {};
  let isSubmitting = false;
  let isSuccess = false;
  
  // Options for shoot types
  const shootTypes = [
    "Wedding Photography",
    "Portrait Sessions",
    "Event Coverage",
    "Commercial Photography",
    "Nature & Landscape",
    "Group & Team Photography"
  ];
  
  // Form submission
  function handleSubmit() {
    isSubmitting = true;
    errors = {};
    
    // Simple validation
    if (!formData.fullName) errors.fullName = "Full name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Please enter a valid email";
    if (!formData.phone) errors.phone = "Phone number is required";
    if (!formData.shootType) errors.shootType = "Please select a shoot type";
    if (!formData.date) errors.date = "Preferred date is required";
    if (!formData.time) errors.time = "Preferred time is required";
    if (!formData.location) errors.location = "Location is required";
    
    // If no errors, submit form
    if (Object.keys(errors).length === 0) {
      // Simulate API call with timeout
      setTimeout(() => {
        isSubmitting = false;
        isSuccess = true;
        // Reset form after successful submission
        formData = {
          fullName: '',
          email: '',
          phone: '',
          shootType: '',
          date: '',
          time: '',
          location: '',
          details: ''
        };
      }, 1500);
    } else {
      isSubmitting = false;
    }
  }
  
  // Reset success message
  function resetSuccess() {
    isSuccess = false;
  }
</script>

<svelte:head>
  <title>Book a Session | Capture Moments Photography</title>
  <meta name="description" content="Book your photography session with us. We offer a variety of photography services for all your needs.">
</svelte:head>

<!-- Hero Section -->
<section class="pt-32 pb-16 bg-bg-light">
  <div class="max-w-4xl mx-auto px-8">
    <h1 class="text-5xl md:text-6xl font-bold text-center text-text-dark mb-6">Book a Session</h1>
    <p class="text-xl text-text-muted text-center max-w-3xl mx-auto mb-6">
      Ready to capture your special moments? Fill out the form below to book your photography session with us.
    </p>
  </div>
</section>

<!-- Booking Form Section -->
<section class="py-16 bg-white">
  <div class="max-w-3xl mx-auto px-8">
    {#if isSuccess}
      <div class="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div class="text-green-600 text-5xl mb-4">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2 class="text-3xl font-bold text-text-dark mb-4">Booking Request Sent!</h2>
        <p class="text-lg text-text-light mb-6">
          Thank you for booking with us. We've received your request and will contact you within 24 hours to confirm the details.
        </p>
        <button 
          class="inline-block py-3 px-8 bg-primary text-white rounded font-semibold hover:bg-primary-dark transition-colors duration-300"
          on:click={resetSuccess}
        >
          Book Another Session
        </button>
      </div>
    {:else}
      <form on:submit|preventDefault={handleSubmit} class="bg-white rounded-lg shadow-card p-8">
        <!-- Full Name -->
        <div class="mb-6">
          <label for="fullName" class="block text-text-dark font-medium mb-2">Full Name *</label>
          <input
            type="text"
            id="fullName"
            bind:value={formData.fullName}
            class={`w-full px-4 py-3 rounded border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="John Doe"
          />
          {#if errors.fullName}
            <p class="text-red-500 text-sm mt-1">{errors.fullName}</p>
          {/if}
        </div>
        
        <!-- Email & Phone (Two columns on larger screens) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="email" class="block text-text-dark font-medium mb-2">Email Address *</label>
            <input
              type="email"
              id="email"
              bind:value={formData.email}
              class={`w-full px-4 py-3 rounded border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="your@email.com"
            />
            {#if errors.email}
              <p class="text-red-500 text-sm mt-1">{errors.email}</p>
            {/if}
          </div>
          
          <div>
            <label for="phone" class="block text-text-dark font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              bind:value={formData.phone}
              class={`w-full px-4 py-3 rounded border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="+233 123 456 7890"
            />
            {#if errors.phone}
              <p class="text-red-500 text-sm mt-1">{errors.phone}</p>
            {/if}
          </div>
        </div>
        
        <!-- Shoot Type -->
        <div class="mb-6">
          <label for="shootType" class="block text-text-dark font-medium mb-2">Type of Shoot *</label>
          <select
            id="shootType"
            bind:value={formData.shootType}
            class={`w-full px-4 py-3 rounded border ${errors.shootType ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
          >
            <option value="" disabled>Select a shoot type</option>
            {#each shootTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
          {#if errors.shootType}
            <p class="text-red-500 text-sm mt-1">{errors.shootType}</p>
          {/if}
        </div>
        
        <!-- Date & Time (Two columns on larger screens) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="date" class="block text-text-dark font-medium mb-2">Preferred Date *</label>
            <input
              type="date"
              id="date"
              bind:value={formData.date}
              class={`w-full px-4 py-3 rounded border ${errors.date ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              min={new Date().toISOString().split('T')[0]}
            />
            {#if errors.date}
              <p class="text-red-500 text-sm mt-1">{errors.date}</p>
            {/if}
          </div>
          
          <div>
            <label for="time" class="block text-text-dark font-medium mb-2">Preferred Time *</label>
            <input
              type="time"
              id="time"
              bind:value={formData.time}
              class={`w-full px-4 py-3 rounded border ${errors.time ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {#if errors.time}
              <p class="text-red-500 text-sm mt-1">{errors.time}</p>
            {/if}
          </div>
        </div>
        
        <!-- Location/Venue -->
        <div class="mb-6">
          <label for="location" class="block text-text-dark font-medium mb-2">Location/Venue *</label>
          <input
            type="text"
            id="location"
            bind:value={formData.location}
            class={`w-full px-4 py-3 rounded border ${errors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="Enter location or venue"
          />
          {#if errors.location}
            <p class="text-red-500 text-sm mt-1">{errors.location}</p>
          {/if}
        </div>
        
        <!-- Additional Details -->
        <div class="mb-8">
          <label for="details" class="block text-text-dark font-medium mb-2">Additional Details</label>
          <textarea
            id="details"
            bind:value={formData.details}
            class="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary h-32"
            placeholder="Tell us more about your event or specific requirements..."
          ></textarea>
        </div>
        
        <!-- Submit Button -->
        <div class="text-center">
          <button
            type="submit"
            class="inline-block py-3 px-10 bg-primary text-white rounded font-semibold hover:bg-primary-dark transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Book Now'}
          </button>
          <p class="text-text-muted mt-4">* Required fields</p>
        </div>
      </form>
    {/if}
  </div>
</section>

<!-- Why Book With Us Section -->
<section class="py-16 bg-bg-lighter">
  <div class="max-w-5xl mx-auto px-8">
    <h2 class="text-3xl font-bold text-center text-text-dark mb-12">Why Book With Us</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white p-6 rounded-lg shadow-card text-center">
        <div class="text-4xl text-primary mb-4">
          <i class="fas fa-camera"></i>
        </div>
        <h3 class="text-xl font-semibold text-text-dark mb-3">Professional Equipment</h3>
        <p class="text-text-light">We use top-of-the-line cameras and equipment to ensure the highest quality photos.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-card text-center">
        <div class="text-4xl text-primary mb-4">
          <i class="fas fa-user-tie"></i>
        </div>
        <h3 class="text-xl font-semibold text-text-dark mb-3">Experienced Photographers</h3>
        <p class="text-text-light">Our photographers have years of experience capturing beautiful moments.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-card text-center">
        <div class="text-4xl text-primary mb-4">
          <i class="fas fa-heart"></i>
        </div>
        <h3 class="text-xl font-semibold text-text-dark mb-3">Customer Satisfaction</h3>
        <p class="text-text-light">We prioritize your vision and work closely with you to achieve the perfect results.</p>
      </div>
    </div>
  </div>
</section>
