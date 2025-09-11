'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('This Month');

  const stats = [
    {
      name: 'Total Visitors',
      value: '3,847',
      change: '+1.2%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
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
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
    { id: 1, action: 'New Broker Rahul Sharma Registered', time: '10 minutes ago' },
    { id: 2, action: '25 New Tags Issued At Skyline Heights', time: '1 hour ago' },
    { id: 3, action: '12 Tags Expired At Green Valley', time: '2 hours ago' },
    { id: 4, action: 'Monthly Report For June 2025 is Ready', time: '3 hours ago' },
  ];

  return (
    <Layout title="Dashboard" subtitle="Overview">
      <div className="p-6 space-y-6">
        {/* Header with Time Filter */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.changeType === 'positive' ? '↑' : '↓'} {stat.change} from last month
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
          {/* Daily Footfall Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Daily Footfall Trends</h3>
              <div className="flex space-x-1">
                <button className="px-3 py-1 text-sm bg-red-600 text-white rounded">Daily</button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">Weekly</button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">Monthly</button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-500">Chart will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Tag Validity & Expiry Forecast */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tag Validity & Expiry Forecast</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">Donut chart will be displayed here</p>
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
              <a href="#" className="text-sm text-red-600 hover:text-red-700">View All Projects →</a>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search Projects"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-500">Name</th>
                    <th className="text-left py-2 font-medium text-gray-500">Location</th>
                    <th className="text-left py-2 font-medium text-gray-500">Visitors</th>
                    <th className="text-left py-2 font-medium text-gray-500">Brokers</th>
                    <th className="text-left py-2 font-medium text-gray-500">Conversion</th>
                    <th className="text-left py-2 font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 font-medium text-gray-900">{project.name}</td>
                      <td className="py-3 text-gray-600">{project.location}</td>
                      <td className="py-3 text-gray-600">{project.visitors}</td>
                      <td className="py-3 text-gray-600">{project.brokers}</td>
                      <td className="py-3 text-gray-600">{project.conversion}</td>
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
                  <a href="#" className="text-sm text-red-600 hover:text-red-700">Edit</a>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Site Settings Access</p>
                    <p className="text-sm text-gray-500">12 Sites Configured</p>
                  </div>
                  <a href="#" className="text-sm text-red-600 hover:text-red-700">Manage</a>
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
                <a href="#" className="text-sm text-red-600 hover:text-red-700">View All →</a>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-red-600 rounded-full mt-2"></div>
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
  );
}
