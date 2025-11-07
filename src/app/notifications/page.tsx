'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { notificationsAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';

interface Notification {
  _id: string;
  title: string;
  message: string;
  description?: string;
  type?: 'property' | 'lead' | 'broker' | 'general' | 'new_leads' | 'properties' | 'unread';
  read?: boolean;
  createdAt: string;
  [key: string]: unknown;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await notificationsAPI.getNotifications(currentPage, 50, filter);
      
      console.log('🔔 API Response:', response);
      
      // Extract notifications from API response
      let list: Notification[] = [];
      let paginationInfo: PaginationInfo = {
        currentPage: 1,
        totalPages: 1,
        totalNotifications: 0,
        hasNextPage: false,
        hasPrevPage: false
      };
      
      if (Array.isArray(response)) {
        list = response;
      } else if (response && typeof response === 'object') {
        // Extract notifications array
        if (Array.isArray(response.data)) {
          list = response.data;
        } else if (Array.isArray(response.data?.notifications)) {
          list = response.data.notifications;
        } else if (Array.isArray(response.data?.data)) {
          list = response.data.data;
        } else if (Array.isArray(response.notifications)) {
          list = response.notifications;
        } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          const possibleArrays = Object.values(response.data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            list = possibleArrays.reduce((prev, curr) => 
              (curr as unknown[]).length > (prev as unknown[]).length ? curr : prev
            ) as Notification[];
          }
        } else if (Array.isArray(response.results)) {
          list = response.results;
        } else if (Array.isArray(response.items)) {
          list = response.items;
        }
        
        // Extract pagination info - check multiple possible locations
        const paginationData = response.pagination || response.data?.pagination || response.paginationInfo;
        if (paginationData) {
          paginationInfo = {
            currentPage: paginationData.currentPage || currentPage,
            totalPages: paginationData.totalPages || 1,
            totalNotifications: paginationData.totalNotifications || list.length,
            hasNextPage: paginationData.hasNextPage || false,
            hasPrevPage: paginationData.hasPrevPage || false
          };
        } else {
          // Fallback: if no pagination info, assume we have all notifications
          paginationInfo = {
            currentPage: currentPage,
            totalPages: 1,
            totalNotifications: list.length,
            hasNextPage: false,
            hasPrevPage: false
          };
        }
      }
      
      // Ensure list is always an array
      if (!Array.isArray(list)) {
        console.warn('⚠️ API response is not an array, defaulting to empty array. Response:', response);
        list = [];
      }
      
      console.log('🔔 Extracted notifications count:', list.length);
      console.log('🔔 Pagination info:', paginationInfo);
      console.log('🔔 Full response structure:', JSON.stringify(response, null, 2));
      
      setNotifications(list);
      setPagination(paginationInfo);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Mark all notifications as read when page loads
  useEffect(() => {
    const markAllAsRead = async () => {
      try {
        await notificationsAPI.markAllAsRead();
        console.log('✅ All notifications marked as read');
        // Refresh notifications to update read status
        // Use setTimeout to ensure API call completes before fetching
        setTimeout(() => {
          fetchNotifications();
        }, 500);
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        toast.error('Failed to mark all notifications as read');
      }
    };

    // Mark all as read when component mounts
    markAllAsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format time ago
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'property':
      case 'properties':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        );
      case 'lead':
      case 'new_leads':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'broker':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  // Use notifications directly from API (filtering and pagination is done server-side)
  const filteredNotifications = notifications;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1 text-sm">View and manage all your notifications</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                <div className="flex items-center space-x-2">
                  {['all', 'new_leads', 'properties', 'broker', 'unread'].map((filterOption) => {
                    const isActive = filter === filterOption;
                    const labels: Record<string, string> = {
                      all: 'All',
                      new_leads: 'New Leads',
                      properties: 'Properties',
                      broker: 'Broker',
                      unread: 'Unread'
                    };
                    
                    return (
                      <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isActive && (
                          <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {labels[filterOption]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {pagination.totalNotifications > 0 ? pagination.totalNotifications : filteredNotifications.length} notifications
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Notifications List */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">Try adjusting your filter criteria.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? '' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    {getNotificationIcon(notification.type)}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notification.title || 'Notification'}
                      </h3>
                      {(notification.message || notification.description) && (
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message || notification.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredNotifications.length > 0 && (
            <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    {pagination.totalPages > 1 ? (
                      <>
                        Showing {((pagination.currentPage - 1) * 50) + 1} to {Math.min(pagination.currentPage * 50, pagination.totalNotifications)} of {pagination.totalNotifications} results
                      </>
                    ) : (
                      <>
                        Showing {filteredNotifications.length} of {pagination.totalNotifications > 0 ? pagination.totalNotifications : filteredNotifications.length} results
                      </>
                    )}
                  </span>
                </div>
                {pagination.totalPages > 1 && (
                  <ReactPaginate
                    pageCount={pagination.totalPages}
                    pageRangeDisplayed={3}
                    marginPagesDisplayed={1}
                    onPageChange={({ selected }) => setCurrentPage(selected + 1)}
                    forcePage={pagination.currentPage - 1}
                    previousLabel="Previous"
                    nextLabel="Next"
                    breakLabel="..."
                    containerClassName="flex items-center space-x-1"
                    pageClassName="px-3 py-2 text-sm font-medium rounded-md cursor-pointer text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    activeClassName="!bg-teal-600 !text-white !border-teal-600"
                    previousClassName="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    nextClassName="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    breakClassName="px-3 py-2 text-sm font-medium text-gray-500 cursor-pointer"
                    disabledClassName="opacity-50 cursor-not-allowed"
                    renderOnZeroPageCount={null}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

