'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Layout from '@/components/Layout';

interface Broker {
  _id: string;
  userId: string;
  firmName: string;
  region: Array<{
    _id: string;
    name: string;
    description: string;
    state: string;
    city: string;
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
  brokerImage?: string;
  gender?: string;
  experience?: string;
  dateOfBirth?: string;
  specializations?: string[];
  website?: string;
  whatsapp?: string;
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
}

export default function BrokerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock static data for demonstration - matching the image
  const mockBrokerData: Broker = {
    _id: params.id as string,
    userId: 'user123',
    firmName: 'Sterling & Co. Realty',
    region: [
      { _id: 'reg1', name: 'Mumbai', description: 'Financial capital of India', state: 'Maharashtra', city: 'Mumbai' },
      { _id: 'reg2', name: 'Delhi', description: 'National capital region', state: 'Delhi', city: 'New Delhi' }
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
    name: 'Alexander Sterling',
    email: 'alexander.sterling@sterlingrealty.com',
    phone: '+1 (555) 123-4567',
    address: '789 Grand Blvd, Suite 200, Minneapolis, CA 90210',
    accreditedBy: 'NAR (National Association of Realtors)',
    licenseNumber: 'BRB 907233567',
    expertiseField: 'Residential Sales, Luxury Homes',
    state: 'California',
    brokerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    gender: 'Male',
    experience: '12 Years',
    dateOfBirth: '1983-09-22',
    specializations: ['Residential Sales', 'Luxury Homes'],
    website: 'https://www.sterlingrealty.com/alexander-sterling',
    whatsapp: '+1 (555) 123-4567',
    socialMedia: {
      instagram: 'https://instagram.com/alexsterling',
      linkedin: 'https://linkedin.com/in/alexsterling',
      facebook: 'https://facebook.com/alexsterling',
      twitter: 'https://twitter.com/alexsterling'
    },
    leads: [
      {
        id: 1,
        name: 'Alice Smith',
        inquiry: 'Buying inquiry',
        property: '456 Elmwood St',
        status: 'New'
      },
      {
        id: 2,
        name: 'Bob Johnson',
        inquiry: 'Selling inquiry',
        property: '789 Oak Ave',
        status: 'Follow Up'
      },
      {
        id: 3,
        name: 'Carol White',
        inquiry: 'Rental inquiry',
        property: '101 Pine St',
        status: 'Qualified'
      },
      {
        id: 4,
        name: 'David Green',
        inquiry: 'Commercial inquiry',
        property: '303 Business Park',
        status: 'New'
      }
    ],
    subscription: {
      plan: 'Pro Agent - Monthly',
      status: 'Active',
      paymentMethod: 'Visa ending in **** 1234',
      nextBillingDate: '2023-08-20',
      amountDue: '$39.99'
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-gray-100 text-gray-800';
      case 'Follow Up':
        return 'bg-gray-100 text-gray-800';
      case 'Qualified':
        return 'bg-green-100 text-green-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              ))}
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

  return (
    <>
      <Head>
        <title>Broker Details - Broker Adda Admin</title>
      </Head>
      <Layout>
        <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
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
              {/* Broker Information Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Broker Information</h2>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                    Edit Profile
                  </button>
            </div>
            
                <div className="flex items-start space-x-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={broker.brokerImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80"}
                  alt={broker.name || 'Broker'} 
                      className="w-20 h-20 rounded-full object-cover"
                />
              </div>
                  
                  {/* Profile Details */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{broker.name || 'Alexander Sterling'}</h3>
                    <p className="text-lg text-gray-600 mb-6">Senior Real Estate Agent</p>
                    
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
                          <p className="text-sm font-semibold text-gray-900">{broker.firmName || 'Sterling & Co. Realty'}</p>
                </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                            <p className="text-sm font-medium text-gray-500">Gender</p>
                </div>
                          <p className="text-sm font-semibold text-gray-900">{broker.gender || 'Male'}</p>
            </div>
          </div>

                      {/* Middle Column */}
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">Experience</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{broker.experience || '12 Years'}</p>
                        </div>
              <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{broker.dateOfBirth || '1985-05-20'}</p>
                        </div>
              </div>
              
                      {/* Right Column */}
                      <div className="space-y-6">
              <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">License</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{broker.licenseNumber || 'BRE #01234567'}</p>
              </div>
              <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                            <p className="text-sm font-medium text-gray-500">Specializations</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {['Residential Sales', 'Commercial Leasing', 'Luxury Homes'].map((spec, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                {spec}
                    </span>
                  ))}
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
                      <div>
                        <p className="text-sm font-medium text-gray-500">Mobile</p>
                        <p className="text-sm font-semibold text-teal-600">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    <div>
                        <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                        <p className="text-sm font-semibold text-teal-600">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-teal-600">alexander.sterling@sterlingrealty.com</p>
                </div>
              </div>

                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Office Address</p>
                        <p className="text-sm font-semibold text-gray-900">789 Grand Blvd, Suite 200, Metropolis, CA 90210</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Website</p>
                        <a href="https://www.sterlingrealty.com/alexander-sterling" className="text-sm font-semibold text-teal-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          https://www.sterlingrealty.com/alexander-sterling
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Social Media Section */}
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500 mb-3">Social Media</p>
                    <div className="flex items-center space-x-4">
                      <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                      <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                        </svg>
                      </a>
                      <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Active Leads */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Active Leads</h2>
                  
                  <div className="space-y-3">
                    {[
                      { id: 1, name: 'Alice Smith', inquiry: 'Buying Inquiry', property: '456 Hilltop Rd', status: 'New' },
                      { id: 2, name: 'Bob Johnson', inquiry: 'Selling Inquiry', property: '789 Oak Ave', status: 'Follow Up' },
                      { id: 3, name: 'Carol White', inquiry: 'Rental Inquiry', property: '101 Pine St', status: 'Qualified' },
                      { id: 4, name: 'David Green', inquiry: 'Commercial Inquiry', property: '202 Business Park', status: 'New' }
                    ].map((lead) => (
                      <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">{lead.name}</h3>
                            <p className="text-sm text-gray-600">{lead.inquiry} • Property: {lead.property}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            lead.status === 'Qualified' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                      </div>
                    ))}
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
                {/* Reviews & Ratings */}
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
                      <p className="text-sm text-gray-700 mb-2">"Alexander made our home buying process incredibly smooth and stress-free. Highly recommend!"</p>
                      <p className="text-xs text-gray-500">- Sarah L., 2024-03-15</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-2">"Professional, knowledgeable, and always responsive. He found us the perfect commercial space."</p>
                      <p className="text-xs text-gray-500">- Mark T., 2024-02-28</p>
                    </div>
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
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">Average Deal Value</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">$1,200,000</p>
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
                      <div className="text-3xl font-bold text-teal-600 mb-1">150</div>
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
                    {[
                      { 
                        id: 1, 
                        title: 'Modern Family Home', 
                        price: '$2,850,000', 
                        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80' 
                      },
                      { 
                        id: 2, 
                        title: 'Luxury Penthouse', 
                        location: 'Downtown LA, CA',
                        price: '$4,200,000', 
                        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80' 
                      },
                      { 
                        id: 3, 
                        title: 'Prime Commercial Space', 
                        location: 'Santa Monica, CA',
                        price: '$12,500/month', 
                        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format&q=80' 
                      },
                      { 
                        id: 4, 
                        title: 'Charming Suburban Retreat', 
                        location: 'Culver City, CA',
                        price: '$1,500,000', 
                        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format&q=80' 
                      },
                      { 
                        id: 5, 
                        title: 'Mountain View Cabin', 
                        location: 'Malibu, CA',
                        price: '$3,100,000', 
                        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80' 
                      },
                      { 
                        id: 6, 
                        title: 'Beachfront Villa', 
                        location: 'Malibu, CA',
                        price: '$7,900,000', 
                        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&auto=format&q=80' 
                      }
                    ].map((property) => (
                      <div key={property.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                            <h4 className="text-sm font-semibold text-white mb-1">{property.title}</h4>
                            {property.location && (
                              <p className="text-xs text-white/90 mb-2">{property.location}</p>
                            )}
                            <span className="text-sm font-semibold text-teal-400">{property.price}</span>
                            <div className="flex justify-center mt-3">
                              <button className="w-full px-4 py-1 text-s font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Documents Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Documents</h2>
                
                <div className="space-y-0">
                  {[
                    { name: 'Broker License', type: 'PDF' },
                    { name: 'Client Agreement Template', type: 'DOC' },
                    { name: 'Property Listing Guide', type: 'PDF' },
                    { name: 'Privacy Policy', type: 'PDF' }
                  ].map((doc, index) => (
                    <div key={index} className={`flex items-center justify-between py-4 ${index !== 3 ? 'border-b border-gray-200' : ''}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex items-center space-x-3">
                          <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {doc.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Preview</span>
                        </button>
                        <button className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </>
        )}
        </div>
    </Layout>
    </>
  );
}