'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { brokerAPI } from '@/services/api';


interface Broker {
  _id: string;
  userId: {
    _id: string;
    phone: string;
    status: string;
    email: string;
    name: string;
  };
  firmName: string;
  region: Array<{
    _id: string;
    name: string;
    description: string;
    state: string;
    city: string;
    centerLocation: string;
    radius: number;
  }>;
  brokerImage: string;
  status: string;
  approvedByAdmin: string;
  kycDocs: {
    aadhar: string;
    pan: string;
    gst: string;
    brokerLicense: string;
    companyId: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  email: string;
  name: string;
  phone: string;
  propertyCount?: number;
  propertiesCount?: number;
  address: string;
  gender: string;

  // ✅ ADD THIS FIELD
  properties?: Array<{
    _id: string;
    title: string;
    type: string;
    status: string;
    price: number;
    location: string;
    images?: string[];
    createdAt: string;
    updatedAt: string;
  }>;

  // Hardcoded fields for other sections
  accreditedBy?: string;
  licenseNumber?: string;
  expertiseField?: string;
  state?: string;
  experience?: string;
  dateOfBirth?: string;
  specializations?: string[];
  website?: string;
  whatsappNumber?: string;
  socialMedia?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
  leads?: Array<{
    id: number;
    name: string;
    inquiry: string;
    property: string;
    status: string;
  }>;
  subscription?: {
    plan: string;
    status: string;
    paymentMethod: string;
    nextBillingDate: string;
    amountDue: string;
  };
  leadsCreated?: {
    count?: number;
    items?: Array<{
      _id?: string;
      customerName?: string;
      name?: string;
      inquiry?: string;
      requirement?: string;
      propertyType?: string;
      property?: string;
      status?: string;
      createdAt?: string;
    }>;
  };
}


export default function BrokerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);


  useEffect(() => {
    const fetchBrokerDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!token) {
          setError('Authentication token not found. Please login again.');
          return;
        }
        
        console.log('🔄 Fetching broker details for ID:', params.id);
        const response = await brokerAPI.getBrokerById(params.id as string);
        
        console.log('📊 API Response:', response);
        
        if (response.success && response.data.broker) {
          setBroker(response.data.broker);
        } else {
          throw new Error(response.message || 'Failed to fetch broker details');
        }
      } catch (err) {
        console.error('❌ Error fetching broker details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch broker details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && token) {
      fetchBrokerDetails();
    }
  }, [params.id, token]);

  // Removed unused getStatusColor

  // Handle broker blocking confirmation
  const handleBlockClick = () => {
    setShowBlockConfirm(true);
  };

  // Handle broker unblocking confirmation
  const handleUnblockClick = () => {
    setShowUnblockConfirm(true);
  };

  // Handle broker blocking
  const handleBlock = async () => {
    if (!broker) return;
    
    try {
      setActionLoading(true);
      setError('');
      console.log('🔴 Blocking broker with ID:', broker._id);
      const response = await brokerAPI.blockBroker(broker._id);
      console.log('🔴 Block API response:', response);
      
      // Update local state
      setBroker(prevBroker => 
        prevBroker ? { ...prevBroker, approvedByAdmin: 'blocked' } : null
      );
      
      // Close confirmation dialog
      setShowBlockConfirm(false);
    } catch (err) {
      console.error('🔴 Block error:', err);
      setError(err instanceof Error ? err.message : 'Failed to block broker');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle broker unblocking
  const handleUnblock = async () => {
    if (!broker) return;
    
    try {
      setActionLoading(true);
      setError('');
      console.log('🟢 Unblocking broker with ID:', broker._id);
      const response = await brokerAPI.unblockBroker(broker._id);
      console.log('🟢 Unblock API response:', response);
      
      // Update local state
      setBroker(prevBroker => 
        prevBroker ? { ...prevBroker, approvedByAdmin: 'unblocked' } : null
      );
      
      // Close confirmation dialog
      setShowUnblockConfirm(false);
    } catch (err) {
      console.error('🟢 Unblock error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unblock broker');
    } finally {
      setActionLoading(false);
    }
  };

  // Skeleton loader component for broker details
  const BrokerDetailsSkeleton = () => (
    <div className="space-y-6">
      {/* Broker Information Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="grid grid-cols-3 gap-6">
              {/* Left column placeholders */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              </div>

              {/* Middle column placeholders */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                </div>
              </div>

              {/* Right column placeholders: License + Regions (aligned right) */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* License */}
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                  {/* Regions (right-aligned label and chips) */}
                  <div className="text-right space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16 ml-auto"></div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-5 w-14 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                {/* Specializations placeholder */}
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-5 w-28 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details & Active Leads Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
            </div>
          ))}
        </div>
      </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription & Payment Details Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-4"></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
          </div>
        </div>
    </div>
  );

  // Use image URL with proxy for external URLs to avoid Next.js image domain issues
  const getBrokerImageUrl = (brokerImage: string | undefined) => {
    if (!brokerImage) {
      return "https://www.w3schools.com/howto/img_avatar.png";
    }
    if (brokerImage.includes('broker-adda-be.algofolks.com') || 
        brokerImage.includes('https://') || 
        (brokerImage.includes('http://') && !brokerImage.includes('localhost'))) {
      return `/api/image-proxy?url=${encodeURIComponent(brokerImage)}`;
    }
    return brokerImage;
  };


  const handleViewDetails = (_id: string) => {
    router.push(`/properties/${_id}`); // Navigate to property detail page
  };
 

  return (
    <ProtectedRoute>
      <Head>
        <title>Broker Details - Broker Adda Admin</title>
      </Head>
      <Layout>
        <div className="space-y-6 px-6 sm:px-8 lg:px-14">
        {/* Page Header */}
        {/* <div className="mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 cursor-pointer mr-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Broker Details</h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">Complete information about the broker</p>
        </div> */}

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
              {/* Broker Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Broker Information</h2>
                  {broker.approvedByAdmin === 'unblocked' ? (
                    <button 
                      onClick={handleBlockClick}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM5 19L19 5" />
                      </svg>
                      <span>{actionLoading ? 'Blocking...' : 'Block'}</span>
                    </button>
                  ) : broker.approvedByAdmin === 'blocked' ? (
                    <button 
                      onClick={handleUnblockClick}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{actionLoading ? 'Unblocking...' : 'Unblock'}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleBlockClick}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM5 19L19 5" />
                      </svg>
                      <span>{actionLoading ? 'Blocking...' : 'Block Broker'}</span>
                    </button>
                  )}
            </div>
            
                <div className="flex items-start space-x-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={getBrokerImageUrl(broker.brokerImage) || "https://www.w3schools.com/howto/img_avatar.png"}
                      alt={broker.name || 'Broker'} 
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                  
                  {/* Profile Details */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{broker.name || '-'}</h3>
                    <p className="text-lg text-gray-600 mb-6 capitalize">{broker.firmName || '-'}</p>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-3 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">Firm</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 capitalize">{broker.firmName || '-'}</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">Gender</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 capitalize">{broker.gender || '-'}</p>
                        </div>
                      </div>

                      {/* Middle Column */}
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            broker.approvedByAdmin === 'unblocked' 
                              ? 'bg-green-100 text-green-800' 
                              : broker.approvedByAdmin === 'blocked'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {broker.approvedByAdmin === 'unblocked' ? 'Unblocked' : 
                             broker.approvedByAdmin === 'blocked' ? 'Blocked' : '-'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">Joined Date</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{broker.createdAt ? new Date(broker.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
                        </div>
                      </div>
              
                      {/* Right Column */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm font-medium text-gray-500">License</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{broker.licenseNumber || '-'}</p>
                          </div>
                          <div className="text-right min-w-[180px] flex flex-col items-end">
                            <div className="inline-flex items-center gap-2 mb-1 mr-7 ">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <p className="text-sm font-medium text-gray-500 mb-1">Regions</p>
                            </div>
                            {Array.isArray(broker.region) && broker.region.length > 0 ? (
                              <div className="flex flex-wrap gap-2 justify-end w-full">
                                {broker.region.map((r) => (
                                  <span key={r._id} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                                    {r.name || '-'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm font-semibold text-gray-900">-</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">Specializations</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(broker.specializations && broker.specializations.length > 0) ? (
                              broker.specializations.map((spec, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                  {spec}
                                </span>
                              ))
                            ) : (
                              ['Residential Sales', 'Commercial Leasing', 'Luxury Homes'].map((spec, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                  {spec}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                </div>
              </div>
            </div>
          </div>


              {/* Contact Details & Active Leads Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Contact Details</h2>
                  
                  <div className="space-y-5">
                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Mobile</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-teal-600">{broker.phone || '-'}</p>
                          {broker.phone && (
                            <svg className="w-3 h-3 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                        <p className="text-sm font-semibold text-teal-600">{broker.whatsappNumber || broker.phone || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-teal-600">{broker.email || '-'}</p>
                          {broker.email && (
                            <svg className="w-3 h-3 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Office Address</p>
                        <p className="text-sm font-semibold text-gray-900">{broker.address || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Website</p>
                        {broker.website ? (
                          <a 
                            href={broker.website.startsWith('http') ? broker.website : `https://${broker.website}`} 
                            className="text-sm font-semibold text-teal-600 hover:underline" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {broker.website}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Social Media Section */}
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500 mb-3">Social Media</p>
                    <div className="flex items-center space-x-4">
                      {broker.socialMedia?.linkedin && (
                        <a 
                          href={broker.socialMedia.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {broker.socialMedia?.twitter && (
                        <a 
                          href={broker.socialMedia.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-blue-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                      )}
                      {broker.socialMedia?.instagram && (
                        <a 
                          href={broker.socialMedia.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-pink-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                          </svg>
                        </a>
                      )}
                      {broker.socialMedia?.facebook && (
                        <a 
                          href={broker.socialMedia.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      {(!broker.socialMedia?.linkedin && !broker.socialMedia?.twitter && !broker.socialMedia?.instagram && !broker.socialMedia?.facebook) && (
                        <span className="text-gray-400 text-sm">No social media links available</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Documents</h2>
                  
                  <div className="space-y-0">
                    {[
                      { name: 'Aadhar Card', url: broker.kycDocs?.aadhar },
                      { name: 'PAN Card', url: broker.kycDocs?.pan },
                      { name: 'GST Certificate', url: broker.kycDocs?.gst },
                      { name: 'Broker License', url: broker.kycDocs?.brokerLicense },
                      { name: 'Company ID', url: broker.kycDocs?.companyId }
                    ].map((doc, index) => {
                      // Extract file extension from URL
                      const getFileExtension = (url: string | undefined) => {
                        if (!url) return '-';
                        const extension = url.split('.').pop()?.toUpperCase();
                        console.log('📄 File extension extracted:', extension, 'from URL:', url);
                        return extension || '-';
                      };
                      
                      const fileType = getFileExtension(doc.url);
                      
                      return (
                      <div key={index} className={`flex items-center justify-between py-4 ${index !== 4 ? 'border-b border-gray-200' : ''}`}>
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex items-center space-x-3">
                            <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                              {fileType}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => {
                              if (doc.url) {
                                console.log('👁️ Previewing document:', doc.name, 'URL:', doc.url);
                                try {
                                  window.open(doc.url, '_blank', 'noopener,noreferrer');
                                } catch (error) {
                                  console.error('❌ Preview failed:', error);
                                }
                              } else {
                                console.warn('⚠️ No URL available for document:', doc.name);
                              }
                            }}
                            className="flex items-center space-x-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Preview</span>
                          </button>
                          <button 
                            onClick={async () => {
                              if (doc.url) {
                                setDownloading(doc.name);
                                console.log('📥 Downloading document:', doc.name, 'URL:', doc.url);
                                
                                try {
                                  // Method 1: Use the image proxy route to handle CORS
                                  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(doc.url)}&download=true`;
                                  const response = await fetch(proxyUrl, {
                                    method: 'GET',
                                    headers: {
                                      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                                    },
                                  });
                                  
                                  if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                  }
                                  
                                  // Convert to blob
                                  const blob = await response.blob();
                                  
                                  // Create download link
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `${doc.name.replace(/\s+/g, '_')}.${fileType.toLowerCase()}`;
                                  link.style.display = 'none';
                                  
                                  // Add to DOM, click, and remove
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  
                                  // Clean up the URL object
                                  setTimeout(() => window.URL.revokeObjectURL(url), 100);
                                  
                                  console.log('✅ Download completed for:', doc.name);
                                } catch (fetchError) {
                                  console.error('❌ Fetch download failed, trying direct method:', fetchError);
                                  
                                  try {
                                    // Method 2: Use proxy URL directly for download
                                    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(doc.url)}&download=true`;
                                    const link = document.createElement('a');
                                    link.href = proxyUrl;
                                    link.download = `${doc.name.replace(/\s+/g, '_')}.${fileType.toLowerCase()}`;
                                    link.target = '_blank';
                                    link.rel = 'noopener noreferrer';
                                    link.style.display = 'none';
                                    
                                    // Add to DOM, click, and remove
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    
                                    console.log('✅ Proxy download initiated for:', doc.name);
                                  } catch (directError) {
                                    console.error('❌ Direct download also failed:', directError);
                                    
                                    try {
                                      // Method 3: Open proxy URL in new tab for manual download
                                      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(doc.url)}&download=true`;
                                      const newWindow = window.open(proxyUrl, '_blank', 'noopener,noreferrer');
                                      if (!newWindow) {
                                        throw new Error('Popup blocked');
                                      }
                                      console.log('✅ Opened proxy URL in new tab for manual download:', doc.name);
                                    } catch (openError) {
                                      console.error('❌ All download methods failed:', openError);
                                      alert(`Unable to download ${doc.name}. Please try right-clicking the preview button and selecting "Save link as..."`);
                                    }
                                  }
                                } finally {
                                  setDownloading(null);
                                }
                              } else {
                                console.warn('⚠️ No URL available for document:', doc.name);
                                alert('No download URL available for this document.');
                              }
                            }}
                            disabled={downloading === doc.name}
                            className={`flex items-center space-x-1 px-3 py-1 text-sm font-medium border border-gray-300 rounded transition-colors ${
                              downloading === doc.name 
                                ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                                : 'text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{downloading === doc.name ? 'Downloading...' : 'Download'}</span>
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Subscription & Payment Details Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Subscription & Payment Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Plan</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-semibold text-gray-900">Pro Agent - Monthly</span>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Method</p>
                      <p className="text-sm font-semibold text-gray-900">Visa ending in **** 1234</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Next Billing Date</p>
                      <p className="text-sm font-semibold text-gray-900">2024-06-20</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount Due</p>
                      <p className="text-sm font-semibold text-gray-900">$99.99</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                      Upgrade Plan
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">
                      Manage Subscription
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews & Ratings and Performance Snapshot Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Leads */
                }
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Active Leads</h2>
                  
                  <div className="space-y-3">
                    {(broker.leadsCreated?.items && broker.leadsCreated.items.length > 0) ? (
                      broker.leadsCreated.items.map((lead) => {
                        const title = lead.customerName || lead.name || 'Lead';
                        const inquiry = lead.inquiry || 'Inquiry';
                        const requirement = lead.requirement || '';
                        const propertyType = lead.propertyType || '';
                        const property = lead.property || '';
                        const status = (lead.status || '').trim() || 'New';
                        return (
                          <div key={lead._id || `${title}-${inquiry}`} 
                          onClick={() => router.push(`/leads?brokerId=${broker?._id}`)}
                          className="bg-white border border-gray-200 cursor-pointer rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                                <div className="space-y-0.5">
                                  <p className="text-sm text-gray-600">
                                    {inquiry}
                                    {requirement ? ` • Requirement: ${requirement}` : ''}
                                    {propertyType ? ` • Property Type: ${propertyType}` : ''}
                                    {property ? ` • Property: ${property}` : ''}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                status.toLowerCase() === 'qualified' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500">No active leads available.</div>
                    )}
                  </div>
                </div>

                {/* Performance Snapshot */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Performance Snapshot</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">Total Deals Closed</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">125</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                          <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">₹</text>
                        </svg>
                        <p className="text-sm font-medium text-gray-500">Average Deal Value</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">₹1,200,000</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">Areas of Operation</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Beverly Hills', 'Malibu', 'Santa Monica', 'Hollywood Hills'].map((area) => (
                          <span key={area} className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">Closed deal: Luxury Estate on Ocean View Dr</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">New listing: Modern Condo in Downtown LA</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">Client consultation: Commercial property investor</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Listings Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Property Listings</h2>
                
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600 mb-1">{broker?.propertyCount || broker?.propertiesCount || 0}</div>
                      <div className="text-sm text-gray-500">Total Properties</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">25</div>
                      <div className="text-sm text-gray-500">Active Listings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600 mb-1">125</div>
                      <div className="text-sm text-gray-500">Sold Deals</div>
                    </div>
                  </div>
                </div>
                
                <div>
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Properties</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
   {broker?.properties && broker.properties.length > 0 ? (
  broker.properties.map((property) => (
    <div
      key={property._id}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
          <div className="relative w-full h-48">
            <Image
              src={
                property.images?.[0] ||
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80"
              }
              alt={property.title || "Property"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <h4 className="text-sm font-semibold text-white mb-1">
                {property.title || "Untitled Property"}
              </h4>

              {property.location && (
                <p className="text-xs text-white/90 mb-2">
                  {property.location}
                </p>
              )}

              <span className="text-sm font-semibold text-teal-400">
               {property.price ?? "Price on Request"}
              </span>

              <div className="flex justify-center mt-3">
                <button
                  onClick={() => handleViewDetails(property._id)}
                  className="w-full px-4 py-1 text-s font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500">No properties available.</p>
    )}
  </div>
</div>

              </div>
              
              {/* Reviews & Ratings Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Reviews & Ratings</h2>
                
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-teal-600">4.9</span>
                    <span className="text-sm text-gray-500">(185 Reviews)</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">&ldquo;Alexander made our home buying process incredibly smooth and stress-free. Highly recommend!&rdquo;</p>
                    <p className="text-xs text-gray-500">- Sarah L., 2024-03-15</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">&ldquo;Professional, knowledgeable, and always responsive. He found us the perfect commercial space.&rdquo;</p>
                    <p className="text-xs text-gray-500">- Mark T., 2024-02-28</p>
                  </div>
                </div>
              </div>

              {/* Block Confirmation Dialog */}
              {showBlockConfirm && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Block Broker</h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Are you sure you want to block <span className="font-semibold">{broker?.name || 'this broker'}</span>? 
                        This will prevent them from accessing the platform.
                      </p>
                      <div className="flex space-x-3 justify-center">
                        <button
                          onClick={() => setShowBlockConfirm(false)}
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBlock}
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? 'Blocking...' : 'Block Broker'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Unblock Confirmation Dialog */}
              {showUnblockConfirm && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Unblock Broker</h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Are you sure you want to unblock <span className="font-semibold">{broker?.name || 'this broker'}</span>? 
                        This will restore their access to the platform.
                      </p>
                      <div className="flex space-x-3 justify-center">
                        <button
                          onClick={() => setShowUnblockConfirm(false)}
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUnblock}
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? 'Unblocking...' : 'Unblock'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}  