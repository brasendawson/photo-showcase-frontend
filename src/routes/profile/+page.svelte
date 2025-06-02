<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import toast from 'svelte-5-french-toast';
  import { writable } from 'svelte/store';

  // Create local user store
  const user = writable(null);
  
  // Page state
  let bookings = [];
  let profilePicture = null;
  let isLoading = true;
  let error = null;
  let message = null;
  let uploadStatus = 'idle';
  let selectedFile = null;
  let isEditingBooking = false;
  let editingBooking = null;
  let editLocation = '';
  let editDetails = '';

  // Add state for logout confirmation modal
  let showLogoutConfirmation = false;

  // Check if user is authenticated
  onMount(() => {
    // Check for token to determine authentication status
    const token = localStorage.getItem('token');
    if (!token) {
      goto('/login?redirect=/profile');
      return;
    }
    
    // Try to parse user info from token
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      user.set({
        id: tokenData.userId,
        username: tokenData.username,
        role: tokenData.role,
        email: tokenData.email
      });
    } catch (e) {
      console.error('Invalid token format', e);
    }
    
    fetchBookings();
    fetchProfilePicture();
  });

  // Fetch user's bookings
  async function fetchBookings() {
    isLoading = true;
    error = null;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('https://photo-showcase-api.vercel.app/api/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      bookings = data.bookings || [];
    } catch (err) {
      console.error('Error fetching bookings:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  // Fetch user's profile picture
  async function fetchProfilePicture() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      const response = await fetch('https://photo-showcase-api.vercel.app/api/profile/picture', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.profilePicture) {
          profilePicture = data.profilePicture;
        }
      }
    } catch (err) {
      console.error('Error fetching profile picture:', err);
    }
  }

  // Handle file selection
  function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      error = 'Please select an image file';
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error = 'File size must be less than 5MB';
      return;
    }
    
    selectedFile = file;
    uploadProfilePicture();
  }

  // Upload profile picture
  async function uploadProfilePicture() {
    if (!selectedFile) {
      return;
    }
    
    uploadStatus = 'uploading';
    error = null;
    message = null;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);
      
      const response = await fetch('https://photo-showcase-api.vercel.app/api/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload profile picture');
      }
      
      uploadStatus = 'success';
      message = data.message || 'Profile picture uploaded successfully';
      toast.success(message);
      
      // Update profile picture
      if (data.profilePicture) {
        profilePicture = data.profilePicture;
      }
      
      // Clear selected file
      selectedFile = null;
      
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      error = err.message;
      toast.error(error);
      uploadStatus = 'error';
    }
  }

  // Delete profile picture
  async function deleteProfilePicture() {
    uploadStatus = 'uploading';
    error = null;
    message = null;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('https://photo-showcase-api.vercel.app/api/profile/picture', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove profile picture');
      }
      
      uploadStatus = 'idle';
      message = data.message || 'Profile picture removed';
      toast.success(message);
      
      // Update profile picture
      profilePicture = data.profilePicture || null;
      
    } catch (err) {
      console.error('Error removing profile picture:', err);
      error = err.message;
      toast.error(error);
      uploadStatus = 'error';
    }
  }

  // Start editing a booking
  function startEditBooking(booking) {
    editingBooking = booking;
    editLocation = booking.location;
    editDetails = booking.additionalDetails || '';
    isEditingBooking = true;
  }

  // Cancel editing
  function cancelEditBooking() {
    editingBooking = null;
    editLocation = '';
    editDetails = '';
    isEditingBooking = false;
  }

  // Save booking changes
  async function saveBookingChanges() {
    if (!editingBooking) return;
    
    error = null;
    message = null;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`https://photo-showcase-api.vercel.app/api/bookings/my-bookings/${editingBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: editLocation,
          additionalDetails: editDetails
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking');
      }
      
      message = 'Booking updated successfully';
      toast.success(message);
      
      // Update the booking in the list
      bookings = bookings.map(booking => 
        booking.id === editingBooking.id ? { ...booking, location: editLocation, additionalDetails: editDetails } : booking
      );
      
      // Reset editing state
      cancelEditBooking();
      
    } catch (err) {
      console.error('Error updating booking:', err);
      error = err.message;
      toast.error(error);
    }
  }

  // Cancel a booking
  async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    error = null;
    message = null;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`https://photo-showcase-api.vercel.app/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }
      
      message = data.message || 'Booking cancelled successfully';
      toast.success(message);
      
      // Remove cancelled booking from the list
      bookings = bookings.filter(booking => booking.id !== bookingId);
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      error = err.message;
      toast.error(error);
    }
  }

  // Format date for display
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Function to show logout confirmation
  function showLogoutModal() {
    showLogoutConfirmation = true;
  }
  
  // Function to handle logout
  function handleLogout() {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    showLogoutConfirmation = false;
    setTimeout(() => goto('/'), 1500);
  }
  
  // Function to cancel logout
  function cancelLogout() {
    showLogoutConfirmation = false;
  }
