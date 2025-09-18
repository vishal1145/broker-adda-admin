'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('This Month');
  const [activeTab, setActiveTab] = useState('Daily');

  const stats = [
    {
      name: 'Total Visitors',
      value: '3,847',
      change: '+7.12%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
        </svg>
      ),
    },
    {
      name: 'Active Tags',
      value: '1,264',
      change: '+8.3%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
        </svg>
      ),
    },
    {
      name: 'Expired Tags',
      value: '586',
      change: '-4.2%',
      changeType: 'negative',
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
      ),
    },
    {
      name: 'Commission Payable',
      value: '₹20,000',
      change: '+8.3%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
      ),
    },
  ];

  const projects = [
    { name: 'Skyline Heights', location: 'Mumbai', visitors: '1,356', brokers: '36', conversion: '24.5%' },
    { name: 'Green Valley', location: 'Pune', visitors: '1,356', brokers: '36', conversion: '24.5%' },
    { name: 'Urban Square', location: 'Bangalore', visitors: '1,356', brokers: '36', conversion: '24.5%' },
    { name: 'Coastal Breeze', location: 'Noida', visitors: '1,356', brokers: '36', conversion: '24.5%' },
    { name: 'Metro Heights', location: 'Delhi', visitors: '1,356', brokers: '36', conversion: '24.5%' },
  ];

  const recentActivities = [
    { id: 1, action: 'New Broker Rahul Sharma Registered', time: '10 minutes ago', color: 'blue' },
    { id: 2, action: '25 New Tags Issued At Skyline Heights', time: '1 hour ago', color: 'green' },
    { id: 3, action: '12 Tags Expired At Green Valley', time: '2 hours ago', color: 'orange' },
    { id: 4, action: 'Monthly Report For June 2025 is Ready', time: '3 hours ago', color: 'purple' },
  ];

  // Chart data for the line chart
  const chartData = [
    { day: 'Mon', value: 40 },
    { day: 'Tue', value: 60 },
    { day: 'Wed', value: 48 },
    { day: 'Thu', value: 67 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 78 },
    { day: 'Sun', value: 78 },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className=" space-y-6">
        {/* Header with Time Filter */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
            <p className="text-gray-600">Real-time visitor management statistics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary "
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 flex items-center ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-1">{stat.changeType === 'positive' ? '↑' : '↓'}</span>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Footfall Trends - Line Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Daily Footfall Trends</h3>
              <div className="flex space-x-1">
                <button 
                  onClick={() => setActiveTab('Daily')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'Daily' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setActiveTab('Weekly')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'Weekly' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setActiveTab('Monthly')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'Monthly' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Monthly
                </button>
              </div>
            </div>
            
            {/* Line Chart */}
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Y-axis labels */}
                {[30, 40, 50, 60, 70, 80, 90, 100].map((value, index) => (
                  <text key={value} x="10" y={180 - (value - 30) * 1.5} className="text-xs fill-gray-500">
                    {value}
                  </text>
                ))}
                
                {/* X-axis labels */}
                {chartData.map((item, index) => (
                  <text key={item.day} x={60 + index * 50} y="195" className="text-xs fill-gray-500 text-center">
                    {item.day}
                  </text>
                ))}
                
                {/* Line chart */}
                <polyline
                  fill="none"
                  stroke="#1E40AF"
                  strokeWidth="3"
                  points={chartData.map((item, index) => 
                    `${60 + index * 50},${180 - (item.value - 30) * 1.5}`
                  ).join(' ')}
                />
                
                {/* Data points */}
                {chartData.map((item, index) => (
                  <circle
                    key={index}
                    cx={60 + index * 50}
                    cy={180 - (item.value - 30) * 1.5}
                    r="4"
                    fill="#1E40AF"
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Tag Validity & Expiry Forecast - Donut Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tag Validity & Expiry Forecast</h3>
            
            <div className="h-64 flex items-center justify-center">
              <div className="flex items-center space-x-8">
                {/* Donut Chart */}
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Active - Dark Blue (45%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#1E40AF"
                      strokeWidth="20"
                      strokeDasharray={`${45 * 2.51} 251`}
                      strokeDashoffset="0"
                    />
                    {/* Expiring in 7 Days - Yellow (25%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="20"
                      strokeDasharray={`${25 * 2.51} 251`}
                      strokeDashoffset={`-${45 * 2.51}`}
                    />
                    {/* Expiring in 30 Days - Light Blue (20%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="20"
                      strokeDasharray={`${20 * 2.51} 251`}
                      strokeDashoffset={`-${70 * 2.51}`}
                    />
                    {/* Expired - Red (10%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="20"
                      strokeDasharray={`${10 * 2.51} 251`}
                      strokeDashoffset={`-${90 * 2.51}`}
                    />
                  </svg>
                </div>
                
                {/* Legend */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-800"></div>
                    <span className="text-sm text-gray-700">Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-700">Expiring in 7 Days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-sm text-gray-700">Expiring in 30 Days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    <span className="text-sm text-gray-700">Expired</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site/Project Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Site/Project Performance</h3>
              <a href="#" className="text-sm text-primary hover:text-hover flex items-center">
                View All Projects 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search Projects"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-500">NAME</th>
                    <th className="text-left py-2 font-medium text-gray-500">LOCATION</th>
                    <th className="text-left py-2 font-medium text-gray-500">VISITORS</th>
                    <th className="text-left py-2 font-medium text-gray-500">BROKERS</th>
                    <th className="text-left py-2 font-medium text-gray-500">CONVERSION</th>
                    <th className="text-left py-2 font-medium text-gray-500">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 font-medium text-gray-900">{project.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {project.location}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{project.visitors}</td>
                      <td className="py-3 text-gray-600">{project.brokers}</td>
                      <td className="py-3 text-green-600 font-medium">{project.conversion}</td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tag Validity Setting</p>
                    <p className="text-sm text-gray-500">Default: 60 Days</p>
                  </div>
                  <a href="#" className="text-sm text-primary hover:text-hover flex items-center">
                    Edit 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Site Settings Access</p>
                    <p className="text-sm text-gray-500">12 Sites Configured</p>
                  </div>
                  <a href="#" className="text-sm text-primary hover:text-hover flex items-center">
                    Manage 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Daily Email Report</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-500 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Tag Expiry Alerts</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-500 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Mobile Notifications</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-500 cursor-pointer"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <a href="#" className="text-sm text-primary hover:text-hover flex items-center">
                  View All 
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`h-2 w-2 rounded-full mt-2 ${
                        activity.color === 'blue' ? 'bg-blue-500' :
                        activity.color === 'green' ? 'bg-green-500' :
                        activity.color === 'orange' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
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
