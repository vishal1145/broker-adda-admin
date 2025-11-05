'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

  // Chart data for the bar chart - Leads by Month
  const chartData = [
    { month: 'Jan', value: 110, leads: 110 },
    { month: 'Feb', value: 135, leads: 135 },
    { month: 'Mar', value: 160, leads: 160 },
    { month: 'Apr', value: 175, leads: 175 },
    { month: 'May', value: 145, leads: 145 },
    { month: 'Jun', value: 190, leads: 190 },
  ];

  // Donut chart data for lead status distribution
  const leadStatusData = [
    { name: 'New', value: 35, color: '#1E40AF' },
    { name: 'Assigned', value: 28, color: '#F59E0B' },
    { name: 'In Progress', value: 22, color: '#3B82F6' },
    { name: 'Closed', value: 15, color: '#22C55E' },
  ];

  const COLORS = ['#1E40AF', '#F59E0B', '#3B82F6', '#22C55E'];

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
            const isLoading = index === 0 ? isLoadingRegions : 
                            index === 1 ? isLoadingBrokers : 
                            index === 2 ? isLoadingLeads : 
                            isLoadingProperties;

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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads by Month - Bar Chart */}
          <div className="bg-white rounded-xl shadow-xs p-4  duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div>
                <h3 className="text-[16px] font-semibold text-gray-900">Leads by Month</h3>
                <p className="text-xs text-gray-500 mt-1">Monthly lead generation overview</p>
              </div>
            </div>
            
            {/* Bar Chart using Recharts */}
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
                        return (
                          <div className="bg-white rounded-lg shadow-xs px-2 py-1.5">
                            <p className="text-[14px] font-medium text-gray-900 mb-0.5">{payload[0].payload.month}</p>
                            <p className="text-xs text-blue-600 font-medium">value : {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Status Distribution - Donut Chart */}
          <div className="bg-white rounded-xl shadow-xs  p-4  duration-200">
            <div className="mb-4">
              <h3 className="text-[16px] font-semibold text-gray-900">Lead Status Distribution</h3>
              <p className="text-xs text-gray-500 mt-1">Current status of all leads</p>
            </div>
            
            <div className="h-56">
              <div className="flex flex-col lg:flex-row items-center justify-center h-full">
                <div className="w-full lg:w-1/2 h-48" style={{ border: 'none', outline: 'none' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ border: 'none', outline: 'none' }}>
                      <Pie
                        data={leadStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        innerRadius={40}
                        outerRadius={65}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                        strokeWidth={0}
                      >
                        {leadStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white rounded-lg shadow-xs px-2 py-1.5">
                                <p className="text-xs font-normal text-gray-700">{payload[0].name} : {payload[0].value}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="w-full lg:w-1/2 space-y-2 mt-3 lg:mt-0 lg:pl-4">
                  {leadStatusData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <span className="text-xs font-normal text-gray-700">{item.name}</span>
                  </div>
                      <span className="text-xs font-normal text-gray-900">{item.value}%</span>
                  </div>
                  ))}
                </div>
              </div>
            </div>
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
      </Layout>
    </ProtectedRoute>
  );
}
