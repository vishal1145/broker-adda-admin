'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';

export default function BrokersPage() {
  const [activeTab, setActiveTab] = useState('Registered Brokers');
  const [currentPage, setCurrentPage] = useState(1);

  const brokers = [
    {
      id: 1,
      name: 'Ralph Edwards',
      email: 'ralph.edwards@email.com',
      mobile: '+91 9856547563',
      status: 'Pending',
      photo: 'RE'
    },
    {
      id: 2,
      name: 'Wade Warren',
      email: 'wade.warren@email.com',
      mobile: '+91 9876543210',
      status: 'Approved',
      photo: 'WW'
    },
    {
      id: 3,
      name: 'Brooklyn Simmons',
      email: 'brooklyn.simmons@email.com',
      mobile: '+91 9123456789',
      status: 'Rejected',
      photo: 'BS'
    },
    {
      id: 4,
      name: 'Cody Fisher',
      email: 'cody.fisher@email.com',
      mobile: '+91 9988776655',
      status: 'Pending',
      photo: 'CF'
    },
    {
      id: 5,
      name: 'Dianne Russell',
      email: 'dianne.russell@email.com',
      mobile: '+91 9112233445',
      status: 'Approved',
      photo: 'DR'
    },
    {
      id: 6,
      name: 'Guy Hawkins',
      email: 'guy.hawkins@email.com',
      mobile: '+91 9556677889',
      status: 'Pending',
      photo: 'GH'
    },
    {
      id: 7,
      name: 'Jane Cooper',
      email: 'jane.cooper@email.com',
      mobile: '+91 9445566778',
      status: 'Approved',
      photo: 'JC'
    },
    {
      id: 8,
      name: 'Robert Fox',
      email: 'robert.fox@email.com',
      mobile: '+91 9334455667',
      status: 'Rejected',
      photo: 'RF'
    },
    {
      id: 9,
      name: 'Savannah Nguyen',
      email: 'savannah.nguyen@email.com',
      mobile: '+91 9223344556',
      status: 'Pending',
      photo: 'SN'
    },
    {
      id: 10,
      name: 'Marvin McKinney',
      email: 'marvin.mckinney@email.com',
      mobile: '+91 9112233445',
      status: 'Approved',
      photo: 'MM'
    }
  ];

  const handleApprove = (brokerId: number) => {
    console.log('Approving broker:', brokerId);
    // Add your approval logic here
  };

  const handleReject = (brokerId: number) => {
    console.log('Rejecting broker:', brokerId);
    // Add your rejection logic here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className=" space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
          <p className="text-gray-600 mt-1">View and manage all registered brokers</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by Name, Email, Phone Number"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

         

          {/* Action Buttons */}
          <div className="flex space-x-3">
           
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Brokers Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PHOTO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NUMBER</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brokers.map((broker) => (
                  <tr key={broker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">{broker.photo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{broker.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{broker.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{broker.mobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(broker.status)}`}>
                        {broker.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {broker.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => handleApprove(broker.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(broker.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1-10 of {brokers.length} Brokers
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className={`px-3 py-1 text-sm rounded ${currentPage === 1 ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`} style={currentPage === 1 ? { backgroundColor: 'var(--primary)' } : {}}>
              01
            </button>
            <button className={`px-3 py-1 text-sm rounded ${currentPage === 2 ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`} style={currentPage === 2 ? { backgroundColor: 'var(--primary)' } : {}}>
              02
            </button>
            <button className={`px-3 py-1 text-sm rounded ${currentPage === 3 ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`} style={currentPage === 3 ? { backgroundColor: 'var(--primary)' } : {}}>
              03
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}