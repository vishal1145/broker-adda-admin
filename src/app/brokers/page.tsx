'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { brokerAPI } from '@/services/api';
import Select from 'react-select';
import ReactPaginate from 'react-paginate';

interface Broker {
  _id: string;
  userId: string;
  firmName: string;
  region: Array<{
    _id: string;
    name: string;
    description: string;
    state: string;
    city: string;
    centerLocation: string;
    radius: number;
  }>;
  regionId: string | null;
  status: string;
  approvedByAdmin: string;
  kycDocs: {
    aadhar: string;
    pan: string;
    gst: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Optional fields that might be populated
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  accreditedBy?: string;
  licenseNumber?: string;
  expertiseField?: string;
  state?: string;
  brokerImage?: string;
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBrokers, setTotalBrokers] = useState(0);

  // Fetch brokers from API
  const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔄 Fetching brokers with statusFilter:', statusFilter);
      const approvedByAdmin = statusFilter === 'approved' ? true : statusFilter === 'pending' ? false : undefined;
      const response = await brokerAPI.getBrokers(currentPage, 10, approvedByAdmin);
      
      console.log('📊 API Response:', response); // Debug log
      console.log('📊 Brokers data:', response.data.brokers);
      
      // Debug each broker's approvedByAdmin value
      if (response.data.brokers) {
        response.data.brokers.forEach((broker: Broker, index: number) => {
          console.log(`📊 Broker ${index + 1}:`, {
            _id: broker._id,
            name: broker.name,
            approvedByAdmin: broker.approvedByAdmin,
            type: typeof broker.approvedByAdmin
          });
        });
      }
      
