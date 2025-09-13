'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { regionAPI, brokerAPI } from '@/services/api';
import Popup from 'reactjs-popup';
import ReactPaginate from 'react-paginate';

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
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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

  // Format date to "9 July 2025" format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
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

  // Pagination logic for regions
  const getPaginatedRegions = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return regions.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(regions.length / itemsPerPage);

  // Skeleton loader component for region table rows
  const RegionSkeletonRow = () => (
    <tr className="bg-white border-b border-gray-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-36"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </td>
    </tr>
  );

  // Skeleton loader component for broker table rows
  const BrokerSkeletonRow = () => (
    <tr className="bg-white border-b border-gray-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="ml-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-36"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </td>
    </tr>
  );


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
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {showForm ? 'Cancel' : 'Add Region'}
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
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Create Region
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
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
        <div className="shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REGION NAME</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESCRIPTION</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CREATED DATE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {loading ? (
                  <>
                    <RegionSkeletonRow />
                    <RegionSkeletonRow />
                    <RegionSkeletonRow />
                    <RegionSkeletonRow />
                    <RegionSkeletonRow />
                  </>
                ) : !Array.isArray(regions) || regions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No regions found. Create your first region above.
                    </td>
                  </tr>
                ) : (
                  getPaginatedRegions().map((region, index) => (
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
                          {formatDate(region.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // TODO: Implement edit functionality
                              console.log('Edit region:', region._id);
                            }}
                            className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                            title="Edit Region"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Implement delete functionality
                              console.log('Delete region:', region._id);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            title="Delete Region"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && regions.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, regions.length)} of {regions.length} results
              </span>
            </div>
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              onPageChange={({ selected }) => setCurrentPage(selected + 1)}
              forcePage={currentPage - 1}
              previousLabel="Previous"
              nextLabel="Next"
              breakLabel="..."
              containerClassName="flex items-center space-x-1"
              pageClassName="px-3 py-2 text-sm font-medium rounded-md cursor-pointer text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              activeClassName="bg-primary text-white border-primary"
              previousClassName="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              nextClassName="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              breakClassName="px-3 py-2 text-sm font-medium text-gray-500"
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
        )}

      
      </div>
    </Layout>
  );
}
