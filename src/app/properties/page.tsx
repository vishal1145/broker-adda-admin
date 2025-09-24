'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

// Skeleton Loader Components
const Skeleton = ({ className = '', height = 'h-4', width = 'w-full', rounded = false }: { className?: string; height?: string; width?: string; rounded?: boolean }) => (
  <div 
    className={`bg-gray-200 animate-pulse ${height} ${width} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
  />
);

const SummaryCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3  gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton height="h-4" width="w-20" />
              <Skeleton height="h-8" width="w-12" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <Skeleton height="h-6" width="w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function PropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  type PropertyCard = {
    id: number;
    title: string;
    price: string;
    location?: string;
    thumbnail?: string;
    image?: string;
  };
  const [cards, setCards] = useState<PropertyCard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  

  // Mock data for summary cards
  const propertyStats = {
    total: 10,
    available: 7,
    sold: 3
  };

  // Load cards from index.json
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/data/properties/index.json', { cache: 'no-store' });
        const json = await res.json();
        setCards(json.properties || []);
      } catch (e) {
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Pagination helpers (10 items per page)
  const totalPages = Math.max(1, Math.ceil((cards?.length || 0) / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = (safePage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const displayedCards: PropertyCard[] = (cards || []).slice(startIdx, endIdx);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                >
                  <option value="all">All Properties</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">House</option>
                  <option value="commercial">Commercial</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="townhouse">Townhouse</option>
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                >
                  <option value="all">All Regions</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="delhi">Delhi</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="hyderabad">Hyderabad</option>
                  <option value="pune">Pune</option>
                  <option value="chennai">Chennai</option>
                  <option value="noida">Noida</option>
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
              {error}
            </div>
          )}

          {/* Summary Cards */}
          {loading ? (
            <SummaryCardsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Total Properties Card */}
              <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-600 text-sm font-medium">Total Properties</p>
                    <p className="text-2xl font-bold text-teal-700">{propertyStats.total}</p>
                  </div>
                  <div className="bg-teal-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Available Properties Card */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Available</p>
                    <p className="text-2xl font-bold text-green-700">{propertyStats.available}</p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sold Properties Card */}
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Sold</p>
                    <p className="text-2xl font-bold text-red-600">{propertyStats.sold}</p>
                  </div>
                  <div className="bg-red-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {displayedCards.map((property, idx) => (
                  <Link key={`${property.id}-${idx}`} href={`/properties/${property.id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden ">
                    <img
                      src={property.thumbnail || property.image}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <div className="text-gray-900 text-base font-bold mb-1">{property.price}</div>
                      <div className="flex items-start text-gray-600 text-xs mb-1">
                        <svg className="w-4 h-4 mr-1 mt-[2px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.5-7.5 10.5-7.5 10.5S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="truncate">{property.location || '98A Mount Shasta Dr, San Pedro'}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">3 beds / 2 baths / 1520sqft</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {cards.length > itemsPerPage && (
                <div className="mt-6 flex items-center justify-center gap-2">
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
                        className={`w-9 h-9 text-sm rounded-md border ${pageNum === safePage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
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
                      className={`w-12 h-9 text-sm rounded-md border ${safePage === totalPages ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
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
      </Layout>
    </ProtectedRoute>
  );
}