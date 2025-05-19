'use client';

import React, { useState, useEffect } from 'react';
import { Notification, NotificationType } from '@/lib/notifications/notificationService';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications/notificationService';
import { formatDate } from '@/lib/utils/dateUtils';
import Link from 'next/link';

interface NotificationListProps {
  userId: string;
  limit?: number;
  onNotificationClick?: (notification: Notification) => void;
}

/**
 * NotificationList component displays a list of user notifications
 */
export default function NotificationList({
  userId,
  limit = 10,
  onNotificationClick
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userNotifications = await getUserNotifications(userId, limit);
        setNotifications(userNotifications);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, [userId, limit]);
  
  // Handle marking a notification as read
  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await markNotificationAsRead(notification.id);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
      
      // Call the click handler if provided
      if (onNotificationClick) {
        onNotificationClick(notification);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.GAME_INVITATION:
        return (
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case NotificationType.WAITLIST_PROMOTION:
        return (
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case NotificationType.GAME_REMINDER:
        return (
          <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case NotificationType.GAME_CANCELED:
        return (
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case NotificationType.TEAM_ASSIGNMENT:
        return (
          <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };
  
  // Get notification link based on type and data
  const getNotificationLink = (notification: Notification) => {
    const { type, data } = notification;
    
    if (!data) return '#';
    
    switch (type) {
      case NotificationType.GAME_INVITATION:
      case NotificationType.WAITLIST_PROMOTION:
      case NotificationType.GAME_REMINDER:
      case NotificationType.GAME_CANCELED:
      case NotificationType.GAME_UPDATED:
      case NotificationType.TEAM_ASSIGNMENT:
      case NotificationType.GAME_RESULT:
        return data.gameId ? `/app/games/${data.gameId}` : '#';
      case NotificationType.GROUP_INVITATION:
      case NotificationType.GROUP_ROLE_CHANGE:
        return data.groupId ? `/app/groups/${data.groupId}` : '#';
      default:
        return '#';
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading notifications...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-2 text-blue-600 hover:text-blue-800"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">No notifications</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <Link
            key={notification.id}
            href={getNotificationLink(notification)}
            onClick={() => handleMarkAsRead(notification)}
            className={`block hover:bg-gray-50 transition-colors duration-150 ${
              !notification.isRead ? 'bg-blue-50' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${!notification.isRead ? 'text-blue-800' : 'text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  
                  <p className={`mt-1 text-sm ${!notification.isRead ? 'text-blue-700' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                </div>
                
                {!notification.isRead && (
                  <div className="ml-3 flex-shrink-0">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
