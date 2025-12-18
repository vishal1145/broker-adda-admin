'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { propertiesAPI } from '@/services/api';

type RegionItem = string | {
  _id?: string;
  name?: string;
  description?: string;
  state?: string;
  city?: string;
  centerLocation?: string;
  radius?: number;
  region?: string;
} | unknown;

type Property = {
  _id: string;
  title: string;
  price: number;
  priceUnit: string;
  address: string;
  city: string;
  region: string | RegionItem;
  coordinates: { lat: number; lng: number };
  bedrooms: number;
  bathrooms: number;
  furnishing: string;
  amenities: string[];
  images: string[];
  videos: string[];
  broker: string | {
    _id: string;
    name: string;
    email: string;
    phone: string;
    firmName: string;
    status: string;
  };
  isFeatured: boolean;
  notes: string;
  status: string;
  propertyType: string;
  subType: string;
  description: string;
  // Optional fields for backward compatibility
  location?: string;
  thumbnail?: string;
  specs?: {
    bedrooms?: number;
    bathrooms?: number;
    areaSqft?: number;
    parking?: number;
  };
  descriptionLong?: string;
  documents?: { name: string; type: string; url: string }[];
  contact?: {
    mobile?: string;
    whatsapp?: string;
    email?: string;
    owner?: string;
    company?: string;
    address?: string;
    avatar?: string;
  };
  listedDate?: string;
  viewsCount?: number;
};

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Function to show toast message
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Helper function to extract region display name from object or string
  const getRegionDisplayName = (item: RegionItem): string => {
    if (typeof item === "string") return item;
    if (!item || typeof item !== "object") return "";
    const obj = item as {
      name?: string;
      region?: string;
      city?: string;
      state?: string;
      description?: string;
      centerLocation?: string;
      radius?: number;
    };
    return obj?.name || obj?.region || obj?.city || obj?.state || "";
  };

  // Resolve a broker avatar image URL with proxy support and fallback
  const getBrokerAvatarUrl = (property: Property | null) => {
    const fallback = 'https://www.w3schools.com/howto/img_avatar.png';
    if (!property) return fallback;
    let rawUrl: string | undefined;
    if (typeof property.broker === 'object' && property.broker) {
      rawUrl = (property.broker as unknown as { brokerImage?: string }).brokerImage || property.contact?.avatar || undefined;
    } else {
      rawUrl = property.contact?.avatar || undefined;
    }
    if (!rawUrl) return fallback;
    if (
      rawUrl.includes('https://') ||
      (rawUrl.includes('http://') && !rawUrl.includes('localhost'))
    ) {
      return `/api/image-proxy?url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  };

  // Helper function to format price in Crores, Lakhs, Thousands, or Rupees
  const formatPrice = (price: number | undefined): string => {
    if (!price || price === 0) return '₹0';
    
    // 1 Crore = 1,00,00,000
    if (price >= 10000000) {
      const crores = price / 10000000;
      return `₹${crores.toFixed(2)} Cr`;
    }
    
    // 1 Lakh = 1,00,000
    if (price >= 100000) {
      const lakhs = price / 100000;
      return `₹${lakhs.toFixed(2)} L`;
    }
    
    // 1 Thousand = 1,000
    if (price >= 1000) {
      const thousands = price / 1000;
      return `₹${thousands.toFixed(2)} K`;
    }
    
    // Less than 1000, show in rupees
    return `₹${price.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await propertiesAPI.getPropertyById(id);
        console.log('Property API Response:', response);
        
        const rawData = response.data || response;
        // Normalize region to string if it's an object
        const propertyData = rawData ? {
          ...rawData,
          region: typeof rawData.region === 'string' 
            ? rawData.region 
            : getRegionDisplayName(rawData.region)
        } : null;
        
        setData(propertyData);
      } catch (err) {
        console.error('Error loading property:', err);
        setError(err instanceof Error ? err.message : 'Property not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle approve property
  const handleApprove = async () => {
    if (!data) return;
    
    try {
      setApproveLoading(true);
      await propertiesAPI.approveProperty(data._id);
      // Update the property status locally
      setData(prev => prev ? { ...prev, status: 'Approved' } : null);
      showToast('Property approved successfully!', 'success');
    } catch (err) {
      console.error('Error approving property:', err);
      showToast('Failed to approve property. Please try again.', 'error');
    } finally {
      setApproveLoading(false);
    }
  };

  // Handle reject property
  const handleReject = async () => {
    if (!data) return;
    
    try {
      setRejectLoading(true);
      await propertiesAPI.rejectProperty(data._id);
      // Update the property status locally
      setData(prev => prev ? { ...prev, status: 'Rejected' } : null);
      showToast('Property rejected successfully!', 'success');
    } catch (err) {
      console.error('Error rejecting property:', err);
      showToast('Failed to reject property. Please try again.', 'error');
    } finally {
      setRejectLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading property details...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Property</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!data) return null;

  const mainImage = data.images?.[selectedImage] || data.thumbnail || '';
  const thumbnails = data.images || [data.thumbnail].filter(Boolean);

  const showCarouselControls = (thumbnails?.length || 0) > 1;
  const handlePrevImage = () => {
    if (!thumbnails || thumbnails.length === 0) return;
    setSelectedImage((prev) => (prev - 1 + thumbnails.length) % thumbnails.length);
  };
  const handleNextImage = () => {
    if (!thumbnails || thumbnails.length === 0) return;
    setSelectedImage((prev) => (prev + 1) % thumbnails.length);
  };

  const renderIcon = (label: string) => {
    switch (label) {
      case 'Price':
      case 'Listing Price':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'Property Type':
      case 'Sub Type':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12l9-9 9 9" />
            <path d="M9 21V9h6v12" />
          </svg>
        );
      case 'Address':
      case 'City':
      case 'Region':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
          </svg>
        );
      case 'Coordinates':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12v6M21 12v6M3 12h18M7 12V9a2 2 0 1 1 4 0v3" />
          </svg>
        );
      case 'Bedrooms':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M6 12V7a2 2 0 1 1 4 0v5M5 16h14l-1 3H6l-1-3z" />
          </svg>
        );
      case 'Bathrooms':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10a5 5 0 0110 0v3H7v-3zm-2 8h14a2 2 0 002-2v-1H3v1a2 2 0 002 2z" />
          </svg>
        );
      case 'Furnishing':
      case 'Amenities':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 22h16V2H4v20Zm4-4h8M8 6h8M8 10h8M8 14h8" />
          </svg>
        );
      case 'Status':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 17l-5 3 1.9-5.9L4 9h6l2-6 2 6h6l-4.9 5.1L17 20z" />
          </svg>
        );
      case 'Featured':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      case 'Views':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7h14M3 11h10M3 15h6M3 19h2M19 7v12" />
          </svg>
        );
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Property Details</h1>
              <Link className="text-sm text-blue-600 hover:underline" href="/properties">Back to list</Link>
            </div>

            {/* Two Column Layout - redesigned to match screenshot structure */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Row 1: Large hero (left) and 2x2 thumbnails (right) */}
              <div className={thumbnails.length > 1 ? "lg:col-span-7" : "lg:col-span-12"}>
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-[30rem]">
                  <Image src={mainImage} alt={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
                  {showCarouselControls && (
                    <>
                      <button
                        aria-label="Previous image"
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        aria-label="Next image"
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                        {(thumbnails || []).map((_, i) => (
                          <span
                            key={`dot-${i}`}
                            className={`w-2 h-2 rounded-full ${i === selectedImage ? 'bg-white' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {thumbnails.length > 1 && (
                <div className="lg:col-span-5">
                  <div className={`grid gap-3 ${thumbnails.length === 2 ? 'grid-cols-1' : thumbnails.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                    {thumbnails.slice(0, 4).map((img, idx) => (
                      <button
                        key={`thumb-grid-${idx}`}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative rounded-xl overflow-hidden border cursor-pointer ${selectedImage === idx ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'} ${thumbnails.length === 3 && idx === 2 ? 'col-span-2' : ''}`}
                      >
                        <Image src={img || ''} alt={`${data.title} thumb ${idx + 1}`} width={400} height={224} className={`w-full object-cover ${thumbnails.length === 2 ? 'h-[230px]' : 'h-[230px]'}`} />
                        {idx === 3 && thumbnails.length > 4 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-xs bg-white/10 px-3 py-1 rounded-full border border-white/40 inline-flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-3h6l2 3h4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                              </svg>
                              Tampilkan Semua Foto
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Row 2: Left content (labels, details) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="">
                 
                  <h1 className="text-xl font-semibold text-gray-900 leading-snug mb-3">
                    {data.title}
                  </h1>
                
                  {/* <p className="text-sm text-gray-600 mb-4">{data.location}</p> */}
                 
                  <p className="text-sm text-gray-500 leading-6">
                    {data.description || data.notes || 'Property description not available.'}
                  </p>
                </div>



                {/* Detail Properti - redesigned list with icons, two columns */}
                <div className="">
                  <div className="w-full  py-4 flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-900"> Property Details</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      { label: 'Title', value: data.title || '-' },
                      { label: 'Property Type', value: data.propertyType || '-' },
                      { label: 'Sub Type', value: data.subType || '-' },
                      { label: 'Price', value: formatPrice(data.price) },
                      { label: 'Address', value: data.address || '-' },
                      { label: 'City', value: data.city || '-' },
                      { label: 'Region', value: data.region || '-' },
                      { label: 'Bedrooms', value: data.bedrooms?.toString() || '-' },
                      { label: 'Bathrooms', value: data.bathrooms?.toString() || '-' },
                      { label: 'Furnishing', value: data.furnishing || '-' },
                      { label: 'Amenities', value: data.amenities?.join(', ') || '-' },
                      { label: 'Status', value: data.status || 'Pending Approval' },
                      { label: 'Featured', value: data.isFeatured ? 'Yes' : 'No' },
                      { label: 'Views', value: data.viewsCount?.toString() || '0' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start gap-4 py-3 border-b border-gray-200">
                        <span className="inline-grid place-items-center w-10 h-10 rounded-full bg-teal-50 text-teal-600">
                          {renderIcon(row.label)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-base text-gray-500">{row.label}</div>
                          <div className="text-base font-semibold text-gray-900 truncate">{String(row.value || '')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Destinasi dekat proyek (schema location only) */}
                {/* <div className="">
                  <div className="w-full flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Destinasi dekat proyek</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-gray-500">Address</span>
                      <span className="text-gray-900 font-medium truncate ml-4 text-right">{data.address || data.location || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-gray-500">City</span>
                      <span className="text-gray-900 font-medium">{data.city || 'Agra'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-gray-500">Region</span>
                      <span className="text-gray-900 font-medium">{data.region || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-gray-500">Coordinates</span>
                      <span className="text-gray-900 font-medium">{(() => { const c = data.coordinates || {}; return c.lat && c.lng ? `${c.lat}, ${c.lng}` : '-'; })()}</span>
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Right column on Row 2: summary + contact card */}
              <div className="lg:col-span-5 space-y-6">
                {/* Price summary card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="h-8 bg-gradient-to-b from-gray-200/60 to-transparent"></div>
                  <div className="px-6 pt-2 pb-3">
                    <div className="text-3xl font-bold text-gray-900">{formatPrice(data.price)}</div>
                  </div>
                  <div className="">
                    {[
                      { label: 'Property Type', value: data.propertyType || '-' },
                      { label: 'Sub Type', value: data.subType || '-' },
                      { label: 'Bedrooms', value: data.bedrooms?.toString() || '0' },
                      { label: 'Bathrooms', value: data.bathrooms?.toString() || '0' },
                    ].map((row, idx) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-between px-6 py-3 text-sm ${
                          idx !== 3
                            ? idx === 0
                              ? 'border-b border-gray-200'
                              : 'border-b border-gray-100'
                            : ''
                        }`}
                      >
                        <span className="text-gray-500">{row.label}</span>
                        <span className="text-gray-900 font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-6">
                    <div className="w-full flex flex-col items-center text-center">
                      <Image
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow"
                        src={getBrokerAvatarUrl(data)}
                        alt="Agent avatar"
                        width={64}
                        height={64}
                      />
                      <div className="mt-2 text-base font-semibold text-gray-900">
                        {typeof data.broker === 'object' && data.broker?.name ? data.broker.name : 'Property Broker'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {typeof data.broker === 'object' && data.broker?.firmName ? data.broker.firmName : `Broker ID: ${data.broker}`}
                      </div>
                      {typeof data.broker === 'object' && data.broker?.email && (
                        <div className="text-xs text-gray-400 mt-1">
                          {data.broker.email}
                        </div>
                      )}

                      <a
                        href={typeof data.broker === 'object' && data.broker?.phone ? `tel:${data.broker.phone}` : '#'}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-medium bg-teal-600 text-white hover:bg-teal-700"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.69l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.69.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
                        </svg>
                        Call Agent
                      </a>
                    </div>
                  </div>
                </div>

                {/* Admin Tools card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="px-5 py-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Admin Tools</h4>
                    <div className={`p-3 rounded-lg border-l-4 ${
                      data.status === 'Approved' 
                        ? 'bg-green-50 border-green-400 text-green-800' 
                        : data.status === 'Rejected'
                        ? 'bg-red-50 border-red-400 text-red-800'
                        : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                    }`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {data.status === 'Approved' ? (
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : data.status === 'Rejected' ? (
                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">
                            {data.status === 'Approved' 
                              ? 'Property Approved'
                              : data.status === 'Rejected'
                              ? 'Property Rejected'
                              : 'Pending Approval'
                            }
                          </p>
                          <p className="text-xs mt-1">
                            {data.status === 'Approved' 
                              ? 'This property has been approved and is now live on the platform.'
                              : data.status === 'Rejected'
                              ? 'This property has been rejected and will not be published.'
                              : 'This property is awaiting admin approval before going live.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleApprove}
                        disabled={approveLoading || rejectLoading || data.status === 'Approved'}
                        className={`inline-flex items-center gap-2 px-4 h-9 rounded-md text-white cursor-pointer text-sm font-medium ${
                          data.status === 'Approved' 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {approveLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Approving...</span>
                          </>
                        ) : (
                          'Approve'
                        )}
                      </button>
                      <button 
                        onClick={handleReject}
                        disabled={approveLoading || rejectLoading || data.status === 'Rejected'}
                        className={`inline-flex items-center gap-2 px-4 h-9 rounded-md text-white cursor-pointer text-sm font-medium ${
                          data.status === 'Rejected' 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {rejectLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Rejecting...</span>
                          </>
                        ) : (
                          'Reject'
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Map Location - placed below contact card (map stays in place) */}
                <div className="p-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Map Location</h3>

                  <div className="relative h-96 rounded-lg overflow-hidden">
                    <iframe
                      title="Google Map"
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src="https://www.google.com/maps?q=28.6139,77.2090&z=14&output=embed"
                    />

                    {/* Overlay card pinned over the map - compact version */}
                    <div className="pointer-events-none absolute inset-0">
                      <div className="pointer-events-auto absolute left-[30%] top-[20%]">
                        <div className="relative w-[180px] rounded-md bg-white/95 backdrop-blur-sm shadow-lg ring-1 ring-black/5 overflow-hidden">
                          <div className="p-1.5 flex items-start gap-1.5">
                            <Image
                              src={mainImage}
                              alt={data.title}
                              width={48}
                              height={40}
                              className="h-10 w-12 rounded object-cover flex-shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="text-emerald-600 font-semibold text-[10px] truncate">{formatPrice(data.price)}</div>
                              <div className="text-gray-900 font-medium text-[10px] leading-tight truncate">{data.title}</div>
                              <p className="text-gray-500 text-[8px] mt-0.5 line-clamp-1">
                                {data.description || data.notes || 'Property description not...'}
                              </p>
                            </div>

                            <button
                              type="button"
                              className="absolute top-1 right-1 grid h-4 w-4 place-items-center rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 flex-shrink-0"
                              aria-label="Open on map"
                            >
                              <svg viewBox="0 0 24 24" className="w-2 h-2" fill="currentColor">
                                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
                              </svg>
                            </button>
                          </div>

                          <div className="border-t border-gray-100 px-1.5 py-1 flex items-center gap-1 text-[8px] text-gray-700">
                            <span className="inline-flex items-center gap-0.5 bg-gray-100 px-1 py-0.5 rounded-full">
                              <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12v6M21 12v6M3 12h18M7 12V9a2 2 0 1 1 4 0v3" />
                              </svg>
                              {data.bedrooms || 0}bd
                            </span>

                            <span className="inline-flex items-center gap-0.5 bg-gray-100 px-1 py-0.5 rounded-full">
                              <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M6 12V7a2 2 0 1 1 4 0v5M5 16h14l-1 3H6l-1-3z" />
                              </svg>
                              {data.bathrooms || 0}bt
                            </span>

                            <span className="inline-flex items-center gap-0.5 bg-gray-100 px-1 py-0.5 rounded-full">
                              <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 7h14M3 11h10M3 15h6M3 19h2M19 7v12" />
                              </svg>
                              {data.furnishing || '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Deskripsi (schema description only) */}
            {/* <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
              <div className="w-full flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Deskripsi</h3>
              </div>

              <div className="text-sm text-gray-700 leading-6">
                {((data as any).description) || ((data as any).notes) || 'No description available.'}
              </div>
            </div> */}

            {/* Perbandingan Harga Unit */}
            {/* <div className="  mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Perbandingan Harga Unit di Grand Ontama</h3>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                {[
                  {
                    title: 'Luxora',
                    price: 'Rp 1.145.000.000',
                    img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop',
                    beds: 3, baths: 3, area: '92 m'
                  },
                  {
                    title: 'Verona',
                    price: data.price || 'Rp 950.000.000',
                    img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&h=1066&fit=crop&auto=format&q=80',
                    beds: 2, baths: 3, area: '106 m'
                  },
                  {
                    title: 'Melodia',
                    price: 'Rp 699.000.000',
                    img: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&auto=format&fit=crop',
                    beds: 3, baths: 3, area: '92 m'
                  }
                ].map((c, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="relative w-full h-48">
                      <Image src={c.img} alt={c.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span className="px-2 py-1 text-[10px] rounded-full bg-white/90 border border-gray-200">Dijual</span>
                        <span className="px-2 py-1 text-[10px] rounded-full bg-white/90 border border-gray-200">Rumah Baru</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                        <p className="text-sm font-semibold text-gray-900">{c.price}</p>
                      </div>
                      <p className="text-xs text-gray-500 leading-5 mb-3">
                        Hunian mezzanine modern dengan rancangan yang memaksimalkan cahaya alami dan sirkulasi udara. 
                        Ruang keluarga yang luas terhubung dengan dapur konsep terbuka, menghadirkan kenyamanan untuk aktivitas harian. 
                        Material premium digunakan pada setiap sudut rumah untuk memastikan ketahanan dan estetika jangka panjang.
                      </p>
                      <div className="mb-3">
                        <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between text-[11px] text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-white border border-gray-200">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
     xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M5 12h14M12 5l7 7-7 7"/>
</svg>

                            </span>
                            {c.beds} Bedroom
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-white border border-gray-200">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10a5 5 0 0110 0v3H7v-3zm-2 8h14a2 2 0 002-2v-1H3v1a2 2 0 002 2z" />
                              </svg>
                            </span>
                            {c.baths} Bathroom
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-white border border-gray-200">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
     xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M5 12h14M12 5l7 7-7 7"/>
</svg>

                            </span>
                            {c.area}
                            <sup>2</sup>
                          </span>
                        </div>
                      </div>
                      <button className="w-full h-10 rounded-full bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 inline-flex items-center justify-center gap-2">
                        Tanya Unit
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
     xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M5 12h14M12 5l7 7-7 7"/>
</svg>

                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
            <div className={`px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 ${
              toast.type === 'success' 
                ? 'bg-gray-800 text-white' 
                : 'bg-red-800 text-white'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {toast.type === 'success' ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <span className="font-medium text-white">{toast.message}</span>
              <button
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className="ml-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}


