'use client';

import { useCallback, useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { leadsAPI, regionAPI } from '@/services/api';

// Types
type Region = {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
};

type Lead = {
  id: string | number;
  name: string;
  contact: string;
  phone: string;
  requirement: string;
  propertyType: string;
  budget: string;
  region: string;
  brokerName: string;
  sharedWith: string;
  status: string;
  source: string;
  createdAt: string;
};

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const [viewSlideIn, setViewSlideIn] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [brokerDropdownOpen, setBrokerDropdownOpen] = useState(false);
  const [brokerSearch, setBrokerSearch] = useState('');
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);

  // API data states
  const [leadsStats, setLeadsStats] = useState({
    totalLeads: 0,
    newLeadsToday: 0,
    convertedLeads: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Leads data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Regions data states
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const [regionsError, setRegionsError] = useState<string | null>(null);

  // Dynamic options from leads data
  const [uniqueRequirements, setUniqueRequirements] = useState<string[]>([]);
  const [uniquePropertyTypes, setUniquePropertyTypes] = useState<string[]>([]);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  // Removed unused statusesError to satisfy linter

  // Advanced Filters state
  const [filterRegion, setFilterRegion] = useState('');
  const [filterRequirement, setFilterRequirement] = useState('');
  const [filterPropertyType, setFilterPropertyType] = useState('');
  const [filterMaxBudget, setFilterMaxBudget] = useState(500000);
  const [isFilterApplied, setIsFilterApplied] = useState(false);


  useEffect(() => {
    if (isViewOpen) {
      const t = setTimeout(() => setViewSlideIn(true), 10);
      return () => clearTimeout(t);
    } else {
      setViewSlideIn(false);
    }
  }, [isViewOpen]);

  // Fetch leads metrics on component mount
  useEffect(() => {
    const fetchLeadsMetrics = async () => {
      try {
        setIsLoadingStats(true);
        setStatsError(null);
        const response = await leadsAPI.getMetrics();
        
        // Map API response to our stats format
        // Assuming the API returns data in a specific format
        // Adjust the mapping based on actual API response structure
        setLeadsStats({
          totalLeads: response.data?.totalLeads || response.totalLeads || 0,
          newLeadsToday: response.data?.newLeadsToday || response.newLeadsToday || 0,
          convertedLeads: response.data?.convertedLeads || response.convertedLeads || 0
        });
      } catch (error) {
        console.error('Error fetching leads metrics:', error);
        setStatsError(error instanceof Error ? error.message : 'Failed to fetch leads metrics');
        // Keep default values on error
        setLeadsStats({
          totalLeads: 0,
          newLeadsToday: 0,
          convertedLeads: 0
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchLeadsMetrics();
  }, []);

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoadingRegions(true);
        setRegionsError(null);
        
        const response = await regionAPI.getRegions();
        
        // Map API response to our regions format
        const regionsData = response.data?.regions || response.regions || response.data || [];
        
        const mappedRegions = regionsData.map((region: {
          _id?: string; id?: string; name?: string; regionName?: string; city?: string; state?: string; description?: string;
        }) => ({
          id: region._id || region.id,
          name: region.name || region.regionName || 'Unknown Region',
          city: region.city || 'Unknown City',
          state: region.state || 'Unknown State',
          description: region.description || ''
        }));
        
        setRegions(mappedRegions);
      } catch (error) {
        setRegionsError(error instanceof Error ? error.message : 'Failed to fetch regions');
        
        // Fallback to static regions if API fails
        const fallbackRegions = [
          { id: '1', name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', description: 'Financial capital of India' },
          { id: '2', name: 'Delhi', city: 'Delhi', state: 'Delhi', description: 'Capital of India' },
          { id: '3', name: 'Bangalore', city: 'Bangalore', state: 'Karnataka', description: 'IT hub of India' },
          { id: '4', name: 'Pune', city: 'Pune', state: 'Maharashtra', description: 'Educational hub' },
          { id: '5', name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', description: 'Pearl city' },
          { id: '6', name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', description: 'Gateway to South India' }
        ];
        setRegions(fallbackRegions);
    } finally {
        setIsLoadingRegions(false);
    }
  };

    fetchRegions();
  }, []);

  // Extract unique statuses from leads data
  useEffect(() => {
    if (leads.length > 0) {
      // Extract unique statuses from leads data
      const statuses = [...new Set(leads.map(lead => lead.status).filter(Boolean))];
      setUniqueStatuses(statuses);
      setIsLoadingStatuses(false);
    } else {
      // If no leads data, use fallback statuses
      setUniqueStatuses(['New', 'Contacted', 'Qualified', 'Converted', 'Closed', 'Lost']);
      setIsLoadingStatuses(false);
    }
  }, [leads]);

  // Extract unique requirements and property types from leads data
  useEffect(() => {
    if (leads.length > 0) {
      // Extract unique requirements
      const requirements = [...new Set(leads.map(lead => lead.requirement).filter(Boolean))];
      setUniqueRequirements(requirements);
      
      // Extract unique property types
      const propertyTypes = [...new Set(leads.map(lead => lead.propertyType || '').filter(Boolean))];
      setUniquePropertyTypes(propertyTypes);
    } else {
      // If no leads data, use fallback data for dropdowns
      setUniqueRequirements(['Buy', 'Rent', 'All Requirements']);
      setUniquePropertyTypes(['Residential', 'Commercial']);
    }
  }, [leads]);

  // Fetch leads data
  const fetchLeads = useCallback(async () => {
    try {
      setIsLoadingLeads(true);
      setLeadsError(null);
      
      // Check if token exists before making API call
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await leadsAPI.getLeads(currentPage, 12, searchTerm, statusFilter);
      
      // Map API response to our leads format
      const leadsData = response.data?.items || response.data?.leads || response.leads || response.data || [];
      
      const mappedLeads: Lead[] = leadsData.map((lead: {
        _id?: string; id?: string; customerName?: string; name?: string; customerEmail?: string; email?: string; contact?: string;
        customerPhone?: string; phone?: string; contactNumber?: string; requirement?: string; propertyType?: string; budget?: number; price?: number;
        primaryRegion?: string | { name?: string }; region?: { name?: string }; city?: string; location?: { city?: string };
        createdBy?: { name?: string }; brokerName?: string; broker?: { name?: string }; sharedWith?: string; assignedTo?: string; status?: string;
        source?: string; createdAt?: string;
      }, index: number) => ({
        id: lead._id || lead.id || index + 1,
        name: lead.customerName || lead.name || 'Unknown',
        contact: lead.customerEmail || lead.email || lead.contact || 'No email',
        phone: lead.customerPhone || lead.phone || lead.contactNumber || '+91 00000 00000',
        requirement: lead.requirement || 'Not specified',
        propertyType: lead.propertyType || '',
        budget: lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}` : lead.price ? `₹${lead.price.toLocaleString('en-IN')}` : 'Not specified',
        region: typeof lead.primaryRegion === 'string' ? lead.primaryRegion : lead.primaryRegion?.name || lead.region?.name || lead.city || lead.location?.city || 'Not specified',
        brokerName: lead.createdBy?.name || lead.brokerName || lead.broker?.name || 'Unknown Broker',
        sharedWith: lead.createdBy?.name || lead.sharedWith || lead.assignedTo || 'Me',
        status: lead.status || '',
        source: lead.source || 'Website',
        createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      
      setLeads(mappedLeads);
      setTotalPages(response.data?.totalPages || response.totalPages || 1);
      setTotalLeads(response.data?.total || response.data?.totalLeads || response.totalLeads || mappedLeads.length);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leads';
      setLeadsError(errorMessage);
      
      // Fallback to static data if API fails
      const fallbackLeads = [
        {
          id: 1,
          name: "Rajesh Kumar",
          contact: "rajesh.kumar@email.com",
          phone: "+91 98765 43210",
          requirement: "3 BHK Apartment",
          propertyType: "Residential",
          budget: "₹50-60 Lakhs",
          region: "Mumbai",
          brokerName: "Amit Singh",
          sharedWith: "Amit Singh",
          status: "new",
          source: "Website",
          createdAt: "2024-01-15"
        },
        {
          id: 2,
          name: "Priya Sharma",
          contact: "priya.sharma@email.com",
          phone: "+91 87654 32109",
          requirement: "2 BHK Villa",
          propertyType: "Residential",
          budget: "₹80-90 Lakhs",
          region: "Delhi",
          brokerName: "Suresh Patel",
          sharedWith: "Suresh Patel",
          status: "contacted",
          source: "Referral",
          createdAt: "2024-01-14"
        },
        {
          id: 3,
          name: "Vikram Singh",
          contact: "vikram.singh@email.com",
          phone: "+91 76543 21098",
          requirement: "Commercial Office",
          propertyType: "Commercial",
          budget: "₹2-3 Crores",
          region: "Bangalore",
          brokerName: "Me",
          sharedWith: "Me",
          status: "qualified",
          source: "Advertisement",
          createdAt: "2024-01-13"
        },
        {
          id: 4,
          name: "Anita Patel",
          contact: "anita.patel@email.com",
          phone: "+91 98765 12345",
          requirement: "Buy",
          propertyType: "Residential",
          budget: "₹1.5 Crores",
          region: "Pune",
          brokerName: "Ravi Kumar",
          sharedWith: "Ravi Kumar",
          status: "closed",
          source: "Website",
          createdAt: "2024-01-12"
        }
      ];
      setLeads(fallbackLeads);
      setTotalPages(1);
      setTotalLeads(fallbackLeads.length);
    } finally {
      setIsLoadingLeads(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  // Fetch leads when component mounts or filters change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);


  const closeView = () => {
    setViewSlideIn(false);
    setTimeout(() => {
      setIsViewOpen(false);
    }, 300);
  };
  // Removed unused FAQ state and toggler to satisfy linter

  // Hardcoded/Static data - No API calls (leads data now comes from API)

  // Mock brokers list for transfer dropdown
  const allBrokers = [
    'shivi (Agra)',
    'Unnamed',
    'Dghgdddd (Agra)',
    'Vishsisj (Agra)',
    'Amit Singh (Mumbai)',
    'Suresh Patel (Delhi)',
    'Neha Gupta (Bangalore)',
    'Kumar Raj (Chennai)',
    'Ravi Kumar (Pune)'
  ];
  const filteredBrokers = allBrokers.filter(b => b.toLowerCase().includes(brokerSearch.toLowerCase()));
  const isAllFilteredSelected = filteredBrokers.length > 0 && filteredBrokers.every(b => selectedBrokers.includes(b));
  const toggleBroker = (name: string) => {
    setSelectedBrokers(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };
  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedBrokers(prev => prev.filter(n => !filteredBrokers.includes(n)));
    } else {
      setSelectedBrokers(prev => Array.from(new Set([...prev, ...filteredBrokers])));
    }
  };

  // Apply Advanced Filters
  const applyFilters = () => {
    setIsFilterApplied(true);
    setIsFiltersOpen(false);
  };

  // Clear Advanced Filters
  const clearFilters = () => {
    setFilterRegion('');
    setFilterRequirement('');
    setFilterPropertyType('');
    setFilterMaxBudget(500000);
    setIsFilterApplied(false);
    setIsFiltersOpen(false);
  };

  // Filter leads based on active tab, status filter, and advanced filters
  const filteredLeads = leads.filter(lead => {
    // Status filtering (client-side fallback if API doesn't handle it properly)
    if (statusFilter !== 'all' && statusFilter !== '') {
      const leadStatus = lead.status || '';
      const filterStatus = statusFilter;
      
      // Exact match (case sensitive)
      if (leadStatus !== filterStatus) {
        return false;
      }
    }
    
    // Advanced Filters (only apply if filters are applied)
    if (isFilterApplied) {
      // Region filter
      if (filterRegion && filterRegion !== 'All Regions') {
        const leadRegion = lead.region?.toLowerCase() || '';
        const selectedRegion = regions.find(r => r.id === filterRegion);
        if (selectedRegion && !leadRegion.includes(selectedRegion.name.toLowerCase())) {
          return false;
        }
      }
      
      // Requirement filter
      if (filterRequirement && filterRequirement !== 'All Requirements') {
        const leadRequirement = lead.requirement?.toLowerCase() || '';
        if (leadRequirement !== filterRequirement.toLowerCase()) {
          return false;
        }
      }
      
      // Property Type filter
      if (filterPropertyType && filterPropertyType !== 'All Property Types') {
        const leadPropertyType = lead.propertyType?.toLowerCase() || '';
        if (leadPropertyType !== filterPropertyType.toLowerCase()) {
          return false;
        }
      }
      
      // Budget filter
      if (filterMaxBudget < 20000000) { // Only apply if not max value
        const leadBudget = lead.budget || 'Not specified';
        if (leadBudget !== 'Not specified') {
          // Extract numeric value from budget string (e.g., "₹50,000" -> 50000)
          const budgetMatch = leadBudget.match(/₹?([\d,]+)/);
          if (budgetMatch) {
            const budgetValue = parseInt(budgetMatch[1].replace(/,/g, ''));
            if (budgetValue > filterMaxBudget) {
              return false;
            }
          }
        }
      }
    }
    
    // For now, show all leads regardless of tab since we don't have proper sharedWith logic
    // TODO: Implement proper lead ownership/sharing logic based on your business requirements
    return true;
  });


  // Visual styles per status for the new card design
  const statusStyles: Record<string, { header: string; pill: string; pillText: string; glow: string; triangle: string }> = {
    new: {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-teal-100',
      pillText: 'text-teal-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(13,148,136,0.6)]',
      triangle: 'border-b-teal-400'
    },
    contacted: {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-emerald-100',
      pillText: 'text-emerald-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.55)]',
      triangle: 'border-b-emerald-400'
    },
    qualified: {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-green-100',
      pillText: 'text-green-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(34,197,94,0.55)]',
      triangle: 'border-b-green-400'
    },
    converted: {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-amber-100',
      pillText: 'text-amber-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(245,158,11,0.55)]',
      triangle: 'border-b-amber-400'
    },
    lost: {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-rose-100',
      pillText: 'text-rose-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(244,63,94,0.4)]',
      triangle: 'border-b-rose-400'
    },
    closed: {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-gray-100',
      pillText: 'text-gray-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(107,114,128,0.4)]',
      triangle: 'border-b-gray-400'
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="space-y-6">
              {/* Page Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads & Visitors</h1>
                    <p className="text-gray-500 mt-1 text-sm">Track and manage your sales pipeline effectively.</p>
                  </div>
                  
                  {/* Toggle Buttons removed by request */}
                </div>
              </div>

              {/* Search and Filters - Under title/description */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                {/* Search Bar (left) */}
                <div className="relative  w-[500px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                     className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Right side controls: status + Advanced Filters */}
                <div className="flex items-center gap-3 sm:ml-4">
                {/* Status Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
                  >
                    <option value="all">All Status</option>
                    {isLoadingStatuses ? (
                      <option disabled>Loading statuses...</option>
                    ) : uniqueStatuses.length > 0 ? (
                      uniqueStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))
                    ) : (
                      <>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Closed">Closed</option>
                    <option value="Lost">Lost</option>
                      </>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                  {/* Advanced Filters button */}
                  <button onClick={() => setIsFiltersOpen(true)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isFilterApplied 
                      ? 'text-white bg-teal-600 border border-teal-600 hover:bg-teal-700' 
                      : 'text-teal-600 bg-white border border-teal-600 hover:bg-teal-50'
                  }`}>
                    Advanced Filters {isFilterApplied && '✓'}
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Total Leads Card */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 border-l-4 border-l-blue-500">
                  <div className="text-left">
                    {isLoadingStats ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    ) : statsError ? (
                      <div>
                        <p className="text-3xl font-bold text-red-500">--</p>
                        <p className="text-gray-600 text-sm font-medium mb-2">Total Leads</p>
                        <p className="text-xs text-red-500">Error loading data</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-gray-900">{leadsStats.totalLeads}</p>
                        <p className="text-gray-600 text-sm font-medium mb-2">Total Leads</p>
                      </>
                    )}
                  </div>
                </div>

                {/* New Leads Today Card */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 border-l-4 border-l-orange-500">
                  <div className="text-left">
                    {isLoadingStats ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    ) : statsError ? (
                      <div>
                        <p className="text-3xl font-bold text-red-500">--</p>
                        <p className="text-gray-600 text-sm font-medium mb-2">New Leads Today</p>
                        <p className="text-xs text-red-500">Error loading data</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-gray-900">{leadsStats.newLeadsToday}</p>
                        <p className="text-gray-600 text-sm font-medium mb-2">New Leads Today</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Converted Leads Card */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 border-l-4 border-l-green-500">
                  <div className="text-left">
                    {isLoadingStats ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    ) : statsError ? (
                      <div>
                        <p className="text-3xl font-bold text-red-500">--</p>
                        <p className="text-gray-600 text-sm font-medium mb-2">Converted Leads</p>
                        <p className="text-xs text-red-500">Error loading data</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-gray-900">{leadsStats.convertedLeads}</p>
                        <p className="text-gray-600 text-sm font-medium mb-2">Converted Leads</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              

           
          
            

          
              {/* Leads Cards */}
              <div className="bg-transparent">
                {isLoadingLeads ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="relative rounded-xl bg-white shadow-md animate-pulse">
                        <div className="px-5 pt-5">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                            <div className="min-w-0 flex-1">
                              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                          </div>
                        </div>
                        <div className="px-5 pt-4 pb-4">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                              <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                              <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                            <div>
                              <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div>
                              <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                              <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </div>
                            <div className="col-span-2 h-px bg-gray-100"></div>
                            <div>
                              <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div>
                              <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                              <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : leadsError ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-red-300 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-lg font-medium text-red-500">Error loading leads</p>
                    <p className="text-sm text-red-400">{leadsError}</p>
                    <button 
                      onClick={fetchLeads}
                      className="mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-500">
                      {isFilterApplied ? 'No leads match your filters' : 'No leads found'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {isFilterApplied 
                        ? 'Try adjusting your filter criteria or clear filters to see all leads' 
                        : 'Try adjusting your search or filter criteria'
                      }
                    </p>
                    {isFilterApplied && (
                      <button 
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`relative rounded-xl bg-white   shadow-md hover:shadow-lg transition-shadow ${statusStyles[lead.status]?.glow || ''}`}
                      >
                        {/* Status Ribbon - gradient horizontal with folded corner */}
                        <div className="absolute top-0 right-0 z-10">
                          <div
                            className="text-white text-[10px] font-bold px-3.5 py-1.5 relative"
                            style={{
                              background:
                                lead.status?.toLowerCase() === 'new'
                                  ? 'linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)'
                                  : lead.status?.toLowerCase() === 'contacted'
                                  ? 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)'
                                  : lead.status?.toLowerCase() === 'qualified'
                                  ? 'linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)'
                                  : lead.status?.toLowerCase() === 'converted'
                                  ? 'linear-gradient(90deg, #10b981 0%, #047857 100%)'
                                  : lead.status?.toLowerCase() === 'lost'
                                  ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                                  : 'linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)',
                              minWidth: '60px',
                              textAlign: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
                              letterSpacing: '0.04em',
                              borderTopLeftRadius: '6px',
                              borderBottomLeftRadius: '6px'
                            }}
                          >
                            {(lead.status || 'new').toUpperCase()}
                          </div>
                        </div>

                        {/* Header */}
                        <div className="px-5 pt-5">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mr-3">
                              <span className="text-sm font-semibold text-gray-900">
                                {lead.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{lead.name}</h3>
                              <p className="text-xs text-gray-500 truncate">{lead.contact}</p>
                            </div>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="px-5 pt-4 pb-4">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs">
                            <div>
                              <div className="text-[10px] tracking-wide text-gray-500 uppercase">Broker Name</div>
                              <div className="mt-0.5 text-gray-900 text-sm">{lead.brokerName}</div>
                          </div>
                            <div>
                              <div className="text-[10px] tracking-wide text-gray-500 uppercase">Requirement</div>
                              <div className="mt-0.5 text-gray-900 text-sm">{lead.requirement}</div>
                          </div>
                            <div>
                              <div className="text-[10px] tracking-wide text-gray-500 uppercase">Property Type</div>
                              <div className="mt-0.5 text-gray-900 text-sm">{lead.propertyType || 'Residential'}</div>
                          </div>

                            <div className="col-span-2 h-px bg-gray-100" />

                            <div>
                              <div className="text-[10px] tracking-wide text-gray-500 uppercase">Budget</div>
                              <div className="mt-0.5 text-gray-900 text-sm">{lead.budget}</div>
                          </div>
                            <div>
                              <div className="text-[10px] tracking-wide text-gray-500 uppercase">Region(s)</div>
                              <div className="mt-0.5 text-gray-900 text-sm">{lead.region}</div>
                          </div>

                            <div className="col-span-2 h-px bg-gray-100" />

                            <div className="col-span-2">
                              <div className="text-[10px] tracking-wide text-gray-500 uppercase">Shared With</div>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                  <img
                                    className="w-7 h-7 rounded-full ring-2 ring-white bg-gray-200 object-cover"
                                    src="https://www.w3schools.com/howto/img_avatar.png"
                                    alt={lead.sharedWith}
                                    title={lead.sharedWith}
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="w-7 h-7 rounded-full ring-2 ring-white bg-yellow-400 text-black flex items-center justify-center text-[11px] font-semibold" title={'+1 more'}>
                                    +1
                          </div>
                        </div>
                                <div className="flex items-center gap-6">
                                  <button onClick={() => { setSelectedLead(lead); setIsViewOpen(true); }} className="group flex flex-col items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                                    <span>View</span>
                            </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Footer removed since actions moved next to Shared With */}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination - Below Table */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                  Showing {filteredLeads.length} of {totalLeads} leads • Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoadingLeads}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-white bg-teal-600 border border-teal-600 rounded-md hover:bg-teal-700">
                      {currentPage}
                    </button>
                    <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoadingLeads}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
            </div>
          </div>

          {/* Sidebar */}
       
              </div>

        {/* Add New Lead Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[99999]">
            {/* Backdrop */}
            <div onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40" />
            {/* Dialog */}
            <div className="absolute inset-0 flex items-start sm:items-center justify-center p-4 sm:p-6">
              <div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-xl bg-white shadow-2xl border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Add New Lead</h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Hook API here later
                      setIsAddModalOpen(false);
                  }}
                >
                  <div className="px-5 py-4 space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
                        <input required placeholder="Enter customer's full name" className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                        <input inputMode="tel" placeholder="Enter 10-digit phone number" className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                  </div>
                  <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
                        <input type="email" placeholder="e.g., john.doe@example.com" className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                  </div>
                </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Requirement</label>
                        <div className="relative">
                          <select className="w-full appearance-none px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8">
                            <option>All Requirements</option>
                            {uniqueRequirements.length > 0 ? (
                              uniqueRequirements.map((requirement) => (
                                <option key={requirement} value={requirement}>
                                  {requirement}
                                </option>
                              ))
                            ) : (
                              <>
                                <option>Buy</option>
                                <option>Rent</option>
                                <option>All Requirements</option>
                              </>
                            )}
                          </select>
                          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                        </div>
                  </div>
                  <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Property Type</label>
                        <div className="relative">
                          <select className="w-full appearance-none px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8">
                            <option>All Property Types</option>
                            {uniquePropertyTypes.length > 0 ? (
                              uniquePropertyTypes.map((propertyType) => (
                                <option key={propertyType} value={propertyType}>
                                  {propertyType}
                                </option>
                              ))
                            ) : (
                              <>
                            <option>Apartment</option>
                            <option>Villa</option>
                            <option>Plot</option>
                            <option>Office</option>
                              </>
                            )}
                          </select>
                          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                  </div>
                </div>

                    {/* Row 4 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Budget</label>
                      <input placeholder="e.g., 500000" className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                    </div>

                    {/* Row 5 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Primary Region *</label>
                        <div className="relative">
                          <select required className="w-full appearance-none px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8">
                            <option value="">Select..</option>
                            {isLoadingRegions ? (
                              <option disabled>Loading regions...</option>
                            ) : regionsError ? (
                              <option disabled>Error loading regions</option>
                            ) : (
                              regions.map((region) => (
                                <option key={region.id} value={region.id}>
                                  {region.name} - {region.city}, {region.state}
                                </option>
                              ))
                            )}
                          </select>
                          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                        </div>
                  </div>
                  <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Optional Region</label>
                        <div className="relative">
                          <select className="w-full appearance-none px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8">
                            <option value="">Select..</option>
                            {isLoadingRegions ? (
                              <option disabled>Loading regions...</option>
                            ) : regionsError ? (
                              <option disabled>Error loading regions</option>
                            ) : (
                              regions.map((region) => (
                                <option key={region.id} value={region.id}>
                                  {region.name} - {region.city}, {region.state}
                                </option>
                              ))
                            )}
                          </select>
                          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                  </div>
                </div>
              </div>
            </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-teal-600 rounded-md hover:bg-teal-700">
                      Add Lead
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filters Modal */}
        {isFiltersOpen && (
          <div className="fixed inset-0 z-[99998]">
            {/* Backdrop */}
            <div onClick={() => setIsFiltersOpen(false)} className="absolute inset-0 bg-black/40" />
            {/* Dialog */}
            <div className="absolute inset-0 flex items-start sm:items-center justify-center p-4 sm:p-6">
              <div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-xl bg-white shadow-2xl border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Advanced Filters</h2>
                  <button onClick={() => setIsFiltersOpen(false)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyFilters();
                  }}
                >
                  <div className="px-5 py-4 space-y-4">
                    {/* Region */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
                      <div className="relative">
                        <select 
                          value={filterRegion}
                          onChange={(e) => setFilterRegion(e.target.value)}
                          className="w-full appearance-none px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8"
                        >
                          <option value="">All Regions</option>
                          {isLoadingRegions ? (
                            <option disabled>Loading regions...</option>
                          ) : regionsError ? (
                            <option disabled>Error loading regions</option>
                          ) : (
                            regions.map((region) => (
                              <option key={region.id} value={region.id}>
                                {region.name} - {region.city}, {region.state}
                              </option>
                            ))
                          )}
                        </select>
                        <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      </div>
                    </div>

                    {/* Requirement */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Requirement</label>
                      <div className="relative">
                        <select 
                          value={filterRequirement}
                          onChange={(e) => setFilterRequirement(e.target.value)}
                          className="w-full appearance-none px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8"
                        >
                          <option value="">All Requirements</option>
                          {uniqueRequirements.length > 0 ? (
                            uniqueRequirements.map((requirement) => (
                              <option key={requirement} value={requirement}>
                                {requirement}
                              </option>
                            ))
                          ) : (
                            <>
                              <option>Buy</option>
                              <option>Rent</option>
                          <option>All Requirements</option>
                            </>
                          )}
                        </select>
                        <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    </div>
                </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Property Type</label>
                      <div className="relative">
                        <select 
                          value={filterPropertyType}
                          onChange={(e) => setFilterPropertyType(e.target.value)}
                          className="w-full appearance-none px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8"
                        >
                          <option value="">All Property Types</option>
                          {uniquePropertyTypes.length > 0 ? (
                            uniquePropertyTypes.map((propertyType) => (
                              <option key={propertyType} value={propertyType}>
                                {propertyType}
                              </option>
                            ))
                          ) : (
                            <>
                          <option>Apartment</option>
                          <option>Villa</option>
                          <option>Plot</option>
                          <option>Office</option>
                            </>
                          )}
                        </select>
                        <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      </div>
                    </div>

                    {/* Max Budget */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-700">Max Budget</label>
                        <div className="text-xs font-semibold text-teal-600">₹{filterMaxBudget.toLocaleString('en-IN')}</div>
                      </div>
                      <input
                        type="range"
                        min={50000}
                        max={20000000}
                        step={50000}
                        value={filterMaxBudget}
                        onChange={(e) => setFilterMaxBudget(Number(e.target.value))}
                        className="w-full accent-teal-600"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
                    <button 
                      type="button" 
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-emerald-600 rounded-md hover:bg-emerald-700">
                      Apply Filters
                    </button>
                </div>
                </form>
              </div>
            </div>
              </div>
        )}

        {/* Lead Details Drawer */}
        {isViewOpen && selectedLead && (
          <div className="fixed inset-0 z-[99997]">
            {/* Backdrop with fade */}
            <div onClick={closeView} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${viewSlideIn ? 'opacity-100' : 'opacity-0'}`} />
            {/* Right-side drawer */}
            <div className={`fixed right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ${viewSlideIn ? 'translate-x-0' : 'translate-x-full'}`}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-900">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-base sm:text-lg font-semibold">Lead Details</h2>
                </div>
                <button onClick={closeView} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="h-[calc(100%-57px)] overflow-y-auto">
                  {/* Summary Card */}
                  <div className="px-5 pt-4">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-semibold text-teal-700">
                            {selectedLead.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{selectedLead.name}</div>
                          <div className="text-xs text-gray-500">{selectedLead.phone}</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5">
                        {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="px-5 py-4">
                    <div className="rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                          <h3 className="text-sm font-semibold text-gray-900">Customer Information</h3>
                        </div>
                        
                      </div>

                      <div className="divide-y divide-gray-100">
                          <>
                            <div className="flex items-center justify-between px-4 py-2">
                              <div className="text-xs text-gray-600">Status:</div>
                              <div className="text-xs"><span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5">{selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}</span></div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2">
                              <div className="text-xs text-gray-600">Name:</div>
                              <div className="text-sm text-gray-900">{selectedLead.name}</div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2">
                              <div className="text-xs text-gray-600">Phone:</div>
                              <div className="text-sm text-gray-900">{selectedLead.phone}</div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2">
                              <div className="text-xs text-gray-600">Email:</div>
                              <div className="text-sm text-gray-900">{selectedLead.contact}</div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2">
                              <div className="text-xs text-gray-600">Requirement:</div>
                              <div className="text-sm text-gray-900">{selectedLead.requirement}</div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2">
                              <div className="text-xs text-gray-600">Property Type:</div>
                              <div className="text-sm text-gray-900">{selectedLead.propertyType || 'Residential'}</div>
                            </div>
                            <div className="px-4 py-2">
                              <div className="text-xs text-gray-600">Primary Region:</div>
                              <div className="text-sm text-gray-900">{selectedLead.region}</div>
                            </div>
                            <div className="px-4 py-2">
                              <div className="text-xs text-gray-600">Secondary Region:</div>
                              <div className="text-sm text-gray-900">{selectedLead.region}</div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2">
                              <div className="text-xs text-gray-600">Budget:</div>
                              <div className="text-sm text-gray-900">{selectedLead.budget}</div>
                            </div>
                          </>
                      </div>
                    </div>
                  </div>

                  {/* Share History */}
                  <div className="px-5 pb-5">
                    <div className="rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v5" />
                    </svg>
                        <h3 className="text-sm font-semibold text-gray-900">Share History</h3>
                      </div>
                      <div className="px-4 py-3 text-sm text-gray-600">Not shared yet.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Lead Modal */}
        {isTransferOpen && selectedLead && (
          <div className="fixed inset-0 z-[99996]">
            {/* Backdrop */}
            <div onClick={() => setIsTransferOpen(false)} className="absolute inset-0 bg-black/40" />
            {/* Dialog */}
            <div className="absolute inset-0 flex items-start sm:items-center justify-center p-4 sm:p-6">
              <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Transfer Lead</h2>
                  <button onClick={() => setIsTransferOpen(false)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  </button>
                </div>

                {/* Body */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Hook API: send transfer request with form data
                      setIsTransferOpen(false);
                  }}
                >
                  <div className="px-5 py-4 space-y-4">
                    {/* Brokers - Searchable Multi-Select Dropdown */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Select Broker(s)</label>
                      <button
                        type="button"
                        onClick={() => setBrokerDropdownOpen(o => !o)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${brokerDropdownOpen ? 'border-teal-500' : 'border-gray-300'}`}
                      >
                        <span className={`truncate ${selectedBrokers.length ? 'text-gray-900' : 'text-gray-400'}`}>
                          {selectedBrokers.length ? `${selectedBrokers.length} selected` : 'Choose brokers...'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>

                      {brokerDropdownOpen && (
                        <div className="absolute z-10 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                          {/* Search */}
                          <div className="p-2 border-b border-gray-100">
                            <input
                              autoFocus
                              value={brokerSearch}
                              onChange={(e) => setBrokerSearch(e.target.value)}
                              placeholder="Search brokers..."
                              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>

                          {/* Header row with select all */}
                          <div className="flex items-center justify-between text-[11px] text-gray-600 px-3 py-2">
                            <span>Filtered brokers</span>
                            <button type="button" onClick={toggleSelectAllFiltered} className="text-teal-600 hover:text-teal-700">{isAllFilteredSelected ? 'Unselect all' : 'Select all'}</button>
                          </div>

                          {/* List */}
                          <div className="max-h-56 overflow-auto">
                            {filteredBrokers.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-gray-500">No results</div>
                            ) : (
                              filteredBrokers.map(name => (
                                <label key={name} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    checked={selectedBrokers.includes(name)}
                                    onChange={() => toggleBroker(name)}
                                  />
                                  <span className="text-gray-800">{name}</span>
                                </label>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Transfer Notes (Optional)</label>
                      <textarea rows={4} placeholder="Add any specific instructions or context..." className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setIsTransferOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-700 border border-emerald-700 rounded-md hover:bg-emerald-800">Send Transfer Request</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
