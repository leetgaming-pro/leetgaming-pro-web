/**
 * Notifications API SDK
 * Clean, minimal API wrapper for notification operations
 */

import { ReplayApiClient } from './replay-api.client';

/**
 * Notification type categories
 */
export type NotificationType = 'match' | 'team' | 'friend' | 'system' | 'achievement' | 'message';

/**
 * Notification entity
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    icon?: string;
    color?: string;
    [key: string]: unknown;
  };
}

/**
 * Notifications list response
 */
export interface NotificationsResult {
  notifications: Notification[];
  total_count: number;
  unread_count: number;
}

/**
 * Notification filters for searching
 */
export interface NotificationFilters {
  type?: NotificationType;
  read?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * NotificationsAPI provides type-safe access to notification endpoints
 */
export class NotificationsAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get all notifications for the current user
   */
  async getAll(filters: NotificationFilters = {}): Promise<NotificationsResult | null> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';

    const response = await this.client.get<NotificationsResult>(url);
    if (response.error) {
      console.error('Failed to fetch notifications:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get a single notification by ID
   */
  async getById(notificationId: string): Promise<Notification | null> {
    const response = await this.client.get<Notification>(`/notifications/${notificationId}`);
    if (response.error) {
      console.error('Failed to fetch notification:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const response = await this.client.put(`/notifications/${notificationId}/read`, {});
    return response.status === 200 || response.status === 204;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    const response = await this.client.put('/notifications/read-all', {});
    return response.status === 200 || response.status === 204;
  }

  /**
   * Delete a single notification
   */
  async delete(notificationId: string): Promise<boolean> {
    const response = await this.client.delete(`/notifications/${notificationId}`);
    return response.status === 200 || response.status === 204;
  }

  /**
   * Delete all notifications
   */
  async deleteAll(): Promise<boolean> {
    const response = await this.client.delete('/notifications');
    return response.status === 200 || response.status === 204;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.client.get<{ count: number }>('/notifications/unread-count');
    if (response.error || !response.data) {
      return 0;
    }
    return response.data.count;
  }
}


