'use client';
/* eslint-disable @next/next/no-img-element */

import { Suspense } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { leadsAPI, regionAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

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
  _id?: string; // Store original MongoDB _id for API calls
  name: string;
  contact: string;
  phone: string;
  requirement: string;
  propertyType: string;
  budget: string;
  region: string;
  secondaryRegion?: string;
  brokerName: string;
  brokerId?: string;
  sharedWith: string; // comma-joined for quick display/fallback
  sharedWithList?: string[]; // normalized list of names
  sharedWithImages?: string[]; // profile images for shared with users
  status: string;
  source: string;
  createdAt: string;
  // Optional verification status from API
  verificationStatus?: "Verified" | "Unverified";
};

// API types to avoid 'any' usage
type BrokerRef = {
  _id?: string;
  firmName?: string;
  brokerImage?: string | null;
  email?: string;
  name?: string;
  phone?: string;
};

type TransferRecord = {
  fromBroker?: BrokerRef | string;
  toBroker?: BrokerRef | string;
  _id?: string;
};

type ApiLead = {
  _id?: string; id?: string; customerName?: string; name?: string; customerEmail?: string; email?: string; contact?: string;
  customerPhone?: string; phone?: string; contactNumber?: string; requirement?: string; propertyType?: string; budget?: number; price?: number;
  primaryRegion?: string | { name?: string }; region?: { name?: string }; city?: string; location?: { city?: string };
  secondaryRegion?: string | { name?: string }; optionalRegion?: string | { name?: string };
  region2?: string | { name?: string };
  secondaryCity?: string;
  createdBy?: { name?: string } | BrokerRef; brokerName?: string; broker?: { name?: string } | BrokerRef;
  sharedWith?: string | Array<string | { name?: string }>;
  assignedTo?: string;
  collaborators?: Array<string | { name?: string }>;
  transfers?: TransferRecord[];
  status?: string;
  source?: string; createdAt?: string;
  verificationStatus?: "Verified" | "Unverified";
};

