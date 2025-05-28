import { browser } from '$app/environment';

export async function load({ fetch, url, depends }) {
  depends('bookings');
  
  // Get service ID from URL if present
  const serviceId = url.searchParams.get('service');
  
  // Initialize data
  let services = [];
  let selectedService = null;
  let error = null;
  
  try {
    // Fetch services from the API directly - no need for proxy
    try {
      const servicesResponse = await fetch('http://localhost:3000/api/services');
      
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        services = servicesData.services ? servicesData.services.filter(service => service.isActive) : [];
      } else {
        throw new Error(`Failed to load services: ${servicesResponse.status}`);
      }
    } catch (err) {
      console.error('Error loading services data:', err);
      error = `Failed to load services: ${err.message}`;
      
      // Provide fallback services for development
      services = [];
    }
    
    // If a service ID was provided in the URL, find it in the services list
    if (serviceId && services.length > 0) {
      selectedService = services.find(service => service.id.toString() === serviceId);
    }
    
  } catch (err) {
    console.error('Error loading booking data:', err);
    error = err.message || 'Failed to load necessary data for booking';
  }
  
  return {
    services,
    selectedService,
    error
  };
}
