<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import toast from 'svelte-5-french-toast';
  import { browser } from '$app/environment';
  
  // Get data from load function
  export let data;
  
  // Form data
  let formData = {
    fullName: '',
    email: '',
    phoneNumber: '',
    serviceId: '',  // Changed from sessionType to serviceId to match API
    date: '',
    time: '',
    location: '',
    additionalDetails: ''
  };
  
  // For validation
  let errors = {};
  let isSubmitting = false;
  let isSuccess = false;
  
  // Pre-select service if provided in URL
  onMount(() => {
    if (data.selectedService) {
      formData.serviceId = data.selectedService.id.toString();
    }
    
    // Initialize form with user data if available
    const token = browser ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData) {
          formData.fullName = tokenData.username || formData.fullName;
          formData.email = tokenData.email || formData.email;
        }
      } catch (e) {
        console.error('Error parsing token', e);
      }
    }
  });
  
  // Form submission
  async function handleSubmit() {
    isSubmitting = true;
    errors = {};
    
    // Simple validation
    if (!formData.fullName) errors.fullName = "Full name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Please enter a valid email";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    if (!formData.serviceId) errors.serviceId = "Please select a service type";
    if (!formData.date) errors.date = "Preferred date is required";
    if (!formData.time) errors.time = "Preferred time is required";
    if (!formData.location) errors.location = "Location is required";
    
    // If no errors, submit form
    if (Object.keys(errors).length === 0) {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to book a session');
          goto('/login?redirect=/book');
          isSubmitting = false;
          return;
        }
        
        // Make API request
        const response = await fetch('http://localhost:3000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create booking');
        }
        
        const data = await response.json();
        
        // Display success
        isSuccess = true;
        toast.success('Booking created successfully!');
        
        // Reset form after successful submission
        formData = {
          fullName: '',
          email: '',
          phoneNumber: '',
          serviceId: '',
          date: '',
          time: '',
          location: '',
          additionalDetails: ''
        };
      } catch (error) {
        console.error('Booking error:', error);
        toast.error(error.message || 'An error occurred');
      } finally {
        isSubmitting = false;
      }
    } else {
      isSubmitting = false;
    }
  }
  
  // Reset success message
  function resetSuccess() {
    isSuccess = false;
  }
  
  // Add state for cancellation modal
  let showCancelConfirmation = false;
  let bookingToCancel = null;
  
  // Function to open cancel confirmation modal
  function openCancelModal(bookingId) {
    bookingToCancel = bookingId;
    showCancelConfirmation = true;
  }
  
  // Function to handle actual cancellation
  async function confirmCancelBooking() {
    if (!bookingToCancel) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingToCancel}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }
      
      toast.success(data.message || 'Booking cancelled successfully');
      
      // Close modal and reset state
      showCancelConfirmation = false;
      bookingToCancel = null;
      
      // Refresh bookings or redirect to profile
      goto('/profile');
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'An error occurred');
      showCancelConfirmation = false;
    }
  }
  
  // Function to close modal
  function closeCancelModal() {
    showCancelConfirmation = false;
    bookingToCancel = null;
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
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
        <a 
          href="/profile" 
          class="inline-block py-3 px-8 ml-4 bg-gray-200 text-gray-800 rounded font-semibold hover:bg-gray-300 transition-colors duration-300"
        >
          View My Bookings
        </a>
      </div>
    {:else if data.error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <div class="text-red-600 text-5xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-text-dark mb-4">Error Loading Services</h2>
        <p class="text-lg text-text-light mb-6">{data.error}</p>
        <a 
          href="/book" 
          class="inline-block py-3 px-8 bg-primary text-white rounded font-semibold hover:bg-primary-dark transition-colors duration-300"
        >
          Try Again
        </a>
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
            <label for="phoneNumber" class="block text-text-dark font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              bind:value={formData.phoneNumber}
              class={`w-full px-4 py-3 rounded border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="+233 123 456 7890"
            />
            {#if errors.phoneNumber}
              <p class="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            {/if}
          </div>
        </div>
        
        <!-- Service Type selection -->
        <div class="mb-6">
          <label for="serviceId" class="block text-text-dark font-medium mb-2">Type of Service *</label>
          <select
            id="serviceId"
            bind:value={formData.serviceId}
            class={`w-full px-4 py-3 rounded border ${errors.serviceId ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
          >
            <option value="" disabled selected>Select a service type</option>
            {#if data.services && data.services.length > 0}
              {#each data.services as service}
                <option value={service.id}>{service.name} - ${service.price} ({service.duration})</option>
              {/each}
            {:else}
              <option value="" disabled>No services available</option>
            {/if}
          </select>
          {#if errors.serviceId}
            <p class="text-red-500 text-sm mt-1">{errors.serviceId}</p>
          {:else if data.services && data.services.length === 0}
            <p class="text-yellow-600 text-sm mt-1">No services are currently available. Please contact us directly.</p>
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
          <label for="additionalDetails" class="block text-text-dark font-medium mb-2">Additional Details</label>
          <textarea
            id="additionalDetails"
            bind:value={formData.additionalDetails}
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
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-text-dark mb-3">Professional Equipment</h3>
        <p class="text-text-light">We use top-of-the-line cameras and equipment to ensure the highest quality photos.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-card text-center">
        <div class="text-4xl text-primary mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-text-dark mb-3">Experienced Photographers</h3>
        <p class="text-text-light">Our photographers have years of experience capturing beautiful moments.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-card text-center">
        <div class="text-4xl text-primary mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-text-dark mb-3">Customer Satisfaction</h3>
        <p class="text-text-light">We prioritize your vision and work closely with you to achieve the perfect results.</p>
      </div>
    </div>
  </div>
</section>

<!-- Add Cancel Confirmation Modal -->
{#if showCancelConfirmation}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Cancel Booking</h3>
      
      <p class="text-gray-600 mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
      
      <div class="flex justify-end space-x-3">
        <button 
          type="button"
          on:click={closeCancelModal}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Keep Booking
        </button>
        <button 
          type="button"
          on:click={confirmCancelBooking}
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Cancel Booking
        </button>
      </div>
    </div>
  </div>
{/if}