      setBrokers(response.data.brokers || []);
      setTotalPages(response.data.pagination.totalPages || 1);
      setTotalBrokers(response.data.pagination.totalBrokers || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brokers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  // Handle broker approval
  const handleApprove = async (brokerId: string) => {
    try {
      setError('');
      console.log('🟢 Approving broker with ID:', brokerId);
      const response = await brokerAPI.approveBroker(brokerId);
      console.log('🟢 Approve API response:', response);
      
      // Update local state immediately
      setBrokers(prevBrokers => 
        prevBrokers.map(broker => 
          broker._id === brokerId 
            ? { ...broker, approvedByAdmin: 'approved' }
            : broker
        )
      );
      
      // Also refresh from API to get any other updates
      await fetchBrokers();
    } catch (err) {
      console.error('🟢 Approve error:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve broker');
    }
  };

  // Handle broker rejection
  const handleReject = async (brokerId: string) => {
    try {
      setError('');
      console.log('🔴 Rejecting broker with ID:', brokerId);
      const response = await brokerAPI.rejectBroker(brokerId);
      console.log('🔴 Reject API response:', response);
      
      // Update local state immediately
      setBrokers(prevBrokers => 
        prevBrokers.map(broker => 
          broker._id === brokerId 
            ? { ...broker, approvedByAdmin: 'rejected' }
            : broker
        )
      );
      
      // Also refresh from API to get any other updates
      await fetchBrokers();
    } catch (err) {
      console.error('🔴 Reject error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject broker');
    }
  };

  // Filter brokers based on search term and filters
  const filteredBrokers = brokers.filter(broker => {
    // Search term filter
    const matchesSearch = (broker.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (broker.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (broker.phone || '').includes(searchTerm) ||
      broker.firmName.toLowerCase().includes(searchTerm.toLowerCase());

    // Membership filter (hardcoded for now - all show as Premium)
    const matchesMembership = membershipFilter === 'all' || membershipFilter === 'premium';

    // Region filter
    const matchesRegion = regionFilter === 'all' || 
      (broker.region && broker.region.length > 0 && 
       broker.region[0].name.toLowerCase().includes(regionFilter.toLowerCase()));

    return matchesSearch && matchesMembership && matchesRegion;
  });


  // Fetch brokers when component mounts or filters change
  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, membershipFilter, regionFilter]);

  // Helper functions





  // Use image URL with proxy for external URLs to avoid CORS issues
  const getBrokerImageUrl = (brokerImage: string | undefined) => {
    console.log('🖼️ getBrokerImageUrl called with:', brokerImage);
    
    if (!brokerImage) {
      console.log('🖼️ No broker image, using fallback');
      return "https://www.w3schools.com/howto/img_avatar.png";
    }
    
    // If it's an external URL (not localhost), use the proxy
    if (brokerImage.includes('broker-adda-be.algofolks.com') || 
        brokerImage.includes('https://') || 
        (brokerImage.includes('http://') && !brokerImage.includes('localhost'))) {
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(brokerImage)}`;
      console.log('🖼️ Using proxy URL:', proxyUrl);
      return proxyUrl;
    }
    
    // For localhost URLs, return directly
    console.log('🖼️ Using direct URL:', brokerImage);
    return brokerImage;
  };

  // Skeleton loader component for broker cards
  const BrokerSkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className=" space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
          <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
          <p className="text-gray-600 mt-1">View and manage all registered brokers</p>
            </div>
         
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by Firm Name, Contact, Region"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <div className="w-40">
                <Select
                  options={[
                    { value: 'all', label: 'All Brokers' },
                    { value: 'pending', label: 'Pending Approval' },
                    { value: 'approved', label: 'Approved' }
                  ]}
                  value={{ value: statusFilter, label: statusFilter === 'all' ? 'All Brokers' : statusFilter === 'pending' ? 'Pending Approval' : 'Approved' }}
                  onChange={(option) => setStatusFilter(option?.value || 'all')}
                  placeholder="Select Status"
                  isSearchable={false}
                  isClearable={false}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '40px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                      '&:hover': {
                        border: '1px solid #9ca3af'
                      }
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      fontSize: '14px',
                      padding: '8px 12px'
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: '#374151',
                      fontSize: '14px'
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#9ca3af',
                      fontSize: '14px'
                    })
                  }}
                />
              </div>
            </div>

            {/* Membership Filter */}
            <div className="flex items-center space-x-2">
              <div className="w-40">
                <Select
                  options={[
                    { value: 'all', label: 'All Memberships' },
                    { value: 'premium', label: 'Premium' },
                    { value: 'basic', label: 'Basic' },
                    { value: 'gold', label: 'Gold' }
                  ]}
                  value={{ value: membershipFilter, label: membershipFilter === 'all' ? 'All Memberships' : membershipFilter === 'premium' ? 'Premium' : membershipFilter === 'basic' ? 'Basic' : 'Gold' }}
                  onChange={(option) => setMembershipFilter(option?.value || 'all')}
                  placeholder="Select Membership"
                  isSearchable={false}
                  isClearable={false}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '40px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                      '&:hover': {
                        border: '1px solid #9ca3af'
                      }
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      fontSize: '14px',
                      padding: '8px 12px'
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: '#374151',
                      fontSize: '14px'
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#9ca3af',
                      fontSize: '14px'
                    })
                  }}
                />
              </div>
            </div>

            {/* Region Filter */}
            <div className="flex items-center space-x-2">
              <div className="w-40">
                <Select
                  options={[
                    { value: 'all', label: 'All Regions' },
                    { value: 'mumbai', label: 'Mumbai' },
                    { value: 'delhi', label: 'Delhi' },
                    { value: 'bangalore', label: 'Bangalore' },
                    { value: 'hyderabad', label: 'Hyderabad' },
                    { value: 'pune', label: 'Pune' }
                  ]}
                  value={{ value: regionFilter, label: regionFilter === 'all' ? 'All Regions' : regionFilter.charAt(0).toUpperCase() + regionFilter.slice(1) }}
                  onChange={(option) => setRegionFilter(option?.value || 'all')}
                  placeholder="Select Region"
                  isSearchable={false}
                  isClearable={false}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '40px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                      '&:hover': {
                        border: '1px solid #9ca3af'
                      }
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      fontSize: '14px',
                      padding: '8px 12px'
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: '#374151',
                      fontSize: '14px'
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#9ca3af',
                      fontSize: '14px'
                    })
                  }}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setMembershipFilter('all');
                  setRegionFilter('all');
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Brokers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {loading ? (
                  <>
              <BrokerSkeletonCard />
              <BrokerSkeletonCard />
              <BrokerSkeletonCard />
              <BrokerSkeletonCard />
              <BrokerSkeletonCard />
              <BrokerSkeletonCard />
                  </>
                ) : filteredBrokers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brokers found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
                ) : (
                  filteredBrokers.map((broker) => (
              <div key={broker._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                {/* Card Header with Image and Basic Info */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <Link href={`/brokers/${broker._id}`} className="cursor-pointer">
                        <img
                          className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover hover:opacity-80 transition-opacity duration-200"
                          src={getBrokerImageUrl(broker.brokerImage)}
                          alt={broker.name || 'Broker'}
                          onError={(e) => {
                            console.log('🖼️ Image failed to load:', broker.brokerImage);
                            e.currentTarget.src = "https://www.w3schools.com/howto/img_avatar.png";
                          }}
                        />
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/brokers/${broker._id}`}
                        className="text-base sm:text-lg font-semibold text-gray-900 hover:text-primary transition-colors duration-200 cursor-pointer block truncate"
                      >
                        {broker.name || 'N/A'}
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{broker.firmName || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Contact Information and Location */}
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                    {/* Email */}
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{broker.email || 'N/A'}</span>
                      {broker.email && (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Phone */}
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="truncate">{broker.phone || 'N/A'}</span>
                      {broker.phone && (
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="truncate">
                        <span className="font-medium">{broker.region && broker.region.length > 0 ? broker.region[0].name : 'N/A'}</span>
                        {broker.region && broker.region.length > 0 && (
                          <span className="text-gray-500 ml-1">
                            - {broker.region[0].city}, {broker.region[0].state}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats and Membership */}
                  <div className="mt-3 sm:mt-4 flex items-center justify-between">
                    <div className="flex space-x-3 sm:space-x-4">
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">{Math.floor(Math.random() * 50) + 10}</div>
                        <div className="text-xs text-gray-500">Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">{Math.floor(Math.random() * 20) + 5}</div>
                        <div className="text-xs text-gray-500">Properties</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Premium
                    </span>
                  </div>
                        </div>

                {/* Card Footer with Actions */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      {(() => {
                        console.log('🔍 Broker ID:', broker._id, 'approvedByAdmin:', broker.approvedByAdmin, 'Type:', typeof broker.approvedByAdmin);
                        if (broker.approvedByAdmin === 'approved') {
                          return (
                            <span className="inline-flex items-center px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 bg-green-600"></div>
                              Approved
                            </span>
                          );
                        } else if (broker.approvedByAdmin === 'rejected') {
                          return (
                            <span className="inline-flex items-center px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 bg-red-600"></div>
                              Rejected
                            </span>
                          );
                        } else {
                          return (
                            <div className="flex space-x-1.5 sm:space-x-2">
                              <button 
                                onClick={() => handleApprove(broker._id)}
                                className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(broker._id)}
                                className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          );
                        }
                      })()}
                    </div>
                    <Link 
                      href={`/brokers/${broker._id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalBrokers > 0 && (
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalBrokers)} of {totalBrokers} results
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