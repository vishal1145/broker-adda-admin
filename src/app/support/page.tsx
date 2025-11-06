'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { contactAPI } from '@/services/api';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-hot-toast';

interface Contact {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  region?: string;
  membership?: 'basic' | 'standard' | 'premium';
  leadsCount?: number;
  propertiesCount?: number;
  verificationStatus?: 'Verified' | 'Unverified';
  status?: string;
  avatar?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  // Flexible fields to handle different API response structures
  [key: string]: unknown;
}

// Skeleton Loader Components
const Skeleton = ({ className = '', height = 'h-4', width = 'w-full', rounded = false }: { className?: string; height?: string; width?: string; rounded?: boolean }) => (
  <div 
    className={`bg-gray-200 animate-pulse ${height} ${width} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
  />
);

const ContactsTableSkeleton = () => {
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
              <div>
                <Skeleton height="h-4" width="w-20" />
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

              {/* Status Column Skeleton */}
              <div>
                <Skeleton height="h-7" width="w-20" rounded />
              </div>

              {/* Action Column Skeleton */}
              <div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
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

function SupportPageInner() {
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [debouncedStatusFilter, setDebouncedStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [contactStats, setContactStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0
  });
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContactName, setSelectedContactName] = useState<string>('');

  // Fetch contacts from API
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data without limit
      const response = await contactAPI.getContacts(
        1, // Always fetch from page 1 when getting all data
        10000, // Set high limit to get all data
        debouncedSearchTerm || '',
        debouncedStatusFilter === 'all' ? '' : debouncedStatusFilter
      );
      
      console.log('📞 API Response:', response);
      
      // Extract list from different possible API response structures
      let list: Contact[] = [];
      
      // Handle different API response structures
      if (Array.isArray(response)) {
        // Response is directly an array
        list = response;
      } else if (Array.isArray(response?.data)) {
        // Response.data is an array
        list = response.data;
      } else if (Array.isArray(response?.data?.contacts)) {
        // Response.data.contacts is an array
        list = response.data.contacts;
      } else if (Array.isArray(response?.data?.data)) {
        // Response.data.data is an array
        list = response.data.data;
      } else if (Array.isArray(response?.contacts)) {
        // Response.contacts is an array
        list = response.contacts;
      } else if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // If data is an object, try to find an array property
        const possibleArrays = Object.values(response.data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          list = possibleArrays[0] as Contact[];
        }
      }
      
      // Ensure list is always an array
      if (!Array.isArray(list)) {
        console.warn('⚠️ API response is not an array, defaulting to empty array:', response);
        list = [];
      }
      
      setContacts(list);

      // Use actual list length for pagination since we're fetching all data
      const totalItems = Array.isArray(list) ? list.length : 0;
      setTotalContacts(totalItems);
      
      // For client-side pagination, calculate pages based on items per page
      const calculatedPages = Math.ceil(totalItems / 10);
      setTotalPages(calculatedPages || 1);
      
      // Update contact statistics from API response
      if (response?.data?.stats) {
        setContactStats({
          total: response.data.stats.total || 0,
          verified: response.data.stats.verified || 0,
          unverified: response.data.stats.unverified || 0
        });
      } else if (response?.stats) {
        setContactStats({
          total: response.stats.total || 0,
          verified: response.stats.verified || 0,
          unverified: response.stats.unverified || 0
        });
      } else {
        // Calculate stats from list if not provided
        const verifiedCount = Array.isArray(list) ? list.filter((c: Contact) => c.verificationStatus === 'Verified' || c.status === 'verified').length : 0;
        setContactStats({
          total: Array.isArray(list) ? list.length : 0,
          verified: verifiedCount,
          unverified: Array.isArray(list) ? list.length - verifiedCount : 0
        });
      }
    } catch (err) {
      console.error('❌ Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch contacts');
      // Ensure contacts is always an array even on error
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedStatusFilter, debouncedSearchTerm]); // Removed currentPage dependency since we fetch all data

  // Handle contact blocking confirmation
  const handleBlockClick = (contactId: string, contactName: string) => {
    setSelectedContactId(contactId);
    setSelectedContactName(contactName);
    setShowBlockConfirm(true);
  };

  // Handle contact blocking
  const handleBlock = async () => {
    if (!selectedContactId) return;
    
    try {
      setError('');
      console.log('🔴 Blocking contact with ID:', selectedContactId);
      await contactAPI.deleteContact(selectedContactId);
      
      // Update local state immediately
      setContacts(prevContacts => 
        prevContacts.filter(contact => contact._id !== selectedContactId)
      );
      
      // Update stats
      setContactStats(prevStats => ({
        ...prevStats,
        total: prevStats.total - 1
      }));
      
      // Also refresh from API to get any other updates
      await fetchContacts();
      
      toast.success('Contact blocked successfully');
      
      // Close confirmation dialog
      setShowBlockConfirm(false);
      setSelectedContactId(null);
      setSelectedContactName('');
    } catch (err) {
      console.error('🔴 Block error:', err);
      setError(err instanceof Error ? err.message : 'Failed to block contact');
      toast.error(err instanceof Error ? err.message : 'Failed to block contact');
    }
  };

  // Get verification status for a contact (defaults to unverified)
  const getVerificationStatus = (contact: Contact): 'verified' | 'unverified' => {
    if (contact.verificationStatus === 'Verified' || contact.status === 'verified') {
      return 'verified';
    }
    return 'unverified';
  };

  // Use image URL with proxy for external URLs to avoid CORS issues
  const getContactImageUrl = (avatar: string | undefined) => {
    if (!avatar) {
      return "https://www.w3schools.com/howto/img_avatar.png";
    }
    
    // If it's an external URL, use the proxy
    if (avatar.includes('broker-adda-be.algofolks.com') || 
        avatar.includes('https://') || 
        (avatar.includes('http://') && !avatar.includes('localhost'))) {
      return `/api/image-proxy?url=${encodeURIComponent(avatar)}`;
    }
    
    return avatar;
  };

  // Extract column keys from contacts data (excluding name and email fields as they'll be first two columns)
  const getTableColumns = (): string[] => {
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return [];
    }
    
    // Get all unique keys from all contacts, excluding internal/system keys and name/email fields
    const excludedKeys = ['_id', '__v', 'createdAt', 'updatedAt', 'id', 'name', 'firstName', 'lastName', 'fullName', 'email'];
    const allKeys = new Set<string>();
    
    contacts.forEach((contact) => {
      Object.keys(contact).forEach((key) => {
        if (!excludedKeys.includes(key)) {
          allKeys.add(key);
        }
      });
    });
    
    return Array.from(allKeys).sort();
  };

  // Get full name from contact (combining first and last name, or using name field)
  const getFullName = (contact: Contact): string => {
    const firstName = (contact.firstName as string) || '';
    const lastName = (contact.lastName as string) || '';
    const name = (contact.name as string) || '';
    const fullName = (contact.fullName as string) || '';
    
    if (fullName) return fullName;
    if (firstName && lastName) return `${firstName} ${lastName}`.trim();
    if (name) return name;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return '-';
  };

  // Format cell value for display
  const formatCellValue = (key: string, value: unknown): string | React.ReactNode => {
    if (value === null || value === undefined) {
      return '-';
    }

    // Handle status field as chip/badge
    if (key.toLowerCase() === 'status' || key.toLowerCase().includes('status')) {
      const statusValue = String(value).trim();
      if (!statusValue || statusValue === '-') return '-';
      
      // Return JSX for chip (will be handled in render)
      return `__CHIP__${statusValue}`;
    }

    // Handle different data types
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length > 0 ? `${value.length} items` : 'No items';
      }
      // Handle nested objects
      return JSON.stringify(value);
    }

    // Handle dates
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString();
      } catch {
        return value;
      }
    }

    return String(value);
  };

  // Render status chip
  const renderStatusChip = (status: string): React.ReactNode => {
    if (!status || status === '-') return '-';
    
    // Normalize status text
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
        {normalizedStatus}
      </span>
    );
  };

  // Get column header label
  const getColumnLabel = (key: string): string => {
    // Convert camelCase/PascalCase to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Fetch contacts when component mounts
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Handle search and status filter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedStatusFilter(statusFilter);
      setCurrentPage(1);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm, statusFilter]);

  // Refetch when debounced filters change (not on page change since we fetch all data)
  useEffect(() => {
    fetchContacts();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [debouncedSearchTerm, debouncedStatusFilter, fetchContacts]);
  
  // Get paginated contacts for current page
  const getPaginatedContacts = (): Contact[] => {
    if (!Array.isArray(contacts)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return contacts.slice(startIndex, endIndex);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            </div>
            <p className="text-gray-500 mt-1 text-sm">View and manage all contact and support requests</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
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
                  placeholder="Search by Name or Email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filter */}
              <div className="relative">
                <input
                  type="date"
                  onChange={(e) => {
                    // You can add date filtering logic here
                    console.log('Date filter:', e.target.value);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Filter by Date"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
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
          {error && contacts.length === 0 && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          {loading ? (
            <SummaryCardsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Contacts Card */}
              <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-600 text-xs font-medium">Total Contacts</p>
                    <p className="text-xl font-bold text-teal-700">{contactStats.total}</p>
                  </div>
                  <div className="bg-teal-100 rounded-lg p-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Verified Contacts Card */}
              {/* <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-xs font-medium">Verified</p>
                    <p className="text-xl font-bold text-green-700">{contactStats.verified}</p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div> */}

              {/* Unverified Contacts Card */}
              {/* <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-xs font-medium">Unverified</p>
                    <p className="text-xl font-bold text-orange-700">{contactStats.unverified}</p>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          {/* Contacts Table */}
          {loading ? (
            <ContactsTableSkeleton />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
              {contacts.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                <>
                  {/* Table Header - Full Name and Email as first two columns, then dynamic columns */}
                  <div className="bg-gray-50 px-6 py-4 w-full border-b border-gray-200">
                    <div className={`grid gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wide`} style={{ gridTemplateColumns: `repeat(${getTableColumns().length + 2}, minmax(0, 1fr))` }}>
                      <div>Full Name</div>
                      <div>Email</div>
                      {getTableColumns().map((column) => (
                        <div key={column}>{getColumnLabel(column)}</div>
                      ))}
                    </div>
                  </div>

                  {/* Table Body - Full Name and Email as first two columns, then dynamic columns */}
                  <div className="divide-y divide-gray-200">
                    {getPaginatedContacts().map((contact: Contact) => {
                      const columns = getTableColumns();
                      return (
                        <div key={contact._id || String(contact._id) || Math.random()} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className={`grid gap-4 items-center`} style={{ gridTemplateColumns: `repeat(${columns.length + 2}, minmax(0, 1fr))` }}>
                            {/* Full Name Column - First */}
                            <div className="text-sm font-semibold text-gray-900">
                              {getFullName(contact)}
                            </div>
                            
                            {/* Email Column - Second */}
                            <div className="text-sm text-gray-500">
                              {contact.email || '-'}
                            </div>
                            
                            {/* Dynamic Columns */}
                            {columns.map((column) => {
                              const value = contact[column as keyof Contact];
                              const formattedValue = formatCellValue(column, value);
                              const isStatusColumn = column.toLowerCase() === 'status' || column.toLowerCase().includes('status');
                              const isMessageOrBodyColumn = column.toLowerCase() === 'message' || 
                                                           column.toLowerCase() === 'emailbody' || 
                                                           column.toLowerCase() === 'email_body' ||
                                                           column.toLowerCase().includes('message') ||
                                                           column.toLowerCase().includes('body');
                              
                              // Determine text color based on column type
                              const textColorClass = isMessageOrBodyColumn ? 'text-gray-500' : 'text-gray-900';
                              
                              return (
                                <div key={column} className={`text-sm ${textColorClass}`}>
                                  {isStatusColumn && typeof formattedValue === 'string' && formattedValue.startsWith('__CHIP__') ? (
                                    renderStatusChip(formattedValue.replace('__CHIP__', ''))
                                  ) : (
                                    formattedValue
                                  )}
                                </div>
                              );
                            })}
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
          {totalContacts > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Showing {totalContacts > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalContacts)} of {totalContacts} results
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Block Contact</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to block <span className="font-semibold">{selectedContactName}</span>? 
                    This action cannot be undone.
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={() => {
                        setShowBlockConfirm(false);
                        setSelectedContactId(null);
                        setSelectedContactName('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBlock}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Block Contact
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

export default function SupportPage() {
  return (
    <Suspense>
      <SupportPageInner />
    </Suspense>
  );
}

