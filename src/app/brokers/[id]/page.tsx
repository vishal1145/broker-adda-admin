'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { brokerAPI } from '@/services/api';

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
  // Optional fields that might be populated
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  accreditedBy?: string;
  licenseNumber?: string;
  expertiseField?: string;
  state?: string;
}

export default function BrokerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock static data for demonstration
  const mockBrokerData: Broker = {
    _id: params.id as string,
    userId: 'user123',
    firmName: 'Alpha Financial Services',
    region: [
      { _id: 'reg1', name: 'Mumbai', description: 'Financial capital of India' },
      { _id: 'reg2', name: 'Delhi', description: 'National capital region' }
    ],
    regionId: 'reg1',
    status: 'active',
    approvedByAdmin: true,
    kycDocs: {
      aadhar: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Aadhar+Card',
      pan: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=PAN+Card',
      gst: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=GST+Certificate'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    __v: 0,
    name: 'Rajesh Kumar Sharma',
    email: 'rajesh.sharma@alphafinancial.com',
    phone: '+91 98765 43210',
    address: '123 Business Park, Andheri West, Mumbai - 400058',
    accreditedBy: 'SEBI (Securities and Exchange Board of India)',
    licenseNumber: 'SEBI/REG/2024/001234',
    expertiseField: 'Equity Trading, Mutual Funds, Insurance',
    state: 'Maharashtra'
  };

  useEffect(() => {
    // Simulate API call with static data
    const fetchBrokerDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setBroker(mockBrokerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch broker details');
      } finally {
        setLoading(false);
      }
    };

    fetchBrokerDetails();
  }, [params.id]);

  const getStatusColor = (approved: boolean) => {
    return approved ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getStatusText = (approved: boolean) => {
    return approved ? 'Approved' : 'Pending Approval';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-gray-600">Loading broker details...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  if (!broker) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Broker Not Found</h2>
          <p className="text-gray-600 mb-4">The broker you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Broker Details - Broker Adda Admin</title>
      </Head>
      <Layout>
        <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Brokers
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Broker Details</h1>
          <p className="text-gray-600 mt-1">Complete information about the broker</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
          <div className="flex items-center space-x-6">
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {broker.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{broker.name || 'N/A'}</h2>
                  <p className="text-lg text-gray-600">{broker.firmName}</p>
                  <p className="text-sm text-gray-500">{broker.email || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border ${getStatusColor(broker.approvedByAdmin)}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${broker.approvedByAdmin ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
                    {getStatusText(broker.approvedByAdmin)}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Member since {new Date(broker.createdAt).getFullYear()}</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{broker.region.length}</div>
                  <div className="text-sm text-gray-600">Operating Regions</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{broker.licenseNumber ? 'Verified' : 'Pending'}</div>
                  <div className="text-sm text-gray-600">License Status</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{broker.phone ? 'Active' : 'N/A'}</div>
                  <div className="text-sm text-gray-600">Contact Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">PERSONAL INFORMATION</h2>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {broker.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{broker.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <p className="text-gray-900">{broker.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900">{broker.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <p className="text-gray-900">{broker.state || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{broker.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Company Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-6">COMPANY INFORMATION</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name</label>
                  <p className="text-gray-900 font-medium">{broker.firmName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <p className="text-gray-900">{broker.licenseNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accredited By</label>
                  <p className="text-gray-900">{broker.accreditedBy || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expertise Field</label>
                  <p className="text-gray-900">{broker.expertiseField || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Regions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-6">OPERATING REGIONS</h2>
              
              <div className="space-y-4">
                {broker.region.map((region, index) => (
                  <div key={region._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{region.name}</h3>
                      <p className="text-sm text-gray-600">{region.description}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Region {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - KYC Documents & Timeline */}
          <div className="space-y-6">
            {/* KYC Documents Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-6">KYC DOCUMENTS</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card</label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={broker.kycDocs.aadhar} 
                      alt="Aadhar Card" 
                      className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(broker.kycDocs.aadhar, '_blank')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card</label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={broker.kycDocs.pan} 
                      alt="PAN Card" 
                      className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(broker.kycDocs.pan, '_blank')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Certificate</label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={broker.kycDocs.gst} 
                      alt="GST Certificate" 
                      className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(broker.kycDocs.gst, '_blank')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-6">TIMELINE</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-xs text-gray-500">{formatDate(broker.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(broker.updatedAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-2 ${broker.approvedByAdmin ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Admin Approval</p>
                    <p className="text-xs text-gray-500">
                      {broker.approvedByAdmin ? 'Approved' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-6">ACTIONS</h2>
              
              <div className="space-y-3">
                {!broker.approvedByAdmin && (
                  <>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      Approve Broker
                    </button>
                    <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                      Reject Broker
                    </button>
                  </>
                )}
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  Download Report
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </>
  );
}
