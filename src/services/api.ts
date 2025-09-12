// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Broker API functions
export const brokerAPI = {
  // Get brokers with pagination and filters
  getBrokers: async (page: number, limit: number, approvedByAdmin?: boolean) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(approvedByAdmin !== undefined && { approvedByAdmin: approvedByAdmin.toString() })
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

  // Reject a broker
  rejectBroker: async (brokerId: string) => {
    console.log('🔴 brokerAPI.rejectBroker called with ID:', brokerId);
    
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
      throw new Error('Failed to reject broker');
    }
    
      const result = await response.json();
      console.log('🔴 API Response:', result);
      console.log('🔴 API Response data:', result.data);
      console.log('🔴 Updated broker:', result.data);
      return result;
  }
};

// Region API functions
export const regionAPI = {
  // Get all regions
  getRegions: async () => {
    console.log('🟢 regionAPI.getRegions called');
    
    const token = localStorage.getItem('adminToken');
    console.log('🟢 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/regions`;
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
  createRegion: async (name: string, description: string) => {
    console.log('🔵 regionAPI.createRegion called with:', { name, description });
    
    const token = localStorage.getItem('adminToken');
    console.log('🔵 Token found:', token ? 'Yes' : 'No');
    
    if (!token) throw new Error('No authentication token found');

    const url = `${API_BASE_URL}/regions`;
    const requestBody = { name, description };
    
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
  }
};