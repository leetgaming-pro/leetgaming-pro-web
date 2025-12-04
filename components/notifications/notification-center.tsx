'use client';

/**
 * Notification Center Component
 * Displays and manages user notifications with real-time updates
 */

import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Badge,
  Card,
  CardBody,
  Divider,
  Chip,
  Tabs,
  Tab,
  ScrollShadow,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';

export interface Notification {
  id: string;
  type: 'match' | 'team' | 'friend' | 'system' | 'achievement' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    icon?: string;
    color?: string;
    [key: string]: any;
  };
}

export interface NotificationCenterProps {
  /** Initial notifications */
  initialNotifications?: Notification[];
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: Notification) => void;
  /** Callback when notification is marked as read */
  onMarkAsRead?: (notificationId: string) => void;
  /** Callback when all notifications are marked as read */
  onMarkAllAsRead?: () => void;
  /** Enable real-time updates */
  enableRealtime?: boolean;
}

const notificationIcons: Record<Notification['type'], string> = {
  match: 'solar:gameboy-bold',
  team: 'solar:users-group-rounded-bold',
  friend: 'solar:user-plus-bold',
  system: 'solar:bell-bold',
  achievement: 'solar:cup-star-bold',
  message: 'solar:chat-round-bold',
};

const notificationColors: Record<
  Notification['type'],
  'primary' | 'secondary' | 'success' | 'warning' | 'danger'
> = {
  match: 'primary',
  team: 'secondary',
  friend: 'success',
  system: 'warning',
  achievement: 'warning',
  message: 'primary',
};

export function NotificationCenter({
  initialNotifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  enableRealtime = false,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [selectedTab, setSelectedTab] = useState<string>('all');

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Real-time updates simulation (replace with WebSocket in production)
  useEffect(() => {
    if (!enableRealtime) return;

    const interval = setInterval(() => {
      // In production, use WebSocket or Server-Sent Events
      // For now, we'll just poll the API
      loadNotifications();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [enableRealtime]);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        // Show empty state when API fails
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Show empty state on error - no mock data fallback
      setNotifications([]);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // In production, call API
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      if (onMarkAsRead) {
        onMarkAsRead(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In production, call API
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      if (onMarkAllAsRead) {
        onMarkAllAsRead();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);

    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    selectedTab === 'all'
      ? notifications
      : notifications.filter((n) => n.type === selectedTab);

  const renderNotification = (notification: Notification) => {
    const icon = notification.metadata?.icon || notificationIcons[notification.type];
    const color = notificationColors[notification.type];

    return (
      <Card
        key={notification.id}
        isPressable
        className={`mb-2 ${notification.read ? 'opacity-60' : ''}`}
        onPress={() => handleNotificationClick(notification)}
      >
        <CardBody className="p-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 bg-${color}/10 rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon icon={icon} width={20} className={`text-${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-xs text-default-600 line-clamp-2">{notification.message}</p>
              <p className="text-xs text-default-400 mt-1">
                {formatTimestamp(notification.timestamp)}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <Popover placement="bottom-end" offset={10}>
      <PopoverTrigger>
        <Button isIconOnly variant="light" className="relative">
          <Badge content={unreadCount > 0 ? unreadCount : ''} color="danger" size="sm">
            <Icon icon="solar:bell-bold" width={24} />
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px]">
        <div className="w-full">
          {/* Header */}
          <div className="p-4 pb-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  onPress={handleMarkAllAsRead}
                >
                  Mark all read
                </Button>
              )}
            </div>

            {/* Tabs for filtering */}
            <Tabs
              size="sm"
              aria-label="Notification filters"
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              className="w-full"
            >
              <Tab key="all" title="All" />
              <Tab key="match" title="Matches" />
              <Tab key="team" title="Teams" />
              <Tab key="friend" title="Friends" />
              <Tab key="achievement" title="Achievements" />
            </Tabs>
          </div>

          <Divider className="mt-2" />

          {/* Notifications List */}
          <ScrollShadow className="max-h-[500px] p-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="solar:bell-off-linear" width={48} className="mx-auto mb-3 text-default-300" />
                <p className="text-default-500">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map(renderNotification)
            )}
          </ScrollShadow>

          <Divider />

          {/* Footer */}
          <div className="p-3">
            <Button
              className="w-full"
              variant="flat"
              color="primary"
              onPress={() => (window.location.href = '/notifications')}
            >
              View All Notifications
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper function to format timestamps
function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

