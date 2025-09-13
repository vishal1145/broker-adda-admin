'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { regionAPI, brokerAPI } from '@/services/api';
import Popup from 'reactjs-popup';

interface Region {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Broker {
  _id: string;
  userId: string;
  firmName: string;
  region: Array<{
    _id: string;
    name: string;
    description: string;
  }>;
  regionId: string | null;
  status: string;
  approvedByAdmin: boolean;
  kycDocs: {
    aadhar: string;
    pan: string;
    gst: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  accreditedBy?: string;
  licenseNumber?: string;
  expertiseField?: string;
  state?: string;
}

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [brokersLoading, setBrokersLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch regions from API
  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await regionAPI.getRegions();
      console.log('Regions API Response:', response); // Debug log
      
      // Handle the actual API response structure: response.data.regions
      if (response && response.data && response.data.regions && Array.isArray(response.data.regions)) {
        setRegions(response.data.regions);
      } else if (Array.isArray(response)) {
        setRegions(response);
      } else if (response.data && Array.isArray(response.data)) {
        setRegions(response.data);
      } else if (response.regions && Array.isArray(response.regions)) {
        setRegions(response.regions);
      } else {
        console.warn('Unexpected API response structure:', response);
        setRegions([]);
      }
    } catch (err) {
      console.error('Error fetching regions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch regions');
      setRegions([]); // Ensure regions is always an array
    } finally {
      setLoading(false);
    }
  };

  // Fetch brokers by region
  const fetchBrokersByRegion = async (regionId: string) => {
    try {
      setBrokersLoading(true);
      setError('');
      const response = await regionAPI.getBrokersByRegion(regionId);
      console.log('Brokers by region API Response:', response); // Debug log
      
      // Handle the actual API response structure: response.data.brokers
      if (response && response.data && response.data.brokers && Array.isArray(response.data.brokers)) {
        setBrokers(response.data.brokers);
      } else if (Array.isArray(response)) {
        setBrokers(response);
      } else if (response.data && Array.isArray(response.data)) {
        setBrokers(response.data);
      } else if (response.brokers && Array.isArray(response.brokers)) {
        setBrokers(response.brokers);
      } else {
        console.warn('Unexpected brokers API response structure:', response);
        setBrokers([]);
      }
    } catch (err) {
      console.error('Error fetching brokers by region:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch brokers');
      setBrokers([]); // Ensure brokers is always an array
    } finally {
      setBrokersLoading(false);
    }
  };

  // Handle region selection
  const handleRegionClick = (region: Region) => {
    setSelectedRegion(region);
    fetchBrokersByRegion(region._id);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData); // Debug log
    
