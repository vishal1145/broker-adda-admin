"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import { propertiesAPI, regionAPI } from "@/services/api";
import { useSearchParams } from "next/navigation";

// Skeleton Loader Components
const Skeleton = ({
  className = "",
  height = "h-4",
  width = "w-full",
  rounded = false,
}: {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}) => (
  <div
    className={`bg-gray-200 animate-pulse ${height} ${width} ${
      rounded ? "rounded-full" : "rounded"
    } ${className}`}
  />
);

const SummaryCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton height="h-3" width="w-16" />
              <Skeleton height="h-6" width="w-8" />
            </div>
            <div className="bg-gray-100 rounded-lg p-2">
              <Skeleton height="h-5" width="w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to validate and get safe image URL
const getSafeImageUrl = (images: string[] | undefined): string => {
  const defaultImage =
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop";

  if (!images || !Array.isArray(images) || images.length === 0) {
    return defaultImage;
  }

  // Find first valid image URL
  const validImage = images.find(
    (img) =>
      img &&
      typeof img === "string" &&
      !img.includes("example.com") &&
      // accept absolute http/https or app-relative URLs
      (img.startsWith("https://") ||
        img.startsWith("http://") ||
        img.startsWith("/"))
  );

  return validImage || defaultImage;
};

function PropertiesPageContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const searchParams = useSearchParams();
  const brokerId = searchParams.get("brokerId");
  type PropertyCard = {
    _id: string;
    title: string;
    description?: string;
    propertyDescription?: string;
    price: number;
    priceUnit: string;
    address: string;
    city: string;
    region: string;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    area?: number; // optional built-up area in sqft
    areaUnit?: string; // e.g., sqft, sqyd
    propertyType: string;
    subType: string;
    status: string;
    isFeatured: boolean;
  };
  const [cards, setCards] = useState<PropertyCard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const itemsPerPage = 10;

  // State for property metrics
  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [regions, setRegions] = useState<string[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  // Load property metrics from API
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setMetricsLoading(true);
        const metricsResponse = await propertiesAPI.getMetrics();

        console.log("Metrics API Response:", metricsResponse);

        // Handle different possible response structures
        const metrics = metricsResponse.data || metricsResponse;

        setPropertyStats({
          total: metrics.total || 0,
          available: metrics.available || 0,
          sold: metrics.sold || 0,
        });
      } catch (err) {
        console.error("Error loading metrics:", err);
        // Keep default values (0) if API fails
      } finally {
        setMetricsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  type RegionsApiItem =
    | Partial<{ name: string; region: string; city: string; state: string }>
    | string
    | unknown;

  // Load regions for filter
  useEffect(() => {
    const getRegionDisplayName = (item: RegionsApiItem): string | undefined => {
      if (typeof item === "string") return item;
      const obj = item as Partial<{
        name: string;
        region: string;
        city: string;
        state: string;
      }>;
      return obj?.name || obj?.region || obj?.city || obj?.state || undefined;
    };
    const loadRegions = async () => {
      try {
        setRegionsLoading(true);
        const res = await regionAPI.getRegions(1, 100);
        // Flexible extraction based on possible API shapes
        const list: RegionsApiItem[] =
          res?.data?.regions || res?.regions || res?.data || [];
        const names: string[] = Array.isArray(list)
          ? list
              .map((r: RegionsApiItem) => getRegionDisplayName(r))
              .filter(
                (v): v is string => typeof v === "string" && v.trim().length > 0
              )
          : [];
        // unique & sorted
        const uniqueNames = Array.from(new Set(names)).sort();
        setRegions(uniqueNames);
      } catch (err) {
        console.error("Failed to load regions for filter:", err);
        // keep regions empty → dropdown will still show "All Regions"
      } finally {
        setRegionsLoading(false);
      }
    };

    loadRegions();
  }, [brokerId]);

  // Reset to page 1 when brokerId changes
  useEffect(() => {
    setCurrentPage(1);
  }, [brokerId]);

  // Load properties from API
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError("");

        let propertiesResponse;

        // If brokerId is provided, load broker-specific properties
        if (brokerId) {
          propertiesResponse = await propertiesAPI.getPropertyByBrokerId(
            brokerId,
            currentPage,
            itemsPerPage
          );
          console.log("Broker-specific properties:", propertiesResponse);
        } else {
          // For all properties, check if we need client-side filtering
          const needsClientSideFiltering =
            debouncedSearchTerm ||
            typeFilter !== "all" ||
            statusFilter !== "all" ||
            regionFilter !== "all";

          if (needsClientSideFiltering) {
            // Get ALL properties for client-side filtering
            propertiesResponse = await propertiesAPI.getProperties(
              1, // Get first page
              1000, // Get large number to get all properties
              "", // No search term
              "all", // No type filter
              "all", // No status filter
              "all" // No region filter
            );
          } else {
            // Use server-side pagination
            propertiesResponse = await propertiesAPI.getProperties(
              currentPage,
              itemsPerPage,
              debouncedSearchTerm,
              typeFilter,
              statusFilter,
              regionFilter
            );
          }
        }

        console.log("Properties API Response:", propertiesResponse);
        console.log("Properties data:", propertiesResponse.data);
        console.log("Properties array:", propertiesResponse.data?.properties);
        console.log(
          "Full response structure:",
          JSON.stringify(propertiesResponse, null, 2)
        );
        console.log("Current filters:", {
          debouncedSearchTerm,
          typeFilter,
          statusFilter,
          regionFilter,
        });
        console.log(
          "API URL called:",
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"
          }/properties?page=${currentPage}&limit=${itemsPerPage}&search=${debouncedSearchTerm}&propertyType=${typeFilter}&status=${statusFilter}&region=${regionFilter}`
        );

        // Handle different possible response structures
        const properties =
          propertiesResponse.data?.properties ||
          propertiesResponse.properties ||
          propertiesResponse.data ||
          [];

        // Handle pagination data - check for both general and broker-specific response structures
        let totalPages, total;
        if (brokerId) {
          // Broker-specific response structure
          totalPages =
            propertiesResponse.pagination?.totalPages ||
            propertiesResponse.data?.pagination?.totalPages ||
            1;
          total =
            propertiesResponse.pagination?.total ||
            propertiesResponse.data?.pagination?.total ||
            0;
        } else {
          // General properties response structure
          totalPages =
            propertiesResponse.data?.totalPages ||
            propertiesResponse.totalPages ||
            1;
          total =
            propertiesResponse.data?.total || propertiesResponse.total || 0;
        }

        console.log("Processed properties:", properties);
        console.log("Processed totalPages:", totalPages);
        console.log("Processed total:", total);
        console.log("Broker ID:", brokerId);
        console.log(
          "Pagination data:",
          brokerId ? propertiesResponse.pagination : propertiesResponse.data
        );
        console.log("Raw response structure:", {
          hasData: !!propertiesResponse.data,
          dataKeys: propertiesResponse.data
            ? Object.keys(propertiesResponse.data)
            : "no data",
          responseKeys: Object.keys(propertiesResponse),
          totalPagesFromData: propertiesResponse.data?.totalPages,
          totalFromData: propertiesResponse.data?.total,
          totalPagesFromRoot: propertiesResponse.totalPages,
          totalFromRoot: propertiesResponse.total,
        });

        // Filter out invalid image URLs and ensure only valid images are used
        type ApiProperty = Partial<PropertyCard> & {
          name?: string;
          propertyDescription?: string;
          propertySize?: number | string;
          bedrooms?: number | string;
          bathrooms?: number | string;
          price?: number | string;
          images?: string[];
          address?: string;
          city?: string;
          region?: string;
        };

        let processedProperties = Array.isArray(properties)
          ? properties.map((prop: unknown) => {
              const property = prop as ApiProperty;
              // normalize fields coming from API (strings -> numbers, alternate names)
              const normalizedBedrooms =
                typeof property.bedrooms === "string"
                  ? parseInt(property.bedrooms, 10)
                  : property.bedrooms;
              const normalizedBathrooms =
                typeof property.bathrooms === "string"
                  ? parseInt(property.bathrooms, 10)
                  : property.bathrooms;
              const areaFromSize = property.propertySize;
              const normalizedArea =
                typeof areaFromSize === "string"
                  ? parseFloat(areaFromSize)
                  : areaFromSize;
              const normalizedPrice =
                typeof property.price === "string"
                  ? parseFloat(property.price)
                  : property.price;

              const filteredImages = property.images
                ? property.images.filter(
                    (img: string) =>
                      img &&
                      typeof img === "string" &&
                      !img.includes("example.com") &&
                      (img.startsWith("https://") ||
                        img.startsWith("http://") ||
                        img.startsWith("/"))
                  )
                : [];

              const normalized: PropertyCard = {
                _id: (property._id as string) || "",
                title: property.title || property.name || "",
                description:
                  (property as { description?: string })?.description ||
                  property.propertyDescription ||
                  "",
                propertyDescription: property.propertyDescription,
                price:
                  typeof normalizedPrice === "number" &&
                  !Number.isNaN(normalizedPrice)
                    ? normalizedPrice
                    : (property.price as number) || 0,
                priceUnit: property.priceUnit || "INR",
                address: property.address || "",
                city: property.city || "",
                region: property.region || "",
                images: filteredImages,
                bedrooms:
                  typeof normalizedBedrooms === "number" &&
                  !Number.isNaN(normalizedBedrooms)
                    ? normalizedBedrooms
                    : (property.bedrooms as number) || 0,
                bathrooms:
                  typeof normalizedBathrooms === "number" &&
                  !Number.isNaN(normalizedBathrooms)
                    ? normalizedBathrooms
                    : (property.bathrooms as number) || 0,
                area:
                  typeof normalizedArea === "number" &&
                  !Number.isNaN(normalizedArea)
                    ? normalizedArea
                    : property.area,
                areaUnit: property.areaUnit || "sqft",
                propertyType: property.propertyType || "",
                subType: property.subType || "",
                status: property.status || "",
                isFeatured: Boolean(property.isFeatured),
              };

              return normalized;
            })
          : [];

        // Client-side filtering as fallback (in case API doesn't filter properly)
        // Only apply client-side filtering if we're not using broker-specific filtering
        if (Array.isArray(processedProperties) && !brokerId) {
          processedProperties = processedProperties.filter((property) => {
            // Search filter
            if (debouncedSearchTerm && debouncedSearchTerm !== "") {
              const searchLower = debouncedSearchTerm.toLowerCase();
              const matchesSearch =
                property.title?.toLowerCase().includes(searchLower) ||
                property.address?.toLowerCase().includes(searchLower) ||
                property.city?.toLowerCase().includes(searchLower) ||
                property.region?.toLowerCase().includes(searchLower) ||
                property.price?.toString().includes(searchLower);

              if (!matchesSearch) return false;
            }

            // Type filter
            if (typeFilter !== "all" && property.propertyType !== typeFilter) {
              return false;
            }

            // Status filter
            if (statusFilter !== "all" && property.status !== statusFilter) {
              return false;
            }

            // Region filter (case-insensitive, checks both region and city)
            if (regionFilter !== "all") {
              const selected = regionFilter.toLowerCase();
              const propRegion = (property.region || "").toLowerCase();
              const propCity = (property.city || "").toLowerCase();
              if (propRegion !== selected && propCity !== selected) {
                return false;
              }
            }

            return true;
          });
        }

        console.log(
          "Processed properties after image filtering:",
          processedProperties
        );
        console.log("Filtered properties count:", processedProperties.length);

        setCards(processedProperties);

        // Calculate pagination based on whether we're using client-side filtering
        let calculatedTotal, calculatedTotalPages;

        if (brokerId) {
          // For broker-specific properties, use API pagination data
          calculatedTotal = total > 0 ? total : processedProperties.length;
          calculatedTotalPages =
            totalPages > 1
              ? totalPages
              : Math.ceil(calculatedTotal / itemsPerPage);
        } else {
          // For general properties, check if client-side filtering was applied
          const hasClientSideFiltering =
            debouncedSearchTerm ||
            typeFilter !== "all" ||
            statusFilter !== "all" ||
            regionFilter !== "all";

          if (hasClientSideFiltering) {
            // Use client-side filtered results for pagination
            calculatedTotal = processedProperties.length;
            calculatedTotalPages = Math.ceil(calculatedTotal / itemsPerPage);
          } else {
            // Use API pagination data, but ensure we calculate correctly
            calculatedTotal = total > 0 ? total : processedProperties.length;
            // Always calculate pages based on total, don't rely on API totalPages
            calculatedTotalPages = Math.ceil(calculatedTotal / itemsPerPage);
          }
        }

        console.log("Final values:", {
          calculatedTotal,
          calculatedTotalPages,
          originalTotal: total,
          originalTotalPages: totalPages,
          processedPropertiesLength: processedProperties.length,
          hasClientSideFiltering:
            !brokerId &&
            (debouncedSearchTerm ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              regionFilter !== "all"),
          needsClientSideFiltering:
            !brokerId &&
            (debouncedSearchTerm ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              regionFilter !== "all"),
          brokerId,
          currentPage,
          itemsPerPage,
        });

        setTotalPages(calculatedTotalPages);
        setTotalProperties(calculatedTotal);
      } catch (err) {
        console.error("Error loading properties:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load properties"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [
    currentPage,
    debouncedSearchTerm,
    typeFilter,
    statusFilter,
    regionFilter,
    brokerId,
  ]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Pagination helpers
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const goToPage = (p: number) =>
    setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // Client-side pagination for filtered results
  const getPaginatedCards = () => {
    const hasClientSideFiltering =
      !brokerId &&
      (debouncedSearchTerm ||
        typeFilter !== "all" ||
        statusFilter !== "all" ||
        regionFilter !== "all");

    if (hasClientSideFiltering) {
      // Apply client-side pagination
      const startIndex = (safePage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return cards.slice(startIndex, endIndex);
    }

    // For API pagination, return all cards
    return cards;
  };

  const paginatedCards = getPaginatedCards();

  // Debug cards state
  useEffect(() => {
    console.log("Cards state updated:", cards, "Length:", cards.length);
    console.log("Pagination debug:", {
      currentPage,
      totalPages,
      totalProperties,
      safePage,
      itemsPerPage,
      showPagination: totalPages > 1,
      showResultsCount: totalProperties > 0,
    });
  }, [cards, currentPage, totalPages, totalProperties, safePage]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Properties
                  </h1>
                  {brokerId ? (
                    <p className="text-gray-500 mt-1 text-sm">
                      Viewing properties for selected broker
                    </p>
                  ) : (
                    <p className="text-gray-500 mt-1 text-sm">
                      View and manage all registered properties
                    </p>
                  )}
                </div>
                {/* {brokerId && (
                <Link 
                  href="/properties"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to All Properties
                </Link>
              )} */}
              </div>
            </div>

            {/* Search and Filter Bar */}
            {!brokerId && (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by Property Name, Price, Region"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Property Type Dropdown */}
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
                    >
                      <option value="all">All Properties</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Land">Land</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
                    >
                      <option value="all">All Status</option>
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Region Dropdown */}
                  <div className="relative">
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none pr-8"
                    >
                      <option value="all">All Regions</option>
                      {regionsLoading && <option disabled>Loading...</option>}
                      {!regionsLoading &&
                        regions.map((r) => (
                          <option key={`region-opt-${r}`} value={r}>
                            {r}
                          </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {(searchTerm ||
                    typeFilter !== "all" ||
                    statusFilter !== "all" ||
                    regionFilter !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setTypeFilter("all");
                        setStatusFilter("all");
                        setRegionFilter("all");
                      }}
                      className="inline-flex cursor-pointer items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filters</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="font-semibold">Error loading properties:</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            )}

            {/* Active Filters Indicator removed as requested */}

            {/* Summary Cards */}
            {metricsLoading ? (
              <SummaryCardsSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* Total Properties Card */}
                <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-600 text-xs font-medium">
                        Total Properties
                      </p>
                      <p className="text-xl font-bold text-teal-700">
                        {propertyStats.total}
                      </p>
                    </div>
                    <div className="bg-teal-100 rounded-lg p-2">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Available Properties Card */}
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-xs font-medium">
                        Available
                      </p>
                      <p className="text-xl font-bold text-green-700">
                        {propertyStats.available}
                      </p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Sold Properties Card */}
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-xs font-medium">Sold</p>
                      <p className="text-xl font-bold text-red-600">
                        {propertyStats.sold}
                      </p>
                    </div>
                    <div className="bg-red-100 rounded-lg p-2">
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM5 19L19 5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Featured Properties */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Properties</h3> */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paginatedCards.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      {brokerId ? (
                        <>
                          <div className="text-gray-500 text-lg">
                            No properties found for this broker
                          </div>
                          <div className="text-gray-400 text-sm mt-2">
                            This broker hasn&apos;t listed any properties yet
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-gray-500 text-lg">
                            No properties found
                          </div>
                          <div className="text-gray-400 text-sm mt-2">
                            Try adjusting your search or filters
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    paginatedCards.map(
                      (property: PropertyCard, idx: number) => (
                        <Link
                          key={`${property._id}-${idx}`}
                          href={`/properties/${property._id}`}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden "
                        >
                          <div className="relative w-full h-48">
                            <Image
                              src={getSafeImageUrl(property.images)}
                              alt={property.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 25vw"
                            />
                          </div>
                          <div className="p-3">
                            {property.title && (
                              <div className="text-[13px] font-semibold text-gray-900 mb-1 line-clamp-1">
                                {property.title}
                              </div>
                            )}
                            {property.description && (
                              <div className="text-[11px] text-gray-500 mb-2 line-clamp-2">
                                {property.description}
                              </div>
                            )}
                            <div className="text-gray-900 text-base font-bold mb-2">
                              ₹{property.price.toLocaleString()}
                              {property.priceUnit && ` ${property.priceUnit}`}
                            </div>
                            {/* City & Region plain with icons (no chips) */}
                            <div className="flex items-center gap-4 mb-2 text-xs text-gray-600">
                              {property.city && (
                                <span className="inline-flex items-center gap-1">
                                  {/* building icon */}
                                  <svg
                                    className="w-4 h-4 text-gray-500"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M3 21h18M6 21V7a2 2 0 012-2h4a2 2 0 012 2v14M6 10h6m-6 4h6m6 7V11a2 2 0 00-2-2h-2"
                                    />
                                  </svg>
                                  {property.city}
                                </span>
                              )}
                              {property.region && (
                                <span className="inline-flex items-center gap-1">
                                  {/* location pin */}
                                  <svg
                                    className="w-4 h-4 text-gray-500"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 11a3 3 0 100-6 3 3 0 000 6z"
                                    />
                                    <path
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19.5 10.5c0 7.5-7.5 10.5-7.5 10.5S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z"
                                    />
                                  </svg>
                                  {property.region}
                                </span>
                              )}
                            </div>

                            {/* Features section */}
                            <div>
                              <div className="text-[11px] text-gray-500 mb-1">
                                Features
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-green-50 text-green-700 border border-green-200">
                                  {/* bed icon */}
                                  <svg
                                    className="w-3.5 h-3.5 text-green-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M3 18V8a2 2 0 012-2h14a2 2 0 012 2v10M3 14h18"
                                    />
                                  </svg>
                                  {property.bedrooms} bd
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-green-50 text-green-700 border border-green-200">
                                  {/* bath icon */}
                                  <svg
                                    className="w-3.5 h-3.5 text-green-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M3 10h18v4a5 5 0 01-5 5H8a5 5 0 01-5-5v-4zm4-3a3 3 0 016 0v3"
                                    />
                                  </svg>
                                  {property.bathrooms} bt
                                </span>
                                {(property.area || property.subType) && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-green-50 text-green-700 border border-green-200">
                                    {/* area icon */}
                                    <svg
                                      className="w-3.5 h-3.5 text-green-600"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 0h6v6h-6v-6z"
                                      />
                                    </svg>
                                    {property.area
                                      ? `${property.area} ${
                                          property.areaUnit || "sqft"
                                        }`
                                      : property.subType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    )
                  )}
                </div>

                {/* Results Count and Pagination */}
                {totalProperties > 0 && (
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Results Count */}
                    <div className="text-sm text-gray-700">
                      {brokerId
                        ? `Showing ${totalProperties} properties for this broker`
                        : `Showing ${
                            (safePage - 1) * itemsPerPage + 1
                          } to ${Math.min(
                            safePage * itemsPerPage,
                            totalProperties
                          )} of ${totalProperties} results`}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => goToPage(safePage - 1)}
                          disabled={safePage === 1}
                          className={`px-3 py-2 text-sm rounded-md border ${
                            safePage === 1
                              ? "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
                              : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Prev
                        </button>
                        {(() => {
                          const pages = [];
                          const maxVisiblePages = 5;
                          let startPage = Math.max(
                            1,
                            safePage - Math.floor(maxVisiblePages / 2)
                          );
                          const endPage = Math.min(
                            totalPages,
                            startPage + maxVisiblePages - 1
                          );

                          // Adjust start page if we're near the end
                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(
                              1,
                              endPage - maxVisiblePages + 1
                            );
                          }

                          // Show first page and ellipsis if needed
                          if (startPage > 1) {
                            pages.push(
                              <button
                                key="page-1"
                                onClick={() => goToPage(1)}
                                className="w-9 h-9 text-sm rounded-md border bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              >
                                1
                              </button>
                            );
                            if (startPage > 2) {
                              pages.push(
                                <span
                                  key="ellipsis-start"
                                  className="px-2 text-gray-500"
                                >
                                  ...
                                </span>
                              );
                            }
                          }

                          // Show visible pages
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <button
                                key={`page-${i}`}
                                onClick={() => goToPage(i)}
                                className={`w-9 h-9 text-sm rounded-md border ${
                                  i === safePage
                                    ? "bg-teal-600 text-white border-teal-600"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }

                          // Show last page and ellipsis if needed
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <span
                                  key="ellipsis-end"
                                  className="px-2 text-gray-500"
                                >
                                  ...
                                </span>
                              );
                            }
                            pages.push(
                              <button
                                key={`page-${totalPages}`}
                                onClick={() => goToPage(totalPages)}
                                className={`w-9 h-9 text-sm rounded-md border ${
                                  totalPages === safePage
                                    ? "bg-teal-600 text-white border-teal-600"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                {totalPages}
                              </button>
                            );
                          }

                          return pages;
                        })()}
                        <button
                          onClick={() => goToPage(safePage + 1)}
                          disabled={safePage === totalPages}
                          className={`px-3 py-2 text-sm rounded-md border ${
                            safePage === totalPages
                              ? "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
                              : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertiesPageContent />
    </Suspense>
  );
}
