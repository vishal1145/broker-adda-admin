'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Link from 'next/link';
import { leadsAPI, regionAPI, propertiesAPI, brokerAPI, notificationsAPI, dashboardAPI } from '@/services/api';

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Skeleton Loader Components
const Skeleton = ({ className = '', height = 'h-4', width = 'w-full', rounded = false }: { className?: string; height?: string; width?: string; rounded?: boolean }) => (
  <div 
    className={`bg-gray-200 animate-pulse ${height} ${width} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
  />
);

const NewLeadsTableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">NAME</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">PROPERTY</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">REGION</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">STATUS</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">TIME</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index}>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-24" />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-32" />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-20" />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-6" width="w-16" rounded />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-16" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const NewBrokersTableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">NAME</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">EMAIL</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">REGION</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">STATUS</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">TIME</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index}>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-24" />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-36" />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-20" />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-6" width="w-20" rounded />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-16" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PropertiesTableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">PROPERTY</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">REGION</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">PRICE</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">STATUS</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">TIME</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index}>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-32" />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-20" />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-16" />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-6" width="w-16" rounded />
              </td>
              <td className="py-4 px-2">
                <Skeleton height="h-4" width="w-16" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RecentActivitySkeleton = () => {
  return (
    <div className="divide-y divide-gray-200">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-start space-x-3 py-4 first:pt-0 last:pb-0">
          <div className="flex-shrink-0 mt-0.5">
            <Skeleton height="h-4" width="w-4" rounded />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-3" width="w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [monthlyOverviewPeriod, setMonthlyOverviewPeriod] = useState<'Week' | 'Month'>('Month');
  const [totalLeads, setTotalLeads] = useState('2,847');
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [totalRegions, setTotalRegions] = useState('47');
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [totalBrokers, setTotalBrokers] = useState('156');
  const [isLoadingBrokers, setIsLoadingBrokers] = useState(false);
  const [totalProperties, setTotalProperties] = useState('1,234');
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [newBrokersData, setNewBrokersData] = useState<Array<{
    id: string;
    name: string;
    email: string;
    location: string;
    time: string;
    status: string;
    phone: string;
  }>>([]);
  const [isLoadingNewBrokers, setIsLoadingNewBrokers] = useState(false);
  const [newLeadsData, setNewLeadsData] = useState<Array<{
    id: string;
    name: string;
    property: string;
    location: string;
    time: string;
    status: string;
    phone: string;
  }>>([]);
  const [isLoadingNewLeads, setIsLoadingNewLeads] = useState(false);
  const [newPropertiesData, setNewPropertiesData] = useState<Array<{
    id: string;
    name: string;
    location: string;
    price: string;
    status: string;
    time: string;
  }>>([]);
  const [isLoadingNewProperties, setIsLoadingNewProperties] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    action: string;
    time: string;
  }>>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  // Chart data states
  const [monthChartData, setMonthChartData] = useState([
    { month: 'Jan', leads: 0, brokers: 0, properties: 0 },
    { month: 'Feb', leads: 0, brokers: 0, properties: 0 },
    { month: 'Mar', leads: 0, brokers: 0, properties: 0 },
    { month: 'Apr', leads: 0, brokers: 0, properties: 0 },
    { month: 'May', leads: 0, brokers: 0, properties: 0 },
    { month: 'Jun', leads: 0, brokers: 0, properties: 0 },
    { month: 'Jul', leads: 0, brokers: 0, properties: 0 },
    { month: 'Aug', leads: 0, brokers: 0, properties: 0 },
    { month: 'Sep', leads: 0, brokers: 0, properties: 0 },
    { month: 'Oct', leads: 0, brokers: 0, properties: 0 },
    { month: 'Nov', leads: 0, brokers: 0, properties: 0 },
    { month: 'Dec', leads: 0, brokers: 0, properties: 0 },
  ]);

  const [weekChartData, setWeekChartData] = useState([
    { week: 'Sun', leads: 0, brokers: 0, properties: 0 },
    { week: 'Mon', leads: 0, brokers: 0, properties: 0 },
    { week: 'Tue', leads: 0, brokers: 0, properties: 0 },
    { week: 'Wed', leads: 0, brokers: 0, properties: 0 },
    { week: 'Thu', leads: 0, brokers: 0, properties: 0 },
    { week: 'Fri', leads: 0, brokers: 0, properties: 0 },
    { week: 'Sat', leads: 0, brokers: 0, properties: 0 },
  ]);

  const [, setIsLoadingChartData] = useState(false);

  const stats = [
    {
      name: 'Total Regions',
      value: totalRegions,
      change: '+22.1%',
      changeType: 'positive',
      color: 'rose',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
      ),
    },
    {
      name: 'Total Brokers',
      value: totalBrokers,
      change: '+8.3%',
      changeType: 'positive',
      color: 'green',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
        </svg>
      ),
    },
    {
      name: 'Total Enquiries',
      value: totalLeads,
      change: '+12.5%',
      changeType: 'positive',
      color: 'blue',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-4a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
      ),
    },
    {
      name: 'Total Properties',
      value: totalProperties,
      change: '+15.2%',
      changeType: 'positive',
      color: 'yellow',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      ),
    },
  ];





  // Fetch leads metrics
  const fetchLeadsMetrics = useCallback(async () => {
    try {
      setIsLoadingLeads(true);
      const response = await leadsAPI.getMetrics();
      
      // Extract total leads from API response
      // The API response structure may vary, so we handle multiple possibilities
      const metrics = response.data || response;
      const total = metrics.totalLeads || metrics.total || metrics.count || 0;
      
      // Format the number with commas
      setTotalLeads(total.toLocaleString('en-US'));
    } catch (error) {
      console.error('Failed to fetch leads metrics:', error);
      // Keep default value on error, don't show toast for dashboard metrics
      // toast.error(error instanceof Error ? error.message : 'Failed to fetch leads metrics');
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  // Fetch regions stats
  const fetchRegionsStats = useCallback(async () => {
    try {
      setIsLoadingRegions(true);
      const response = await regionAPI.getRegionStats();
      
      // Extract total regions from API response
      // The API response structure may vary, so we handle multiple possibilities
      const stats = response.data || response;
      const total = stats.totalRegions || stats.total || stats.count || 0;
      
      // Format the number with commas
      setTotalRegions(total.toLocaleString('en-US'));
    } catch (error) {
      console.error('Failed to fetch regions stats:', error);
      // Keep default value on error, don't show toast for dashboard metrics
      // toast.error(error instanceof Error ? error.message : 'Failed to fetch regions stats');
    } finally {
      setIsLoadingRegions(false);
    }
  }, []);

  // Fetch brokers stats
  const fetchBrokersStats = useCallback(async () => {
    try {
      setIsLoadingBrokers(true);
      // Call brokers API with page 1 and limit 1 just to get total count
      const response = await brokerAPI.getBrokers(1, 1);
      
      // Extract total brokers from API response
      // The API response structure: { totalBrokers: 7, hasNextPage: true, ... } or { data: { totalBrokers: 7, ... }, stats: { totalAllBrokers: 7 } }
      const total = response.totalBrokers || 
                    response.data?.totalBrokers || 
                    response.stats?.totalAllBrokers || 
                    response.data?.stats?.totalAllBrokers ||
                    response.total || 
                    response.data?.total ||
                    response.totalCount || 
                    response.data?.totalCount || 
                    response.count || 
                    response.data?.count || 
                    0;
      
      // Format the number with commas
      setTotalBrokers(total.toLocaleString('en-US'));
    } catch (error) {
      console.error('Failed to fetch brokers stats:', error);
      // Keep default value on error, don't show toast for dashboard metrics
      // toast.error(error instanceof Error ? error.message : 'Failed to fetch brokers stats');
    } finally {
      setIsLoadingBrokers(false);
    }
  }, []);

  // Fetch properties metrics
  const fetchPropertiesMetrics = useCallback(async () => {
    try {
      setIsLoadingProperties(true);
      const response = await propertiesAPI.getMetrics();
      
      // Extract total properties from API response
      // The API response structure may vary, so we handle multiple possibilities
      const metrics = response.data || response;
      const total = metrics.totalProperties || metrics.total || metrics.count || 0;
      
      // Format the number with commas
      setTotalProperties(total.toLocaleString('en-US'));
    } catch (error) {
      console.error('Failed to fetch properties metrics:', error);
      // Keep default value on error, don't show toast for dashboard metrics
      // toast.error(error instanceof Error ? error.message : 'Failed to fetch properties metrics');
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);

  // Fetch new brokers for dashboard
  const fetchNewBrokers = useCallback(async () => {
    try {
      setIsLoadingNewBrokers(true);
      const response = await brokerAPI.getBrokers(1, 5);
      
      // Extract brokers from API response
      const brokers = response.data?.brokers || response.brokers || response.data || [];
      
      // Format brokers data for the table - get latest 5
      const formattedBrokers = brokers.slice(0, 5).map((broker: {
        _id?: string;
        id?: string;
        name?: string;
        email?: string;
        region?: Array<{ name?: string; city?: string }> | { name?: string } | string;
        regionId?: { name?: string } | string;
        createdAt?: string;
        created_at?: string;
        verificationStatus?: string;
        phone?: string;
        phoneNumber?: string;
      }) => {
        // Handle region - it's an array like in brokers page
        let region = '-';
        
        // Check if region is an array (as per brokers page structure)
        if (broker.region && Array.isArray(broker.region) && broker.region.length > 0) {
          // Region is an array, get the first one's name
          region = broker.region[0].name || broker.region[0].city || '-';
        } else if (broker.region && typeof broker.region === 'object' && !Array.isArray(broker.region) && 'name' in broker.region) {
          // Region is a single object with name
          region = (broker.region as { name?: string }).name || '-';
        } else if (broker.region && typeof broker.region === 'string') {
          // Region is just an ID string
          region = broker.region;
        }
        
        // Check regionId as fallback
        if (region === '-' && broker.regionId) {
          if (typeof broker.regionId === 'object' && !Array.isArray(broker.regionId) && 'name' in broker.regionId) {
            region = (broker.regionId as { name?: string }).name || '-';
          } else if (typeof broker.regionId === 'string') {
            region = broker.regionId;
          }
        }
        
        return {
          id: broker._id || broker.id || '',
          name: broker.name || '-',
          email: broker.email || '-',
          location: region,
          time: formatTimeAgo(broker.createdAt || broker.created_at || new Date().toISOString()),
          status: broker.verificationStatus === 'Verified' ? 'Verified' : 'Unverified',
          phone: broker.phone || broker.phoneNumber || '-',
        };
      });
      
      setNewBrokersData(formattedBrokers);
    } catch (error) {
      console.error('Failed to fetch new brokers:', error);
      // Keep empty array on error
      setNewBrokersData([]);
    } finally {
      setIsLoadingNewBrokers(false);
    }
  }, []);

  // Fetch new properties for dashboard
  const fetchNewProperties = useCallback(async () => {
    try {
      setIsLoadingNewProperties(true);
      const response = await propertiesAPI.getProperties(1, 5);
      
      console.log('🏠 Properties API Response:', response);
      
      // Extract properties from API response - check multiple possible structures (matching properties page)
      const properties = response.data?.properties ||
                        response.properties ||
                        response.data?.data?.properties ||
                        response.data ||
                        (Array.isArray(response) ? response : []);
      
      console.log('🏠 Extracted properties:', properties);
      console.log('🏠 Properties count:', Array.isArray(properties) ? properties.length : 0);
      
      // Ensure properties is an array
      if (!Array.isArray(properties)) {
        console.error('🏠 Properties is not an array:', typeof properties, properties);
        setNewPropertiesData([]);
        setIsLoadingNewProperties(false);
        return;
      }
      
      // Format properties data for the table - get latest 5
      const formattedProperties = properties.slice(0, 5).map((property: {
        _id?: string;
        id?: string;
        title?: string;
        name?: string;
        region?: Array<{ name?: string; city?: string; region?: string }> | { name?: string; city?: string; region?: string } | string;
        city?: string;
        price?: number | string;
        status?: string;
        createdAt?: string;
        created_at?: string;
        listedDate?: string;
      }) => {
        console.log('🏠 Processing property:', property);
        
        // Handle region - check if it's an array or object
        let region = '-';
        if (property.region && Array.isArray(property.region) && property.region.length > 0) {
          region = property.region[0].name || property.region[0].city || property.region[0].region || '-';
        } else if (property.region && typeof property.region === 'object' && !Array.isArray(property.region) && 'name' in property.region) {
          const regionObj = property.region as { name?: string; city?: string; region?: string };
          region = regionObj.name || regionObj.city || regionObj.region || '-';
        } else if (property.region && typeof property.region === 'string') {
          region = property.region;
        } else if (property.city) {
          region = property.city;
        }
        
        // Handle price
        let price = '-';
        if (property.price) {
          const priceValue = typeof property.price === 'number' ? property.price : parseFloat(property.price);
          
          if (priceValue >= 10000000) {
            // Convert to Crores
            price = `${(priceValue / 10000000).toFixed(2)} Cr`;
          } else if (priceValue >= 100000) {
            // Convert to Lakhs
            price = `${(priceValue / 100000).toFixed(2)} L`;
          } else {
            price = `${priceValue.toLocaleString('en-IN')}`;
          }
        }
        
        // Handle status
        let status = 'Active';
        if (property.status) {
          status = property.status;
        }
        
        return {
          id: property._id || property.id || '',
          name: property.title || property.name || '-',
          location: region,
          price: price,
          status: status,
          time: formatTimeAgo(property.createdAt || property.created_at || property.listedDate || new Date().toISOString()),
        };
      });
      
      console.log('🏠 Formatted properties:', formattedProperties);
      setNewPropertiesData(formattedProperties);
    } catch (error) {
      console.error('Failed to fetch new properties:', error);
      // Keep empty array on error
      setNewPropertiesData([]);
    } finally {
      setIsLoadingNewProperties(false);
    }
  }, []);

  // Fetch recent activities (notifications) for dashboard
  const fetchRecentActivities = useCallback(async () => {
    try {
      setIsLoadingActivities(true);
      const response = await notificationsAPI.getAllNotifications();
      
      console.log('🔔 Notifications API Response:', response);
      
      // Extract notifications from API response - check multiple possible structures
      const notifications = response.data?.notifications ||
                          response.data?.items ||
                          response.notifications ||
                          response.data ||
                          (Array.isArray(response) ? response : []);
      
      console.log('🔔 Extracted notifications:', notifications);
      console.log('🔔 Notifications count:', Array.isArray(notifications) ? notifications.length : 0);
      
      // Ensure notifications is an array
      if (!Array.isArray(notifications)) {
        console.error('🔔 Notifications is not an array:', typeof notifications, notifications);
        setRecentActivities([]);
        setIsLoadingActivities(false);
        return;
      }
      
      // Format notifications data for the activity list - get latest 5
      const formattedActivities = notifications.slice(0, 5).map((notification: {
        _id?: string;
        id?: string;
        message?: string;
        title?: string;
        description?: string;
        type?: string;
        createdAt?: string;
        created_at?: string;
        timestamp?: string;
      }) => {
        console.log('🔔 Processing notification:', notification);
        
        // Handle action/message text - prioritize title over message
        let action = '-';
        if (notification.title) {
          action = notification.title;
          if (notification.description) {
            action = `${notification.title}: ${notification.description}`;
          }
        } else if (notification.message) {
          action = notification.message;
        } else if (notification.description) {
          action = notification.description;
        }
        
        // Handle time
        const timeString = notification.createdAt || 
                          notification.created_at || 
                          notification.timestamp || 
                          new Date().toISOString();
        
        return {
          id: notification._id || notification.id || '',
          action: action,
          time: formatTimeAgo(timeString),
        };
      });
      
      console.log('🔔 Formatted activities:', formattedActivities);
      setRecentActivities(formattedActivities);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      // Keep empty array on error
      setRecentActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  }, []);

  // Fetch new leads for dashboard
  const fetchNewLeads = useCallback(async () => {
    try {
      setIsLoadingNewLeads(true);
      const response = await leadsAPI.getLeads(1, 5);
      
      console.log('📋 Leads API Response:', response);
      
      // Extract leads from API response - check multiple possible structures (matching leads page)
      const leads = response.data?.items ||
                    response.data?.leads || 
                    response.data?.data?.leads ||
                    response.leads || 
                    response.data || 
                    (Array.isArray(response) ? response : []);
      
      console.log('📋 Extracted leads:', leads);
      console.log('📋 Leads count:', Array.isArray(leads) ? leads.length : 0);
      console.log('📋 Is array:', Array.isArray(leads));
      
      // Ensure leads is an array
      if (!Array.isArray(leads)) {
        console.error('📋 Leads is not an array:', typeof leads, leads);
        setNewLeadsData([]);
        setIsLoadingNewLeads(false);
        return;
      }
      
      // Format leads data for the table - get latest 5
      const formattedLeads = leads.slice(0, 5).map((lead: {
        _id?: string;
        id?: string;
        name?: string;
        customerName?: string;
        region?: Array<{ name?: string; city?: string }> | { name?: string } | string;
        regionId?: { name?: string } | string;
        property?: { name?: string; title?: string; propertyType?: string } | string;
        propertyType?: string;
        requirement?: string;
        status?: string;
        verificationStatus?: string;
        phone?: string;
        phoneNumber?: string;
        mobile?: string;
        createdAt?: string;
        created_at?: string;
      }) => {
        console.log('📋 Processing lead:', lead);
        // Handle region - check if it's an array or object
        let region = '-';
        if (lead.region && Array.isArray(lead.region) && lead.region.length > 0) {
          region = lead.region[0].name || lead.region[0].city || '-';
        } else if (lead.region && typeof lead.region === 'object' && !Array.isArray(lead.region) && 'name' in lead.region) {
          region = (lead.region as { name?: string }).name || '-';
        } else if (lead.regionId && typeof lead.regionId === 'object' && !Array.isArray(lead.regionId) && 'name' in lead.regionId) {
          region = (lead.regionId as { name?: string }).name || '-';
        }
        
        // Handle property
        let property = '-';
        if (lead.property && typeof lead.property === 'object') {
          property = lead.property.name || lead.property.title || lead.property.propertyType || '-';
        } else if (lead.property && typeof lead.property === 'string') {
          property = lead.property;
        } else if (lead.propertyType) {
          property = lead.propertyType;
        } else if (lead.requirement) {
          property = lead.requirement;
        }
        
        // Handle status
        let status = 'New';
        if (lead.status) {
          status = lead.status;
        } else if (lead.verificationStatus) {
          status = lead.verificationStatus;
        }
        
        return {
          id: lead._id || lead.id || '',
          name: lead.name || lead.customerName || '-',
          property: property,
          location: region,
          time: formatTimeAgo(lead.createdAt || lead.created_at || new Date().toISOString()),
          status: status,
          phone: lead.phone || lead.phoneNumber || lead.mobile || '-',
        };
      });
      
      console.log('📋 Formatted leads:', formattedLeads);
      setNewLeadsData(formattedLeads);
    } catch (error) {
      console.error('Failed to fetch new leads:', error);
      // Keep empty array on error
      setNewLeadsData([]);
    } finally {
      setIsLoadingNewLeads(false);
    }
  }, []);

  // Fetch dashboard chart stats
  const fetchDashboardChartStats = useCallback(async (period: 'month' | 'week') => {
    try {
      setIsLoadingChartData(true);
      const response = await dashboardAPI.getDashboardStats(period);
      
      console.log('📊 Dashboard Stats API Response:', response);
      
      if (period === 'month') {
        // Extract byPeriod data from API response
        const byPeriod = response?.data?.byPeriod;
        
        if (byPeriod && byPeriod.brokers && byPeriod.leads && byPeriod.properties) {
          const brokersData = byPeriod.brokers;
          const leadsData = byPeriod.leads;
          const propertiesData = byPeriod.properties;
          
          // Type for month data items
          type MonthDataItem = {
            month: number;
            count?: number;
          };
          
          // Create a map of month number to data for easier lookup
          const brokersMap = new Map(brokersData.map((item: MonthDataItem) => [item.month, item.count || 0]));
          const leadsMap = new Map(leadsData.map((item: MonthDataItem) => [item.month, item.count || 0]));
          const propertiesMap = new Map(propertiesData.map((item: MonthDataItem) => [item.month, item.count || 0]));
          
          // Transform to chart format
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const transformedData = monthNames.map((shortMonth, index) => {
            const monthNumber = index + 1;
            return {
              month: shortMonth,
              leads: Number(leadsMap.get(monthNumber)) || 0,
              brokers: Number(brokersMap.get(monthNumber)) || 0,
              properties: Number(propertiesMap.get(monthNumber)) || 0,
            };
          });
          
          console.log('📊 Transformed Month Data:', transformedData);
          setMonthChartData(transformedData);
        } else {
          console.warn('📊 byPeriod data not found in API response');
        }
      } else {
        // Transform week data - API returns data by days of the week (Sunday-Saturday)
        const byPeriod = response?.data?.byPeriod;
        
        if (byPeriod && byPeriod.brokers && byPeriod.leads && byPeriod.properties) {
          const brokersData = byPeriod.brokers;
          const leadsData = byPeriod.leads;
          const propertiesData = byPeriod.properties;
          
          console.log('📊 Week API Data:', { brokersData, leadsData, propertiesData });
          
          // Map full day names to short names
          const dayNameMap: Record<string, string> = {
            'Sunday': 'Sun',
            'Monday': 'Mon',
            'Tuesday': 'Tue',
            'Wednesday': 'Wed',
            'Thursday': 'Thu',
            'Friday': 'Fri',
            'Saturday': 'Sat'
          };
          
          // Type for week data items
          type WeekDataItem = {
            dayOfWeek: number;
            dayName?: string;
            count?: number;
          };
          
          // Create maps using dayOfWeek (1-7) for lookup
          // dayOfWeek: 1=Sunday, 2=Monday, ..., 7=Saturday
          const brokersMap = new Map(brokersData.map((item: WeekDataItem) => [item.dayOfWeek, item.count || 0]));
          const leadsMap = new Map(leadsData.map((item: WeekDataItem) => [item.dayOfWeek, item.count || 0]));
          const propertiesMap = new Map(propertiesData.map((item: WeekDataItem) => [item.dayOfWeek, item.count || 0]));
          
          // Day order: Sunday (1), Monday (2), Tuesday (3), Wednesday (4), Thursday (5), Friday (6), Saturday (7)
          const dayOrder = [1, 2, 3, 4, 5, 6, 7];
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          
          // Transform to chart format - use day names instead of "Week 1", "Week 2"
          const transformedData = dayOrder.map((dayOfWeek, index) => {
            // Get day name from API data or use default
            const dayData = leadsData.find((item: WeekDataItem) => item.dayOfWeek === dayOfWeek) || 
                          brokersData.find((item: WeekDataItem) => item.dayOfWeek === dayOfWeek) ||
                          propertiesData.find((item: WeekDataItem) => item.dayOfWeek === dayOfWeek);
            
            const dayName = dayData?.dayName 
              ? (dayNameMap[dayData.dayName] || dayData.dayName.substring(0, 3))
              : dayNames[index];
            
            return {
              week: dayName,
              leads: Number(leadsMap.get(dayOfWeek)) || 0,
              brokers: Number(brokersMap.get(dayOfWeek)) || 0,
              properties: Number(propertiesMap.get(dayOfWeek)) || 0,
            };
          });
          
          console.log('📊 Transformed Week Data:', transformedData);
          setWeekChartData(transformedData);
        } else {
          console.warn('📊 byPeriod data not found in API response for week');
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard chart stats:', error);
      // Keep default empty data on error
    } finally {
      setIsLoadingChartData(false);
    }
  }, []);

  useEffect(() => {
    fetchLeadsMetrics();
    fetchRegionsStats();
    fetchBrokersStats();
    fetchPropertiesMetrics();
    fetchNewBrokers();
    fetchNewLeads();
    fetchNewProperties();
    fetchRecentActivities();
    // Fetch chart data for both periods on initial load
    fetchDashboardChartStats('month');
    fetchDashboardChartStats('week');
  }, [fetchLeadsMetrics, fetchRegionsStats, fetchBrokersStats, fetchPropertiesMetrics, fetchNewBrokers, fetchNewLeads, fetchNewProperties, fetchRecentActivities, fetchDashboardChartStats]);


  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
        {/* Header with Time Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
            <p className="text-gray-600 text-sm">Real-time visitor management statistics and analytics</p>
          </div>
          {/* <div className="flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium bg-white text-gray-700 shadow-sm hover:border-primary focus:ring-2 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div> */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const colorClasses = {
              blue: {
                border: 'border-blue-200',
                bg: 'bg-blue-50/40',
                label: 'text-blue-700',
                value: 'text-blue-700',
                iconBg: 'bg-blue-100',
                iconText: 'text-blue-600',
              },
              green: {
                border: 'border-green-200',
                bg: 'bg-green-50/40',
                label: 'text-green-700',
                value: 'text-green-700',
                iconBg: 'bg-green-100',
                iconText: 'text-green-600',
              },
              yellow: {
                border: 'border-yellow-200',
                bg: 'bg-yellow-50/40',
                label: 'text-yellow-700',
                value: 'text-yellow-700',
                iconBg: 'bg-yellow-100',
                iconText: 'text-yellow-600',
              },
              rose: {
                border: 'border-rose-200',
                bg: 'bg-rose-50/40',
                label: 'text-rose-700',
                value: 'text-rose-700',
                iconBg: 'bg-rose-100',
                iconText: 'text-rose-600',
              },
            };

            const colors = colorClasses[stat.color as keyof typeof colorClasses] || colorClasses.blue;
            
            // Check if this specific stat is loading
            const isLoading = index === 0 ? isLoadingRegions : 
                            index === 1 ? isLoadingBrokers : 
                            index === 2 ? isLoadingLeads : 
                            isLoadingProperties;

            // Map stat names to routes
            const getRoute = (name: string) => {
              if (name.includes('Region')) return '/regions';
              if (name.includes('Broker')) return '/brokers';
              if (name.includes('Lead') || name.includes('Enquiries')) return '/leads';
              if (name.includes('Property')) return '/properties';
              return '#';
            };

            const route = getRoute(stat.name);

            return (
              <Link 
                key={stat.name} 
                href={route}
                className={`relative rounded-xl border ${colors.border} ${colors.bg} p-4 cursor-pointer hover:shadow-md transition-shadow`}
              >
                {isLoading ? (
                <div>
                    <div className={`h-3 w-20 bg-gray-200 rounded animate-pulse mb-3`}></div>
                    <div className="mt-1 flex justify-between gap-2">
                      <div className={`h-7 w-16 bg-gray-200 rounded animate-pulse`}></div>
                      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg} ${colors.iconText} opacity-50`}>
                        {stat.icon}
                      </div>
                    </div>
                </div>
                ) : (
                  <div>
                    <div className={`text-[12px] font-medium ${colors.label}`}>{stat.name}</div>
                    <div className="mt-1 flex justify-between gap-2">
                      <div className={`text-xl font-bold ${colors.value}`}>{stat.value}</div>
                      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg} ${colors.iconText}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Month-wise Bar Chart */}
        <div className="bg-white rounded-xl shadow-xs p-4 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div>
              <h3 className="text-[16px] font-semibold text-gray-900">Monthly Overview</h3>
              <p className="text-xs text-gray-500 mt-1">
                {monthlyOverviewPeriod === 'Week' 
                  ? 'Enquiries, Brokers, and Properties by week' 
                  : 'Enquiries, Brokers, and Properties by month'}
              </p>
            </div>
            <div className="relative">
              <select 
                value={monthlyOverviewPeriod}
                onChange={(e) => {
                  const newPeriod = e.target.value as 'Week' | 'Month';
                  setMonthlyOverviewPeriod(newPeriod);
                  // Fetch data when period changes
                  fetchDashboardChartStats(newPeriod.toLowerCase() as 'month' | 'week');
                }}
                className="border border-gray-300 rounded-lg px-6 py-2 text-sm font-medium bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors cursor-pointer appearance-none pr-8"
              >
                <option value="Week">Week</option>
                <option value="Month">Month</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
            
          {/* Grouped Bar Chart using Recharts */}
          <div className="h-56" tabIndex={-1}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyOverviewPeriod === 'Week' ? weekChartData : monthChartData} 
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis 
                  dataKey={monthlyOverviewPeriod === 'Week' ? 'week' : 'month'} 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const label = monthlyOverviewPeriod === 'Week' ? data.week : data.month;
                      return (
                        <div className="bg-white rounded-lg shadow-xs px-2 py-1.5">
                          <p className="text-[14px] font-medium text-gray-900 mb-1">{label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className={`text-xs font-medium ${
                              entry.dataKey === 'leads' ? 'text-blue-600' :
                              entry.dataKey === 'brokers' ? 'text-green-600' :
                              'text-yellow-600'
                            }`}>
                              {entry.dataKey === 'leads' ? 'Enquiries' : entry.dataKey === 'brokers' ? 'Brokers' : 'Properties'}: {entry.value?.toLocaleString() || 0}
                            </p>
                          ))}
            </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="leads" 
                  name="Enquiries"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
                <Bar 
                  dataKey="brokers" 
                  name="Brokers"
                  fill="#22C55E"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
                <Bar 
                  dataKey="properties" 
                  name="Properties"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New Leads and New Brokers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Leads Section */}
          <div className="bg-white rounded-xl shadow-xs p-6 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[16px] font-semibold text-gray-900">New Enquiries</h3>
                <p className="text-xs text-gray-500 mt-1">Recently created Enquiries</p>
              </div>
              <Link href="/leads" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center transition-colors">
                View All 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {isLoadingNewLeads ? (
              <NewLeadsTableSkeleton />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">NAME</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">PROPERTY</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">REGION</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">STATUS</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {newLeadsData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-gray-500">
                          No enquiries found
                        </td>
                      </tr>
                    ) : (
                      newLeadsData.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-2 text-xs font-semibold text-gray-900">{lead.name}</td>
                          <td className="py-4 px-2 text-xs text-gray-700 font-medium">{lead.property}</td>
                          <td className="py-4 px-2 text-xs text-gray-700 font-medium">{lead.location}</td>
                          <td className="py-4 px-2">
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-xs text-gray-500">{lead.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* New Brokers Section */}
          <div className="bg-white rounded-xl shadow-xs p-6 duration-200">
            <div className="flex items-center justify-between mb-6">
                  <div>
                <h3 className="text-[16px] font-semibold text-gray-900">New Brokers</h3>
                <p className="text-xs text-gray-500 mt-1">Recently registered brokers</p>
                  </div>
              <Link href="/brokers" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center transition-colors">
                View All 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
              </Link>
                </div>
            {isLoadingNewBrokers ? (
              <NewBrokersTableSkeleton />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">NAME</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">EMAIL</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">REGION</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">STATUS</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {newBrokersData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-gray-500">
                          No brokers found
                        </td>
                      </tr>
                    ) : (
                      newBrokersData.map((broker) => (
                        <tr key={broker.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-2 text-xs font-semibold text-gray-900">{broker.name}</td>
                          <td className="py-4 px-2 text-xs text-gray-700 font-medium">{broker.email}</td>
                          <td className="py-4 px-2 text-xs text-gray-700 font-medium">{broker.location}</td>
                          <td className="py-4 px-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              broker.status === 'Verified' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {broker.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-xs text-gray-500">{broker.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
              </div>
                </div>
                
            {/* Properties and Recent Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Properties Section */}
              <div className="bg-white rounded-xl shadow-xs p-6 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-[16px] font-semibold text-gray-900">Properties</h3>
                    <p className="text-xs text-gray-500 mt-1">Recently added properties</p>
                  </div>
                  <Link href="/properties" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center transition-colors">
                    View All 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                {isLoadingNewProperties ? (
                  <PropertiesTableSkeleton />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">PROPERTY</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">REGION</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">PRICE</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">STATUS</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">TIME</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {newPropertiesData.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-xs text-gray-500">
                              No properties found
                            </td>
                          </tr>
                        ) : (
                          newPropertiesData.map((property) => (
                            <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-2 text-xs font-semibold text-gray-900">{property.name}</td>
                              <td className="py-4 px-2 text-xs text-gray-700 font-medium">{property.location}</td>
                              <td className="py-4 px-2 text-xs text-gray-700 font-medium">{property.price}</td>
                              <td className="py-4 px-2">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  property.status === 'Active' || property.status === 'Approved'
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {property.status}
                                </span>
                              </td>
                              <td className="py-4 px-2 text-xs text-gray-500">{property.time}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>

            {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <Link href="/notifications" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center transition-colors">
                    View All 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
              </div>
                {isLoadingActivities ? (
                  <RecentActivitySkeleton />
                ) : recentActivities.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500">
                    No recent activities found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 py-4 first:pt-0 last:pb-0">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </div>
        </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
