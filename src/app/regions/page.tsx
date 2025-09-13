'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { regionAPI, brokerAPI } from '@/services/api';
import Popup from 'reactjs-popup';
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import { useJsApiLoader } from '@react-google-maps/api';

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
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    state: '',
    city: '',
    center: '',
    radius: ''
  });
  const [statusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyA5Lb-4aPQwchmojJe4IpblpreNOjxHFMc",
    libraries: ['places'] as const,
  });

  // Dropdown options
  const stateOptions = [
    { value: 'up', label: 'Uttar Pradesh' },
  ];

  const cityOptions = [
    { value: 'noida', label: 'Noida' },
    { value: 'agra', label: 'Agra' },
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

  // Fetch brokers by region
  const fetchBrokersByRegion = async (regionId: string) => {
    try {
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
    }
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

              
              {/* UP Dropdown and Noida/Agra Dropdown - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* State Dropdown (UP Dropdown) */}
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

              {/* Center Location and Radius - Side by Side */}
              <div>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
               
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
                  getPaginatedRegions().map((region) => (
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
