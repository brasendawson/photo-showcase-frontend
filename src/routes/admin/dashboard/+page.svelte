<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import toast from 'svelte-5-french-toast';
  import { writable } from 'svelte/store';

  // User store for authentication - defined at top level
  const user = writable(null);
  // Create a local variable to hold user data for use in template
  let userData = null;
  
  // Subscribe to the user store at top level to avoid the error
  $: if ($user) {
    userData = $user;
  }
  
  // State management - add about to the active tabs
  let activeTab = 'bookings';
  let isLoading = {
    bookings: true,
    services: true,
    photos: true,
    about: true,
    users: true
  };
  
  // Data stores
  let bookings = [];
  let services = [];
  let photos = [];
  // Update photographers to empty array - we'll fetch from API
  let photographers = [];
  
  // Add users data store
  let users = [];
  
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
  
  // Add about content data
  let aboutContent = null;
  let socialMedia = [];
  let contactInfo = null;
  
  // Add form data for about page editing
  let aboutForm = {
    id: null,
    title: '',
    content: '',
    isActive: true
  };
  
  let contactForm = {
    id: null,
    email: '',
    phone: '',
    address: '',
    businessHours: '',
    isActive: true
  };
  
  let socialMediaForm = {
    id: null,
    platform: '',
    url: '',
    icon: '',
    isActive: true
  };
  
  // Add form data for role update
  let roleUpdateForm = {
    username: '',
    newRole: 'photographer'
  };
  
  // UI state
  let showPhotoForm = false;
  let showServiceForm = false;
  let showAssignForm = false;
  let showAboutForm = false; // Added missing variable
  let showContactForm = false; // Added missing variable
  let showSocialMediaForm = false; // Added missing variable
  let showDeletePhotoModal = false;
  let showDeleteServiceModal = false; // New state for delete service modal
  let selectedBooking = null;
  let selectedPhotographer = null;
  let photoToDelete = null; // New state to track which photo to delete
  let serviceToDelete = null; // New state to track which service to delete
  let socialMediaToDelete = null;
  let showDeleteSocialMediaModal = false;
  let statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];
  let photoTypes = ['portrait', 'wedding', 'event', 'commercial', 'landscape', 'family', 'other'];
  let showRoleUpdateForm = false;
  let selectedUser = null;
  let availableRoles = ['client', 'photographer', 'admin'];
  
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
        
        // Set user data in the store
        user.set({
          id: tokenData.userId,
          username: tokenData.username,
          role: tokenData.role,
          email: tokenData.email
        });
        
        // Load data including photographers - changed order to fetch photographers first
        try {
          await fetchServices();
        } catch (e) {
          console.error('Error loading services:', e);
        }
        
        try {
          await fetchPhotographers();
        } catch (e) {
          console.error('Error loading photographers:', e);
        }
        
        try {
          await fetchBookings();
        } catch (e) {
          console.error('Error loading bookings:', e);
        }
        
        try {
          await fetchPhotos();
        } catch (e) {
          console.error('Error loading photos:', e);
        }
        
        // Add this function to reprocess bookings after photographers are loaded
        processBookingsWithPhotographers();
        
        // Load about page data
        try {
          await fetchAboutData();
        } catch (e) {
          console.error('Error loading about data:', e);
        }
        
        // Load users data
        try {
          await fetchAllUsers();
        } catch (e) {
          console.error('Error loading users:', e);
        }
        
      } catch (e) {
        console.error('Error parsing token or loading data', e);
        toast.error('Authentication error');
        goto('/login?redirect=/admin');
      }
    }
  });

  // New function to reprocess bookings after photographers are loaded
  function processBookingsWithPhotographers() {
    // Skip if no photographers or bookings
    if (!photographers.length || !bookings.length) return;
    
    // Reprocess all bookings to update assigned photographers
    bookings = bookings.map(booking => {
      if (booking.photographerId) {
        const photographer = photographers.find(p => p.id === booking.photographerId);
        if (photographer) {
          booking.assignedPhotographer = photographer;
          console.log(`Assigned photographer ${photographer.name} to booking ${booking.id}`);
        } else {
          console.warn(`Photographer with ID ${booking.photographerId} not found for booking ${booking.id}`);
        }
      }
      return booking;
    });
  }
  
  // Fetch all bookings - Modified to correctly handle photographer assignment
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
      
      // Process bookings to ensure service info and photographer info is properly displayed
      bookings = bookings.map(booking => {
        // Look up service name if we have a serviceId but no service name
        if (booking.serviceId && services.length > 0) {
          const service = services.find(s => s.id === booking.serviceId);
          if (service) {
            booking.serviceName = service.name;
          }
        }
        
        // Look up photographer if we have photographerId but no assignedPhotographer
        if (booking.photographerId && !booking.assignedPhotographer && photographers.length > 0) {
          const photographer = photographers.find(p => p.id === booking.photographerId);
          if (photographer) {
            booking.assignedPhotographer = photographer;
          }
        }
        
        return booking;
      });
      
      console.log('Processed bookings:', bookings);
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
  
  // Create or update photo - modified to handle potential server errors
  async function savePhoto() {
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!photoForm.id;
      
      // Validate required fields
      if (!photoForm.title || !photoForm.imageUrl || !photoForm.photographerName) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Validate image URL format
      try {
        new URL(photoForm.imageUrl);
      } catch (e) {
        toast.error('Please enter a valid image URL');
        return;
      }
      
      // Prepare the request data, filtering out any null/undefined values
      const photoData = Object.fromEntries(
        Object.entries(photoForm).filter(([_, value]) => value !== null && value !== undefined)
      );
      
      console.log('Sending photo data:', photoData);
      
      const response = await fetch(
        isEditing ? `http://localhost:3000/api/photos/${photoForm.id}` : 'http://localhost:3000/api/photos', 
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(photoData)
        }
      );
      
      // Handle different response status codes
      if (response.status === 500) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Server error. The photo could not be saved.');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} photo`);
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
      toast.error(error.message || 'An unexpected error occurred');
    }
  }
  
  // Update the delete photo function to use the modal instead of confirm
  function confirmDeletePhoto(photo) {
    photoToDelete = photo;
    showDeletePhotoModal = true;
  }
  
  // Execute the actual deletion after confirmation in modal
  async function deletePhoto(id) {
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
      
      // Close the modal
      showDeletePhotoModal = false;
      photoToDelete = null;
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error(error.message);
    }
  }
  
  // Cancel the delete operation
  function cancelDeletePhoto() {
    showDeletePhotoModal = false;
    photoToDelete = null;
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
  
  // Update to handle service deletion via modal instead of confirm
  function confirmDeleteService(service) {
    serviceToDelete = service;
    showDeleteServiceModal = true;
  }
  
  // Original delete service function modified to work with the modal
  async function deleteService(id) {
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
      
      // Close the modal
      showDeleteServiceModal = false;
      serviceToDelete = null;
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.message);
    }
  }
  
  // Assign photographer to booking - modified to use the correct API endpoint
  async function assignPhotographer() {
    if (!selectedBooking || !selectedPhotographer) {
      toast.error('Please select a photographer');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const photographer = photographers.find(p => p.id === parseInt(selectedPhotographer));
      
      if (!photographer) {
        throw new Error('Selected photographer not found');
      }
      
      // Make the actual API call to assign the photographer
      const response = await fetch(`http://localhost:3000/api/bookings/${selectedBooking.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photographerId: photographer.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign photographer');
      }
      
      const data = await response.json();
      
      // Update the local bookings array with the updated booking
      bookings = bookings.map(b => {
        if (b.id === selectedBooking.id) {
          return { 
            ...b, 
            assignedPhotographer: photographer,
            photographerId: photographer.id,
            photographerName: photographer.name
          };
        }
        return b;
      });
      
      toast.success(`${photographer.name} assigned successfully`);
      
      // Close the modal and reset selection
      showAssignForm = false;
      selectedBooking = null;
      selectedPhotographer = null;
      
      // Optionally refresh the bookings to ensure data consistency
      await fetchBookings();
      
    } catch (error) {
      console.error('Error assigning photographer:', error);
      toast.error(error.message || 'Failed to assign photographer');
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
  
  // Helper functions for About page
  function editAboutContent() {
    aboutForm = { ...aboutContent };
    showAboutForm = true;
  }
  
  function editContactInfo() {
    contactForm = { ...contactInfo };
    showContactForm = true;
  }
  
  function editSocialMedia(social) {
    socialMediaForm = { ...social };
    showSocialMediaForm = true;
  }
  
  function addSocialMedia() {
    resetSocialMediaForm();
    showSocialMediaForm = true;
  }
  
  function confirmDeleteSocialMedia(social) {
    socialMediaToDelete = social;
    showDeleteSocialMediaModal = true;
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
  
  function resetSocialMediaForm() {
    socialMediaForm = {
      id: null,
      platform: '',
      url: '',
      icon: '',
      isActive: true
    };
  }
  
  function resetAboutForm() {
    aboutForm = {
      id: null,
      title: '',
      content: '',
      isActive: true
    };
    showAboutForm = false;
  }
  
  function resetContactForm() {
    contactForm = {
      id: null,
      email: '',
      phone: '',
      address: '',
      businessHours: '',
      isActive: true
    };
    showContactForm = false;
  }
  
  // Fetch about data
  async function fetchAboutData() {
    isLoading.about = true;
    try {
      // Use the complete endpoint to get all data
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/about/complete', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        aboutContent = data.about;
        socialMedia = data.socialMedia || [];
        contactInfo = data.contact;
        console.log('Loaded about data:', data);
      } else {
        // If complete endpoint fails, try individual endpoints
        await Promise.all([
          fetchAboutContent(),
          fetchSocialMedia(),
          fetchContactInfo()
        ]);
      }
    } catch (err) {
      console.error('Error fetching about data:', err);
      toast.error('Failed to load about page data');
      
      // Try individual endpoints as fallback
      try {
        await Promise.all([
          fetchAboutContent(),
          fetchSocialMedia(),
          fetchContactInfo()
        ]);
      } catch (e) {
        console.error('All about data fetches failed');
      }
    } finally {
      isLoading.about = false;
    }
  }
  
  // Individual fetch functions for about data
  async function fetchAboutContent() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/about', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      aboutContent = await response.json();
    }
  }
  
  async function fetchSocialMedia() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/about/social', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        socialMedia = data.socialMedia || [];
      }
    }
  }
  
  async function fetchContactInfo() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/about/contact', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        contactInfo = data.contactInfo;
      }
    }
  }
  
  // Save about content
  async function saveAboutContent() {
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!aboutForm.id;
      
      const url = isEditing 
        ? `http://localhost:3000/api/about/${aboutForm.id}`
        : 'http://localhost:3000/api/about';
      
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: aboutForm.title,
          content: aboutForm.content,
          isActive: aboutForm.isActive
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} about content`);
      }
      
      const result = await response.json();
      
      if (result.success || result.aboutPage) {
        aboutContent = result.aboutPage || aboutForm;
        showAboutForm = false;
        toast.success(`About content ${isEditing ? 'updated' : 'created'} successfully`);
      }
    } catch (error) {
      console.error('Error saving about content:', error);
      toast.error(error.message);
    }
  }
  
  // Save contact info
  async function saveContactInfo() {
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!contactForm.id;
      
      const url = isEditing 
        ? `http://localhost:3000/api/about/contact/${contactForm.id}`
        : 'http://localhost:3000/api/about/contact';
      
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: contactForm.email,
          phone: contactForm.phone,
          address: contactForm.address,
          businessHours: contactForm.businessHours,
          makeActive: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} contact information`);
      }
      
      const result = await response.json();
      
      if (result.success || result.contactInfo) {
        contactInfo = result.contactInfo || contactForm;
        showContactForm = false;
        toast.success(`Contact information ${isEditing ? 'updated' : 'created'} successfully`);
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error(error.message);
    }
  }
  
  // Save social media
  async function saveSocialMedia() {
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!socialMediaForm.id;
      
      const url = isEditing 
        ? `http://localhost:3000/api/about/social/${socialMediaForm.id}`
        : 'http://localhost:3000/api/about/social';
      
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          platform: socialMediaForm.platform,
          url: socialMediaForm.url,
          icon: socialMediaForm.icon,
          isActive: socialMediaForm.isActive
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} social media link`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        if (isEditing) {
          socialMedia = socialMedia.map(item => 
            item.id === socialMediaForm.id ? result.socialMedia : item
          );
        } else {
          socialMedia = [...socialMedia, result.socialMedia];
        }
        
        showSocialMediaForm = false;
        toast.success(`Social media link ${isEditing ? 'updated' : 'added'} successfully`);
        resetSocialMediaForm();
      }
    } catch (error) {
      console.error('Error saving social media link:', error);
      toast.error(error.message);
    }
  }
  
  // Delete social media
  async function deleteSocialMedia(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/about/social/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete social media link');
      }
      
      const result = await response.json();
      
      if (result.success) {
        socialMedia = socialMedia.filter(item => item.id !== id);
        toast.success('Social media link deleted successfully');
        showDeleteSocialMediaModal = false;
        socialMediaToDelete = null;
      }
    } catch (error) {
      console.error('Error deleting social media:', error);
      toast.error(error.message);
    }
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
  
  // Fetch all users (admin only)
  async function fetchAllUsers() {
    isLoading.users = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      if (!data.success || !Array.isArray(data.users)) {
        throw new Error('Invalid API response format');
      }
      
      users = data.users;
      console.log('Loaded users:', users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      isLoading.users = false;
    }
  }
  
  // Update user role (admin only)
  async function updateUserRole() {
    try {
      const token = localStorage.getItem('token');
      
      if (!roleUpdateForm.username || !roleUpdateForm.newRole) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const response = await fetch('http://localhost:3000/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: roleUpdateForm.username,
          newRole: roleUpdateForm.newRole
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update the user in the local users array
        users = users.map(user => {
          if (user.username === roleUpdateForm.username) {
            return { ...user, role: roleUpdateForm.newRole };
          }
          return user;
        });
        
        showRoleUpdateForm = false;
        toast.success('User role updated successfully');
        resetRoleUpdateForm();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'An unexpected error occurred');
    }
  }
  
  // Reset role update form
  function resetRoleUpdateForm() {
    roleUpdateForm = {
      username: '',
      newRole: 'photographer'
    };
    selectedUser = null;
  }
  
  // Open role update form for a specific user
  function openRoleUpdateForm(userItem) {
    selectedUser = userItem;
    roleUpdateForm = {
      username: userItem.username,
      newRole: userItem.role
    };
    showRoleUpdateForm = true;
  }
  
  // Modify the function to get role badge class
  function getRoleBadgeClass(role) {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'photographer': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  // New function to fetch photographers from admin/users endpoint with error handling
  async function fetchPhotographers() {
    try {
      const token = localStorage.getItem('token');
      // Use the provided endpoint to get users
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Log the full response for debugging
      
      if (!data.users || !Array.isArray(data.users)) {
        console.error('Invalid API response format - users property missing or not an array');
        photographers = [];
        return;
      }
      
      // ONLY include users with photographer role
      photographers = data.users
        .filter(user => user.role === 'photographer')
        .map(user => ({
          id: user.id,
          name: user.username || user.name || `User #${user.id}`
        }));
        
      console.log('Loaded photographers:', photographers);
    } catch (error) {
      console.error('Error fetching photographers:', error);
      photographers = [];
      toast.error('Failed to load photographers');
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
      {#if userData}
        <div class="flex items-center">
          <span class="mr-2 text-text-muted">Welcome, {userData.username}</span>
          <span class="px-3 py-1 bg-primary text-white rounded-full text-sm">Admin</span>
        </div>
      {/if}
    </div>
    
    <!-- Dashboard Tabs - Add Users tab -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div class="flex border-b overflow-x-auto">
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
        <button 
          class={`px-6 py-3 text-lg font-medium ${activeTab === 'about' ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'}`}
          on:click={() => activeTab = 'about'}
        >
          About Page
        </button>
        <button 
          class={`px-6 py-3 text-lg font-medium ${activeTab === 'users' ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'}`}
          on:click={() => activeTab = 'users'}
        >
          Users
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
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Location</th>
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
                      <td class="py-3 px-4 text-sm">
                        {#if booking.location}
                          {booking.location}
                        {:else}
                          <span class="text-gray-400 italic">Not specified</span>
                        {/if}
                      </td>
                      <td class="py-3 px-4">
                        <span class={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-sm">
                        {#if booking.assignedPhotographer}
                          {booking.assignedPhotographer.name}
                        {:else if booking.photographerId}
                          <!-- If we have photographerId but couldn't find the matching photographer -->
                          <span class="text-amber-600">Photographer #{booking.photographerId}</span>
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
                        on:click={() => confirmDeleteService(service)}
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
                        on:click={() => confirmDeletePhoto(photo)}
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
      
      <!-- About Page Tab -->
      {#if activeTab === 'about'}
        <div class="p-6">
          <h2 class="text-2xl font-bold text-text-dark mb-6">Manage About Page</h2>
          
          {#if isLoading.about}
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          {:else}
            <!-- About Content Section -->
            <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8 border">
              <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">About Content</h3>
                  <p class="mt-1 max-w-2xl text-sm text-gray-500">Main information about your business</p>
                </div>
                <button 
                  on:click={editAboutContent} 
                  class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                  aria-label="Edit About Content"
                >
                  Edit Content
                </button>
              </div>
              
              {#if aboutContent}
                <div class="border-t border-gray-200">
                  <dl>
                    <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500">Title</dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{aboutContent.title}</dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500">Content</dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div class="prose prose-sm max-w-none">
                          {@html aboutContent.content}
                        </div>
                      </dd>
                    </div>
                    <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500">Status</dt>
                      <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2">
                        <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${aboutContent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {aboutContent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              {:else}
                <div class="border-t border-gray-200 px-4 py-5 sm:px-6 text-center text-gray-500">
                  <p>No about content found. Click "Edit Content" to add information.</p>
                </div>
              {/if}
            </div>
            
            <!-- Contact Information Section -->
            <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8 border">
              <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Contact Information</h3>
                  <p class="mt-1 max-w-2xl text-sm text-gray-500">How customers can reach you</p>
                </div>
                <button 
                  on:click={editContactInfo} 
                  class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                  aria-label="Edit Contact Information"
                >
                  Edit Contact
                </button>
              </div>
              
              {#if contactInfo}
                <div class="border-t border-gray-200">
                  <dl>
                    <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500">Email</dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contactInfo.email}</dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500">Phone</dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contactInfo.phone}</dd>
                    </div>
                    {#if contactInfo.address}
                      <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Address</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contactInfo.address}</dd>
                      </div>
                    {/if}
                    {#if contactInfo.businessHours}
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Business Hours</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contactInfo.businessHours}</dd>
                      </div>
                    {/if}
                  </dl>
                </div>
              {:else}
                <div class="border-t border-gray-200 px-4 py-5 sm:px-6 text-center text-gray-500">
                  <p>No contact information found. Click "Edit Contact" to add information.</p>
                </div>
              {/if}
            </div>
            
            <!-- Social Media Section -->
            <div class="bg-white shadow overflow-hidden sm:rounded-lg border">
              <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Social Media Links</h3>
                  <p class="mt-1 max-w-2xl text-sm text-gray-500">Your social media presence</p>
                </div>
                <button 
                  on:click={addSocialMedia} 
                  class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                  aria-label="Add Social Media Link"
                >
                  Add Social Link
                </button>
              </div>
              
              {#if socialMedia && socialMedia.length > 0}
                <div class="border-t border-gray-200">
                  <ul class="divide-y divide-gray-200">
                    {#each socialMedia as social}
                      <li class="px-4 py-4 sm:px-6">
                        <div class="flex justify-between items-center">
                          <div class="flex items-center">
                            <i class="fab fa-{social.icon.toLowerCase()} text-2xl text-primary mr-3"></i>
                            <div>
                              <h4 class="text-lg font-medium">{social.platform}</h4>
                              <a href={social.url} target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline">{social.url}</a>
                              <div class="mt-1">
                                <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${social.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {social.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="flex space-x-2">
                            <button 
                              on:click={() => editSocialMedia(social)} 
                              class="text-primary hover:text-primary-dark"
                              aria-label={`Edit ${social.platform} social media link`}
                            >
                              <i class="fas fa-edit"></i>
                              <span class="sr-only">Edit</span>
                            </button>
                            <button 
                              on:click={() => confirmDeleteSocialMedia(social)} 
                              class="text-red-600 hover:text-red-800"
                              aria-label={`Delete ${social.platform} social media link`}
                            >
                              <i class="fas fa-trash"></i>
                              <span class="sr-only">Delete</span>
                            </button>
                          </div>
                        </div>
                      </li>
                    {/each}
                  </ul>
                </div>
              {:else}
                <div class="border-t border-gray-200 px-4 py-5 sm:px-6 text-center text-gray-500">
                  <p>No social media links found. Add some using the button above.</p>
                </div>
              {/if}
            </div>
            
            <div class="mt-8 flex justify-end">
              <button 
                on:click={fetchAboutData} 
                class="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                aria-label="Refresh About Page Data"
              >
                Refresh Data
              </button>
            </div>
          {/if}
        </div>
      {/if}
      
      <!-- Users Tab -->
      {#if activeTab === 'users'}
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-text-dark">Manage Users</h2>
            <button 
              on:click={fetchAllUsers}
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            >
              <i class="fas fa-sync-alt mr-2"></i> Refresh
            </button>
          </div>
          
          {#if isLoading.users}
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          {:else if users.length === 0}
            <div class="bg-gray-50 py-8 px-6 rounded-lg text-center">
              <p class="text-text-muted text-lg">No users found</p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white">
                <thead>
                  <tr class="bg-gray-100 border-b">
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">ID</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Username</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Email</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Role</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each users as userItem}
                    <tr class="border-b hover:bg-gray-50">
                      <td class="py-3 px-4 text-sm">{userItem.id}</td>
                      <td class="py-3 px-4 font-medium text-text-dark">{userItem.username}</td>
                      <td class="py-3 px-4 text-sm text-text-muted">{userItem.email}</td>
                      <td class="py-3 px-4">
                        <span class={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(userItem.role)}`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td class="py-3 px-4">
                        <button 
                          on:click={() => openRoleUpdateForm(userItem)}
                          class="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs font-medium"
                          disabled={userItem.role === 'admin' && userData?.username === userItem.username}
                          title={userItem.role === 'admin' && userData?.username === userItem.username ? "You can't change your own admin role" : "Change role"}
                        >
                          Change Role
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
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
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
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL <span class="text-red-500">*</span></label>
          <input 
            type="url" 
            id="imageUrl" 
            bind:value={photoForm.imageUrl} 
            required
            placeholder="https://example.com/your-image.jpg"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
          <p class="text-xs text-gray-500 mt-1">Enter a direct URL to an image (must start with http:// or https://)</p>
        </div>
        
        <div>
          <label for="photographerName" class="block text-sm font-medium text-gray-700 mb-1">Photographer Name <span class="text-red-500">*</span></label>
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
            min="0"
            step="0.01"
            required
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
          <p class="text-sm">Service: 
            {#if selectedBooking.serviceName}
              {selectedBooking.serviceName}
            {:else if selectedBooking.serviceType}
              {selectedBooking.serviceType}
            {:else if selectedBooking.sessionType}
              {selectedBooking.sessionType}
            {:else if selectedBooking.service && selectedBooking.service.name}
              {selectedBooking.service.name}
            {:else if selectedBooking.serviceId}
              Service #{selectedBooking.serviceId}
            {:else}
              Unknown service
            {/if}
          </p>
        </div>
      {/if}
      
      <div class="mb-6">
        <label for="photographer" class="block text-sm font-medium text-gray-700 mb-1">Select Photographer</label>
        <select 
          id="photographer" 
          bind:value={selectedPhotographer} 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white"
        >
          <option value={null} disabled selected>-- Select a photographer --</option>
          {#each photographers as photographer}
            <option value={photographer.id}>{photographer.name}</option>
          {/each}
        </select>
        {#if photographers.length === 0}
          <p class="text-xs text-red-600 mt-1">Failed to load photographers. Please try again.</p>
        {/if}
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

<!-- Delete Photo Confirmation Modal -->
{#if showDeletePhotoModal && photoToDelete}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
      
      <div class="mb-6">
        <p class="mb-4">Are you sure you want to delete this photo?</p>
        
        <div class="bg-gray-50 p-4 rounded-md mb-4">
          <div class="flex items-center space-x-4">
            <img 
              src={photoToDelete.imageUrl} 
              alt={photoToDelete.title} 
              class="w-20 h-20 object-cover rounded-md"
            />
            <div>
              <h4 class="font-medium text-gray-900">{photoToDelete.title}</h4>
              <p class="text-sm text-gray-500">By {photoToDelete.photographerName}</p>
            </div>
          </div>
        </div>
        
        <p class="text-sm text-red-600">This action cannot be undone.</p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          type="button"
          on:click={cancelDeletePhoto}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          on:click={() => deletePhoto(photoToDelete.id)}
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Delete Photo
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Service Confirmation Modal -->
{#if showDeleteServiceModal && serviceToDelete}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Confirm Delete Service</h3>
      
      <div class="mb-6">
        <p class="mb-4">Are you sure you want to delete this service?</p>
        
        <div class="bg-gray-50 p-4 rounded-md mb-4">
          <div class="space-y-2">
            <h4 class="font-medium text-gray-900 text-lg">{serviceToDelete.name}</h4>
            <p class="text-primary font-bold">{formatCurrency(serviceToDelete.price)}</p>
            <p class="text-gray-500 text-sm">{serviceToDelete.description}</p>
            <p class="text-gray-500 italic text-sm">Duration: {serviceToDelete.duration}</p>
          </div>
        </div>
        
        <p class="text-sm text-red-600">This action cannot be undone. All associated bookings will remain but will no longer be linked to this service.</p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          type="button"
          on:click={cancelDeleteService}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          on:click={() => deleteService(serviceToDelete.id)}
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Delete Service
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- About Content Modal -->
{#if showAboutForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">
        {aboutForm.id ? 'Edit About Content' : 'Add About Content'}
      </h3>
      
      <form on:submit|preventDefault={saveAboutContent} class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            type="text" 
            id="title" 
            bind:value={aboutForm.title} 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content (HTML allowed)</label>
          <textarea 
            id="content" 
            bind:value={aboutForm.content}
            rows="15" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">You can use HTML tags to format your content (headings, paragraphs, lists, etc.)</p>
        </div>
        
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="isActive" 
            bind:checked={aboutForm.isActive}
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="isActive" class="ml-2 block text-sm text-gray-700">Content is active</label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            on:click={resetAboutForm}
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            {aboutForm.id ? 'Update' : 'Save'} Content
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Contact Information Modal -->
{#if showContactForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">
        {contactForm.id ? 'Edit Contact Information' : 'Add Contact Information'}
      </h3>
      
      <form on:submit|preventDefault={saveContactInfo} class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            bind:value={contactForm.email} 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input 
            type="text" 
            id="phone" 
            bind:value={contactForm.phone} 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea 
            id="address" 
            bind:value={contactForm.address}
            rows="2" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary resize-none"
          ></textarea>
        </div>
        
        <div>
          <label for="businessHours" class="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
          <textarea 
            id="businessHours" 
            bind:value={contactForm.businessHours}
            rows="2" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary resize-none"
            placeholder="e.g. Monday-Friday: 9am-5pm, Weekends: 10am-2pm"
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            on:click={resetContactForm}
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            {contactForm.id ? 'Update' : 'Save'} Contact Info
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Social Media Modal -->
{#if showSocialMediaForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">
        {socialMediaForm.id ? 'Edit Social Media Link' : 'Add Social Media Link'}
      </h3>
      
      <form on:submit|preventDefault={saveSocialMedia} class="space-y-4">
        <div>
          <label for="platform" class="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <input 
            type="text" 
            id="platform" 
            bind:value={socialMediaForm.platform} 
            required
            placeholder="Facebook, Instagram, Twitter, etc."
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="url" class="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input 
            type="url" 
            id="url" 
            bind:value={socialMediaForm.url} 
            required
            placeholder="https://example.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label for="icon" class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
          <input 
            type="text" 
            id="icon" 
            bind:value={socialMediaForm.icon}
            required
            placeholder="facebook, twitter, instagram, etc."
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
          <p class="text-xs text-gray-500 mt-1">Use the platform name in lowercase for FontAwesome icons</p>
        </div>
        
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="social-isActive" 
            bind:checked={socialMediaForm.isActive}
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="social-isActive" class="ml-2 block text-sm text-gray-700">Active</label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            on:click={() => showSocialMediaForm = false}
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            {socialMediaForm.id ? 'Update' : 'Add'} Link
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Delete Social Media Confirmation Modal -->
{#if showDeleteSocialMediaModal && socialMediaToDelete}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
      
      <div class="mb-6">
        <p class="mb-4">Are you sure you want to delete this social media link?</p>
        
        <div class="bg-gray-50 p-4 rounded-md mb-4">
          <div class="flex items-center space-x-4">
            <i class="fab fa-{socialMediaToDelete.icon.toLowerCase()} text-3xl text-primary"></i>
            <div>
              <h4 class="font-medium text-gray-900">{socialMediaToDelete.platform}</h4>
              <a href={socialMediaToDelete.url} target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline">{socialMediaToDelete.url}</a>
            </div>
          </div>
        </div>
        
        <p class="text-sm text-red-600">This action cannot be undone.</p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          type="button"
          on:click={() => { showDeleteSocialMediaModal = false; socialMediaToDelete = null; }}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          on:click={() => deleteSocialMedia(socialMediaToDelete.id)}
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Delete Link
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Role Update Modal -->
{#if showRoleUpdateForm && selectedUser}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">
        Update User Role
      </h3>
      
      <div class="mb-4 p-3 bg-gray-50 rounded-md">
        <p class="text-sm text-gray-500">User:</p>
        <p class="font-medium">{selectedUser.username}</p>
        <p class="text-sm text-gray-500">{selectedUser.email}</p>
        <p class="text-sm mt-1">
          Current Role: 
          <span class={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(selectedUser.role)}`}>
            {selectedUser.role}
          </span>
        </p>
      </div>
      
      <form on:submit|preventDefault={updateUserRole} class="space-y-4">
        <div>
          <label for="newRole" class="block text-sm font-medium text-gray-700 mb-1">New Role</label>
          <select 
            id="newRole" 
            bind:value={roleUpdateForm.newRole} 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white"
          >
            {#each availableRoles as role}
              <option value={role}>{role}</option>
            {/each}
          </select>
          {#if roleUpdateForm.newRole === 'admin'}
            <p class="text-xs text-amber-600 mt-1">Warning: Admins have full access to all dashboard features.</p>
          {/if}
        </div>
        
        <div class="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            on:click={() => { showRoleUpdateForm = false; resetRoleUpdateForm(); }}
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            disabled={roleUpdateForm.newRole === selectedUser.role}
          >
            Update Role
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
