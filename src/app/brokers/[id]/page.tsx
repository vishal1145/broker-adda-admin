'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '@/components/Layout';

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
  leaders?: Array<{
    id: number;
    name: string;
    role: string;
    email: string;
    phone: string;
    status: string;
    experience: string;
  }>;
}

export default function BrokerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('');

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
      aadhar: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&auto=format&q=80',
      pan: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&auto=format&q=80',
      gst: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&auto=format&q=80'
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

  const openImageModal = (imageUrl: string, title: string) => {
    setSelectedImage(imageUrl);
    setImageTitle(title);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setImageTitle('');
  };

  // Skeleton loader component for broker details
  const BrokerDetailsSkeleton = () => (
    <div className="space-y-6">
      {/* Profile Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start">
          {/* Left Section Skeleton */}
          <div className="flex-shrink-0 text-center pr-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse mx-auto mb-6"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-36 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
            </div>
          </div>
          
          {/* Vertical Divider */}
          <div className="flex-shrink-0 w-0.5 bg-gray-300 mx-6 h-full min-h-[200px]"></div>
          
          {/* Right Section Skeleton */}
          <div className="flex-1 pl-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KYC Documents Skeleton */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

        {/* Team Lead Skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="h-12 bg-gray-50"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );

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
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Brokers
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Broker Details</h1>
          <p className="text-gray-600 mt-1">Complete information about the broker</p>
        </div>

        {loading ? (
          <BrokerDetailsSkeleton />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : !broker ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Broker Not Found</h2>
            <p className="text-gray-600 mb-4">The broker you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>

        {/* Cards Row - 4:4:4 ratio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Profile</h2>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${broker.approvedByAdmin ? 'bg-green-50 text-green-800 border-green-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
                <div className={`w-2 h-2 rounded-full mr-1.5 ${broker.approvedByAdmin ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                {broker.approvedByAdmin ? 'Active' : 'Pending'}
              </span>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-gray-100 shadow-md">
                <Image 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80" 
                  alt={broker.name || 'Broker'} 
                  className="w-full h-full object-cover"
                  width={64}
                  height={64}
                  unoptimized={true}
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{broker.name || 'N/A'}</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-3 h-3 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-xs font-medium">{broker.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-3 h-3 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">{broker.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* About Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Firm Name</label>
                <p className="text-sm font-semibold text-gray-900">{broker.firmName}</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Registration Date</label>
                <p className="text-sm font-semibold text-gray-900">{new Date(broker.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Regions</label>
                <div className="flex flex-wrap gap-1">
                  {broker.region.map((region, index) => (
                    <span key={region._id} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                      <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {region.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment Status</label>
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border bg-green-50 text-green-800 border-green-200">
                  <div className="w-2 h-2 rounded-full mr-1.5 bg-green-500"></div>
                  Up to Date
                </span>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Payment</label>
                <p className="text-sm font-semibold text-gray-900">₹15,000</p>
                <p className="text-xs text-gray-500">January 15, 2024</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Next Payment Due</label>
                <p className="text-sm font-semibold text-gray-900">February 15, 2024</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Commission</label>
                <p className="text-lg font-bold text-green-600">₹2,45,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table and KYC Section - 8:4 ratio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Leads Table - 8/12 ratio */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Leads</h2>
            </div>
                  
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow-lg border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Lead Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  {
                    id: 1,
                    name: "John Allen",
                    email: "john.allen@alphafinancial.com",
                    phone: "+91 98765 43210",
                    status: "Active",
                    property: "Commercial Plaza"
                  },
                  {
                    id: 2,
                    name: "Sarah Johnson",
                    email: "sarah.johnson@alphafinancial.com",
                    phone: "+91 98765 43211",
                    status: "Active",
                    property: "Residential Complex"
                  },
                  {
                    id: 3,
                    name: "Michael Chen",
                    email: "michael.chen@alphafinancial.com",
                    phone: "+91 98765 43212",
                    status: "On Leave",
                    property: "Office Building"
                  }
                ].map((leader) => (
                  <tr key={leader.id} className="hover:bg-gray-50 transition-colors">
               <td className="px-6 py-4 whitespace-nowrap">
                 <div className="flex items-center">
                   <Image 
                     src={`data:image/jpeg;base64,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`}
                     alt={leader.name}
                     className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-gray-200"
                     width={40}
                     height={40}
                     unoptimized={true}
                   />
                   <div>
                     <div className="text-sm font-semibold text-gray-900">{leader.name}</div>
                     <div className="text-sm text-gray-500">{leader.email}</div>
                   </div>
                 </div>
               </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{leader.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
                        leader.status === 'Active' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1.5 ${
                          leader.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        {leader.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {leader.property}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KYC Documents Card - 4/12 ratio */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">KYC Documents</h2>
            
            <div className="space-y-4">
              {/* Aadhar Card */}
              <div 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => openImageModal(broker.kycDocs.aadhar, 'Aadhar Card')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Aadhar Card</p>
                      <p className="text-xs text-gray-500">Click to view</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* PAN Card */}
              <div 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => openImageModal(broker.kycDocs.pan, 'PAN Card')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">PAN Card</p>
                      <p className="text-xs text-gray-500">Click to view</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* GST Certificate */}
              <div 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => openImageModal(broker.kycDocs.gst, 'GST Certificate')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">GST Certificate</p>
                      <p className="text-xs text-gray-500">Click to view</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
          </>
        )}

      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 " onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="text-xl font-semibold text-gray-900">{imageTitle}</h3>
              <button
                onClick={closeImageModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <Image
                src={selectedImage}
                alt={imageTitle}
                className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg"
                width={800}
                height={600}
                unoptimized={true}
              />
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={closeImageModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
    </>
  );
}