function LeadsPageContent() {
  const DEFAULT_AVATAR = 'https://www.w3schools.com/howto/img_avatar.png';
  const pageSize = 9;
  const searchParams = useSearchParams();
  const brokerId = searchParams.get('brokerId');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterBroker, setFilterBroker] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  
  const [viewSlideIn, setViewSlideIn] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'overview' | 'share'>('overview');
  const [brokerDropdownOpen, setBrokerDropdownOpen] = useState(false);
  const [brokerSearch, setBrokerSearch] = useState('');
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
  
  // Verification status states
  const [verificationStatus, setVerificationStatus] = useState<Record<string, 'verified' | 'unverified'>>({});
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);
  const [showUnverifyConfirm, setShowUnverifyConfirm] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadName, setSelectedLeadName] = useState<string>('');

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
  // Global option caches to avoid dropdowns shrinking when API returns filtered data
  const [allRequirements, setAllRequirements] = useState<string[]>([]);
  const [allPropertyTypes, setAllPropertyTypes] = useState<string[]>([]);
  // Static status options - matching API requirements
  const uniqueStatuses = ['New', 'Assigned', 'In Progress', 'Closed', 'Rejected'];

  // Advanced Filters state
  const [filterRegion, setFilterRegion] = useState('');
  const [filterRequirement, setFilterRequirement] = useState('');
  const [filterPropertyType, setFilterPropertyType] = useState('');
  const [filterMaxBudget, setFilterMaxBudget] = useState(500000);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  // Snapshot of filters actually applied to API (prevents calls on every keystroke)
  const [appliedFilters, setAppliedFilters] = useState<{
    region?: string;
    requirement?: string;
    propertyType?: string;
    maxBudget?: number;
  } | undefined>(undefined);


  useEffect(() => {
    if (isViewOpen) {
      const t = setTimeout(() => setViewSlideIn(true), 10);
      return () => clearTimeout(t);
    } else {
      setViewSlideIn(false);
    }
  }, [isViewOpen]);

  // Debounce search term to limit API calls while typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 800);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // When the debounced search term changes, reset to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // When broker filter changes, reset to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [filterBroker]);

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

  // Fetch brokers on component mount
  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setIsLoadingBrokers(true);
        setBrokersError(null);
        
        // Check if token exists before making API call
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }
        
        const response = await fetch('https://broker-adda-be.algofolks.com/api/brokers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Map API response to broker names array
        const brokersData = data.data?.brokers || data.brokers || data.data || [];
        
        const brokerData = brokersData.map((broker: {
          _id?: string; id?: string; name?: string; brokerName?: string; firmName?: string;
        }) => ({
          id: broker._id || broker.id || '',
          name: broker.name || broker.brokerName || broker.firmName || 'Unknown Broker'
        })).filter((broker: {id: string, name: string}) => broker.id && broker.name);
        
        // Remove duplicates based on ID and sort alphabetically by name
        const brokerMap = new Map<string, {id: string, name: string}>();
        brokerData.forEach((broker: {id: string, name: string}) => {
          brokerMap.set(broker.id, broker);
        });
        const uniqueBrokers = Array.from(brokerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        
        setAllBrokers(uniqueBrokers);
      } catch (error) {
        setBrokersError(error instanceof Error ? error.message : 'Failed to fetch brokers');
        
        // Fallback to static brokers if API fails
        const fallbackBrokers = [
          { id: '1', name: 'Amit Singh' },
          { id: '2', name: 'Suresh Patel' },
          { id: '3', name: 'Neha Gupta' },
          { id: '4', name: 'Kumar Raj' },
          { id: '5', name: 'Ravi Kumar' },
          { id: '6', name: 'Priya Sharma' },
          { id: '7', name: 'Rajesh Verma' },
          { id: '8', name: 'Sunita Reddy' },
          { id: '9', name: 'Vikram Joshi' },
          { id: '10', name: 'Anita Desai' }
        ];
        setAllBrokers(fallbackBrokers);
      } finally {
        setIsLoadingBrokers(false);
      }
    };

    fetchBrokers();
  }, []);


  // Extract unique requirements and property types from leads data
  useEffect(() => {
    if (leads.length > 0) {
      // Extract unique requirements
      const requirements = [...new Set(leads.map(lead => lead.requirement).filter(Boolean))];
      setUniqueRequirements(requirements);
      
      // Extract unique property types
      const propertyTypes = [...new Set(leads.map(lead => lead.propertyType || '').filter(Boolean))];
      setUniquePropertyTypes(propertyTypes);
      // Update global caches (accumulate to preserve full option set across filtered fetches)
      setAllRequirements(prev => Array.from(new Set([...(prev || []), ...requirements])));
      setAllPropertyTypes(prev => Array.from(new Set([...(prev || []), ...propertyTypes])));
    } else {
      // If no leads data, use fallback data for dropdowns (match design)
      setUniqueRequirements(['Buy', 'Rent', 'Sell']);
      setUniquePropertyTypes(['Residential', 'Commercial', 'Plot', 'Other']);
      setAllRequirements(prev => (prev && prev.length > 0) ? prev : ['Buy', 'Rent', 'Sell']);
      setAllPropertyTypes(prev => (prev && prev.length > 0) ? prev : ['Residential', 'Commercial', 'Plot', 'Other']);
    }
  }, [leads]);

  // Fetch leads data (uses snapshot in appliedFilters)
 const fetchLeads = useCallback(async () => {
  try {
    setIsLoadingLeads(true);
    setLeadsError(null);

    // Check if token exists before making API call
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    // ✅ Get brokerId from URL (using useSearchParams hook)
    // brokerId is already available from the component state

    // Use only applied filters snapshot for API calls
    const apiFilters = isFilterApplied ? appliedFilters : undefined;

    console.log('📡 Making API call with:', {
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
      apiFilters,
      isFilterApplied,
      brokerId, // ✅ Added for debugging
    });

    // Always include region and broker from main controls
    const regionFilterObj = filterRegion ? { region: filterRegion } : undefined;
    const brokerFilterObj = filterBroker ? { broker: filterBroker } : undefined;

    // ✅ Include brokerId from URL if present
    const brokerIdFilterObj = brokerId ? { broker: brokerId } : undefined;

    const mergedFilters = {
      ...(apiFilters || {}),
      ...(regionFilterObj || {}),
      ...(brokerFilterObj || {}),
      ...(brokerIdFilterObj || {}), // ✅ merged broker filter
    };

    const response = await leadsAPI.getLeads(
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
      mergedFilters
    );

    // Map API response to our leads format
    const leadsData =
      response.data?.items ||
      response.data?.leads ||
      response.leads ||
      response.data ||
      [];

    console.log('📊 API Response Summary:', {
      success: response.success,
      message: response.message,
      itemsCount: response.data?.items?.length || 0,
      total: response.data?.total || 0,
      page: response.data?.page || 1,
      totalPages: response.data?.totalPages || 0,
    });

    // If no leads data from API, set empty array instead of fallback
    if (!leadsData || !Array.isArray(leadsData) || leadsData.length === 0) {
      console.log('No leads data found, setting empty array');
      setLeads([]);
      setTotalLeads(0);
      setTotalPages(1);
      return;
    }

    const mappedLeads: Lead[] = (leadsData as ApiLead[]).map((lead: ApiLead, index: number) => {
      // Extract verification status from various possible field names
      const verificationStatus = lead.verificationStatus || 
        (lead as unknown as Record<string, unknown>)?.['verificationStatus'] ||
        (lead as unknown as Record<string, unknown>)?.['verification'] ||
        undefined;

      console.log('🔍 Mapping lead:', {
        leadId: lead._id || lead.id,
        name: lead.customerName || lead.name,
        verificationStatusFromAPI: lead.verificationStatus,
        extractedVerificationStatus: verificationStatus,
        fullLeadKeys: Object.keys(lead),
      });

      return {
        id: lead._id || lead.id || index + 1,
        _id: lead._id, // Store original MongoDB _id for API calls
        name: lead.customerName || lead.name || 'Unknown',
        contact: lead.customerEmail || lead.email || lead.contact || 'No email',
        phone: lead.customerPhone || lead.phone || lead.contactNumber || '+91 00000 00000',
        requirement: lead.requirement || 'Not specified',
        propertyType: lead.propertyType || '',
        budget:
          lead.budget !== undefined && lead.budget !== null
            ? `$${lead.budget.toLocaleString('en-US')}`
            : lead.price !== undefined && lead.price !== null
            ? `$${lead.price.toLocaleString('en-US')}`
            : 'Not specified',
        region:
          typeof lead.primaryRegion === 'string'
            ? lead.primaryRegion
            : (lead.primaryRegion as { name?: string } | undefined)?.name ||
              (typeof lead.region === 'string'
                ? lead.region
                : (lead.region as { name?: string } | undefined)?.name) ||
              lead.city ||
              lead.location?.city ||
              'Not specified',
        secondaryRegion:
          (typeof lead.secondaryRegion === 'string'
            ? lead.secondaryRegion
            : (lead.secondaryRegion as { name?: string } | undefined)?.name) ||
          (typeof lead.optionalRegion === 'string'
            ? lead.optionalRegion
            : (lead.optionalRegion as { name?: string } | undefined)?.name) ||
          (typeof lead.region2 === 'string'
            ? lead.region2
            : (lead.region2 as { name?: string } | undefined)?.name) ||
          lead.secondaryCity ||
          undefined,
        brokerName: lead.createdBy?.name || lead.brokerName || lead.broker?.name || 'Unknown Broker',
        sharedWith:
          Array.isArray(lead.transfers) && lead.transfers.length > 0
            ? lead.transfers
                .map((t) =>
                  typeof t?.toBroker === 'string' ? t.toBroker : t?.toBroker?.name || ''
                )
                .filter(Boolean)
                .join(', ')
            : Array.isArray(lead.sharedWith)
            ? lead.sharedWith
                .map((u) => (typeof u === 'string' ? u : u?.name || ''))
                .filter(Boolean)
                .join(', ')
            : typeof lead.sharedWith === 'string'
            ? (lead.sharedWith as string)
            : Array.isArray(lead.collaborators)
            ? lead.collaborators
                .map((u) => (typeof u === 'string' ? u : u?.name || ''))
                .filter(Boolean)
                .join(', ')
            : '',
        sharedWithList:
          Array.isArray(lead.transfers) && lead.transfers.length > 0
            ? lead.transfers
                .map((t) =>
                  typeof t?.toBroker === 'string' ? t.toBroker : t?.toBroker?.name || ''
                )
                .filter(Boolean)
            : Array.isArray(lead.sharedWith)
            ? lead.sharedWith
                .map((u) => (typeof u === 'string' ? u : u?.name || ''))
                .filter(Boolean)
            : typeof lead.sharedWith === 'string'
            ? (lead.sharedWith as string)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : Array.isArray(lead.collaborators)
            ? lead.collaborators
                .map((u) => (typeof u === 'string' ? u : u?.name || ''))
                .filter(Boolean)
            : [],
        sharedWithImages:
          Array.isArray(lead.transfers) && lead.transfers.length > 0
            ? lead.transfers
                .map((t) =>
                  typeof t?.toBroker === 'object' &&
                  t?.toBroker &&
                  'brokerImage' in t.toBroker
                    ? (t.toBroker as BrokerRef).brokerImage
                    : null
                )
                .filter((img): img is string => Boolean(img))
            : Array.isArray(lead.sharedWith)
            ? lead.sharedWith
                .map((u) =>
                  typeof u === 'object' && u && 'brokerImage' in u
                    ? (u as BrokerRef).brokerImage
                    : null
                )
                .filter((img): img is string => Boolean(img))
            : Array.isArray(lead.collaborators)
            ? lead.collaborators
                .map((u) =>
                  typeof u === 'object' && u && 'brokerImage' in u
                    ? (u as BrokerRef).brokerImage
                    : null
                )
                .filter((img): img is string => Boolean(img))
            : [],
        status: lead.status || '',
        source: lead.source || 'Website',
        createdAt: lead.createdAt
          ? new Date(lead.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        verificationStatus: verificationStatus as "Verified" | "Unverified" | undefined,
      };
    });

    // ✅ Extra filter safeguard — if brokerId is in query, filter locally too
    const filteredLeads = brokerId
      ? mappedLeads.filter((lead) => lead.brokerId === brokerId || lead.brokerName)
      : mappedLeads;

    setLeads(filteredLeads);

    // Initialize verification status from API response if available
    // IMPORTANT: Preserve existing verification status from state if API doesn't return it
    setVerificationStatus(prev => {
      const verificationStatusMap: Record<string, 'verified' | 'unverified'> = {};
      
      mappedLeads.forEach((lead: Lead) => {
        // Use both _id and id as keys to ensure we can find it either way
        const leadId = String(lead.id);
        const leadMongoId = lead._id ? String(lead._id) : null;
        
        // Priority 1: Check if API response has verificationStatus
        if (lead.verificationStatus) {
          const status = lead.verificationStatus.toLowerCase() as 'verified' | 'unverified';
          verificationStatusMap[leadId] = status;
          if (leadMongoId && leadMongoId !== leadId) {
            verificationStatusMap[leadMongoId] = status; // Also store by MongoDB _id
          }
          console.log(`✅ API returned verificationStatus for lead ${leadId} (${leadMongoId || 'no _id'}):`, status);
        } else {
          // Priority 2: If API doesn't have it, preserve existing state if available
          const existingStatusById = prev[leadId];
          const existingStatusByMongoId = leadMongoId ? prev[leadMongoId] : undefined;
          const existingStatus = existingStatusById || existingStatusByMongoId;
          
          if (existingStatus) {
            verificationStatusMap[leadId] = existingStatus;
            if (leadMongoId && leadMongoId !== leadId) {
              verificationStatusMap[leadMongoId] = existingStatus;
            }
            console.log(`✅ Preserved existing verificationStatus for lead ${leadId} (${leadMongoId || 'no _id'}):`, existingStatus);
          } else {
            console.log(`⚠️ No verificationStatus found in API or state for lead ${leadId} (${leadMongoId || 'no _id'}), defaulting to unverified`);
            // Don't set anything - let getVerificationStatus handle default
          }
        }
      });
      
      // Merge: API values override, existing state is preserved for IDs not in current response
      const merged = { ...prev, ...verificationStatusMap };
      console.log('✅ Verification status map updated (preserving existing state):', merged);
      return merged;
    });

    // Refresh global caches
    try {
      const batchRequirements = Array.from(new Set(mappedLeads.map((l) => l.requirement).filter(Boolean)));
      const batchPropertyTypes = Array.from(new Set(mappedLeads.map((l) => l.propertyType || '').filter(Boolean)));
      setAllRequirements((prev) => Array.from(new Set([...(prev || []), ...batchRequirements])));
      setAllPropertyTypes((prev) => Array.from(new Set([...(prev || []), ...batchPropertyTypes])));
    } catch {}

    const apiTotal = response.data?.total || response.data?.totalLeads || response.totalLeads;
    const apiTotalPages = response.data?.totalPages || response.totalPages;
    const computedTotal =
      typeof apiTotal === 'number' ? apiTotal : filteredLeads.length;
    const computedPages =
      typeof apiTotalPages === 'number'
        ? apiTotalPages
        : Math.max(1, Math.ceil(computedTotal / pageSize));

    setTotalLeads(computedTotal);
    setTotalPages(computedPages);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leads';
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      setLeadsError('Data not found');
      setLeads([]);
      setTotalPages(1);
      setTotalLeads(0);
    } else {
      setLeadsError(errorMessage);
      setLeads([]);
      setTotalPages(1);
      setTotalLeads(0);
    }
  } finally {
    setIsLoadingLeads(false);
  }
}, [
  currentPage,
  debouncedSearchTerm,
  statusFilter,
  isFilterApplied,
  appliedFilters,
  pageSize,
  filterRegion,
  filterBroker,
  brokerId,
]);

  // Reset to page 1 when brokerId changes
  useEffect(() => {
    setCurrentPage(1);
  }, [brokerId]);

  // Fetch leads when key inputs change (debounced)
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, brokerId]);


  const closeView = () => {
    setViewSlideIn(false);
    setTimeout(() => {
      setIsViewOpen(false);
    }, 300);
  };
  
  // Get verification status for a lead (from API or local state - defaults to unverified)
  const getVerificationStatus = (leadId: string | number): 'verified' | 'unverified' => {
    const stateKey = String(leadId);
    
    // First check local state (updated from API or previous actions)
    if (verificationStatus[stateKey]) {
      console.log(`✅ Verification status from state for ${stateKey}:`, verificationStatus[stateKey]);
      return verificationStatus[stateKey];
    }
    
    // Fallback: check lead object from API response (by id or _id)
    const lead = leads.find(l => String(l.id) === stateKey || (l._id && String(l._id) === stateKey));
    if (lead?.verificationStatus) {
      const status = lead.verificationStatus.toLowerCase() as 'verified' | 'unverified';
      const leadMongoId = lead._id ? String(lead._id) : String(lead.id);
      console.log(`✅ Verification status from lead object for ${stateKey}:`, status);
      // Update local state for future use (by both id and _id if different)
      setVerificationStatus(prev => ({
        ...prev,
        [stateKey]: status,
        [leadMongoId]: status
      }));
      return status;
    }
    
    // Also check by MongoDB _id if different from stateKey
    if (lead?._id && String(lead._id) !== stateKey && verificationStatus[String(lead._id)]) {
      return verificationStatus[String(lead._id)];
    }
    
    // Default to unverified
    console.log(`⚠️ No verification status found for ${stateKey}, defaulting to unverified`);
    return 'unverified';
  };

  // Handle verify confirmation
  const handleVerifyClick = (leadId: string | number, leadName: string) => {
    setSelectedLeadId(String(leadId));
    setSelectedLeadName(leadName);
    setShowVerifyConfirm(true);
  };

  // Handle unverify confirmation
  const handleUnverifyClick = (leadId: string | number, leadName: string) => {
    setSelectedLeadId(String(leadId));
    setSelectedLeadName(leadName);
    setShowUnverifyConfirm(true);
  };

  // Handle verification
  const handleVerify = async () => {
    if (!selectedLeadId) return;
    
    try {
      console.log('✅ Verifying lead with ID:', selectedLeadId);
      console.log('✅ Full lead object:', leads.find(l => String(l._id || l.id) === selectedLeadId));
      
      const response = await leadsAPI.updateLeadVerification(selectedLeadId, 'Verified');
      console.log('✅ Verify API response:', JSON.stringify(response, null, 2));
      
      // Extract lead _id and verificationStatus from response
      const updatedLead = response?.data?.lead || response?.data;
      const updatedLeadId = updatedLead?._id || updatedLead?.id || selectedLeadId;
      const updatedVerificationStatus = updatedLead?.verificationStatus || 'Verified';
      
      console.log('✅ Extracted from response:', {
        updatedLeadId,
        updatedVerificationStatus,
        fullResponse: response
      });
      
      // Update local state immediately using both the _id and the id we used for API call
      const statusToSet = updatedVerificationStatus.toLowerCase() as 'verified' | 'unverified';
      
      setVerificationStatus(prev => {
        const updated = {
          ...prev,
          [String(updatedLeadId)]: statusToSet,
          [selectedLeadId]: statusToSet
        };
        console.log('✅ Updated verification status map:', updated);
        return updated;
      });
      
      // Update the lead in the leads array directly
      setLeads(prevLeads => prevLeads.map(lead => {
        const leadIdStr = String(lead._id || lead.id);
        if (leadIdStr === String(updatedLeadId) || leadIdStr === selectedLeadId) {
          console.log('✅ Updating lead in array:', leadIdStr);
          return {
            ...lead,
            verificationStatus: updatedVerificationStatus as 'Verified' | 'Unverified'
          };
        }
        return lead;
      }));
      
      // Wait a bit before refreshing to ensure database is updated
      setTimeout(async () => {
        await fetchLeads();
      }, 500);
      
      toast.success('Lead verified successfully');
      
      // Close confirmation dialog
      setShowVerifyConfirm(false);
      setSelectedLeadId(null);
      setSelectedLeadName('');
    } catch (err) {
      console.error('❌ Verify error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify lead';
      toast.error(errorMessage);
      
      // Don't close dialog on error so user can retry
    }
  };

  // Handle unverification
  const handleUnverify = async () => {
    if (!selectedLeadId) return;
    
    try {
      console.log('✅ Unverifying lead with ID:', selectedLeadId);
      console.log('✅ Full lead object:', leads.find(l => String(l._id || l.id) === selectedLeadId));
      
      const response = await leadsAPI.updateLeadVerification(selectedLeadId, 'Unverified');
      console.log('✅ Unverify API response:', JSON.stringify(response, null, 2));
      
      // Extract lead _id and verificationStatus from response
      const updatedLead = response?.data?.lead || response?.data;
      const updatedLeadId = updatedLead?._id || updatedLead?.id || selectedLeadId;
      const updatedVerificationStatus = updatedLead?.verificationStatus || 'Unverified';
      
      console.log('✅ Extracted from response:', {
        updatedLeadId,
        updatedVerificationStatus,
        fullResponse: response
      });
      
      // Update local state immediately using both the _id and the id we used for API call
      const statusToSet = updatedVerificationStatus.toLowerCase() as 'verified' | 'unverified';
      
      setVerificationStatus(prev => {
        const updated = {
          ...prev,
          [String(updatedLeadId)]: statusToSet,
          [selectedLeadId]: statusToSet
        };
        console.log('✅ Updated verification status map:', updated);
        return updated;
      });
      
      // Update the lead in the leads array directly
      setLeads(prevLeads => prevLeads.map(lead => {
        const leadIdStr = String(lead._id || lead.id);
        if (leadIdStr === String(updatedLeadId) || leadIdStr === selectedLeadId) {
          console.log('✅ Updating lead in array:', leadIdStr);
          return {
            ...lead,
            verificationStatus: updatedVerificationStatus as 'Verified' | 'Unverified'
          };
        }
        return lead;
      }));
      
      // Wait a bit before refreshing to ensure database is updated
      setTimeout(async () => {
        await fetchLeads();
      }, 500);
      
      toast.success('Lead unverified successfully');
      
      // Close confirmation dialog
      setShowUnverifyConfirm(false);
      setSelectedLeadId(null);
      setSelectedLeadName('');
    } catch (err) {
      console.error('❌ Unverify error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to unverify lead';
      toast.error(errorMessage);
      
      // Don't close dialog on error so user can retry
    }
  };
  
  // Removed unused FAQ state and toggler to satisfy linter

  // Hardcoded/Static data - No API calls (leads data now comes from API)

  // Brokers data states
  const [allBrokers, setAllBrokers] = useState<{id: string, name: string}[]>([]);
  const [isLoadingBrokers, setIsLoadingBrokers] = useState(true);
  const [brokersError, setBrokersError] = useState<string | null>(null);
  const filteredBrokers = allBrokers.filter(b => b.name.toLowerCase().includes(brokerSearch.toLowerCase()));
  const isAllFilteredSelected = filteredBrokers.length > 0 && filteredBrokers.every(b => selectedBrokers.includes(b.id));
  const toggleBroker = (brokerId: string) => {
    setSelectedBrokers(prev => prev.includes(brokerId) ? prev.filter(id => id !== brokerId) : [...prev, brokerId]);
  };
  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedBrokers(prev => prev.filter(id => !filteredBrokers.map(b => b.id).includes(id)));
    } else {
      setSelectedBrokers(prev => Array.from(new Set([...prev, ...filteredBrokers.map(b => b.id)])));
    }
  };

  // Apply Advanced Filters
  const applyFilters = async () => {
    console.log('🔍 Applying filters:', {
      filterRequirement,
      filterPropertyType,
      filterMaxBudget
    });
    
    // Check if any filter is selected (region handled in main controls)
    const hasFilters = filterRequirement || filterPropertyType || filterMaxBudget !== 500000;
    
    if (!hasFilters) {
      console.log('⚠️ No filters selected, clearing filters instead');
      await clearFilters();
      return;
    }
    
    console.log('✅ Filters selected, applying filters...');
    // snapshot currently selected filters
    const snapshot = {
      requirement: filterRequirement || undefined,
      propertyType: filterPropertyType || undefined,
      maxBudget: filterMaxBudget !== 500000 ? filterMaxBudget : undefined,
    };
    
    console.log('📸 Filter snapshot:', snapshot);
    setAppliedFilters(snapshot);
    setIsFilterApplied(true);
    setIsFiltersOpen(false);
    
    // Trigger API call with filters
    console.log('🚀 Triggering API call with filters...');
    await fetchLeads();
  };

  // Clear Advanced Filters
  const clearFilters = async () => {
    console.log('🧹 Clearing all filters...');
    setFilterRegion('');
    setFilterBroker('');
    setFilterRequirement('');
    setFilterPropertyType('');
    setFilterMaxBudget(500000);
    setIsFilterApplied(false);
    setAppliedFilters(undefined);
    setIsFiltersOpen(false);
    
    // Trigger API call without filters
    console.log('🚀 Triggering API call without filters...');
    await fetchLeads();
  };

  // Apply client-side filtering as fallback when server-side filtering doesn't work properly
  const filteredLeads = leads.filter((lead) => {
    // If no filters are applied, show all leads
    if (!isFilterApplied && !filterBroker) {
      return true;
    }

    // Use the applied snapshot to ensure strict matching
    const active = appliedFilters || {};

    console.log('🔍 Filtering lead:', {
      leadName: lead.name,
      leadRegion: lead.region,
      leadBroker: lead.brokerName,
      leadRequirement: lead.requirement,
      leadPropertyType: lead.propertyType,
      leadBudget: lead.budget,
      filters: active,
      filterBroker
    });

    // Check if any filters are selected
    const hasRegionFilter = Boolean(active.region && String(active.region).trim() !== '');
    const hasBrokerFilter = Boolean(filterBroker && String(filterBroker).trim() !== '');
    const hasRequirementFilter = Boolean(active.requirement && String(active.requirement).trim() !== '');
    const hasPropertyTypeFilter = Boolean(active.propertyType && String(active.propertyType).trim() !== '');
    const hasBudgetFilter = typeof active.maxBudget === 'number';

    console.log('🎯 Filter Status:', {
      hasRegionFilter,
      hasBrokerFilter,
      hasRequirementFilter,
      hasPropertyTypeFilter,
      hasBudgetFilter
    });

    // Apply region filter - MUST match if selected
    if (hasRegionFilter) {
      const selectedRegion = regions.find(r => r.id === active.region);
      const regionName = selectedRegion?.name;
      if (regionName) {
        // Check both primary and secondary regions
        const primaryMatches = (lead.region || '').toLowerCase() === regionName.toLowerCase();
        const secondaryMatches = lead.secondaryRegion && (lead.secondaryRegion || '').toLowerCase() === regionName.toLowerCase();
        
        if (!primaryMatches && !secondaryMatches) {
          console.log('❌ Region filter failed:', { 
            leadRegion: lead.region, 
            leadSecondaryRegion: lead.secondaryRegion,
            expectedRegion: regionName 
          });
          return false;
        }
      }
    }

    // Apply broker filter - MUST match if selected
    if (hasBrokerFilter) {
      // Find the selected broker name from the broker ID
      const selectedBroker = allBrokers.find(b => b.id === filterBroker);
      const expectedBrokerName = selectedBroker?.name;
      
      if (expectedBrokerName && lead.brokerName !== expectedBrokerName) {
        console.log('❌ Broker filter failed:', { 
          leadBroker: lead.brokerName, 
          expectedBroker: expectedBrokerName,
          filterBrokerId: filterBroker 
        });
        return false;
      }
    }

    // Apply requirement filter - MUST match if selected
    if (hasRequirementFilter && lead.requirement !== active.requirement) {
      console.log('❌ Requirement filter failed:', { leadRequirement: lead.requirement, expectedRequirement: filterRequirement });
      return false;
    }

    // Apply property type filter - MUST match if selected
    if (hasPropertyTypeFilter && lead.propertyType !== active.propertyType) {
      console.log('❌ Property type filter failed:', { leadPropertyType: lead.propertyType, expectedPropertyType: filterPropertyType });
      return false;
    }

    // Apply budget filter - MUST be within budget if selected
    if (hasBudgetFilter && typeof active.maxBudget === 'number') {
      // Extract numeric value from budget string (e.g., "$50,000" -> 50000)
      const budgetValue = lead.budget.replace(/[$₹,]/g, '');
      const numericBudget = parseInt(budgetValue) || 0;
      if (numericBudget > active.maxBudget) {
        console.log('❌ Budget filter failed:', { leadBudget: numericBudget, maxBudget: active.maxBudget });
        return false;
      }
    }

    console.log('✅ Lead passed all filters');
    return true;
  });

  // Calculate pagination for filtered results
  // If no filters are applied, use API results directly (server-side pagination)
  // If filters are applied, use client-side filtered results
  const shouldUseServerSidePagination = !isFilterApplied && !filterBroker;
  
  const filteredLeadsForPagination = shouldUseServerSidePagination ? leads : filteredLeads;
  const totalFilteredLeads = shouldUseServerSidePagination ? totalLeads : filteredLeadsForPagination.length;
  const totalFilteredPages = shouldUseServerSidePagination ? totalPages : Math.max(1, Math.ceil(totalFilteredLeads / pageSize));
  
  // Get current page data for filtered results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFilteredLeads = shouldUseServerSidePagination ? leads : filteredLeadsForPagination.slice(startIndex, endIndex);

  console.log('📊 Filter Results:', {
    totalLeads: leads.length,
    filteredLeads: filteredLeads.length,
    totalFilteredLeads,
    totalFilteredPages,
    currentPage,
    shouldUseServerSidePagination,
    isFilterApplied,
    appliedFilters,
    filters: {
      filterRegion,
      filterBroker,
      filterRequirement,
      filterPropertyType,
      filterMaxBudget
    }
  });


  // Visual styles per status for the new card design
  // Sanitize dropdown option lists to remove placeholder values coming from API
  const sanitizedRequirements = Array.from(new Set(
    ((allRequirements && allRequirements.length > 0) ? allRequirements : uniqueRequirements)
      .map((r) => (r || '').trim())
      .filter((r) => r && !/^(select requirement|all requirements?)$/i.test(r))
  ));
  const sanitizedPropertyTypes = Array.from(new Set(
    ((allPropertyTypes && allPropertyTypes.length > 0) ? allPropertyTypes : uniquePropertyTypes)
      .map((p) => (p || '').trim())
      .filter((p) => p && !/^(all property types?)$/i.test(p))
  ));

  const statusStyles: Record<string, { header: string; pill: string; pillText: string; glow: string; triangle: string }> = {
    'New': {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-teal-100',
      pillText: 'text-teal-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(13,148,136,0.6)]',
      triangle: 'border-b-teal-400'
    },
    'Assigned': {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-emerald-100',
      pillText: 'text-emerald-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.55)]',
      triangle: 'border-b-emerald-400'
    },
    'In Progress': {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-blue-100',
      pillText: 'text-blue-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(59,130,246,0.55)]',
      triangle: 'border-b-blue-400'
    },
    'Closed': {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-green-100',
      pillText: 'text-green-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(34,197,94,0.55)]',
      triangle: 'border-b-green-400'
    },
    'Rejected': {
      header: 'from-slate-900 to-slate-800',
      pill: 'bg-rose-100',
      pillText: 'text-rose-700',
      glow: 'shadow-[0_10px_30px_-10px_rgba(244,63,94,0.4)]',
      triangle: 'border-b-rose-400'
    }
  };

  // Drawer status pill styles: light bg + dark text per status
  const drawerStatusPills: Record<string, string> = {
    'New': 'bg-amber-100 text-amber-800',
    'Assigned': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-violet-100 text-violet-800',
    'Closed': 'bg-emerald-100 text-emerald-800',
    'Rejected': 'bg-rose-100 text-rose-800'
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
                    {brokerId ? (
                      <p className="text-gray-500 mt-1 text-sm">Viewing leads for selected broker</p>
                    ) : (
                      <p className="text-gray-500 mt-1 text-sm">Track and manage your sales pipeline effectively.</p>
                    )}
                  </div>
                  {/* {brokerId && (
                    <Link 
                      href="/leads"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to All Leads
                    </Link>
                  )} */}
                  
                  {/* Toggle Buttons removed by request */}
                </div>
              </div>

              {/* Search and Filters - Under title/description */}
              {!brokerId && (
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

                {/* Right side controls: region + status + Advanced Filters */}
                <div className="flex items-center gap-3 sm:ml-4">
                {/* Region Dropdown (moved from Advanced Filters) */}
                <div className="relative">
                  <select
                    value={filterRegion}
                    onChange={async (e) => {
                      const value = e.target.value;
                      setFilterRegion(value);
                      setCurrentPage(1);
                      await fetchLeads();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
                  >
                    <option value="">All Regions</option>
                    {isLoadingRegions ? (
                      <option disabled>Loading regions...</option>
                    ) : regionsError ? (
                      <option disabled>Error loading regions</option>
                    ) : (
                      regions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))
                    )}
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
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Broker Filter Dropdown */}
                <div className="relative">
                  <select
                    value={filterBroker}
                    onChange={(e) => setFilterBroker(e.target.value)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
                  >
                    <option value="">All Brokers</option>
                    {isLoadingBrokers ? (
                      <option disabled>Loading brokers...</option>
                    ) : brokersError ? (
                      <option disabled>Error loading brokers</option>
                    ) : (
                      allBrokers.map((broker) => (
                        <option key={broker.id} value={broker.id}>
                          {broker.name}
                        </option>
                      ))
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

                  {/* Clear Filters button - show when region, broker, or advanced filters are active */}
                  {(isFilterApplied || Boolean(filterRegion) || Boolean(filterBroker)) && (
                    <button 
                      onClick={clearFilters}
                      className="inline-flex cursor-pointer items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filters</span>
                    </button>
                  )}
                </div>
              </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                {/* Total Leads */}
                <div className="relative rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                  <div>
                    {isLoadingStats ? (
                      <div className="animate-pulse">
                        <div className="h-7 bg-blue-100 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-blue-100 rounded w-28"></div>
                      </div>
                    ) : statsError ? (
                      <>
                        <div className="text-2xl font-bold text-gray-900">--</div>
                        <div className="text-[12px] font-medium text-gray-500 mt-1">Total Leads</div>
                        <div className="text-[11px] text-red-500 mt-1">Error loading data</div>
                      </>
                    ) : (
                      <>
                        <div className="text-[12px] font-semibold text-blue-700">Total Leads</div>
                        <div className="mt-1 flex justify-between gap-2">
                          <div className="text-2xl font-extrabold text-blue-700">{leadsStats.totalLeads}</div>
                          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600  ">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-4a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* New Leads Today */}
                <div className="relative rounded-xl border border-green-200 bg-green-50/40 p-4">
                  <div>
                    {isLoadingStats ? (
                      <div className="animate-pulse">
                        <div className="h-7 bg-green-100 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-green-100 rounded w-28"></div>
                      </div>
                    ) : statsError ? (
                      <>
                        <div className="text-2xl font-bold text-gray-900">--</div>
                        <div className="text-[12px] font-medium text-gray-500 mt-1">New Leads Today</div>
                        <div className="text-[11px] text-red-500 mt-1">Error loading data</div>
                      </>
                    ) : (
                      <>
                        <div className="text-[12px] font-semibold text-green-700">New Leads Today</div>
                        <div className="mt-1 flex justify-between gap-2">
                          <div className="text-2xl font-extrabold text-green-700">{leadsStats.newLeadsToday}</div>
                          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 ">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Converted Leads */}
                {/* <div className="relative rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      {isLoadingStats ? (
                        <div className="animate-pulse">
                          <div className="h-7 bg-rose-100 rounded w-16 mb-2"></div>
                          <div className="h-3 bg-rose-100 rounded w-28"></div>
                        </div>
                      ) : statsError ? (
                        <>
                          <div className="text-2xl font-bold text-gray-900">--</div>
                          <div className="text-[12px] font-medium text-gray-500 mt-1">Converted Leads</div>
                          <div className="text-[11px] text-red-500 mt-1">Error loading data</div>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-extrabold text-gray-900">{leadsStats.convertedLeads}</div>
                          <div className="text-[12px] font-semibold text-rose-700 mt-1">Converted Leads</div>
                        </>
                      )}
                    </div>
                    <div className="shrink-0">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-600 border border-rose-200">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"/></svg>
                      </div>
                    </div>
                  </div>
                </div> */}
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
                    {leadsError === 'Data not found' ? (
                      <>
                        <svg className="w-16 h-16 text-gray-300 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-500">Data not found</p>
                        <p className="text-sm text-gray-400">No leads available for the selected criteria</p>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                ) : paginatedFilteredLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-500">
                      {brokerId ? 'No leads found for this broker' : (isFilterApplied ? 'No leads match your filters' : 'No leads found')}
                    </p>
                    <p className="text-sm text-gray-400">
                      {brokerId 
                        ? 'This broker hasn\'t received any leads yet'
                        : (isFilterApplied 
                          ? 'Try adjusting your filter criteria or clear filters to see all leads' 
                          : 'Try adjusting your search or filter criteria'
                        )
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
                    {paginatedFilteredLeads.map((lead) => (
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
                                lead.status === 'New'
                                  ? 'linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)'
                                  : lead.status === 'Assigned'
                                  ? 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)'
                                  : lead.status === 'In Progress'
                                  ? 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
                                  : lead.status === 'Closed'
                                  ? 'linear-gradient(90deg, #10b981 0%, #047857 100%)'
                                  : lead.status === 'Rejected'
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
                            {(lead.status || 'New').toUpperCase()}
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
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">{lead.name}</h3>
                                {/* Verification Status Button */}
                                {(() => {
                                  const verifyStatus = getVerificationStatus(lead.id);
                                  // Use _id for API calls if available, otherwise fallback to id
                                  const leadIdForApi = lead._id || lead.id;
                                  if (verifyStatus === 'verified') {
                                    return (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUnverifyClick(leadIdForApi, lead.name);
                                        }}
                                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors text-xs flex-shrink-0"
                                        title="Verified"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Verified</span>
                                      </button>
                                    );
                                  } else {
                                    return (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleVerifyClick(leadIdForApi, lead.name);
                                        }}
                                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-xs flex-shrink-0"
                                        title="Unverified"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>Unverified</span>
                                      </button>
                                    );
                                  }
                                })()}
                              </div>
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
                              <div className="mt-0.5 text-gray-900 text-sm">
                                {lead.region}
                                {lead.secondaryRegion && lead.secondaryRegion.toLowerCase() !== (lead.region || '').toLowerCase() && (
                                  <div className="text-xs text-gray-600 mt-1">{lead.secondaryRegion}</div>
                                )}
                              </div>
                          </div>

                            <div className="col-span-2 h-px bg-gray-100" />

                            <div className="col-span-2">
                              <div className="text-[10px] tracking-wide text-gray-500 uppercase">Shared With</div>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {lead.sharedWith && lead.sharedWith.trim() ? (
                                    <div className="flex -space-x-2">
                                      {lead.sharedWith.split(',').slice(0, 2).map((name, idx) => {
                                        const trimmedName = name.trim();
                                        const candidate = lead.sharedWithImages && lead.sharedWithImages[idx];
                                        const imgSrc = candidate && candidate.trim() ? candidate : DEFAULT_AVATAR;
                                        return (
                                          <div key={idx} className="w-7 h-7 rounded-full ring-2 ring-white bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden" title={trimmedName}>
                                            <img 
                                              src={imgSrc}
                                              alt={trimmedName}
                                              className="w-full h-full object-cover rounded-full"
                                              onError={(e) => {
                                                // Final fallback to default avatar
                                                const target = e.target as HTMLImageElement;
                                                if (target.src !== DEFAULT_AVATAR) {
                                                  target.src = DEFAULT_AVATAR;
                                                }
                                              }}
                                            />
                                          </div>
                                        );
                                      })}
                                      {lead.sharedWith.split(',').length > 2 && (
                                        <div className="w-7 h-7 rounded-full ring-2 ring-white bg-yellow-400 text-black flex items-center justify-center text-[11px] font-semibold" title={`+${lead.sharedWith.split(',').length - 2} more`}>
                                          +{lead.sharedWith.split(',').length - 2}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-400 italic">Not shared</div>
                                  )}
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

              {/* Pagination - Below Grid */}
                <div className="flex items-center justify-between mt-4">
                  {/* Range text */}
                  <div className="text-sm text-gray-700">
                    {(() => {
                      const start = (currentPage - 1) * pageSize + 1;
                      const end = Math.min(currentPage * pageSize, totalFilteredLeads);
                      return `Showing ${totalFilteredLeads === 0 ? 0 : start} to ${end} of ${totalFilteredLeads} results`;
                    })()}
                  </div>

                  {/* Numbered pagination */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || isLoadingLeads}
                      className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {(() => {
                      const pages: number[] = [];
                      const addPage = (p: number) => { if (p >= 1 && p <= totalFilteredPages && !pages.includes(p)) pages.push(p); };
                      addPage(1);
                      addPage(2);
                      for (let p = currentPage - 1; p <= currentPage + 1; p++) addPage(p);
                      addPage(totalFilteredPages - 1);
                      addPage(totalFilteredPages);
                      const sorted = Array.from(new Set(pages)).sort((a,b)=>a-b);

                      const nodes: React.ReactNode[] = [];
                      let prev = 0;
                      sorted.forEach(p => {
                        if (prev && p - prev > 1) {
                          nodes.push(
                            <span key={`ellipsis-${prev}`} className="px-2 text-gray-400">…</span>
                          );
                        }
                        nodes.push(
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-2 text-sm font-medium rounded-md border ${p === currentPage ? 'text-white bg-teal-600 border-teal-600' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                          >
                            {p}
                          </button>
                        );
                        prev = p;
                      });
                      return nodes;
                    })()}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalFilteredPages))}
                      disabled={currentPage === totalFilteredPages || isLoadingLeads}
                      className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          {(sanitizedRequirements.length > 0 ? sanitizedRequirements : uniqueRequirements).map((requirement) => (
                                <option key={requirement} value={requirement}>
                                  {requirement}
                                </option>
                              ))}
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
                          {(sanitizedPropertyTypes.length > 0 ? sanitizedPropertyTypes : uniquePropertyTypes).map((propertyType) => (
                                <option key={propertyType} value={propertyType}>
                                  {propertyType}
                                </option>
                              ))}
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
                                  {region.name}
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
                                  {region.name}
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
                          {(sanitizedRequirements.length > 0 ? sanitizedRequirements : uniqueRequirements).map((requirement) => (
                              <option key={requirement} value={requirement}>
                                {requirement}
                              </option>
                            ))}
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
                          {(sanitizedPropertyTypes.length > 0 ? sanitizedPropertyTypes : uniquePropertyTypes).map((propertyType) => (
                              <option key={propertyType} value={propertyType}>
                                {propertyType}
                              </option>
                            ))}
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
                        <div className="text-xs font-semibold text-teal-600">${filterMaxBudget.toLocaleString('en-US')}</div>
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
                  <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
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
              <div className="h-[calc(100%-57px)] overflow-y-auto bg-gray-50 p-4">
                {/* Header Summary */}
                <div className="mb-3">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-blue-700">
                            {selectedLead.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{selectedLead.name}</div>
                          <div className="text-xs text-gray-500">{selectedLead.phone}</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-[11px] px-3 py-1 border border-blue-100">
                        {selectedLead.status?.charAt(0).toUpperCase() + selectedLead.status?.slice(1) || 'New'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mb-3">
                  <div className="bg-white rounded-lg border border-gray-200 px-3 pt-3 pb-3">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>setActiveViewTab('overview')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${activeViewTab==='overview' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Overview</button>
                      <button onClick={()=>setActiveViewTab('share')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${activeViewTab==='share' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Share</button>
                      
                    </div>
                        {activeViewTab === 'overview' ? (
           
                    <div className="space-y-3">
                    {/* Contact Details */}
                    <div className=" rounded-lg shadow-sm border border-gray-200 mt-4">
                      <div className="px-4 py-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM5 21a7 7 0 0114 0"/></svg>
                        <span className="text-sm font-semibold text-gray-900">Contact Details</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center px-4 py-2">
                          <div className="w-4 h-4 mr-3 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          </div>
                          <div className="text-xs text-gray-500 mr-2">Email</div>
                          <div className="text-xs text-gray-900">{selectedLead.contact}</div>
                        </div>
                        <div className="flex items-center px-4 py-2">
                          <div className="w-4 h-4 mr-3 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 5a2 2 0 012-2h2a2 2 0 012 2v1a2 2 0 01-.586 1.414l-1.121 1.121a2 2 0 00-.293 2.475 11.04 11.04 0 004.989 4.989 2 2 0 002.475-.293l1.121-1.121A2 2 0 0116 13h1a2 2 0 012 2v2a2 2 0 01-2 2h-.5C9.596 19 5 14.404 5 8.5V8a3 3 0 013-3H8"/></svg>
                          </div>
                          <div className="text-xs text-gray-500 mr-2">Phone</div>
                          <div className="text-xs text-gray-900">{selectedLead.phone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Property Preferences */}
                    <div className=" rounded-lg shadow-sm border border-gray-200">
                      <div className="px-4 py-3 flex items-center gap-2 ">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                        <span className="text-sm font-semibold text-gray-900">Property Preferences</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center px-4 py-3">
                          <div className="w-4 h-4 mr-3 text-gray-400"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg></div>
                          <div className="text-xs text-gray-500 mr-2">Property Type</div>
                          <div className="text-xs text-gray-900">{selectedLead.propertyType || 'Residential'}</div>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <div className="w-4 h-4 mr-3 text-gray-400"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1"/></svg></div>
                          <div className="text-xs text-gray-500 mr-2">Budget</div>
                          <div className="text-xs text-gray-900">{selectedLead.budget}</div>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <div className="w-4 h-4 mr-3 text-gray-400"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9h14l1 12H4L5 9z"/></svg></div>
                          <div className="text-xs text-gray-500 mr-2">Requirement</div>
                          <div className="text-xs text-gray-900">{selectedLead.requirement}</div>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <div className="w-4 h-4 mr-3 text-gray-400"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/></svg></div>
                          <div className="text-xs text-gray-500 mr-2">Primary Region</div>
                          <div className="text-xs text-gray-900">{selectedLead.region}</div>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <div className="w-4 h-4 mr-3 text-gray-400"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/></svg></div>
                          <div className="text-xs text-gray-500 mr-2">Secondary Region</div>
                          <div className="text-xs text-gray-900">{selectedLead.secondaryRegion || '-'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        {(() => {
                          const label = selectedLead.status?.charAt(0).toUpperCase() + selectedLead.status?.slice(1) || 'New';
                          const pill = drawerStatusPills[label] || 'bg-gray-100 text-gray-800';
                          return (
                            <span className={`inline-flex items-center mt-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-transparent ${pill}`}>
                              {label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    </div>
              
                ) : (
                  // Share Tab

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-3">
                      <div className="px-4 py-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v.01M8 12v.01M12 12v.01M16 12v.01M20 12v.01"/></svg>
                        <span className="text-sm font-semibold text-gray-900">Share History</span>
                      </div>
                      <div className="p-4">
                      {(() => {
                        const toList = (selectedLead.sharedWithList && selectedLead.sharedWithList.length > 0)
                          ? selectedLead.sharedWithList
                          : (selectedLead.sharedWith && selectedLead.sharedWith.trim()
                              ? selectedLead.sharedWith.split(',').map(s => s.trim()).filter(Boolean)
                              : []);
                        if (toList.length === 0) {
                          return <div className="text-sm text-gray-500">Not shared</div>;
                        }
                        const fromName = selectedLead.brokerName || '-';
                        const primaryRegion = selectedLead.region || '-';
                        const secondaryRegion = selectedLead.secondaryRegion || '-';
                        const imageList = Array.isArray(selectedLead.sharedWithImages) ? selectedLead.sharedWithImages : [];
                        return (
                          <div className="space-y-1">
                            {toList.map((toName, idx) => (
                              <div key={`${toName}-${idx}`} className="flex items-center justify-between rounded-lg px-3 py-2">
                                <div className="flex items-start gap-3">
                                  {/* Avatar: show image if present, else default avatar */}
                                  {(() => {
                                    const img = imageList[idx];
                                    const src = img && String(img).trim() ? String(img) : DEFAULT_AVATAR;
                                    return (
                                      <img
                                        src={src}
                                        alt={toName}
                                        className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0"
                                        onError={(e) => {
                                          const t = e.target as HTMLImageElement;
                                          if (t.src !== DEFAULT_AVATAR) t.src = DEFAULT_AVATAR;
                                        }}
                                      />
                                    );
                                  })()}
                                  <div>
                                    <div className="text-sm text-gray-900">
                                      <span className="font-medium">{fromName}</span>
                                      <span className="mx-2 text-gray-400">→</span>
                                      <span className="font-medium">{toName}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                      <span>{primaryRegion}</span>
                                      <span className="mx-2 text-gray-400">→</span>
                                      <span>{secondaryRegion || '-'}</span>
                                    </div>
                                  </div>
                                </div>
                               
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      </div>
                    </div>
             
                )}
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
                            {isLoadingBrokers ? (
                              <div className="px-3 py-2 text-xs text-gray-500">Loading brokers...</div>
                            ) : brokersError ? (
                              <div className="px-3 py-2 text-xs text-red-500">Error loading brokers</div>
                            ) : filteredBrokers.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-gray-500">No results</div>
                            ) : (
                              filteredBrokers.map(broker => (
                                <label key={broker.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    checked={selectedBrokers.includes(broker.id)}
                                    onChange={() => toggleBroker(broker.id)}
                                  />
                                  <span className="text-gray-800">{broker.name}</span>
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

        {/* Verify Confirmation Dialog */}
        {showVerifyConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[99999] bg-[rgba(0,0,0,0.8)]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Lead</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to verify <span className="font-semibold">{selectedLeadName}</span>? 
                  This will mark the lead as verified.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => {
                      setShowVerifyConfirm(false);
                      setSelectedLeadId(null);
                      setSelectedLeadName('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Verify Lead
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unverify Confirmation Dialog */}
        {showUnverifyConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[99999] bg-[rgba(0,0,0,0.8)]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unverify Lead</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to unverify <span className="font-semibold">{selectedLeadName}</span>? 
                  This will remove the verification status from the lead.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => {
                      setShowUnverifyConfirm(false);
                      setSelectedLeadId(null);
                      setSelectedLeadName('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnverify}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Unverify Lead
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeadsPageContent />
    </Suspense>
  );
}
