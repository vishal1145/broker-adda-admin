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
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/brokers/${brokerId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    if (!response.ok) throw new Error('Failed to approve broker');
    return response.json();
  },

  // Reject a broker
  rejectBroker: async (brokerId: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/brokers/${brokerId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    if (!response.ok) throw new Error('Failed to reject broker');
    return response.json();
  }
};
