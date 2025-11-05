'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('This Month');
  const [activeTab, setActiveTab] = useState('Daily');

  const stats = [
    {
      name: 'Total Leads',
      value: '2,847',
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
      name: 'Active Brokers',
      value: '156',
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
      name: 'Total Properties',
      value: '1,234',
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
      name: 'New Leads Today',
      value: '47',
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
    { id: 1, action: 'New Broker Rahul Sharma Registered', time: '10 minutes ago', color: 'blue' },
    { id: 2, action: '15 New Leads Created in Mumbai Central', time: '1 hour ago', color: 'green' },
    { id: 3, action: 'Property "Luxury Apartment" Approved in Pune', time: '2 hours ago', color: 'orange' },
    { id: 4, action: 'Monthly Report For January 2025 is Ready', time: '3 hours ago', color: 'purple' },
  ];

  // Chart data for the line chart - Leads created per day
  const chartData = [
    { day: 'Mon', value: 52, leads: 52 },
    { day: 'Tue', value: 68, leads: 68 },
    { day: 'Wed', value: 45, leads: 45 },
    { day: 'Thu', value: 73, leads: 73 },
    { day: 'Fri', value: 89, leads: 89 },
    { day: 'Sat', value: 64, leads: 64 },
    { day: 'Sun', value: 58, leads: 58 },
  ];

  // Pie chart data for lead status distribution
  const leadStatusData = [
    { name: 'New', value: 35, color: '#1E40AF' },
    { name: 'Assigned', value: 28, color: '#F59E0B' },
    { name: 'In Progress', value: 22, color: '#3B82F6' },
    { name: 'Closed', value: 15, color: '#22C55E' },
  ];

  const COLORS = ['#1E40AF', '#F59E0B', '#3B82F6', '#22C55E'];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
        {/* Header with Time Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
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
          {stats.map((stat) => {
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

            return (
              <div key={stat.name} className={`relative rounded-xl border ${colors.border} ${colors.bg} p-4`}>
                <div>
                  <div className={`text-[12px] font-semibold ${colors.label}`}>{stat.name}</div>
                  <div className="mt-1 flex justify-between gap-2">
                    <div className={`text-2xl font-extrabold ${colors.value}`}>{stat.value}</div>
                    <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg} ${colors.iconText}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Footfall Trends - Line Chart */}
          <div className="bg-white rounded-xl shadow-xs p-6  duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-[16px] font-semibold text-gray-900">Daily Leads Trends</h3>
                <p className="text-xs text-gray-500 mt-1">New leads created per day</p>
              </div>
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab('Daily')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'Daily' 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setActiveTab('Weekly')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'Weekly' 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setActiveTab('Monthly')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'Monthly' 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            
            {/* Line Chart using Recharts */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
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
                            <p className="text-[14px] font-medium text-gray-900 mb-0.5">{payload[0].payload.day}</p>
                            <p className="text-xs text-teal-600 font-medium">value : {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0D9488" 
                    strokeWidth={2}
                    fill="url(#colorValue)"
                    dot={{ fill: '#0D9488', r: 3 }}
                    activeDot={{ r: 4, fill: '#0D9488' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tag Validity & Expiry Forecast - Pie Chart */}
          <div className="bg-white rounded-xl shadow-xs  p-6  duration-200">
            <div className="mb-6">
              <h3 className="text-[16px] font-semibold text-gray-900">Lead Status Distribution</h3>
              <p className="text-xs text-gray-500 mt-1">Current status of all leads</p>
            </div>
            
            <div className="h-80">
              <div className="flex flex-col lg:flex-row items-center justify-center h-full">
                <div className="w-full lg:w-1/2 h-64" style={{ border: 'none', outline: 'none' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ border: 'none', outline: 'none' }}>
                      <Pie
                        data={leadStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: { value?: number | string }) => `${props.value || 0}%`}
                        outerRadius={100}
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
                                <p className="text-xs font-medium text-gray-700">{payload[0].name} : {payload[0].value}</p>
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
                <div className="w-full lg:w-1/2 space-y-4 mt-6 lg:mt-0 lg:pl-6">
                  {leadStatusData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site/Project Performance */}
          <div className="bg-white rounded-xl shadow-xs p-6 duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-[16px] font-semibold text-gray-900">Region Performance</h3>
                <p className="text-xs text-gray-500 mt-1">Top performing regions overview</p>
              </div>
              <Link href="/regions" className="text-sm font-medium text-primary hover:text-hover flex items-center transition-colors">
                View All Regions 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Regions..."
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold  text-gray-700 text-xs uppercase tracking-wider">NAME</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">LOCATION</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">VISITORS</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">BROKERS</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">CONVERSION</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {regions.map((region, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2  text-sm font-semibold  text-gray-900">{region.name}</td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1  text-sm  rounded-full bg-blue-100 text-blue-800">
                          {region.location}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-700 font-medium">{region.visitors}</td>
                      <td className="py-4 px-2 text-gray-700 font-medium">{region.brokers}</td>
                      <td className="py-4 px-2">
                        <span className="text-green-600 font-semibold">{region.conversion}</span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex space-x-3">
                          <button className="text-gray-400 hover:text-primary transition-colors" title="View">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-primary transition-colors" title="Edit">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Settings & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Settings */}
            <div className="bg-white rounded-xl shadow-xs p-6 duration-200">
              <div className="mb-6">
                <h3 className="text-[16px] font-semibold text-gray-900">Quick Settings</h3>
                <p className="text-xs text-gray-500 mt-1">Manage your preferences</p>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Broker Verification</p>
                    <p className="text-xs text-gray-500 mt-0.5">156 Active Brokers</p>
                  </div>
                  <Link href="/brokers" className="text-sm font-medium text-primary hover:text-hover flex items-center transition-colors">
                    Manage 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Region Management</p>
                    <p className="text-xs text-gray-500 mt-0.5">12 Regions Active</p>
                  </div>
                  <Link href="/regions" className="text-sm font-medium text-primary hover:text-hover flex items-center transition-colors">
                    Manage 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">New Lead Alerts</span>
                      <p className="text-xs text-gray-500 mt-0.5">Get notified when new leads are created</p>
                    </div>
                    <div className="relative inline-block w-11 h-6 align-middle select-none">
                      <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer transition-all" defaultChecked />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-500 cursor-pointer transition-colors"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">Broker Approval Notifications</span>
                      <p className="text-xs text-gray-500 mt-0.5">Alert when broker requests approval</p>
                    </div>
                    <div className="relative inline-block w-11 h-6 align-middle select-none">
                      <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer transition-all" defaultChecked />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-500 cursor-pointer transition-colors"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">Daily Summary Report</span>
                      <p className="text-xs text-gray-500 mt-0.5">Receive daily statistics via email</p>
                    </div>
                    <div className="relative inline-block w-11 h-6 align-middle select-none">
                      <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer transition-all" defaultChecked />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-500 cursor-pointer transition-colors"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-xs p-6 duration-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-500 mt-1">Latest updates and notifications</p>
                </div>
                <a href="#" className="text-sm font-medium text-primary hover:text-hover flex items-center transition-colors">
                  View All 
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`h-3 w-3 rounded-full ${
                        activity.color === 'blue' ? 'bg-blue-500' :
                        activity.color === 'green' ? 'bg-green-500' :
                        activity.color === 'orange' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}></div>
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
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
