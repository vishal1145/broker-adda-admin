'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

type Property = {
  id: number;
  title: string;
  price: string;
  location?: string;
  status?: string;
  type?: string;
  region?: string;
  thumbnail?: string;
  images?: string[];
  specs?: {
    bedrooms?: number;
    bathrooms?: number;
    areaSqft?: number;
    parking?: number;
  };
  amenities?: string[];
  description?: string;
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
  // Extended optional fields that may appear in JSON
  address?: string;
  city?: string;
  propertyType?: string;
  subType?: string;
  priceUnit?: string;
  coordinates?: { lat?: number; lng?: number };
  isFeatured?: boolean;
  viewsCount?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  notes?: string;
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [data, setData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load all properties then pick the one by id
        const res = await fetch(`/data/properties/index.json`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        const match = (json.properties || []).find((p: Property) => String(p.id) === String(id));
        if (!match) throw new Error('Not found');
        setData(match);
      } catch {
        setError('Property not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);




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
              <div className="lg:col-span-7">
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-[30rem]">
                  <Image src={mainImage} alt={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
                  {showCarouselControls && (
                    <>
                      <button
                        aria-label="Previous image"
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/60"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        aria-label="Next image"
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/60"
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
              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  {thumbnails.slice(0, 4).map((img, idx) => (
                    <button
                      key={`thumb-grid-${idx}`}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative rounded-xl overflow-hidden border ${selectedImage === idx ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'}`}
                    >
                      <Image src={img || ''} alt={`${data.title} thumb ${idx + 1}`} width={400} height={224} className="w-full h-[230px] object-cover" />
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
                {/* Lokasi Proyek - moved to right column below images */}
              
              </div>

              {/* Row 2: Left content (labels, details) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="">
                 
                  <h1 className="text-xl font-semibold text-gray-900 leading-snug mb-3">
                    {data.title}
                  </h1>
                
                  {/* <p className="text-sm text-gray-600 mb-4">{data.location}</p> */}
                 
                  <p className="text-sm text-gray-500 leading-6">
                    {(data.descriptionLong || data.description || 'Rumah Mezzanine Eksklusif! Rumah mezzanine eksklusif ini dirancang dengan gaya elegan, menampilkan tiga kamar tidur yang luas dan nyaman. Setiap kamar dilengkapi dengan material premium yang memastikan kenyamanan maksimal')}
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
                      { label: 'Property Type', value: data.propertyType || 'Residential' },
                      { label: 'Sub Type', value: data.subType || 'Apartment' },
                      { label: 'Price', value: `${data.price || '0'} ${data.priceUnit || 'INR'}` },
                      { label: 'Address', value: data.address || data.location || '-' },
                      { label: 'City', value: data.city || 'Agra' },
                      { label: 'Region', value: data.region || '-' },
                      { label: 'Coordinates', value: (() => { const c = data.coordinates || {}; return c.lat && c.lng ? `${c.lat}, ${c.lng}` : '-'; })() },
                      { label: 'Bedrooms', value: (data.bedrooms ?? data.specs?.bedrooms) ?? '-' },
                      { label: 'Bathrooms', value: (data.bathrooms ?? data.specs?.bathrooms) ?? '-' },
                      { label: 'Furnishing', value: data.furnishing || '-' },
                      { label: 'Amenities', value: (data.amenities || []).join(', ') || '-' },
                      { label: 'Status', value: data.status || 'Pending Approval' },
                      { label: 'Featured', value: String(data.isFeatured ?? false) },
                      { label: 'Views', value: String(data.viewsCount ?? 0) },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start gap-4 py-3 border-b border-gray-200">
                        <span className="inline-grid place-items-center w-10 h-10 rounded-full bg-teal-50 text-teal-600">
                          {renderIcon(row.label)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-base text-gray-500">{row.label}</div>
                          <div className="text-base font-semibold text-gray-900 truncate">{row.value}</div>
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
                    <div className="text-3xl font-bold text-gray-900">{data.price || '—'}</div>
                    <div className="text-[11px] text-gray-400">{data.priceUnit ? `${data.priceUnit} / Month (Est.)` : '$15,000 / Month (Est.)'}</div>
                  </div>
                  <div className="">
                    {[
                      { label: 'Property Type', value: data.propertyType || 'Residential' },
                      { label: 'Area', value: data.specs?.areaSqft ? `${(data.specs.areaSqft).toLocaleString()} SqFt` : '0' },
                      { label: 'Bedrooms', value: (data.bedrooms ?? data.specs?.bedrooms ?? 0).toString() },
                      { label: 'Bathrooms', value: (data.bathrooms ?? data.specs?.bathrooms ?? 0).toString() },
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
                        src={data.contact?.avatar || 'https://www.w3schools.com/howto/img_avatar.png'}
                        alt="Agent avatar"
                        width={64}
                        height={64}
                      />
                      <div className="mt-2 text-base font-semibold text-gray-900">{data.contact?.owner || 'Agent'}</div>
                      <div className="text-xs text-gray-500">Senior Listing Agent</div>

                      <a
                        href={data.contact?.mobile ? `tel:${data.contact.mobile}` : (data.contact?.whatsapp ? `https://wa.me/${data.contact.whatsapp}` : '#')}
                        className={`mt-4 w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-medium ${data.contact?.mobile || data.contact?.whatsapp ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        aria-disabled={!data.contact?.mobile && !data.contact?.whatsapp}
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
                  <div className="px-5 py-4 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">Admin Tools</h4>
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 border border-gray-200">Draft</span>
                  </div>
                  <div className="px-5 pb-5">
                    <div className="flex items-center gap-3">
                      <button className="inline-flex items-center gap-2 px-4 h-9 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700">
                        <span className="inline-flex w-4 h-4 items-center justify-center rounded-sm ">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </span>
                        Approve
                      </button>
                      <button className="inline-flex items-center gap-2 px-4 h-9 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                        <span className="inline-flex w-4 h-4 items-center justify-center rounded-sm  ">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </span>
                        Reject
                      </button>
                      {/* <button className="inline-flex items-center gap-2 px-4 h-9 rounded-md border border-blue-300 text-blue-600 text-sm font-medium hover:bg-blue-50">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                        </svg>
                        Feature
                      </button> */}
                    </div>
                  </div>
                </div>

                {/* Lokasi Proyek - placed below contact card (map stays in place) */}
                <div className="p-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Lokasi Proyek</h3>

                  <div className="relative h-96 rounded-lg overflow-hidden">
                    <iframe
                      title="Google Map"
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src="https://www.google.com/maps?q=28.6139,77.2090&z=14&output=embed"
                    />

                    {/* Overlay card pinned over the map without changing its position */}
                    <div className="pointer-events-none absolute inset-0">
                      <div className="pointer-events-auto absolute left-44 -translate-x-1/2 top-32 sm:translate-x-0">
                        <div className="relative w-[320px] sm:w-[360px] rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl ring-1 ring-black/5 overflow-hidden">
                          <div className="p-3 flex items-start gap-3">
                            <Image
                              src={mainImage}
                              alt={data.title}
                              width={112}
                              height={96}
                              className="h-24 w-28 rounded-xl object-cover"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="text-sky-600 font-semibold text-sm truncate">{data.price || '—'}</div>
                              <div className="text-gray-900 font-bold leading-tight truncate">{data.title}</div>
                              <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                                {data.description || 'Hunian mezzanine modern yang ideal untuk keluarga.'}
                              </p>
                            </div>

                            <button
                              type="button"
                              className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100"
                              aria-label="Open on map"
                            >
                              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
                              </svg>
                            </button>
                          </div>

                          <div className="border-t border-gray-100 px-3 py-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-700">
                            <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12v6M21 12v6M3 12h18M7 12V9a2 2 0 1 1 4 0v3" />
                              </svg>
                              {(data.specs?.bedrooms ?? data.bedrooms ?? 3)} bedroom
                            </span>

                            <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M6 12V7a2 2 0 1 1 4 0v5M5 16h14l-1 3H6l-1-3z" />
                              </svg>
                              {(data.specs?.bathrooms ?? data.bathrooms ?? 2)} bathroom
                            </span>

                            <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 7h14M3 11h10M3 15h6M3 19h2M19 7v12" />
                              </svg>
                              {(data.specs?.areaSqft ? `${data.specs.areaSqft} sqft` : '—')}
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
      </Layout>
    </ProtectedRoute>
  );
}