    try {
      setError('');
      console.log('Calling regionAPI.createRegion...'); // Debug log
      const response = await regionAPI.createRegion(formData.name, formData.description);
      console.log('Create region API Response:', response); // Debug log
      
      setFormData({ name: '', description: '' });
      setShowForm(false);
      console.log('Refreshing regions list...'); // Debug log
      fetchRegions(); // Refresh the regions list
    } catch (err) {
      console.error('Error creating region:', err);
      setError(err instanceof Error ? err.message : 'Failed to create region');
    }
  };

  // Handle broker approval
  const handleApprove = async (brokerId: string) => {
    try {
      setError('');
      await brokerAPI.approveBroker(brokerId);
      if (selectedRegion) {
        fetchBrokersByRegion(selectedRegion._id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve broker');
    }
  };

  // Handle broker rejection
  const handleReject = async (brokerId: string) => {
    try {
      setError('');
      const response = await brokerAPI.rejectBroker(brokerId);
      console.log('🔴 Reject API response:', response);
      
      // Manually update the broker status in local state since API doesn't update it
      setBrokers(prevBrokers => 
        prevBrokers.map(broker => 
          broker._id === brokerId 
            ? { ...broker, status: 'inactive', approvedByAdmin: false }
            : broker
        )
      );
      
      // Also refresh from API to get any other updates
      if (selectedRegion) {
        fetchBrokersByRegion(selectedRegion._id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject broker');
    }
  };

  // Fetch regions when component mounts
  useEffect(() => {
    console.log('🚀 RegionsPage component mounted');
    console.log('🚀 Checking for admin token...');
    const token = localStorage.getItem('adminToken');
    console.log('🚀 Token exists:', token ? 'Yes' : 'No');
    if (token) {
      console.log('🚀 Token preview:', token.substring(0, 20) + '...');
    }
    fetchRegions();
  }, []);


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Helper functions for broker status
  const getStatusColor = (broker: Broker) => {
    if (broker.approvedByAdmin) return 'bg-green-100 text-green-800';
    if (broker.status === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (broker: Broker) => {
    if (broker.approvedByAdmin) return 'Approved';
    return 'Pending';
  };

  const getStatusBadgeColor = (broker: Broker) => {
    if (broker.approvedByAdmin) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  // Filter brokers by status
  const getFilteredBrokers = () => {
    if (statusFilter === 'all') return brokers;
    if (statusFilter === 'approved') return brokers.filter(broker => broker.approvedByAdmin);
    if (statusFilter === 'pending') return brokers.filter(broker => !broker.approvedByAdmin);
    return brokers;
  };

  return (
    <Layout>
      <div className=" space-y-6 ">
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Region Management</h1>
            <p className="text-gray-600 mt-1">Manage regions and view brokers by region</p>
          </div>
          
          {/* Add Region Button - Right side */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add New Region'}
          </button>
        </div>

        {/* Add Region Popup */}
        <Popup
          open={showForm}
          closeOnDocumentClick
          onClose={() => setShowForm(false)}
          modal
          overlayStyle={{
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999
          }}
          contentStyle={{
            background: 'white',
            borderRadius: '8px',
            padding: '0',
            border: 'none',
            maxWidth: '500px',
            width: '90%',
            margin: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Region</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter region name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter region description"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Region
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Popup>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Regions Table */}
        <div className=" shadow-sm rounded-lg border border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REGION NAME</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESCRIPTION</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CREATED DATE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPDATED DATE</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-gray-600">Loading regions...</span>
                      </div>
                    </td>
                  </tr>
                ) : !Array.isArray(regions) || regions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No regions found. Create your first region above.
                    </td>
                  </tr>
                ) : (
                  regions.map((region, index) => (
                    <tr 
                      key={region._id} 
                      className="bg-white hover:bg-gray-50 border-b border-gray-200 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{region.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{region.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(region.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(region.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Region Brokers Table */}
        {selectedRegion && (
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Brokers in {selectedRegion.name}
              </h2>
              <p className="text-gray-600">{selectedRegion.description}</p>
              
              {/* Status Filter */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Brokers</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Brokers Table - Simplified design */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COMPANY NAME</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CONTACT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {brokersLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2 text-gray-600">Loading brokers...</span>
                          </div>
                        </td>
                      </tr>
                    ) : !Array.isArray(brokers) || brokers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No brokers found in this region
                        </td>
                      </tr>
                    ) : getFilteredBrokers().length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No brokers found with the selected status filter
                        </td>
                      </tr>
                    ) : (
                      getFilteredBrokers().map((broker, index) => (
                        <tr key={broker._id} className="bg-white hover:bg-gray-50 border-b border-gray-200 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {getInitials(broker.name || broker.firmName || 'B')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {broker.name || 'N/A'} ({index + 1})
                                </div>
                                <div className="text-sm text-gray-500">{broker.email || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {broker.firmName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {broker.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(broker)}`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${broker.approvedByAdmin ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
                              {getStatusText(broker)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {broker.approvedByAdmin ? (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                                  <div className="w-2 h-2 rounded-full mr-2 bg-green-600"></div>
                                  Approved
                                </span>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleApprove(broker._id)}
                                    className="inline-flex items-center px-4 py-2 text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleReject(broker._id)}
                                    className="inline-flex items-center px-4 py-2 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
