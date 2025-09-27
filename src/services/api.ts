// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Broker API functions
export const brokerAPI = {
  // Get brokers with pagination and filters
  getBrokers: async (page: number, limit: number, approvedByAdmin?: string, search?: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(approvedByAdmin && { approvedByAdmin: approvedByAdmin }),
      ...(search && { search: search })
    });

    const response = await fetch(`${API_BASE_URL}/brokers?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch brokers');
    return response.json();
  },

  // Get single broker by ID
  getBrokerById: async (brokerId: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/brokers/${brokerId}`, {
    // const response = await fetch(`${API_BASE_URL}/brokers/68c8f174b9f8967a7fae49eb`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`Failed to fetch broker details: ${response.status}`);
    }
    
    return response.json();
  },

  // Approve a broker
  approveBroker: async (brokerId: string) => {
    console.log('🟢 brokerAPI.approveBroker called with ID:', brokerId);
    
    const token = localStorage.getItem('adminToken');
    console.log('🟢 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/brokers/${brokerId}/approve`;
    console.log('🟢 Making API call to:', url);
    console.log('🟢 API_BASE_URL:', API_BASE_URL);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    console.log('🟢 Response status:', response.status);
    console.log('🟢 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to approve broker');
    }
    
    const result = await response.json();
    console.log('🟢 API Response:', result);
    console.log('🟢 API Response data:', result.data);
    console.log('🟢 Updated broker:', result.data);
    return result;
  },

  // Block a broker (using existing reject endpoint)
  blockBroker: async (brokerId: string) => {
    console.log('🔴 brokerAPI.blockBroker called with ID:', brokerId);
    
    const token = localStorage.getItem('adminToken');
    console.log('🔴 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/brokers/${brokerId}/reject`;
    console.log('🔴 Making API call to:', url);
    console.log('🔴 API_BASE_URL:', API_BASE_URL);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    console.log('🔴 Response status:', response.status);
    console.log('🔴 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to block broker');
    }
    
    const result = await response.json();
    console.log('🔴 API Response:', result);
    console.log('🔴 API Response data:', result.data);
    console.log('🔴 Updated broker:', result.data);
    return result;
  },

  // Unblock a broker (using existing approve endpoint)
  unblockBroker: async (brokerId: string) => {
    console.log('🟢 brokerAPI.unblockBroker called with ID:', brokerId);
    
    const token = localStorage.getItem('adminToken');
    console.log('🟢 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/brokers/${brokerId}/approve`;
    console.log('🟢 Making API call to:', url);
    console.log('🟢 API_BASE_URL:', API_BASE_URL);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    console.log('🟢 Response status:', response.status);
    console.log('🟢 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to unblock broker');
    }
    
    const result = await response.json();
    console.log('🟢 API Response:', result);
    console.log('🟢 API Response data:', result.data);
    console.log('🟢 Updated broker:', result.data);
    return result;
  },

  // Create a new broker by admin
  createBroker: async (name: string, email: string, phone: string) => {
    console.log('🔵 brokerAPI.createBroker called with:', { name, email, phone });
    
    const token = localStorage.getItem('adminToken');
    console.log('🔵 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/auth/admin/broker`;
    const requestBody = {
      adminCreate: true,
      name,
      email,
      phone
    };
    
    console.log('🔵 Making API call to:', url);
    console.log('🔵 Request body:', requestBody);
    console.log('🔵 Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🔵 Response status:', response.status);
    console.log('🔵 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      
      // Parse error response to provide more specific error messages
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      } catch {
        // If JSON parsing fails, use the raw error text
        throw new Error(errorText || 'Failed to create broker');
      }
      
      throw new Error('Failed to create broker');
    }
    
    const result = await response.json();
    console.log('🔵 API Response:', result);
    return result;
  }
};

