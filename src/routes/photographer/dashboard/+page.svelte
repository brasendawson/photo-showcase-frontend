<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import toast from 'svelte-5-french-toast';
  import { writable } from 'svelte/store';

  // User store for authentication
  const user = writable(null);
  
  // State management
  let activeTab = 'available';
  let isLoading = {
    available: true,
    assigned: true,
  };
  
  // Data stores
  let availableBookings = [];
  let assignedBookings = [];
  let services = [];
  
  // UI state
  let showAcceptForm = false;
  let selectedBooking = null;
  let additionalDetails = '';
  
  // Check photographer access and load data
  onMount(async () => {
    if (browser) {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access photographer dashboard');
        goto('/login?redirect=/photographer');
        return;
      }
      
      // Verify photographer role
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData.role !== 'photographer') {
          toast.error('You do not have permission to access this page');
          goto('/');
          return;
        }
        
        user.set({
          id: tokenData.userId,
          username: tokenData.username,
          role: tokenData.role,
          email: tokenData.email
        });
        
        // Load data
        try {
          await fetchServices();
        } catch (e) {
          console.error('Error loading services:', e);
        }
        
        try {
          await fetchAvailableBookings();
        } catch (e) {
          console.error('Error loading available bookings:', e);
        }
        
        try {
          await fetchAssignedBookings();
        } catch (e) {
          console.error('Error loading assigned bookings:', e);
        }
        
      } catch (e) {
        console.error('Error parsing token or loading data', e);
        toast.error('Authentication error');
        goto('/login?redirect=/photographer');
      }
    }
  });

  // Fetch all available bookings
  async function fetchAvailableBookings() {
    isLoading.available = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/bookings/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available bookings');
      }
      
      const data = await response.json();
      availableBookings = data.bookings || [];
      
      // Process bookings to ensure service info is properly displayed
      availableBookings = availableBookings.map(booking => {
        // Look up service name if we have a serviceId but no service name
        if (booking.serviceId && services.length > 0) {
          const service = services.find(s => s.id === booking.serviceId);
          if (service) {
            booking.serviceName = service.name;
          }
        }
        return booking;
      });
    } catch (error) {
      console.error('Error fetching available bookings:', error);
      toast.error('Failed to load available bookings');
    } finally {
      isLoading.available = false;
    }
  }
  
  // Fetch photographer's assigned bookings
  async function fetchAssignedBookings() {
    isLoading.assigned = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/bookings/photographer', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assigned bookings');
      }
      
      const data = await response.json();
      assignedBookings = data.bookings || [];
      
      // Process bookings to ensure service info is properly displayed
      assignedBookings = assignedBookings.map(booking => {
        // Look up service name if we have a serviceId but no service name
        if (booking.serviceId && services.length > 0) {
          const service = services.find(s => s.id === booking.serviceId);
          if (service) {
            booking.serviceName = service.name;
          }
        }
        return booking;
      });
    } catch (error) {
      console.error('Error fetching assigned bookings:', error);
      toast.error('Failed to load assigned bookings');
    } finally {
      isLoading.assigned = false;
    }
  }
  
  // Fetch all services (to display service names)
  async function fetchServices() {
    try {
      const response = await fetch('http://localhost:3000/api/services');
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      services = data.services || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  }
  
  // Accept booking
  async function acceptBooking() {
    if (!selectedBooking) {
      toast.error('No booking selected');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Make the API call to accept the booking
      const response = await fetch(`http://localhost:3000/api/bookings/${selectedBooking.id}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          additionalDetails: additionalDetails
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept booking');
      }
      
      const data = await response.json();
      
      // Remove from available bookings
      availableBookings = availableBookings.filter(b => b.id !== selectedBooking.id);
      
      // Refresh assigned bookings to show the newly accepted one
      await fetchAssignedBookings();
      
      toast.success('Booking accepted successfully');
      
      // Close the modal and reset selection
      closeAcceptForm();
      
      // Switch to assigned tab to show the booking
      activeTab = 'assigned';
      
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error(error.message || 'Failed to accept booking');
    }
  }
  
  // Open accept booking form
  function openAcceptForm(booking) {
    selectedBooking = booking;
    additionalDetails = 'I\'ll be your photographer for this session.';
    showAcceptForm = true;
  }
  
  // Close accept booking form
  function closeAcceptForm() {
    showAcceptForm = false;
    selectedBooking = null;
    additionalDetails = '';
  }
  
  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Get status class for coloring
  function getStatusClass(status) {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
</script>

<svelte:head>
  <title>Photographer Dashboard | Capture Moments Photography</title>
  <meta name="description" content="Photographer dashboard for managing bookings">
</svelte:head>

<section class="pt-32 pb-20 bg-bg-light min-h-screen">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-text-dark">Photographer Dashboard</h1>
      {#if $user}
        <div class="flex items-center">
          <span class="mr-2 text-text-muted">Welcome, {$user.username}</span>
          <span class="px-3 py-1 bg-primary text-white rounded-full text-sm">Photographer</span>
        </div>
      {/if}
    </div>
    
    <!-- Dashboard Tabs -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div class="flex border-b">
        <button 
          class={`px-6 py-3 text-lg font-medium ${activeTab === 'available' ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'}`}
          on:click={() => activeTab = 'available'}
        >
          Available Bookings
        </button>
        <button 
          class={`px-6 py-3 text-lg font-medium ${activeTab === 'assigned' ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'}`}
          on:click={() => activeTab = 'assigned'}
        >
          My Bookings
        </button>
      </div>
      
      <!-- Available Bookings Tab -->
      {#if activeTab === 'available'}
        <div class="p-6">
          <h2 class="text-2xl font-bold text-text-dark mb-4">Available Bookings</h2>
          
          {#if isLoading.available}
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          {:else if availableBookings.length === 0}
            <div class="bg-gray-50 py-8 px-6 rounded-lg text-center">
              <p class="text-text-muted text-lg">No available bookings found</p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white">
                <thead>
                  <tr class="bg-gray-100 border-b">
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">ID</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Client</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Service</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Date & Time</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Location</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Status</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each availableBookings as booking}
                    <tr class="border-b hover:bg-gray-50">
                      <td class="py-3 px-4 text-sm">{booking.id}</td>
                      <td class="py-3 px-4">
                        <div class="font-medium text-text-dark">{booking.fullName}</div>
                        <div class="text-sm text-text-muted">{booking.email}</div>
                        {#if booking.phoneNumber}
                          <div class="text-sm text-text-muted">{booking.phoneNumber}</div>
                        {/if}
                      </td>
                      <td class="py-3 px-4 text-sm">
                        {#if booking.serviceName}
                          {booking.serviceName}
                        {:else if booking.serviceId}
                          Service #{booking.serviceId}
                        {:else}
                          <span class="text-yellow-600">No service specified</span>
                        {/if}
                      </td>
                      <td class="py-3 px-4 text-sm">
                        <div>{formatDate(booking.date)}</div>
                        <div class="text-text-muted">{booking.time}</div>
                      </td>
                      <td class="py-3 px-4 text-sm">
                        {booking.location || 'Not specified'}
                      </td>
                      <td class="py-3 px-4">
                        <span class={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td class="py-3 px-4">
                        <button 
                          on:click={() => openAcceptForm(booking)}
                          class="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 text-xs font-medium"
                        >
                          Accept
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      {/if}
      
      <!-- Assigned Bookings Tab -->
      {#if activeTab === 'assigned'}
        <div class="p-6">
          <h2 class="text-2xl font-bold text-text-dark mb-4">My Bookings</h2>
          
          {#if isLoading.assigned}
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          {:else if assignedBookings.length === 0}
            <div class="bg-gray-50 py-8 px-6 rounded-lg text-center">
              <p class="text-text-muted text-lg">No bookings assigned to you yet</p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white">
                <thead>
                  <tr class="bg-gray-100 border-b">
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">ID</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Client</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Service</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Date & Time</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Location</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Status</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {#each assignedBookings as booking}
                    <tr class="border-b hover:bg-gray-50">
                      <td class="py-3 px-4 text-sm">{booking.id}</td>
                      <td class="py-3 px-4">
                        <div class="font-medium text-text-dark">{booking.fullName}</div>
                        <div class="text-sm text-text-muted">{booking.email}</div>
                        {#if booking.phoneNumber}
                          <div class="text-sm text-text-muted">{booking.phoneNumber}</div>
                        {/if}
                      </td>
                      <td class="py-3 px-4 text-sm">
                        {#if booking.serviceName}
                          {booking.serviceName}
                        {:else if booking.serviceId}
                          Service #{booking.serviceId}
                        {:else}
                          <span class="text-yellow-600">No service specified</span>
                        {/if}
                      </td>
                      <td class="py-3 px-4 text-sm">
                        <div>{formatDate(booking.date)}</div>
                        <div class="text-text-muted">{booking.time}</div>
                      </td>
                      <td class="py-3 px-4 text-sm">
                        {booking.location || 'Not specified'}
                      </td>
                      <td class="py-3 px-4">
                        <span class={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td class="py-3 px-4 max-w-xs text-sm">
                        <div class="truncate">
                          {booking.additionalDetails || 'No additional details'}
                        </div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- Accept Booking Modal -->
{#if showAcceptForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Accept Booking</h3>
      
      {#if selectedBooking}
        <div class="mb-4 p-3 bg-gray-50 rounded-md">
          <p class="text-sm text-gray-500">Booking for:</p>
          <p class="font-medium">{selectedBooking.fullName}</p>
          <p class="text-sm">{formatDate(selectedBooking.date)} at {selectedBooking.time}</p>
          <p class="text-sm">Service: 
            {#if selectedBooking.serviceName}
              {selectedBooking.serviceName}
            {:else if selectedBooking.serviceId}
              Service #{selectedBooking.serviceId}
            {:else}
              Unknown service
            {/if}
          </p>
          {#if selectedBooking.location}
            <p class="text-sm">Location: {selectedBooking.location}</p>
          {/if}
          {#if selectedBooking.additionalDetails}
            <p class="text-sm mt-2">Client message: {selectedBooking.additionalDetails}</p>
          {/if}
        </div>
      {/if}
      
      <div class="mb-6">
        <label for="additionalDetails" class="block text-sm font-medium text-gray-700 mb-1">Message to Client</label>
        <textarea 
          id="additionalDetails" 
          bind:value={additionalDetails}
          rows="3" 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary resize-none"
          placeholder="Add any additional details or message for the client..."
        ></textarea>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          type="button"
          on:click={closeAcceptForm}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          on:click={acceptBooking}
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Accept Booking
        </button>
      </div>
    </div>
  </div>
{/if}
