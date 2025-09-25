'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { brokerAPI } from '@/services/api';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-hot-toast';

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
  approvedByAdmin: "unblocked" | "blocked";
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
  gender?: string;
  accreditedBy?: string;
  licenseNumber?: string;
  expertiseField?: string;
  state?: string;
  brokerImage?: string;
  membership?: "basic" | "standard" | "premium";
}

// Skeleton Loader Components
const Skeleton = ({ className = '', height = 'h-4', width = 'w-full', rounded = false }: { className?: string; height?: string; width?: string; rounded?: boolean }) => (
  <div 
    className={`bg-gray-200 animate-pulse ${height} ${width} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
  />
);

const BrokersTableSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-6 gap-4">
          <Skeleton height="h-4" width="w-16" />
          <Skeleton height="h-4" width="w-20" />
          <Skeleton height="h-4" width="w-16" />
          <Skeleton height="h-4" width="w-24" />
          <Skeleton height="h-4" width="w-20" />
          <Skeleton height="h-4" width="w-16" />
        </div>
      </div>

      {/* Table Body Skeleton */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-6 gap-4 items-center">
              {/* Name Column Skeleton */}
              <div className="flex items-center space-x-3">
                <Skeleton height="h-10" width="w-10" rounded />
                <div className="space-y-2">
                  <Skeleton height="h-4" width="w-24" />
                  <Skeleton height="h-3" width="w-32" />
                </div>
              </div>

              {/* Contact Column Skeleton */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton height="h-4" width="w-4" />
                  <Skeleton height="h-4" width="w-20" />
                  <Skeleton height="h-3" width="w-3" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton height="h-4" width="w-4" />
                  <Skeleton height="h-3" width="w-28" />
                  <Skeleton height="h-3" width="w-3" />
                </div>
              </div>

              {/* Region Column Skeleton */}
              <div className="space-y-2">
                <Skeleton height="h-4" width="w-20" />
                <Skeleton height="h-3" width="w-24" />
              </div>

              {/* Membership Column Skeleton */}
              <div>
                <Skeleton height="h-6" width="w-16" rounded />
              </div>

              {/* Numbers Column Skeleton */}
              <div className="space-y-1">
                <Skeleton height="h-4" width="w-16" />
                <Skeleton height="h-3" width="w-20" />
              </div>

              {/* Action Column Skeleton */}
              <div className="flex space-x-2">
                <Skeleton height="h-7" width="w-16" rounded />
                <Skeleton height="h-7" width="w-16" rounded />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SummaryCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton height="h-3" width="w-16" />
              <Skeleton height="h-6" width="w-8" />
            </div>
            <div className="bg-gray-100 rounded-lg p-2">
              <Skeleton height="h-5" width="w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

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
  const [brokerStats, setBrokerStats] = useState({
    total: 0,
    unblocked: 0,
    blocked: 0
  });
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);
  const [selectedBrokerName, setSelectedBrokerName] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBroker, setNewBroker] = useState({ name: '', email: '', phone: '' });

  // Fetch brokers from API
  const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔄 Fetching brokers with statusFilter:', statusFilter, 'searchTerm:', searchTerm);
      const approvedByAdmin = statusFilter === 'unblocked' ? 'unblocked' : statusFilter === 'blocked' ? 'blocked' : undefined;
      const response = await brokerAPI.getBrokers(currentPage, 10, approvedByAdmin, searchTerm);
      
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
      
      // Add sample membership data for testing if not present
      const brokersWithMembership = (response.data.brokers || []).map((broker: Broker, index: number) => ({
        ...broker,
        membership: broker.membership || (['basic', 'standard', 'premium'][index % 3] as 'basic' | 'standard' | 'premium')
      }));
      
      setBrokers(brokersWithMembership);
      setTotalPages(response.data.pagination.totalPages || 1);
      setTotalBrokers(response.data.pagination.totalBrokers || 0);
      
      // Update broker statistics from API response
      if (response.data.stats) {
        setBrokerStats({
          total: response.data.stats.totalAllBrokers || 0,
          unblocked: response.data.stats.totalUnblockedBrokers || 0,
          blocked: response.data.stats.totalBlockedBrokers || 0
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brokers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  // Handle broker blocking confirmation
  const handleBlockClick = (brokerId: string, brokerName: string) => {
    setSelectedBrokerId(brokerId);
    setSelectedBrokerName(brokerName);
    setShowBlockConfirm(true);
  };

  // Handle broker unblocking confirmation
  const handleUnblockClick = (brokerId: string, brokerName: string) => {
    setSelectedBrokerId(brokerId);
    setSelectedBrokerName(brokerName);
    setShowUnblockConfirm(true);
  };

  // Handle broker blocking
  const handleBlock = async () => {
    if (!selectedBrokerId) return;
    
    try {
      setError('');
      console.log('🔴 Blocking broker with ID:', selectedBrokerId);
      const response = await brokerAPI.blockBroker(selectedBrokerId);
      console.log('🔴 Block API response:', response);
      
      // Update local state immediately
      setBrokers(prevBrokers => 
        prevBrokers.map(broker => 
          broker._id === selectedBrokerId 
            ? { ...broker, approvedByAdmin: 'blocked' }
            : broker
        )
      );
      
      // Update stats immediately
      setBrokerStats(prevStats => ({
        ...prevStats,
        unblocked: prevStats.unblocked - 1,
        blocked: prevStats.blocked + 1
      }));
      
      // Also refresh from API to get any other updates
      await fetchBrokers();
      
      // Close confirmation dialog
      setShowBlockConfirm(false);
      setSelectedBrokerId(null);
      setSelectedBrokerName('');
    } catch (err) {
      console.error('🔴 Block error:', err);
      setError(err instanceof Error ? err.message : 'Failed to block broker');
    }
  };

  // Handle broker unblocking
  const handleUnblock = async () => {
    if (!selectedBrokerId) return;
    
    try {
      setError('');
      console.log('🟢 Unblocking broker with ID:', selectedBrokerId);
      const response = await brokerAPI.unblockBroker(selectedBrokerId);
      console.log('🟢 Unblock API response:', response);
      
      // Update local state immediately
      setBrokers(prevBrokers => 
        prevBrokers.map(broker => 
          broker._id === selectedBrokerId 
            ? { ...broker, approvedByAdmin: 'unblocked' }
            : broker
        )
      );
      
      // Update stats immediately
      setBrokerStats(prevStats => ({
        ...prevStats,
        unblocked: prevStats.unblocked + 1,
        blocked: prevStats.blocked - 1
      }));
      
      // Also refresh from API to get any other updates
      await fetchBrokers();
      
      // Close confirmation dialog
      setShowUnblockConfirm(false);
      setSelectedBrokerId(null);
      setSelectedBrokerName('');
    } catch (err) {
      console.error('🟢 Unblock error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unblock broker');
    }
  };

  // Filter brokers based on membership and region filters (search is now server-side)
  const filteredBrokers = brokers.filter(broker => {
    // Membership filter - check actual broker membership data
    const matchesMembership = membershipFilter === 'all' || 
      (broker.membership && broker.membership.toLowerCase() === membershipFilter.toLowerCase());

    // Region filter
    const matchesRegion = regionFilter === 'all' || 
      (broker.region && broker.region.length > 0 && 
       broker.region[0].name.toLowerCase().includes(regionFilter.toLowerCase()));

    return matchesMembership && matchesRegion;
  });


  // Fetch brokers when component mounts
  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  // Handle search and filter changes with debouncing
  useEffect(() => {
    // Set searching state when filters change
    setIsSearching(true);
    
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchBrokers();
      setIsSearching(false);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [searchTerm, statusFilter, membershipFilter, regionFilter, fetchBrokers]);

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

  // Generate consistent sample data for demonstration
  const getSampleData = (broker: Broker, index: number) => {
    const sampleData = [
      { leads: 4, properties: 2, membership: 'Premium' },
      { leads: 8, properties: 5, membership: 'Premium' },
      { leads: 3, properties: 7, membership: 'Standard' },
      { leads: 9, properties: 1, membership: 'Premium' },
      { leads: 6, properties: 4, membership: 'Standard' },
      { leads: 2, properties: 8, membership: 'Premium' },
      { leads: 7, properties: 3, membership: 'Standard' }
    ];
    
    return sampleData[index % sampleData.length];
  };


  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white bg-teal-600 hover:bg-teal-700 text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Broker
            </button>
          </div>
          <p className="text-gray-500 mt-1 text-sm">View and manage all registered brokers</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <svg className="h-5 w-5 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <input
                type="text"
                placeholder="Search by Firm Name, Contact, Region"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Broker Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
              >
                <option value="all">All Brokers</option>
                <option value="unblocked">Unblocked</option>
                <option value="blocked">Blocked</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* Membership Dropdown */}
            <div className="relative">
              <select
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
              >
                <option value="all">All Membership</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
                <option value="basic">Basic</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* Region Dropdown */}
            <div className="relative">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
              >
                <option value="all">All Regions</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
                <option value="bangalore">Bangalore</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="pune">Pune</option>
                <option value="agra">Agra</option>
                <option value="noida">Noida</option>
                <option value="lucknow">Lucknow</option>
                <option value="chennai">Chennai</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {(searchTerm || statusFilter !== 'all' || membershipFilter !== 'all' || regionFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setMembershipFilter('all');
                  setRegionFilter('all');
                }}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {loading ? (
          <SummaryCardsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Total Brokers Card */}
            <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-600 text-xs font-medium">Total Brokers</p>
                  <p className="text-xl font-bold text-teal-700">{brokerStats.total}</p>
                </div>
                <div className="bg-teal-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Unblocked Brokers Card */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-xs font-medium">Unblocked</p>
                  <p className="text-xl font-bold text-green-700">{brokerStats.unblocked}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Disabled Brokers Card */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-xs font-medium">Blocked</p>
                  <p className="text-xl font-bold text-red-600">{brokerStats.blocked}</p>
                </div>
                <div className="bg-red-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM5 19L19 5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Broker Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
            <div className="relative bg-white w-full max-w-lg mx-4 rounded-xl border border-gray-200 shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Broker</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    value={newBroker.name}
                    onChange={(e) => setNewBroker({ ...newBroker, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newBroker.email}
                    onChange={(e) => setNewBroker({ ...newBroker, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700  mb-1">Phone</label>
                  <input
                    value={newBroker.phone}
                    onChange={(e) => setNewBroker({ ...newBroker, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter phone"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2 rounded-md border bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setError('');
                        console.log('Creating broker:', newBroker);
                        
                        // Basic required validation
                        if (!newBroker.name.trim() || !newBroker.email.trim() || !newBroker.phone.trim()) {
                          setError('Please fill in all fields');
                          toast.error('Please fill in all fields');
                          return;
                        }

                        // Phone validation: exactly 10 digits
                        const phoneOnlyDigits = newBroker.phone.replace(/\D/g, '');
                        if (!/^\d{10}$/.test(phoneOnlyDigits)) {
                          toast.error('Phone must be exactly 10 digits');
                          return;
                        }

                        // Email validation (simple)
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(newBroker.email.trim())) {
                          toast.error('Please enter a valid email');
                          return;
                        }

                        // Duplicate checks against current list
                        const normalizedPhone = phoneOnlyDigits;
                        const phoneExists = brokers.some(b => (b.phone || '').replace(/\D/g, '') === normalizedPhone);
                        if (phoneExists) {
                          toast.error('Phone already exists');
                          return;
                        }

                        const emailExists = brokers.some(b => (b.email || '').toLowerCase() === newBroker.email.trim().toLowerCase());
                        if (emailExists) {
                          toast.error('Email already exists');
                          return;
                        }
                        
                        // Call API to create broker
                        const response = await brokerAPI.createBroker(
                          newBroker.name.trim(),
                          newBroker.email.trim(),
                          newBroker.phone.trim()
                        );
                        
                        console.log('Broker created successfully:', response);
                        toast.success('Broker created successfully');
                        
                        // Close modal and reset form
                        setShowAddModal(false);
                        setNewBroker({ name: '', email: '', phone: '' });
                        
                        // Refresh the brokers list
                        await fetchBrokers();
                        
                      } catch (err) {
                        console.error('Error creating broker:', err);
                        let message = 'Failed to create broker';
                        
                        // Parse error message to show generic messages for phone/email conflicts
                        if (err instanceof Error) {
                          const errorMessage = err.message.toLowerCase();
                          if (errorMessage.includes('phone') && errorMessage.includes('already') && errorMessage.includes('registered')) {
                            message = 'Phone already exists';
                          } else if (errorMessage.includes('email') && errorMessage.includes('already') && errorMessage.includes('registered')) {
                            message = 'Email already exists';
                          } else {
                            message = err.message;
                          }
                        }
                        
                        setError(message);
                        toast.error(message);
                      }
                    }}
                    className="px-5 py-2 rounded-md  text-white bg-teal-600 hover:bg-teal-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brokers Table */}
        {loading ? (
          <BrokersTableSkeleton />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredBrokers.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brokers found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-6 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <div>Name</div>
                  <div>Contact</div>
                  <div>Region</div>
                  <div>Membership</div>
                  <div>Numbers</div>
                  <div>Action</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredBrokers.map((broker, index) => {
                  const sampleData = getSampleData(broker, index);
                  return (
                    <div key={broker._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        {/* Name Column */}
                        <div className="flex items-center space-x-3">
                          <Link href={`/brokers/${broker.userId}`} className="cursor-pointer">
                            <Image
                              className="h-10 w-10 rounded-full object-cover hover:opacity-80 transition-opacity"
                              src={getBrokerImageUrl(broker.brokerImage)}
                              alt={broker.name || 'Broker'}
                              width={40}
                              height={40}
                            />
                          </Link>
                          <div>
                            <Link 
                              href={`/brokers/${broker.userId}`}
                              className="text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer capitalize"
                            >
                              {broker.name || 'N/A'}
                            </Link>
                            <div className="text-gray-500 text-xs capitalize">{broker.firmName || 'N/A'}</div>
                          </div>
                        </div>

                        {/* Contact Column */}
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="font-semibold text-gray-900">{broker.phone || 'N/A'}</span>
                            {broker.phone && (
                              <svg className="w-3 h-3 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-500 text-xs truncate">{broker.email || 'N/A'}</span>
                            {broker.email && (
                              <svg className="w-3 h-3 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Region Column */}
                        <div className="text-sm text-gray-900">
                          {broker.region && broker.region.length > 0 ? (
                            <div>
                              <div className="font-semibold text-gray-900">{broker.region[0].name}</div>
                              <div className="text-gray-500 text-xs">{broker.region[0].city}, {broker.region[0].state}</div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </div>

                        {/* Membership Column */}
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            broker.membership === 'premium'
                              ? 'bg-teal-100 text-teal-800' 
                              : broker.membership === 'standard'
                              ? 'bg-teal-100 text-teal-800'
                              : broker.membership === 'basic'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {broker.membership ? broker.membership.charAt(0).toUpperCase() + broker.membership.slice(1) : 'N/A'}
                          </span>
                        </div>

                        {/* Numbers Column */}
                        <div className="text-sm">
                          <div className="capitalize text-gray-500">{sampleData.leads} leads</div>
                          <div className="text-gray-500 text-xs capitalize">{sampleData.properties} properties</div>
                        </div>

                        {/* Action Column */}
                        <div>
                          {(() => {
                            if (broker.approvedByAdmin === 'unblocked') {
                              return (
                                <button 
                                  onClick={() => handleBlockClick(broker._id, broker.name || 'Broker')}
                                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM5 19L19 5" />
                                  </svg>
                                  <span>Block</span>
                                </button>
                              );
                            } else if (broker.approvedByAdmin === 'blocked') {
                              return (
                                <button 
                                  onClick={() => handleUnblockClick(broker._id, broker.name || 'Broker')}
                                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors text-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Unblock</span>
                                </button>
                              );
                            } else {
                              // Default to unblocked if status is undefined - show block button
                              return (
                                <button 
                                  onClick={() => handleBlockClick(broker._id, broker.name || 'Broker')}
                                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM5 19L19 5" />
                                  </svg>
                                  <span>Block</span>
                                </button>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalBrokers > 0 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
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
                activeClassName="!bg-teal-600 !text-white !border-teal-600"
                previousClassName="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                nextClassName="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                breakClassName="px-3 py-2 text-sm font-medium text-gray-500"
                disabledClassName="opacity-50 cursor-not-allowed"
                renderOnZeroPageCount={null}
              />
            </div>
          </div>
        )}

        {/* Block Confirmation Dialog */}
        {showBlockConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.8)]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Block Broker</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to block <span className="font-semibold">{selectedBrokerName}</span>? 
                  This will prevent them from accessing the platform.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => {
                      setShowBlockConfirm(false);
                      setSelectedBrokerId(null);
                      setSelectedBrokerName('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBlock}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Block Broker
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unblock Confirmation Dialog */}
        {showUnblockConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.8)]" >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unblock Broker</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to unblock <span className="font-semibold">{selectedBrokerName}</span>? 
                  This will restore their access to the platform.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => {
                      setShowUnblockConfirm(false);
                      setSelectedBrokerId(null);
                      setSelectedBrokerName('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnblock}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Unblock Broker
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}