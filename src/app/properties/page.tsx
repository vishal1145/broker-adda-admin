'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import Image from 'next/image';
import { propertiesAPI } from '@/services/api';

// Skeleton Loader Components
const Skeleton = ({ className = '', height = 'h-4', width = 'w-full', rounded = false }: { className?: string; height?: string; width?: string; rounded?: boolean }) => (
  <div 
    className={`bg-gray-200 animate-pulse ${height} ${width} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
  />
);

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

// Helper function to validate and get safe image URL
const getSafeImageUrl = (images: string[] | undefined): string => {
  const defaultImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop';
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    return defaultImage;
  }
  
  // Find first valid image URL
  const validImage = images.find(img => 
    img && 
    typeof img === 'string' && 
    !img.includes('example.com') && 
    (img.startsWith('https://images.unsplash.com') || img.startsWith('/') || img.startsWith('http://localhost'))
  );
  
  return validImage || defaultImage;
};

export default function PropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  type PropertyCard = {
    _id: string;
    title: string;
    price: number;
    priceUnit: string;
    address: string;
    city: string;
    region: string;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    propertyType: string;
    subType: string;
    status: string;
    isFeatured: boolean;
  };
  const [cards, setCards] = useState<PropertyCard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const itemsPerPage = 10;
  
  // State for property metrics
  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    available: 0,
    sold: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Load property metrics from API
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setMetricsLoading(true);
        const metricsResponse = await propertiesAPI.getMetrics();
        
        console.log('Metrics API Response:', metricsResponse);
        
        // Handle different possible response structures
        const metrics = metricsResponse.data || metricsResponse;
        
        setPropertyStats({
          total: metrics.total || 0,
          available: metrics.available || 0,
          sold: metrics.sold || 0
        });
        
      } catch (err) {
        console.error('Error loading metrics:', err);
        // Keep default values (0) if API fails
      } finally {
        setMetricsLoading(false);
      }
    };
    
    loadMetrics();
  }, []);

  // Load properties from API
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Load properties with current filters
        const propertiesResponse = await propertiesAPI.getProperties(
          currentPage,
          itemsPerPage,
          debouncedSearchTerm,
          typeFilter,
          statusFilter,
          regionFilter
        );
        
        console.log('Properties API Response:', propertiesResponse);
        console.log('Properties data:', propertiesResponse.data);
        console.log('Properties array:', propertiesResponse.data?.properties);
        console.log('Full response structure:', JSON.stringify(propertiesResponse, null, 2));
        console.log('Current filters:', { debouncedSearchTerm, typeFilter, statusFilter, regionFilter });
        console.log('API URL called:', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/properties?page=${currentPage}&limit=${itemsPerPage}&search=${debouncedSearchTerm}&propertyType=${typeFilter}&status=${statusFilter}&region=${regionFilter}`);
        
        // Handle different possible response structures
        const properties = propertiesResponse.data?.properties || propertiesResponse.properties || propertiesResponse.data || [];
        const totalPages = propertiesResponse.data?.totalPages || propertiesResponse.totalPages || 1;
        const total = propertiesResponse.data?.total || propertiesResponse.total || 0;
        
        console.log('Processed properties:', properties);
        console.log('Processed totalPages:', totalPages);
        console.log('Processed total:', total);
        console.log('Raw response structure:', {
          hasData: !!propertiesResponse.data,
          dataKeys: propertiesResponse.data ? Object.keys(propertiesResponse.data) : 'no data',
          responseKeys: Object.keys(propertiesResponse),
          totalPagesFromData: propertiesResponse.data?.totalPages,
          totalFromData: propertiesResponse.data?.total,
          totalPagesFromRoot: propertiesResponse.totalPages,
          totalFromRoot: propertiesResponse.total
        });
        
        // Filter out invalid image URLs and ensure only valid images are used
        let processedProperties = Array.isArray(properties) ? properties.map(property => ({
          ...property,
          images: property.images ? property.images.filter((img: string) => 
            img && 
            typeof img === 'string' && 
            !img.includes('example.com') && 
            (img.startsWith('https://images.unsplash.com') || img.startsWith('/'))
          ) : []
        })) : [];

        // Client-side filtering as fallback (in case API doesn't filter properly)
        if (Array.isArray(processedProperties)) {
          processedProperties = processedProperties.filter(property => {
            // Search filter
            if (debouncedSearchTerm && debouncedSearchTerm !== '') {
              const searchLower = debouncedSearchTerm.toLowerCase();
              const matchesSearch = 
                property.title?.toLowerCase().includes(searchLower) ||
                property.address?.toLowerCase().includes(searchLower) ||
                property.city?.toLowerCase().includes(searchLower) ||
                property.region?.toLowerCase().includes(searchLower) ||
                property.price?.toString().includes(searchLower);
              
              if (!matchesSearch) return false;
            }

            // Type filter
            if (typeFilter !== 'all' && property.propertyType !== typeFilter) {
              return false;
            }

            // Status filter
            if (statusFilter !== 'all' && property.status !== statusFilter) {
              return false;
            }

            // Region filter
            if (regionFilter !== 'all' && 
                property.region !== regionFilter && 
                property.city !== regionFilter) {
              return false;
            }

            return true;
          });
        }
        
        console.log('Processed properties after image filtering:', processedProperties);
        console.log('Filtered properties count:', processedProperties.length);
        
        setCards(processedProperties);
        
        // Calculate fallback values if API doesn't provide them
        const calculatedTotal = total > 0 ? total : processedProperties.length;
        const calculatedTotalPages = totalPages > 1 ? totalPages : Math.ceil(calculatedTotal / itemsPerPage);
        
        console.log('Final values:', {
          calculatedTotal,
          calculatedTotalPages,
          originalTotal: total,
          originalTotalPages: totalPages,
          processedPropertiesLength: processedProperties.length
        });
        
        setTotalPages(calculatedTotalPages);
        setTotalProperties(calculatedTotal);
        
      
        
      } catch (err) {
        console.error('Error loading properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    
    loadProperties();
  }, [currentPage, debouncedSearchTerm, typeFilter, statusFilter, regionFilter]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Pagination helpers
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // Debug cards state
  useEffect(() => {
    console.log('Cards state updated:', cards, 'Length:', cards.length);
    console.log('Pagination debug:', { 
      currentPage, 
      totalPages, 
      totalProperties, 
      safePage,
      itemsPerPage,
      showPagination: totalPages > 1,
      showResultsCount: totalProperties > 0
    });
  }, [cards, currentPage, totalPages, totalProperties, safePage]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            </div>
            <p className="text-gray-500 mt-1 text-sm">View and manage all registered properties</p>
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
                  placeholder="Search by Property Name, Price, Region"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Property Type Dropdown */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
                >
                  <option value="all">All Properties</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Land">Land</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
                >
                  <option value="all">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
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
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Noida">Noida</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || regionFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setRegionFilter('all');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="font-semibold">Error loading properties:</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          )}

          {/* Active Filters Indicator */}
          {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || regionFilter !== 'all') && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <div className="font-semibold">Active Filters:</div>
              <div className="text-sm mt-1 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="bg-blue-100 px-2 py-1 rounded-full text-xs">
                    Search: &quot;{searchTerm}&quot;
                  </span>
                )}
                {typeFilter !== 'all' && (
                  <span className="bg-blue-100 px-2 py-1 rounded-full text-xs">
                    Type: {typeFilter}
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="bg-blue-100 px-2 py-1 rounded-full text-xs">
                    Status: {statusFilter}
                  </span>
                )}
                {regionFilter !== 'all' && (
                  <span className="bg-blue-100 px-2 py-1 rounded-full text-xs">
                    Region: {regionFilter}
                  </span>
                )}
              </div>
            </div>
          )}


       
          {/* Summary Cards */}
          {metricsLoading ? (
            <SummaryCardsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Total Properties Card */}
              <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-600 text-xs font-medium">Total Properties</p>
                    <p className="text-xl font-bold text-teal-700">{propertyStats.total}</p>
                  </div>
                  <div className="bg-teal-100 rounded-lg p-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Available Properties Card */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-xs font-medium">Available</p>
                    <p className="text-xl font-bold text-green-700">{propertyStats.available}</p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sold Properties Card */}
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-xs font-medium">Sold</p>
                    <p className="text-xl font-bold text-red-600">{propertyStats.sold}</p>
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

          {/* Featured Properties */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Properties</h3> */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-500 text-lg">No properties found</div>
                    <div className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</div>
                  </div>
                ) : (
                  cards.map((property, idx) => (
                  <Link key={`${property._id}-${idx}`} href={`/properties/${property._id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden ">
                    <div className="relative w-full h-48">
                      <Image
                        src={getSafeImageUrl(property.images)}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 25vw"
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-gray-900 text-base font-bold mb-1">
                        ₹{property.price.toLocaleString()}
                        {property.priceUnit && ` ${property.priceUnit}`}
                      </div>
                      <div className="flex items-start text-gray-600 text-xs mb-1">
                        <svg className="w-4 h-4 mr-1 mt-[2px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.5-7.5 10.5-7.5 10.5S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="truncate">{property.address}, {property.city}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {property.bedrooms} beds / {property.bathrooms} baths / {property.subType}
                      </div>
                    </div>
                  </Link>
                  ))
                )}
              </div>

              {/* Results Count and Pagination */}
              {totalProperties > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Results Count */}
                  <div className="text-sm text-gray-700">
                    Showing {((safePage - 1) * itemsPerPage) + 1} to {Math.min(safePage * itemsPerPage, totalProperties)} of {totalProperties} results
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    className={`px-3 py-2 text-sm rounded-md border ${safePage === 1 ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'}`}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={`page-btn-${pageNum}`}
                        onClick={() => goToPage(pageNum)}
                        className={`w-9 h-9 text-sm rounded-md border ${pageNum === safePage ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 7 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  {totalPages > 7 && (
                    <button
                      onClick={() => goToPage(totalPages)}
                      className={`w-12 h-9 text-sm rounded-md border ${safePage === totalPages ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {totalPages}
                    </button>
                  )}
                  <button
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                    className={`px-3 py-2 text-sm rounded-md border ${safePage === totalPages ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}