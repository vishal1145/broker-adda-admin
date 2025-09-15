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

  // Filter brokers based on search term
  const filteredBrokers = brokers.filter(broker =>
    (broker.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (broker.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (broker.phone || '').includes(searchTerm) ||
    broker.firmName.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Fetch brokers when component mounts or filters change
  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  // Reset to page 1 when status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Helper functions





  // Use image URL directly from backend
  const getBrokerImageUrl = (brokerImage: string | undefined) => {
    // Return the image URL directly from backend, or fallback if null
    return brokerImage || "https://www.w3schools.com/howto/img_avatar.png";
  };

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
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
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

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <div className="w-48">
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Brokers Table */}
        <div className="shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CONTACT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REGION</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firm NAME</th> */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {loading ? (
                  <>
                    <BrokerSkeletonRow />
                    <BrokerSkeletonRow />
                    <BrokerSkeletonRow />
                    <BrokerSkeletonRow />
                    <BrokerSkeletonRow />
                  </>
                ) : filteredBrokers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No brokers found
                    </td>
                  </tr>
                ) : (
                  filteredBrokers.map((broker) => (
                    <tr key={broker._id} className="bg-white hover:bg-gray-50 border-b border-gray-200 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Link href={`/brokers/${broker._id}`} className="cursor-pointer">
                              <img
                                className="h-10 w-10 rounded-full object-cover hover:opacity-80 transition-opacity duration-200"
                                src={broker.brokerImage || "https://www.w3schools.com/howto/img_avatar.png"}
                                alt={broker.name || 'Broker'}
                                onError={(e) => {
                                  console.log('🖼️ Image failed to load:', broker.brokerImage);
                                  e.currentTarget.src = "https://www.w3schools.com/howto/img_avatar.png";
                                }}
                              />
                            </Link>
                          </div>
                          <div className="ml-4">
                            <Link 
                              href={`/brokers/${broker._id}`}
                              className="text-sm font-medium text-gray-900 hover:text-primary transition-colors duration-200 cursor-pointer"
                            >
                              {broker.name || 'N/A'} 
                            </Link>
                            <div className="text-sm text-gray-500">{broker.firmName || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <div className="flex items-center text-gray-900">
                            {broker.email || 'N/A'}
                            {broker.email && (
                              <svg className="w-4 h-4 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center text-gray-500 text-xs mt-1">
                            {broker.phone || 'N/A'}
                            {broker.phone && (
                              <svg className="w-3 h-3 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <div>{broker.region && broker.region.length > 0 ? broker.region[0].name : 'N/A'}</div>
                          <div className="text-gray-500 text-xs mt-1">
                            {broker.region && broker.region.length > 0 
                              ? `${broker.region[0].city}, ${broker.region[0].state}` 
                              : 'No Region Assigned'
                            }
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {broker.firmName || 'N/A'}
                      </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(broker)}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${broker.approvedByAdmin ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
                          {getStatusText(broker)}
                        </span>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(() => {
                            console.log('🔍 Broker ID:', broker._id, 'approvedByAdmin:', broker.approvedByAdmin, 'Type:', typeof broker.approvedByAdmin);
                            if (broker.approvedByAdmin === 'approved') {
                              return (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                              <div className="w-2 h-2 rounded-full mr-2 bg-green-600"></div>
                              Approved
                            </span>
                              );
                            } else if (broker.approvedByAdmin === 'rejected') {
                              return (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                                  <div className="w-2 h-2 rounded-full mr-2 bg-red-600"></div>
                                  Rejected
                                </span>
                              );
                            } else {
                              return (
                            <>
                              <button 
                                onClick={() => handleApprove(broker._id)}
                                className="inline-flex items-center px-4 py-2 text-xs font-medium rounded text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(broker._id)}
                                className="inline-flex items-center px-4 py-2 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                              );
                            }
                          })()}
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