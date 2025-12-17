'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notificationsAPI } from '@/services/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type?: 'property' | 'lead' | 'broker' | 'general';
  read?: boolean;
  createdAt: string;
  [key: string]: unknown;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Helper function to extract notifications from API response
  const extractNotifications = (response: unknown): Notification[] => {
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object') {
      const resp = response as Record<string, unknown>;
      if (Array.isArray(resp.data)) {
        return resp.data;
      } else if (resp.data && typeof resp.data === 'object' && !Array.isArray(resp.data)) {
        const dataObj = resp.data as Record<string, unknown>;
        if (Array.isArray(dataObj.notifications)) {
          return dataObj.notifications as Notification[];
        } else if (Array.isArray(dataObj.data)) {
          return dataObj.data as Notification[];
        }
        // Try to find any array in the data object
        const possibleArrays = Object.values(dataObj).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          return (possibleArrays.reduce((prev, curr) => 
            (curr as unknown[]).length > (prev as unknown[]).length ? curr : prev
          ) as Notification[]);
        }
      }
      if (Array.isArray(resp.notifications)) {
        return resp.notifications;
      } else if (Array.isArray(resp.results)) {
        return resp.results;
      } else if (Array.isArray(resp.items)) {
        return resp.items;
      }
    }
    return [];
  };

  // Fetch recent notifications (only 3 for dropdown) and calculate unread count
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all notifications first to get accurate unread count
      const allResponse = await notificationsAPI.getNotifications(1, 1000, 'all');
      console.log('🔔 All notifications response:', allResponse);
      
      // Extract all notifications
      const allNotifications = extractNotifications(allResponse);
      console.log('🔔 Extracted all notifications:', allNotifications.length);
      
      // Count unread notifications - check multiple field names
      const unreadNotifications = allNotifications.filter((notification) => {
        // Check different possible field names for read status
        const isRead = notification.read === true || 
                      (notification as { isRead?: boolean }).isRead === true ||
                      (notification as { readStatus?: string }).readStatus === 'read';
        
        return !isRead; // Return true if NOT read (i.e., unread)
      });
      
      console.log('🔔 Unread notifications count:', unreadNotifications.length);
      console.log('🔔 Sample notification:', allNotifications[0]);
      
      // Also try to get count from pagination if available
      const pagination = (allResponse as { pagination?: { totalUnread?: number; totalNotifications?: number } })?.pagination ||
                        (allResponse as { data?: { pagination?: { totalUnread?: number; totalNotifications?: number } } })?.data?.pagination;
      
      let count = 0;
      if (pagination?.totalUnread !== undefined) {
        count = pagination.totalUnread;
        console.log('🔔 Using totalUnread from pagination:', count);
      } else if (pagination?.totalNotifications !== undefined && unreadNotifications.length > 0) {
        // If we have unread notifications but no totalUnread, use the count we calculated
        count = unreadNotifications.length;
        console.log('🔔 Using calculated unread count:', count);
      } else {
        count = unreadNotifications.length;
        console.log('🔔 Using calculated unread count (fallback):', count);
      }
      
      console.log('🔔 Final unread count:', count);
      setUnreadCount(count);
      
      // Ensure we only show 3 recent notifications for dropdown
      const recentNotifications = allNotifications.slice(0, 3);
      setNotifications(recentNotifications);
      console.log('🔔 Set notifications for dropdown:', recentNotifications.length);
      
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Format time ago with abbreviations
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}S`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}M`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}H`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}D`;
    }
  };

  // Fetch notifications and unread count on mount only
  useEffect(() => {
    fetchNotifications(); // This also calculates unread count
    
    // Refresh when page becomes visible (user returns from notifications page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };
    
    // Listen for custom event to refresh notifications (triggered after actions like creating leads)
    const handleNotificationRefresh = () => {
      console.log('🔔 Custom refresh event triggered');
      fetchNotifications();
    };
    
    // Listen for window focus to refresh notifications
    const handleWindowFocus = () => {
      fetchNotifications();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('notification-refresh', handleNotificationRefresh);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('notification-refresh', handleNotificationRefresh);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchNotifications]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(); // This also refreshes the count
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleViewAll = async () => {
    try {
      // Mark all notifications as read before navigating
      await notificationsAPI.markAllAsRead();
      console.log('✅ All notifications marked as read');
      
      // Reset unread count to 0
      setUnreadCount(0);
      
      // Close dropdown and navigate
      setIsOpen(false);
      router.push('/notifications');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Still navigate even if API call fails
      setIsOpen(false);
      router.push('/notifications');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center cursor-pointer bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-sm z-10">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Debug: Show count even if 0 (remove in production) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <span className="absolute -bottom-6 left-0 text-[10px] text-gray-500 whitespace-nowrap">
            Count: {unreadCount}
          </span>
        )} */}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50" style={{ maxWidth: '350px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={handleViewAll}
              className="text-sm text-teal-600 cursor-pointer hover:text-teal-700 font-medium"
            >
              View All
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className='flex items-center justify-between'>
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {getTimeAgo(notification.createdAt)}
                    </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
  {notification.message
    .split(" ")
    .slice(0, 6)
    .join(" ")
    + (notification.message.split(" ").length > 6 ? "..." : "")}
</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