// Region API functions
export const regionAPI = {
  // Get all regions with pagination and filters
  getRegions: async (page: number = 1, limit: number = 10, search: string = '', state: string = '', city: string = '') => {
    console.log('🟢 regionAPI.getRegions called with:', { page, limit, search, state, city });
    
    const token = localStorage.getItem('adminToken');
    console.log('🟢 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(state && { state }),
      ...(city && { city })
    });

    const url = `${API_BASE_URL}/regions?${params}`;
    console.log('🟢 Making API call to:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🟢 Response status:', response.status);
    console.log('🟢 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to fetch regions');
    }
    
    const result = await response.json();
    console.log('🟢 API Response:', result);
    return result;
  },

  // Create a new region
  createRegion: async (name: string, description: string, state: string, city: string, centerLocation: string, radius: number) => {
    console.log('🔵 regionAPI.createRegion called with:', { name, description, state, city, centerLocation, radius });
    
    const token = localStorage.getItem('adminToken');
    console.log('🔵 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/regions`;
    const requestBody = { name, description, state, city, centerLocation, radius };
    
    console.log('🔵 Making API call to:', url);
    console.log('🔵 Request body:', requestBody);
    console.log('🔵 Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🔵 Response status:', response.status);
    console.log('🔵 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to create region');
    }
    
    const result = await response.json();
    console.log('🔵 API Response:', result);
    return result;
  },

  // Get brokers by region
  getBrokersByRegion: async (regionId: string, page: number = 1, limit: number = 10) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      regionId: regionId
    });

    const response = await fetch(`${API_BASE_URL}/brokers/region/${regionId}?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch brokers by region');
    return response.json();
  },

  // Delete a region
  deleteRegion: async (regionId: string) => {
    console.log('🔴 regionAPI.deleteRegion called with ID:', regionId);
    
    const token = localStorage.getItem('adminToken');
    console.log('🔴 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/regions/${regionId}`;
    console.log('🔴 Making API call to:', url);
    console.log('🔴 API_BASE_URL:', API_BASE_URL);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🔴 Response status:', response.status);
    console.log('🔴 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to delete region');
    }
    
    const result = await response.json();
    console.log('🔴 API Response:', result);
    return result;
  },

  // Get single region by ID
  getRegionById: async (regionId: string) => {
    console.log('🔵 regionAPI.getRegionById called with ID:', regionId);
    
    const token = localStorage.getItem('adminToken');
    console.log('🔵 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/regions/${regionId}`;
    console.log('🔵 Making API call to:', url);
    console.log('🔵 API_BASE_URL:', API_BASE_URL);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🔵 Response status:', response.status);
    console.log('🔵 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to fetch region details');
    }
    
    const result = await response.json();
    console.log('🔵 API Response:', result);
    return result;
  },

  // Update a region
  updateRegion: async (regionId: string, name: string, description: string, state: string, city: string, centerLocation: string, radius: number) => {
    console.log('🟡 regionAPI.updateRegion called with:', { regionId, name, description, state, city, centerLocation, radius });
    
    const token = localStorage.getItem('adminToken');
    console.log('🟡 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/regions/${regionId}`;
    const requestBody = { name, description, state, city, centerLocation, radius };
    
    console.log('🟡 Making API call to:', url);
    console.log('🟡 Request body:', requestBody);
    console.log('🟡 Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🟡 Response status:', response.status);
    console.log('🟡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to update region');
    }
    
    const result = await response.json();
    console.log('🟡 API Response:', result);
    return result;
  },

  // Get region statistics
  getRegionStats: async () => {
    console.log('📊 regionAPI.getRegionStats called');
    
    const token = localStorage.getItem('adminToken');
    console.log('📊 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/regions/stats`;
    console.log('📊 Making API call to:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to fetch region statistics');
    }
    
    const result = await response.json();
    console.log('📊 API Response:', result);
    return result;
  }
};

// Properties API functions
export const propertiesAPI = {
  // Get all properties with pagination and filters
  getProperties: async (page: number = 1, limit: number = 10, search: string = '', propertyType: string = '', status: string = '', region: string = '') => {
    console.log('🏠 propertiesAPI.getProperties called with:', { page, limit, search, propertyType, status, region });
    
    const token = localStorage.getItem('adminToken');
    console.log('🏠 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(propertyType && propertyType !== 'all' && { propertyType }),
      ...(status && status !== 'all' && { status }),
      ...(region && region !== 'all' && { region })
    });

    const url = `${API_BASE_URL}/properties?${params}`;
    console.log('🏠 Making API call to:', url);
    console.log('🏠 Query parameters:', Object.fromEntries(params.entries()));
    console.log('🏠 Filter values:', { search, propertyType, status, region });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🏠 Response status:', response.status);
    console.log('🏠 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to fetch properties');
    }
    
    const result = await response.json();
    console.log('🏠 API Response:', result);
    return result;
  },

  // Get single property by ID
  getPropertyById: async (propertyId: string) => {
    console.log('🏠 propertiesAPI.getPropertyById called with ID:', propertyId);
    
    const token = localStorage.getItem('adminToken');
    console.log('🏠 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/properties/${propertyId}`;
    console.log('🏠 Making API call to:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🏠 Response status:', response.status);
    console.log('🏠 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to fetch property details');
    }
    
    const result = await response.json();
    console.log('🏠 API Response:', result);
    return result;
  },

  // Approve a property
  approveProperty: async (propertyId: string) => {
    console.log('🟢 propertiesAPI.approveProperty called with ID:', propertyId);
    
    const token = localStorage.getItem('adminToken');
    console.log('🟢 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/properties/${propertyId}/approve`;
    console.log('🟢 Making API call to:', url);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    console.log('🟢 Response status:', response.status);
    console.log('🟢 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to approve property');
    }
    
    const result = await response.json();
    console.log('🟢 API Response:', result);
    return result;
  },

  // Reject a property
  rejectProperty: async (propertyId: string) => {
    console.log('🔴 propertiesAPI.rejectProperty called with ID:', propertyId);
    
    const token = localStorage.getItem('adminToken');
    console.log('🔴 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/properties/${propertyId}/reject`;
    console.log('🔴 Making API call to:', url);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    console.log('🔴 Response status:', response.status);
    console.log('🔴 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to reject property');
    }
    
    const result = await response.json();
    console.log('🔴 API Response:', result);
    return result;
  },

  // Get property metrics/statistics
  getMetrics: async () => {
    console.log('📊 propertiesAPI.getMetrics called');
    
    const token = localStorage.getItem('adminToken');
    console.log('📊 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/properties/metrics`;
    console.log('📊 Making API call to:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      throw new Error('Failed to fetch property metrics');
    }
    
    const result = await response.json();
    console.log('📊 API Response:', result);
    return result;
  }
};