'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Link from 'next/link';
import { leadsAPI, regionAPI, propertiesAPI, brokerAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('This Month');
  const [activeTab, setActiveTab] = useState('Daily');
  const [totalLeads, setTotalLeads] = useState('2,847');
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [totalRegions, setTotalRegions] = useState('47');
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [totalBrokers, setTotalBrokers] = useState('156');
  const [isLoadingBrokers, setIsLoadingBrokers] = useState(false);
  const [totalProperties, setTotalProperties] = useState('1,234');
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [chartData, setChartData] = useState([
    { month: 'Jan', leads: 110, brokers: 45, properties: 85 },
    { month: 'Feb', leads: 135, brokers: 52, properties: 98 },
    { month: 'Mar', leads: 160, brokers: 58, properties: 112 },
    { month: 'Apr', leads: 175, brokers: 65, properties: 125 },
    { month: 'May', leads: 145, brokers: 60, properties: 108 },
    { month: 'Jun', leads: 190, brokers: 72, properties: 140 },
  ]);

  const stats = [
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
      name: 'Total Leads',
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
  ];

  const regions = [
    { name: 'Mumbai', location: 'Mumbai, Maharashtra', visitors: '856', brokers: '24', conversion: '18.2%' },
    { name: 'Pune', location: 'Pune, Maharashtra', visitors: '642', brokers: '18', conversion: '22.5%' },
    { name: 'Bangalore', location: 'Bangalore, Karnataka', visitors: '1,234', brokers: '32', conversion: '26.8%' },
    { name: 'Delhi', location: 'Delhi, Delhi', visitors: '1,089', brokers: '28', conversion: '24.3%' },
    { name: 'Hyderabad', location: 'Hyderabad, Telangana', visitors: '523', brokers: '15', conversion: '19.5%' },
  ];

  const recentActivities = [
    { id: 1, action: 'Property Created: 2bhk', time: '6 minutes ago' },
    { id: 2, action: 'Property Approved: NX ONe', time: '39 minutes ago' },
    { id: 3, action: 'Property Updated: Spacious 3BHK Apartment in Sector 62', time: '18 hours ago' },
    { id: 4, action: 'Property Updated: Spacious 3BHK Apartment in Sector 62', time: '18 hours ago' },
    { id: 5, action: 'Property Created: NX ONe', time: '18 hours ago' },
    { id: 6, action: 'Property Created: dfgbf', time: '18 hours ago' },
  ];

  const newLeads = [
    { id: 1, name: 'Rajesh Kumar', property: '2BHK Apartment', location: 'Mumbai', time: '5 min ago', status: 'New', phone: '+91 98765 43210' },
    { id: 2, name: 'Priya Sharma', property: '3BHK Villa', location: 'Pune', time: '12 min ago', status: 'New', phone: '+91 98765 43211' },
    { id: 3, name: 'Amit Patel', property: '1BHK Flat', location: 'Bangalore', time: '18 min ago', status: 'New', phone: '+91 98765 43212' },
    { id: 4, name: 'Sneha Reddy', property: '4BHK Penthouse', location: 'Hyderabad', time: '25 min ago', status: 'New', phone: '+91 98765 43213' },
  ];

  const newBrokers = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', location: 'Mumbai', time: '10 min ago', status: 'Pending', phone: '+91 98765 43220' },
    { id: 2, name: 'Anjali Gupta', email: 'anjali@example.com', location: 'Delhi', time: '35 min ago', status: 'Pending', phone: '+91 98765 43221' },
    { id: 3, name: 'Vikram Singh', email: 'vikram@example.com', location: 'Pune', time: '1 hour ago', status: 'Approved', phone: '+91 98765 43222' },
    { id: 4, name: 'Kavita Desai', email: 'kavita@example.com', location: 'Bangalore', time: '2 hours ago', status: 'Pending', phone: '+91 98765 43223' },
  ];

  const newProperties = [
    { id: 1, name: 'Luxury 3BHK Apartment', location: 'Mumbai', price: '₹2.5 Cr', status: 'Active', time: '15 min ago' },
    { id: 2, name: 'Modern 2BHK Flat', location: 'Pune', price: '₹1.2 Cr', status: 'Active', time: '28 min ago' },
    { id: 3, name: 'Spacious 4BHK Villa', location: 'Bangalore', price: '₹4.8 Cr', status: 'Pending', time: '45 min ago' },
    { id: 4, name: 'Premium 1BHK Studio', location: 'Delhi', price: '₹85 L', status: 'Active', time: '1 hour ago' },
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

  useEffect(() => {
    fetchLeadsMetrics();
    fetchRegionsStats();
    fetchBrokersStats();
    fetchPropertiesMetrics();
  }, [fetchLeadsMetrics, fetchRegionsStats, fetchBrokersStats, fetchPropertiesMetrics]);


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
          <div className="flex items-center space-x-3">
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
          </div>
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
            const isLoading = index === 0 ? isLoadingBrokers : 
                            index === 1 ? isLoadingLeads : 
                            index === 2 ? isLoadingProperties : 
                            isLoadingRegions;

            // Map stat names to routes
            const getRoute = (name: string) => {
              if (name.includes('Region')) return '/regions';
              if (name.includes('Broker')) return '/brokers';
              if (name.includes('Lead')) return '/leads';
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
              <p className="text-xs text-gray-500 mt-1">Leads, Brokers, and Properties by month</p>
            </div>
            </div>
            
          {/* Grouped Bar Chart using Recharts */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="month" 
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
                      return (
                        <div className="bg-white rounded-lg shadow-xs px-2 py-1.5">
                          <p className="text-[14px] font-medium text-gray-900 mb-1">{data.month}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className={`text-xs font-medium ${
                              entry.dataKey === 'leads' ? 'text-blue-600' :
                              entry.dataKey === 'brokers' ? 'text-green-600' :
                              'text-yellow-600'
                            }`}>
                              {entry.dataKey === 'leads' ? 'Leads' : entry.dataKey === 'brokers' ? 'Brokers' : 'Properties'}: {entry.value?.toLocaleString() || 0}
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
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
                <Bar 
                  dataKey="brokers" 
                  fill="#22C55E"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
                <Bar 
                  dataKey="properties" 
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
                <h3 className="text-[16px] font-semibold text-gray-900">New Leads</h3>
                <p className="text-xs text-gray-500 mt-1">Recently created leads</p>
              </div>
              <Link href="/leads" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center transition-colors">
                View All 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">NAME</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">PROPERTY</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">LOCATION</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">STATUS</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {newLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 text-xs font-semibold text-gray-900">{lead.name}</td>
                      <td className="py-4 px-2 text-xs text-gray-700 font-medium">{lead.property}</td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {lead.location}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-xs text-gray-500">{lead.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">NAME</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">EMAIL</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">LOCATION</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">STATUS</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {newBrokers.map((broker) => (
                    <tr key={broker.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 text-xs font-semibold text-gray-900">{broker.name}</td>
                      <td className="py-4 px-2 text-xs text-gray-700 font-medium">{broker.email}</td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {broker.location}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          broker.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {broker.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-xs text-gray-500">{broker.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">PROPERTY</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">LOCATION</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">PRICE</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">STATUS</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">TIME</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {newProperties.map((property) => (
                        <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-2 text-xs font-semibold text-gray-900">{property.name}</td>
                          <td className="py-4 px-2">
                            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {property.location}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-xs text-gray-700 font-medium">{property.price}</td>
                          <td className="py-4 px-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              property.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {property.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-xs text-gray-500">{property.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                    View All 
                  </a>
                </div>
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
              </div>
            </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
