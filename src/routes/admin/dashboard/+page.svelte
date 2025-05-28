<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import toast from 'svelte-5-french-toast';
  import { writable } from 'svelte/store';

  // User store for authentication
  const user = writable(null);
  
  // State management
  let activeTab = 'bookings';
  let isLoading = {
    bookings: true,
    services: true,
    photos: true
  };
  
  // Data stores
  let bookings = [];
  let services = [];
  let photos = [];
  let photographers = [];
  
  // Form data for new/edit items
  let photoForm = {
    id: null,
    title: '',
    description: '',
    imageUrl: '',
    photographerName: '',
    type: 'portrait',
    featured: false
  };
  
  let serviceForm = {
    id: null,
    name: '',
    description: '',
    price: '',
    duration: '',
    isActive: true
  };
  
  // UI state
  let showPhotoForm = false;
  let showServiceForm = false;
  let showAssignForm = false;
  let selectedBooking = null;
  let selectedPhotographer = null;
  let statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];
  let photoTypes = ['portrait', 'wedding', 'event', 'commercial', 'landscape', 'family'];
  
  // Check admin access and load data
  onMount(async () => {
    if (browser) {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access admin dashboard');
        goto('/login?redirect=/admin');
        return;
      }
      
      // Verify admin role
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData.role !== 'admin') {
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
        
        // First load services and photographers, then load bookings
        await Promise.all([
          fetchServices(),
          fetchPhotographers(),
          fetchPhotos()
        ]);
        
        // Load bookings after services are loaded
        await fetchBookings();
      } catch (e) {
        console.error('Error parsing token or loading data', e);
        toast.error('Authentication error');
        goto('/login?redirect=/admin');
      }
    }
  });

  // Fetch all bookings
  async function fetchBookings() {
    isLoading.bookings = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/bookings/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      bookings = data.bookings || [];
      
      // Process bookings to ensure service info is properly displayed
      bookings = bookings.map(booking => {
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
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      isLoading.bookings = false;
    }
  }
  
  // Fetch all services
  async function fetchServices() {
    isLoading.services = true;
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
    } finally {
      isLoading.services = false;
    }
  }
  
  // Fetch all photos
  async function fetchPhotos() {
    isLoading.photos = true;
    try {
      const response = await fetch('http://localhost:3000/api/photos/gallery');
      
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      
      const data = await response.json();
      photos = data.photos || [];
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      isLoading.photos = false;
    }
  }
  
  // Fetch photographers for assignment
  async function fetchPhotographers() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/photographers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch photographers');
      }
      
      const data = await response.json();
      photographers = data.photographers || [];
    } catch (error) {
      console.error('Error fetching photographers:', error);
      toast.error('Failed to load photographers');
    }
  }
  
  // Create or update photo
  async function savePhoto() {
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!photoForm.id;
      
      const response = await fetch(
        isEditing ? `http://localhost:3000/api/photos/${photoForm.id}` : 'http://localhost:3000/api/photos', 
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(photoForm)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} photo`);
      }
      
      const data = await response.json();
      
      if (isEditing) {
        photos = photos.map(p => p.id === photoForm.id ? data.photo : p);
        toast.success('Photo updated successfully');
      } else {
        photos = [...photos, data.photo];
        toast.success('Photo added successfully');
      }
      
      resetPhotoForm();
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error(error.message);
    }
  }
  
  // Delete photo
  async function deletePhoto(id) {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/photos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }
      
      photos = photos.filter(p => p.id !== id);
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error(error.message);
    }
  }
  
  // Create or update service
  async function saveService() {
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!serviceForm.id;
      
      const response = await fetch(
        isEditing ? `http://localhost:3000/api/services/${serviceForm.id}` : 'http://localhost:3000/api/services', 
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(serviceForm)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} service`);
      }
      
      const data = await response.json();
      
      if (isEditing) {
        services = services.map(s => s.id === serviceForm.id ? data.service : s);
        toast.success('Service updated successfully');
      } else {
        services = [...services, data.service];
        toast.success('Service added successfully');
      }
      
      resetServiceForm();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.message);
    }
  }
  
  // Delete service
  async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete service');
      }
      
      services = services.filter(s => s.id !== id);
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.message);
    }
  }
  
  // Assign photographer to booking
  async function assignPhotographer() {
    if (!selectedBooking || !selectedPhotographer) {
      toast.error('Please select both a booking and a photographer');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/bookings/${selectedBooking.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ photographerId: selectedPhotographer })
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign photographer');
      }
      
      const data = await response.json();
      
      // Update booking in list
      bookings = bookings.map(b => b.id === selectedBooking.id ? data.booking : b);
      toast.success('Photographer assigned successfully');
      
      showAssignForm = false;
      selectedBooking = null;
      selectedPhotographer = null;
    } catch (error) {
      console.error('Error assigning photographer:', error);
      toast.error(error.message);
    }
  }
  
  // Update booking status
  async function updateBookingStatus(booking, newStatus) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      
      // Update booking in list
      bookings = bookings.map(b => {
        if (b.id === booking.id) {
          return { ...b, status: newStatus };
        }
        return b;
      });
      
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error(error.message);
    }
  }
  
  // Open photo form for editing
  function editPhoto(photo) {
    photoForm = { ...photo };
    showPhotoForm = true;
  }
  
  // Open service form for editing
  function editService(service) {
    serviceForm = { ...service };
    showServiceForm = true;
  }
  
  // Open assignment form
  function openAssignForm(booking) {
    selectedBooking = booking;
    showAssignForm = true;
  }
  
  // Reset photo form
  function resetPhotoForm() {
    photoForm = {
      id: null,
      title: '',
      description: '',
      imageUrl: '',
      photographerName: '',
      type: 'portrait',
      featured: false
    };
    showPhotoForm = false;
  }
  
  // Reset service form
  function resetServiceForm() {
    serviceForm = {
      id: null,
      name: '',
      description: '',
      price: '',
      duration: '',
      isActive: true
    };
    showServiceForm = false;
  }
  
  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Format currency
  function formatCurrency(amount) {
    if (!amount) return 'GH₵0.00';
    return `GH₵${parseFloat(amount).toFixed(2)}`;
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
  <title>Admin Dashboard | Capture Moments Photography</title>
  <meta name="description" content="Admin dashboard for managing photos, services, and bookings">
</svelte:head>

<section class="pt-32 pb-20 bg-bg-light min-h-screen">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-text-dark">Admin Dashboard</h1>
      {#if $user}
        <div class="flex items-center">
          <span class="mr-2 text-text-muted">Welcome, {$user.username}</span>
          <span class="px-3 py-1 bg-primary text-white rounded-full text-sm">Admin</span>
        </div>
      {/if}
    </div>
    
    <!-- Dashboard Tabs -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div class="flex border-b">
        <button 
          class={`px-6 py-3 text-lg font-medium ${activeTab === 'bookings' ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'}`}
          on:click={() => activeTab = 'bookings'}
        >
          Bookings
        </button>
        <button 
          class={`px-6 py-3 text-lg font-medium ${activeTab === 'services' ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'}`}
          on:click={() => activeTab = 'services'}
        >
          Services
        </button>
        <button 
          class={`px-6 py-3 text-lg font-medium ${activeTab === 'photos' ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'}`}
          on:click={() => activeTab = 'photos'}
        >
          Gallery Photos
        </button>
      </div>
      
      <!-- Bookings Tab -->
      {#if activeTab === 'bookings'}
        <div class="p-6">
          <h2 class="text-2xl font-bold text-text-dark mb-4">Manage Bookings</h2>
          
          {#if isLoading.bookings}
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          {:else if bookings.length === 0}
            <div class="bg-gray-50 py-8 px-6 rounded-lg text-center">
              <p class="text-text-muted text-lg">No bookings found</p>
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
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Status</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Photographer</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each bookings as booking}
                    <tr class="border-b hover:bg-gray-50">
                      <td class="py-3 px-4 text-sm">{booking.id}</td>
                      <td class="py-3 px-4">
                        <div class="font-medium text-text-dark">{booking.fullName}</div>
                        <div class="text-sm text-text-muted">{booking.email}</div>
                      </td>
                      <td class="py-3 px-4 text-sm">
                        <!-- Fix service type display - check all possible property names -->
                        {#if booking.serviceName}
                          {booking.serviceName}
                        {:else if booking.serviceType}
                          {booking.serviceType}
                        {:else if booking.sessionType}
                          {booking.sessionType}
                        {:else if booking.service && booking.service.name}
                          {booking.service.name}
                        {:else if booking.serviceId}
                          <!-- If we have serviceId but no name, show serviceId -->
                          Service #{booking.serviceId}
                        {:else}
                          <span class="text-yellow-600">No service specified</span>
                        {/if}
                      </td>
                      <td class="py-3 px-4 text-sm">
                        <div>{formatDate(booking.date)}</div>
                        <div class="text-text-muted">{booking.time}</div>
                      </td>
                      <td class="py-3 px-4">
                        <span class={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-sm">
                        {#if booking.assignedPhotographer}
                          {booking.assignedPhotographer.name}
                        {:else}
                          <span class="text-text-muted">Not assigned</span>
                        {/if}
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex space-x-2">
                          <button 
                            on:click={() => openAssignForm(booking)}
                            class="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs font-medium"
                          >
                            Assign
                          </button>
                          <div class="relative group">
                            <button 
                              class="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 text-xs font-medium"
                            >
                              Status
                            </button>
                            <div class="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-md overflow-hidden z-10 hidden group-hover:block">
                              {#each statusOptions as status}
                                <button 
                                  on:click={() => updateBookingStatus(booking, status)}
                                  class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  {status}
                                </button>
                              {/each}
                            </div>
                          </div>
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
      
      <!-- Services Tab -->
      {#if activeTab === 'services'}
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-text-dark">Manage Services</h2>
            <button 
              on:click={() => showServiceForm = true}
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Add New Service
            </button>
          </div>
          
          {#if isLoading.services}
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          {:else if services.length === 0}
            <div class="bg-gray-50 py-8 px-6 rounded-lg text-center">
              <p class="text-text-muted text-lg">No services found</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each services as service}
                <div class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div class="p-6">
                    <h3 class="text-xl font-bold text-text-dark mb-2">{service.name}</h3>
                    <p class="text-3xl font-bold text-primary mb-1">{formatCurrency(service.price)}</p>
                    <p class="text-text-light italic mb-4">{service.duration}</p>
                    <p class="text-text-muted mb-6">{service.description}</p>
                    
                    <div class="flex justify-between">
                      <button 
                        on:click={() => editService(service)}
                        class="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button 
                        on:click={() => deleteService(service.id)}
                        class="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
      
      <!-- Photos Tab -->
      {#if activeTab === 'photos'}
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-text-dark">Manage Gallery Photos</h2>
            <button 
              on:click={() => showPhotoForm = true}
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Add New Photo
            </button>
          </div>
          
          {#if isLoading.photos}
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          {:else if photos.length === 0}
            <div class="bg-gray-50 py-8 px-6 rounded-lg text-center">
              <p class="text-text-muted text-lg">No photos found</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each photos as photo}
                <div class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img src={photo.imageUrl} alt={photo.title} class="w-full h-48 object-cover">
                  <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="text-lg font-bold text-text-dark">{photo.title}</h3>
                      {#if photo.featured}
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs">Featured</span>
                      {/if}
                    </div>
                    <p class="text-text-muted text-sm mb-2">{photo.description}</p>
                    <p class="text-text-light text-sm mb-3">By {photo.photographerName}</p>
                    <div class="flex justify-between">
                      <button 
                        on:click={() => editPhoto(photo)}
                        class="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        on:click={() => deletePhoto(photo.id)}
                        class="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- Add/Edit Photo Modal -->
{#if showPhotoForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">
        {photoForm.id ? 'Edit Photo' : 'Add New Photo'}
      </h3>
      
      <form on:submit|preventDefault={savePhoto} class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            type="text" 
            id="title" 
            bind:value={photoForm.title} 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            id="description" 
            bind:value={photoForm.description}
            rows="3" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary resize-none"
          ></textarea>
        </div>
        
        <div>
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input 
            type="url" 
            id="imageUrl" 
            bind:value={photoForm.imageUrl} 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="photographerName" class="block text-sm font-medium text-gray-700 mb-1">Photographer Name</label>
          <input 
            type="text" 
            id="photographerName" 
            bind:value={photoForm.photographerName} 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Photo Type</label>
          <select 
            id="type" 
            bind:value={photoForm.type} 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white"
          >
            {#each photoTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>
        
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="featured" 
            bind:checked={photoForm.featured} 
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="featured" class="ml-2 block text-sm text-gray-700">Featured in gallery</label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-2">
          <button 
            type="button"
            on:click={resetPhotoForm}
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            {photoForm.id ? 'Update' : 'Add'} Photo
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Add/Edit Service Modal -->
{#if showServiceForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">
        {serviceForm.id ? 'Edit Service' : 'Add New Service'}
      </h3>
      
      <form on:submit|preventDefault={saveService} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
          <input 
            type="text" 
            id="name" 
            bind:value={serviceForm.name} 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            id="description" 
            bind:value={serviceForm.description}
            rows="3" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary resize-none"
          ></textarea>
        </div>
        
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input 
            type="number" 
            id="price" 
            bind:value={serviceForm.price} 
            required
            min="0"
            step="0.01"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <input 
            type="text" 
            id="duration" 
            bind:value={serviceForm.duration} 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="e.g. 2-3 hours"
          />
        </div>

        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="isActive" 
            bind:checked={serviceForm.isActive} 
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="isActive" class="ml-2 block text-sm text-gray-700">Service is active</label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-2">
          <button 
            type="button"
            on:click={resetServiceForm}
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            {serviceForm.id ? 'Update' : 'Add'} Service
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Assign Photographer Modal -->
{#if showAssignForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Assign Photographer</h3>
      
      {#if selectedBooking}
        <div class="mb-4 p-3 bg-gray-50 rounded-md">
          <p class="text-sm text-gray-500">Booking for:</p>
          <p class="font-medium">{selectedBooking.fullName}</p>
          <p class="text-sm">{formatDate(selectedBooking.date)} at {selectedBooking.time}</p>
          <p class="text-sm">Service: {selectedBooking.sessionType}</p>
        </div>
      {/if}
      
      <label for="photographer" class="block text-sm font-medium text-gray-700 mb-1">Select Photographer</label>
      <div class="mb-6">
        <select 
          id="photographer" 
          bind:value={selectedPhotographer} 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white"
        >
          <option value={null} disabled>Select a photographer</option>
          {#each photographers as photographer}
            <option value={photographer.id}>{photographer.name}</option>
          {/each}
        </select>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          type="button"
          on:click={() => { showAssignForm = false; selectedBooking = null; selectedPhotographer = null; }}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          on:click={assignPhotographer}
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          disabled={!selectedPhotographer}
        >
          Assign
        </button>
      </div>
    </div>
  </div>
{/if}