</script>

<svelte:head>
  <title>My Profile | Capture Moments Photography</title>
  <meta name="description" content="View and manage your bookings and profile information">
</svelte:head>

<section class="pt-32 pb-20 bg-bg-light min-h-screen">
  <div class="max-w-6xl mx-auto px-4">
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Profile Header -->
      <div class="p-8 flex flex-col md:flex-row items-center border-b border-gray-200">
        <div class="md:mr-8 mb-6 md:mb-0">
          <div class="relative">
            {#if profilePicture}
              <img src={profilePicture} alt="Profile" class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
            {:else}
              <div class="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                {$user?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            {/if}
            
            <div class="absolute bottom-0 right-0">
              <label for="profile-picture" class="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <input type="file" id="profile-picture" class="hidden" accept="image/*" on:change={handleFileSelect} />
            </div>
          </div>
          
          {#if profilePicture}
            <button 
              class="mt-4 text-sm text-red-500 hover:text-red-700 transition-colors"
              on:click={deleteProfilePicture}
              disabled={uploadStatus === 'uploading'}
            >
              Remove Photo
            </button>
          {/if}
        </div>
        
        <div class="flex-grow">
          <h1 class="text-3xl font-bold text-gray-800">{$user?.username || 'User'}</h1>
          <p class="text-gray-600 mt-1">{$user?.email || 'No email available'}</p>
          <div class="mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold text-white capitalize bg-primary">
            {$user?.role || 'client'}
          </div>
        </div>
        
        <!-- Logout button -->
        <div class="mt-4 md:mt-0">
          <button 
            class="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors flex items-center"
            on:click={showLogoutModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
      
      <!-- Booking Management -->
      <div class="p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">My Bookings</h2>
          <a href="/book" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors">
            Book New Session
          </a>
        </div>
        
        {#if isLoading}
          <div class="flex justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        {:else if error}
          <div class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        {:else if bookings.length === 0}
          <div class="bg-gray-50 rounded-lg py-16 text-center">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
            <p class="text-gray-500 mb-6">You haven't made any bookings with us yet.</p>
            <a href="/book" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors">
              Book Your First Session
            </a>
          </div>
        {:else}
          <!-- Bookings List -->
          <div class="space-y-6">
            {#each bookings as booking}
              <div class="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <div class="p-6">
                  <div class="flex flex-wrap justify-between items-start mb-4">
                    <div>
                      <h3 class="text-xl font-bold text-gray-800">{booking.sessionType}</h3>
                      <p class="text-gray-500 mt-1">Booked on {formatDate(booking.createdAt)}</p>
                    </div>
                    <div class={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                      booking.status === 'pending' ? 'bg-yellow-500' : 
                      booking.status === 'confirmed' ? 'bg-green-500' : 
                      booking.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span class="block text-sm font-medium text-gray-500">Date & Time</span>
                      <span class="block text-gray-800">{formatDate(booking.date)} at {booking.time}</span>
                    </div>
                    <div>
                      <span class="block text-sm font-medium text-gray-500">Location</span>
                      <span class="block text-gray-800">{booking.location}</span>
                    </div>
                    <div>
                      <span class="block text-sm font-medium text-gray-500">Contact</span>
                      <span class="block text-gray-800">{booking.fullName} • {booking.email}</span>
                    </div>
                  </div>
                  
                  {#if booking.additionalDetails}
                    <div class="mb-4">
                      <span class="block text-sm font-medium text-gray-500">Additional Details</span>
                      <p class="text-gray-800 mt-1">{booking.additionalDetails}</p>
                    </div>
                  {/if}
                  
                  {#if booking.status === 'pending'}
                    <div class="flex space-x-3 mt-4">
                      <button 
                        class="px-4 py-2 bg-transparent border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        on:click={() => startEditBooking(booking)}
                      >
                        Edit Details
                      </button>
                      <button 
                        class="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                        on:click={() => cancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<!-- Edit Booking Modal -->
{#if isEditingBooking}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Edit Booking Details</h3>
      
      <div class="space-y-4">
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input 
            type="text" 
            id="location" 
            bind:value={editLocation} 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="additionalDetails" class="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
          <textarea 
            id="additionalDetails" 
            bind:value={editDetails} 
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary resize-none"
          ></textarea>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end space-x-3">
        <button 
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          on:click={cancelEditBooking}
        >
          Cancel
        </button>
        <button 
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          on:click={saveBookingChanges}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Logout Confirmation Modal -->
{#if showLogoutConfirmation}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Confirm Logout</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
      
      <div class="flex justify-end space-x-3">
        <button 
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          on:click={cancelLogout}
        >
          Cancel
        </button>
        <button 
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          on:click={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  </div>
{/if}
