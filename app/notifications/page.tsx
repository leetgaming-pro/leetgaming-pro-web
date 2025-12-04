'use client';

/**
 * Notifications Page
 * Full page view of all user notifications with filtering and management
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Tabs,
  Tab,
  Divider,
  Skeleton,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';
import { Notification } from '@/components/notifications/notification-center';

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

// Pre-defined Tailwind classes for dynamic color support
const colorBgClasses: Record<string, string> = {
  primary: 'bg-primary/10',
  secondary: 'bg-secondary/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  danger: 'bg-danger/10',
};

const colorTextClasses: Record<string, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
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
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return;

    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
      });

      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  let filteredNotifications = notifications;

  // Filter by type
  if (selectedTab !== 'all') {
    filteredNotifications = filteredNotifications.filter((n) => n.type === selectedTab);
  }

  // Filter by read status
  if (filterUnread) {
    filteredNotifications = filteredNotifications.filter((n) => !n.read);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = (notification: Notification) => {
    const icon = notification.metadata?.icon || notificationIcons[notification.type];
    const color = notificationColors[notification.type];

    return (
      <Card
        key={notification.id}
        className={`mb-4 ${notification.read ? 'opacity-70' : ''}`}
      >
        <CardBody className="p-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 ${colorBgClasses[color]} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <Icon icon={icon} width={24} className={colorTextClasses[color]} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{notification.title}</h3>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                  )}
                </div>
                <Chip size="sm" variant="flat" color={color}>
                  {notification.type}
                </Chip>
              </div>
              <p className="text-default-700 mb-3">{notification.message}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-default-500">
                  <Icon icon="solar:clock-circle-linear" width={16} className="inline mr-1" />
                  {formatTimestamp(notification.timestamp)}
                </p>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => handleMarkAsRead(notification.id)}
                      startContent={<Icon icon="solar:check-circle-bold" width={18} />}
                    >
                      Mark as Read
                    </Button>
                  )}
                  {notification.actionUrl && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      onPress={() => {
                        handleMarkAsRead(notification.id);
                        window.location.href = notification.actionUrl!;
                      }}
                      startContent={<Icon icon="solar:arrow-right-bold" width={18} />}
                    >
                      View
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    isIconOnly
                    onPress={() => handleDeleteNotification(notification.id)}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" width={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <PageContainer title="Notifications" maxWidth="5xl">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Notifications"
      description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      maxWidth="5xl"
    >
      {/* Action Bar */}
      <Card className="mb-6">
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={filterUnread ? 'solid' : 'bordered'}
                color="primary"
                onPress={() => setFilterUnread(!filterUnread)}
                startContent={<Icon icon="solar:filter-bold" width={18} />}
              >
                {filterUnread ? 'Showing Unread' : 'Show Unread Only'}
              </Button>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={handleMarkAllAsRead}
                  startContent={<Icon icon="solar:check-read-bold" width={18} />}
                >
                  Mark All Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={handleClearAll}
                  startContent={<Icon icon="solar:trash-bin-trash-bold" width={18} />}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs for filtering */}
      <Tabs
        aria-label="Notification filters"
        size="lg"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        className="mb-6"
      >
        <Tab
          key="all"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:list-bold" width={20} />
              <span>All</span>
              <Chip size="sm" variant="flat">
                {notifications.length}
              </Chip>
            </div>
          }
        />
        <Tab
          key="match"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:gameboy-bold" width={20} />
              <span>Matches</span>
            </div>
          }
        />
        <Tab
          key="team"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:users-group-rounded-bold" width={20} />
              <span>Teams</span>
            </div>
          }
        />
        <Tab
          key="friend"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:user-plus-bold" width={20} />
              <span>Friends</span>
            </div>
          }
        />
        <Tab
          key="achievement"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:cup-star-bold" width={20} />
              <span>Achievements</span>
            </div>
          }
        />
        <Tab
          key="message"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:chat-round-bold" width={20} />
              <span>Messages</span>
            </div>
          }
        />
      </Tabs>

      {/* Notifications List */}
      <div>
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Icon
                icon="solar:bell-off-linear"
                width={64}
                className="mx-auto mb-4 text-default-400"
              />
              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-default-600">
                {filterUnread
                  ? "You're all caught up! No unread notifications."
                  : selectedTab === 'all'
                  ? 'You have no notifications yet.'
                  : `No ${selectedTab} notifications.`}
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredNotifications.map(renderNotification)
        )}
      </div>
    </PageContainer>
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
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

