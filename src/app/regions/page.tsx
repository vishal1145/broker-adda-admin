'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { regionAPI } from '@/services/api';
import Popup from 'reactjs-popup';
import ReactPaginate from 'react-paginate';
// Removed unused Select import
import { useJsApiLoader } from '@react-google-maps/api';

interface Region {
  _id: string;
  name: string;
  description: string;
  state: string;
  city: string;
  centerLocation: string;
  radius: number;
  brokerCount: number;
  createdAt: string;
  updatedAt: string;
}

// Skeleton Loader Components
const Skeleton = ({ className = '', height = 'h-4', width = 'w-full', rounded = false }: { className?: string; height?: string; width?: string; rounded?: boolean }) => (
  <div 
    className={`bg-gray-200 animate-pulse ${height} ${width} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
  />
);

const RegionsTableSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-5 gap-4">
          <Skeleton height="h-4" width="w-20" />
          <Skeleton height="h-4" width="w-24" />
          <Skeleton height="h-4" width="w-16" />
          <Skeleton height="h-4" width="w-20" />
          <Skeleton height="h-4" width="w-16" />
        </div>
      </div>

      {/* Table Body Skeleton */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              {/* Name Column Skeleton */}
              <div className="flex items-center space-x-3">
                <Skeleton height="h-10" width="w-10" rounded />
                <div className="space-y-2">
                  <Skeleton height="h-4" width="w-24" />
                  <Skeleton height="h-3" width="w-32" />
                </div>
              </div>

              {/* Location Column Skeleton */}
              <div className="space-y-2">
                <Skeleton height="h-4" width="w-20" />
                <Skeleton height="h-3" width="w-24" />
              </div>

              {/* Center Location Column Skeleton */}
              <div className="space-y-2">
                <Skeleton height="h-4" width="w-32" />
                <Skeleton height="h-3" width="w-20" />
              </div>

              {/* Stats Column Skeleton */}
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


export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    state: '',
    city: '',
    center: '',
    radius: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRegions, setTotalRegions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(10);
  const [regionStats, setRegionStats] = useState({
    totalRegions: 0,
    totalBrokers: 0,
    activeCities: 0,
    activeStates: 0,
    avgBrokersPerRegion: 0
  });
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showDescriptionPopup, setShowDescriptionPopup] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    state: '',
    city: '',
    center: '',
    radius: ''
  });
  const [editInputValue, setEditInputValue] = useState('');
  const [editSuggestions, setEditSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showEditSuggestions, setShowEditSuggestions] = useState(false);
  const [editSearchTimeout, setEditSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyA5Lb-4aPQwchmojJe4IpblpreNOjxHFMc",
    libraries: ['places'] as const,
  });

  // Dropdown options
  // Removed unused stateOptions

  // Removed unused cityOptions

  // Handle input change and get suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setFormData(prev => ({ ...prev, center: value }));
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.length > 0 && window.google && window.google.maps && window.google.maps.places) {
      // Add small delay to avoid too many API calls
      const timeout = setTimeout(() => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          { 
            input: value, 
            componentRestrictions: { country: ['in'] },
            types: ['establishment', 'geocode']
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }
        );
      }, 300); // 300ms delay
      
      setSearchTimeout(timeout);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: google.maps.places.AutocompletePrediction) => {
    setInputValue(suggestion.description);
    setFormData(prev => ({ ...prev, center: suggestion.description }));
    setShowSuggestions(false);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Reset form function
  const resetForm = () => {
    setFormData({ name: '', description: '', state: '', city: '', center: '', radius: '' });
    setInputValue(''); // Clear the center location input value
    setSuggestions([]); // Clear suggestions
    setShowSuggestions(false); // Hide suggestions dropdown
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (editSearchTimeout) {
        clearTimeout(editSearchTimeout);
      }
    };
  }, [searchTimeout, editSearchTimeout]);

  // Handle description popup
  const handleShowDescription = (description: string) => {
    setSelectedDescription(description);
    setShowDescriptionPopup(true);
  };

  // Handle delete region
  const handleDeleteRegion = async () => {
    if (!regionToDelete) return;
    
    try {
      setDeleting(true);
      setError('');
      console.log('Deleting region:', regionToDelete._id);
      
      await regionAPI.deleteRegion(regionToDelete._id);
      console.log('Region deleted successfully');
      
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setRegionToDelete(null);
      
      // Refresh the regions list
      fetchRegions(1, itemsPerPage, searchTerm, stateFilter !== 'all' ? stateFilter : '', cityFilter !== 'all' ? cityFilter : '');
      fetchRegionStats(); // Refresh the statistics
    } catch (err) {
      console.error('Error deleting region:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete region');
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (region: Region) => {
    setRegionToDelete(region);
    setShowDeleteConfirm(true);
  };

  // Handle edit button click
  const handleEditClick = async (region: Region) => {
    try {
      setEditingRegion(region);
      setShowEditForm(true);
      
      // Pre-fill form with existing data
      setEditFormData({
        name: region.name,
        description: region.description,
        state: region.state,
        city: region.city,
        center: region.centerLocation,
        radius: region.radius.toString()
      });
      setEditInputValue(region.centerLocation);
    } catch (err) {
      console.error('Error preparing edit form:', err);
      setError('Failed to prepare edit form');
    }
  };

  // Handle edit form input change and get suggestions
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditInputValue(value);
    setEditFormData(prev => ({ ...prev, center: value }));
    
    // Clear previous timeout
    if (editSearchTimeout) {
      clearTimeout(editSearchTimeout);
    }
    
    if (value.length > 0 && window.google && window.google.maps && window.google.maps.places) {
      // Add small delay to avoid too many API calls
      const timeout = setTimeout(() => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          { 
            input: value, 
            componentRestrictions: { country: ['in'] },
            types: ['establishment', 'geocode']
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setEditSuggestions(predictions);
              setShowEditSuggestions(true);
            } else {
              setEditSuggestions([]);
              setShowEditSuggestions(false);
            }
          }
        );
      }, 300); // 300ms delay
      
      setEditSearchTimeout(timeout);
    } else {
      setEditSuggestions([]);
      setShowEditSuggestions(false);
    }
  };

  // Handle edit suggestion selection
  const handleEditSuggestionClick = (suggestion: google.maps.places.AutocompletePrediction) => {
    setEditInputValue(suggestion.description);
    setEditFormData(prev => ({ ...prev, center: suggestion.description }));
    setShowEditSuggestions(false);
  };

  // Handle edit input focus
  const handleEditInputFocus = () => {
    if (editSuggestions.length > 0) {
      setShowEditSuggestions(true);
    }
  };

  // Handle edit input blur
  const handleEditInputBlur = () => {
    setTimeout(() => setShowEditSuggestions(false), 200);
  };

  // Reset edit form function
  const resetEditForm = () => {
    setEditFormData({ name: '', description: '', state: '', city: '', center: '', radius: '' });
    setEditInputValue('');
    setEditSuggestions([]);
    setShowEditSuggestions(false);
    setEditingRegion(null);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegion) return;
    
    try {
      setUpdating(true);
      setError('');
      console.log('Updating region with data:', editFormData);
      
      await regionAPI.updateRegion(
        editingRegion._id,
        editFormData.name,
        editFormData.description,
        editFormData.state,
        editFormData.city,
        editFormData.center,
        parseFloat(editFormData.radius) || 0
      );
      
      console.log('Region updated successfully');
      resetEditForm();
      setShowEditForm(false);
      fetchRegions(1, itemsPerPage, searchTerm, stateFilter !== 'all' ? stateFilter : '', cityFilter !== 'all' ? cityFilter : ''); // Refresh the regions list
      fetchRegionStats(); // Refresh the statistics
    } catch (err) {
      console.error('Error updating region:', err);
      setError(err instanceof Error ? err.message : 'Failed to update region');
    } finally {
      setUpdating(false);
    }
  };

  // Fetch region statistics from API
  const fetchRegionStats = useCallback(async () => {
    try {
      const response = await regionAPI.getRegionStats();
      console.log('Region Stats API Response:', response);
      
      if (response && response.success && response.data) {
        setRegionStats({
          totalRegions: response.data.totalRegions || 0,
          totalBrokers: response.data.totalBrokers || 0,
          activeCities: response.data.activeCities || 0,
          activeStates: response.data.activeStates || 0,
          avgBrokersPerRegion: response.data.avgBrokersPerRegion || 0
        });
      }
    } catch (err) {
      console.error('Error fetching region statistics:', err);
      // Don't set error state for stats, just log it
    }
  }, []);

  // Fetch regions from API
  const fetchRegions = useCallback(async (page = 1, limit = 10, search = '', state = '', city = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await regionAPI.getRegions(page, limit, search, state, city);
      console.log('Regions API Response:', response); // Debug log
      
      // Handle the new API response structure with pagination
      if (response && response.success && response.data && response.data.regions && Array.isArray(response.data.regions)) {
        setRegions(response.data.regions);
        setTotalRegions(response.data.pagination.totalRegions);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        console.warn('Unexpected API response structure:', response);
        setRegions([]);
        setTotalRegions(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching regions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch regions');
      setRegions([]); // Ensure regions is always an array
      setTotalRegions(0);
    } finally {
      setLoading(false);
    }
  }, []);



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData); // Debug log
    
    try {
      setError('');
      console.log('Calling regionAPI.createRegion...'); // Debug log
      const response = await regionAPI.createRegion(
        formData.name, 
        formData.description, 
        formData.state, 
        formData.city, 
        formData.center, 
        parseFloat(formData.radius) || 0
      );
      console.log('Create region API Response:', response); // Debug log
      
      resetForm(); // Reset all form fields including center location input
      setShowForm(false);
      console.log('Refreshing regions list...'); // Debug log
      fetchRegions(1, itemsPerPage, searchTerm, stateFilter !== 'all' ? stateFilter : '', cityFilter !== 'all' ? cityFilter : ''); // Refresh the regions list
      fetchRegionStats(); // Refresh the statistics
    } catch (err) {
      console.error('Error creating region:', err);
      setError(err instanceof Error ? err.message : 'Failed to create region');
    }
  };


  // No client-side filtering needed - using server-side filtering

  // Fetch regions and statistics when component mounts
  useEffect(() => {
    console.log('🚀 RegionsPage component mounted');
    console.log('🚀 Checking for admin token...');
    const token = localStorage.getItem('adminToken');
    console.log('🚀 Token exists:', token ? 'Yes' : 'No');
    if (token) {
      console.log('🚀 Token preview:', token.substring(0, 20) + '...');
    }
    fetchRegions(1, itemsPerPage, searchTerm, stateFilter !== 'all' ? stateFilter : '', cityFilter !== 'all' ? cityFilter : '');
    fetchRegionStats();
  }, [fetchRegions, fetchRegionStats, itemsPerPage]);

  // Handle search and filter changes with debouncing
  useEffect(() => {
    // Set searching state when filters change
    setIsSearching(true);
    
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchRegions(1, itemsPerPage, searchTerm, stateFilter !== 'all' ? stateFilter : '', cityFilter !== 'all' ? cityFilter : '');
      setIsSearching(false);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [searchTerm, stateFilter, cityFilter, fetchRegions, itemsPerPage]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRegions(page, itemsPerPage, searchTerm, stateFilter !== 'all' ? stateFilter : '', cityFilter !== 'all' ? cityFilter : '');
  };



  // Format date to "9 July 2025" format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Pagination logic - using server-side pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRegions);




  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">Regions</h1>
              <p className="text-gray-500 mt-1 text-sm">View and manage all regions</p>
            </div>
            <button
              onClick={() => {
                if (showForm) {
                  resetForm(); // Reset form when canceling
                }
                setShowForm(!showForm);
              }}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              {showForm ? 'Cancel' : 'Add Region'}
            </button>
          </div>
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
                placeholder="Search by Region Name, City, State"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* State Filter */}
            <div className="relative">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
              >
                <option value="all">All States</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* City Filter */}
            <div className="relative">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
              >
                <option value="all">All Cities</option>
                <option value="Noida">Noida</option>
                <option value="Agra">Agra</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            </div>
          {(searchTerm || stateFilter !== 'all' || cityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStateFilter('all');
                setCityFilter('all');
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

        {/* Add Region Popup */}
        <Popup
          open={showForm}
          closeOnDocumentClick
          onClose={() => {
            resetForm(); // Reset form when closing popup
            setShowForm(false);
          }}
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
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            margin: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'auto',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none' /* Internet Explorer 10+ */
          } as React.CSSProperties}
        >
          <div className="popup-content p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Region</h3>
              <button
                onClick={() => {
                  resetForm(); // Reset form when closing
                  setShowForm(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* State and City - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* State Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                        <div className="relative">
                          <select
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            required
                          >
                            <option value="">Select State</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                </div>

                {/* City Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                        <div className="relative">
                          <select
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            required
                          >
                            <option value="">Select City</option>
                            <option value="Noida">Noida</option>
                            <option value="Agra">Agra</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                </div>
              </div>

                  {/* Center Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Center Location
                    </label>
                    <div className="relative">
                      {!isLoaded ? (
                        <div className="text-sm text-gray-500">Loading Google Maps...</div>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search center location"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          
                          {/* Custom Dropdown Suggestions */}
                          {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                              {suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-2 mt-0.5">
                                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900">
                                        {suggestion.structured_formatting?.main_text || suggestion.description}
                                      </div>
                                      {suggestion.structured_formatting?.secondary_text && (
                                        <div className="text-xs text-gray-500">
                                          {suggestion.structured_formatting.secondary_text}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Radius Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Radius 
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.radius}
                        onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter radius"
                        min="1"
                        max="1000"
                        required
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">km</span>
                    </div>
                  </div>

              {/* Region Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter region name"
                  required
                />
                </div>
               
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter region description"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Create Region
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm(); // Reset form when canceling
                    setShowForm(false);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Popup>

        {/* Description Popup */}
        <Popup
          open={showDescriptionPopup}
          closeOnDocumentClick
          onClose={() => setShowDescriptionPopup(false)}
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
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            margin: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'auto',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none' /* Internet Explorer 10+ */
          } as React.CSSProperties}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Region Description</h3>
              <button
                onClick={() => setShowDescriptionPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedDescription || 'No description available'}
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDescriptionPopup(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Popup>

        {/* Delete Confirmation Popup */}
        <Popup
          open={showDeleteConfirm}
          closeOnDocumentClick
          onClose={() => {
            setShowDeleteConfirm(false);
            setRegionToDelete(null);
          }}
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
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            margin: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'auto',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none' /* Internet Explorer 10+ */
          } as React.CSSProperties}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Region</h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRegionToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                disabled={deleting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Are you sure?</h4>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  You are about to delete the region <strong>&ldquo;{regionToDelete?.name}&rdquo;</strong> from <strong>{regionToDelete?.city}, {regionToDelete?.state}</strong>.
                </p>
                {regionToDelete?.brokerCount && regionToDelete.brokerCount > 0 && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    ⚠️ This region has {regionToDelete.brokerCount} broker(s) associated with it. Deleting this region may affect broker assignments.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteRegion}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Region</span>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRegionToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Popup>

        {/* Edit Region Popup */}
        <Popup
          open={showEditForm}
          closeOnDocumentClick
          onClose={() => {
            resetEditForm();
            setShowEditForm(false);
          }}
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
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            margin: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'auto',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none' /* Internet Explorer 10+ */
          } as React.CSSProperties}
        >
          <div className="popup-content p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Region</h3>
              <button
                onClick={() => {
                  resetEditForm();
                  setShowEditForm(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                disabled={updating}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">

              {/* State and City - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* State Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                        <div className="relative">
                          <select
                            value={editFormData.state}
                            onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            required
                          >
                            <option value="">Select State</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                </div>

                {/* City Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                        <div className="relative">
                          <select
                            value={editFormData.city}
                            onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            required
                          >
                            <option value="">Select City</option>
                            <option value="Noida">Noida</option>
                            <option value="Agra">Agra</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                </div>
              </div>

                  {/* Center Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Center Location
                    </label>
                    <div className="relative">
                      {!isLoaded ? (
                        <div className="text-sm text-gray-500">Loading Google Maps...</div>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={editInputValue}
                            onChange={handleEditInputChange}
                            onFocus={handleEditInputFocus}
                            onBlur={handleEditInputBlur}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search center location"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          
                          {/* Custom Dropdown Suggestions */}
                          {showEditSuggestions && editSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                              {editSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleEditSuggestionClick(suggestion)}
                                >
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-2 mt-0.5">
                                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900">
                                        {suggestion.structured_formatting?.main_text || suggestion.description}
                                      </div>
                                      {suggestion.structured_formatting?.secondary_text && (
                                        <div className="text-xs text-gray-500">
                                          {suggestion.structured_formatting.secondary_text}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Radius Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Radius 
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={editFormData.radius}
                        onChange={(e) => setEditFormData({ ...editFormData, radius: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter radius"
                        min="1"
                        max="1000"
                        required
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">km</span>
                    </div>
                  </div>

              {/* Region Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter region name"
                  required
                />
                </div>
               
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter region description"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Region</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetEditForm();
                    setShowEditForm(false);
                  }}
                  disabled={updating}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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

        {/* Summary Cards */}
        {loading ? (
          <SummaryCardsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Total Regions Card */}
            <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-600 text-sm font-medium">Total Regions</p>
                  <p className="text-2xl font-bold text-teal-700">{regionStats.totalRegions}</p>
                </div>
                <div className="bg-teal-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Total Brokers Card */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 text-sm font-medium">Total Brokers</p>
                  <p className="text-2xl font-bold text-gray-800">{regionStats.totalBrokers}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Active Cities Card */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 text-sm font-medium">Active Cities</p>
                  <p className="text-2xl font-bold text-gray-800">{regionStats.activeCities}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Active States Card */}
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Active States</p>
                  <p className="text-2xl font-bold text-orange-700">{regionStats.activeStates}</p>
                </div>
                <div className="bg-orange-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Avg Brokers/Region Card */}
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 text-sm font-medium">Avg. Brokers/Region</p>
                  <p className="text-2xl font-bold text-gray-800">{regionStats.avgBrokersPerRegion}</p>
                </div>
                <div className="bg-purple-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regions Table */}
                {loading ? (
          <RegionsTableSkeleton />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {regions.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No regions found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <div>Region</div>
                    <div>Description</div>
                    <div>Center</div>
                    <div>Brokers</div>
                    <div>Action</div>
              </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {regions.map((region, index) => (
                    <div key={region._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        {/* Region Column */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{region.name}</div>
                            <div className="text-gray-500 text-xs">{region.city}, {region.state}</div>
                        </div>
                      </div>
                      
                        {/* Description Column */}
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <div className="text-gray-500 text-xs truncate flex-1" title={region.description || 'No description available'}>
                              {region.description || 'No description available'}
                            </div>
                            {region.description && region.description.length > 30 && (
                              <button
                                onClick={() => handleShowDescription(region.description)}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                                title="View full description"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            )}
                          </div>
                          {/* <div className="font-semibold text-gray-900">{region.city}</div>
                          <div className="text-gray-500 text-xs">{region.state}</div> */}
                        </div>
                      
                        {/* Center Location Column */}
                        <div className="text-sm text-gray-900">
                          <div className="font-semibold text-gray-900 truncate" title={region.centerLocation || 'N/A'}>{region.centerLocation || 'N/A'}</div>
                          <div className="text-gray-500 text-xs">{region.radius}km Radius</div>
                        </div>
                      
                        {/* Stats Column */}
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">{region.brokerCount || 0} Brokers</div>
                          
                        </div>
                       
                        {/* Action Column */}
                        <div className="flex space-x-2">
                          {region.brokerCount === 0 && (
                            <>
                              <button
                                onClick={() => handleEditClick(region)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(region)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
              </>
            )}
          </div>
        )}

        {/* Pagination */}
        {regions.length > 0 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {startIndex + 1} to {endIndex} of {totalRegions} results
                </span>
              </div>
              <ReactPaginate
                pageCount={totalPages}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                onPageChange={({ selected }) => handlePageChange(selected + 1)}
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

      
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
