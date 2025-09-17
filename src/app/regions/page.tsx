'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { regionAPI } from '@/services/api';
import Popup from 'reactjs-popup';
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
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


export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [brokerCounts, setBrokerCounts] = useState<Record<string, number>>({});
  const [loadingBrokerCounts, setLoadingBrokerCounts] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    state: '',
    city: '',
    center: '',
    radius: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyA5Lb-4aPQwchmojJe4IpblpreNOjxHFMc",
    libraries: ['places'] as const,
  });

  // Dropdown options
  const stateOptions = [
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  ];

  const cityOptions = [
    { value: 'Noida', label: 'Noida' },
    { value: 'Agra', label: 'Agra' },
  ];

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

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
      
      setFormData({ name: '', description: '', state: '', city: '', center: '', radius: '' });
      setShowForm(false);
      console.log('Refreshing regions list...'); // Debug log
      fetchRegions(); // Refresh the regions list
    } catch (err) {
      console.error('Error creating region:', err);
      setError(err instanceof Error ? err.message : 'Failed to create region');
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



  // Format date to "9 July 2025" format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };


  // Filter regions based on selected state and city
  const getFilteredRegions = () => {
    return regions.filter(region => {
      const stateMatch = !selectedState || region.state === selectedState;
      const cityMatch = !selectedCity || region.city === selectedCity;
      return stateMatch && cityMatch;
    });
  };

  // Pagination logic for filtered regions
  const getPaginatedRegions = () => {
    const filteredRegions = getFilteredRegions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRegions.slice(startIndex, endIndex);
  };

  const filteredRegions = getFilteredRegions();
  const totalPages = Math.ceil(filteredRegions.length / itemsPerPage);

  // Skeleton loader component for region table rows
  const RegionSkeletonRow = () => (
    <tr className="bg-white border-b border-gray-100">
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex justify-center">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
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

          {/* Filters and Add Region Button - Right side */}
          <div className="flex items-center space-x-4">
            {/* State Filter */}
            <div className="w-48">
              <Select
                options={[{ value: '', label: 'All States' }, ...stateOptions]}
                value={{ value: selectedState, label: selectedState || 'All States' }}
                onChange={(option) => {
                  setSelectedState(option?.value || '');
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                placeholder="Filter by State"
                isSearchable={false}
                isClearable={false}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    minHeight: '40px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    boxShadow: state.isFocused ? '0 0 0 1px rgba(59, 130, 246, 0.5)' : 'none',
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

            {/* City Filter */}
            <div className="w-48">
              <Select
                options={[{ value: '', label: 'All Cities' }, ...cityOptions]}
                value={{ value: selectedCity, label: selectedCity || 'All Cities' }}
                onChange={(option) => {
                  setSelectedCity(option?.value || '');
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                placeholder="Filter by City"
                isSearchable={false}
                isClearable={false}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    minHeight: '40px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    boxShadow: state.isFocused ? '0 0 0 1px rgba(59, 130, 246, 0.5)' : 'none',
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

            {/* Add Region Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {showForm ? 'Cancel' : 'Add Region'}
          </button>
          </div>
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

              {/* State and City - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* State Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Select
                    options={stateOptions}
                    value={stateOptions.find(option => option.value === formData.state)}
                    onChange={(option) => setFormData({ ...formData, state: option?.value || '' })}
                    placeholder="Select State"
                    isSearchable={false}
                    isClearable={false}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: '40px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: state.isFocused ? '0 0 0 1px rgba(59, 130, 246, 0.5)' : 'none',
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

                {/* City Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Select
                    options={cityOptions}
                    value={cityOptions.find(option => option.value === formData.city)}
                    onChange={(option) => setFormData({ ...formData, city: option?.value || '' })}
                    placeholder="Select City"
                    isSearchable={false}
                    isClearable={false}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: '40px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: state.isFocused ? '0 0 0 1px rgba(59, 130, 246, 0.5)' : 'none',
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
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            placeholder="Search center location"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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

        {/* Regions Dashboard - Card Layout */}
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-blue-900 shadow-sm border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Regions</p>
                  <p className="text-3xl font-bold text-blue-800">{regions.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-green-900 shadow-sm border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Brokers</p>
                  <p className="text-3xl font-bold text-green-800">{regions.reduce((sum, region) => sum + (region.brokerCount || 0), 0)}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-purple-900 shadow-sm border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Active Cities</p>
                  <p className="text-3xl font-bold text-purple-800">{new Set(regions.map(r => r.city)).size}</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-orange-900 shadow-sm border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Avg. Brokers/Region</p>
                  <p className="text-3xl font-bold text-orange-800">
                    {regions.length > 0 ? Math.round(regions.reduce((sum, region) => sum + (region.brokerCount || 0), 0) / regions.length) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Regions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="flex space-x-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                  </>
                ) : !Array.isArray(regions) || regions.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No regions found</h3>
                <p className="text-gray-500 text-center max-w-md">Create your first region to get started with managing broker territories and locations.</p>
              </div>
                 ) : filteredRegions.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching regions</h3>
                <p className="text-gray-500 text-center max-w-md">Try adjusting your filter criteria to see more results.</p>
              </div>
            ) : (
              getPaginatedRegions().map((region, index) => {
                const colors = [
                  'from-blue-200 to-blue-300',
                  'from-green-200 to-green-300', 
                  'from-purple-200 to-purple-300',
                  'from-pink-200 to-pink-300',
                  'from-indigo-200 to-indigo-300',
                  'from-orange-200 to-orange-300'
                ];
                const bgColors = [
                  'from-blue-50 to-blue-100',
                  'from-green-50 to-green-100',
                  'from-purple-50 to-purple-100', 
                  'from-pink-50 to-pink-100',
                  'from-indigo-50 to-indigo-100',
                  'from-orange-50 to-orange-100'
                ];
                const colorIndex = index % colors.length;
                
                return (
                  <div key={region._id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Header with gradient */}
                    <div className={`h-2 bg-gradient-to-r ${colors[colorIndex]}`}></div>
                    
                    <div className="p-6">
                      {/* Region Icon and Name */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${bgColors[colorIndex]} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors mb-1">
                            {region.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                           {region.city || 'N/A'}
                            </span>
                            {region.state && (
                              <span className="text-sm text-gray-500">
                                {region.state}
                              </span>
                            )}
                         </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {region.description || 'No description available'}
                        </p>
                      </div>
                      
                      {/* Center Location */}
                      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-500">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{region.centerLocation || 'N/A'}</span>
                      </div>
                      
                      {/* Stats and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 bg-gradient-to-r ${colors[colorIndex]} rounded-full`}></div>
                            <span className="text-sm font-medium text-gray-700">
                              {region.brokerCount || 0} Brokers
                            </span>
                         </div>
                          <div className="text-sm text-gray-500">
                            {region.radius}km radius
                          </div>
                        </div>
                       
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              console.log('Edit region:', region._id);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit Region"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              console.log('Delete region:', region._id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Region"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && filteredRegions.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-200">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRegions.length)} of {filteredRegions.length} regions
                    </p>
                    {regions.length !== filteredRegions.length && (
                      <p className="text-gray-500 text-xs">Filtered from {regions.length} total regions</p>
                    )}
                  </div>
                </div>
              </div>
              <ReactPaginate
                pageCount={totalPages}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                onPageChange={({ selected }) => setCurrentPage(selected + 1)}
                forcePage={currentPage - 1}
                previousLabel={
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </div>
                }
                nextLabel={
                  <div className="flex items-center space-x-2">
                    <span>Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                }
                breakLabel="..."
                containerClassName="flex items-center space-x-2"
                pageClassName="px-4 py-2 text-sm font-medium rounded-xl cursor-pointer text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 border border-gray-200"
                activeClassName="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300"
                previousClassName="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-blue-100 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
                nextClassName="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-blue-100 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
                breakClassName="px-4 py-2 text-sm font-medium text-gray-400"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          </div>
        )}

      
      </div>
    </Layout>
  );
}
