/**
 * User Settings API SDK
 * Clean, minimal API wrapper for user settings operations
 */

import { ReplayApiClient } from './replay-api.client';

/**
 * Notification preferences
 */
export interface NotificationSettings {
  email_matches: boolean;
  email_teams: boolean;
  email_friends: boolean;
  email_marketing: boolean;
  push_matches: boolean;
  push_friends: boolean;
  push_messages: boolean;
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private';
  show_online_status: boolean;
  show_match_history: boolean;
  show_statistics: boolean;
  allow_friend_requests: boolean;
  allow_team_invites: boolean;
}

/**
 * Account data export request
 */
export interface DataExportRequest {
  format?: 'json' | 'csv';
  include_replays?: boolean;
  include_matches?: boolean;
  include_statistics?: boolean;
}

/**
 * Account deletion request
 */
export interface AccountDeletionRequest {
  confirmation: string;
  reason?: string;
  keep_anonymized_data?: boolean;
}

/**
 * UserSettingsAPI provides type-safe access to user settings endpoints
 */
export class UserSettingsAPI {
  constructor(private client: ReplayApiClient) {}

  // ========================
  // Notification Settings
  // ========================

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings | null> {
    const response = await this.client.get<NotificationSettings>('/user/notifications');
    if (response.error) {
      console.error('Failed to fetch notification settings:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<boolean> {
    const response = await this.client.put('/user/notifications', settings);
    return response.status === 200 || response.status === 204;
  }

  // ========================
  // Privacy Settings
  // ========================

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings | null> {
    const response = await this.client.get<PrivacySettings>('/user/privacy');
    if (response.error) {
      console.error('Failed to fetch privacy settings:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<boolean> {
    const response = await this.client.put('/user/privacy', settings);
    return response.status === 200 || response.status === 204;
  }

  // ========================
  // Account Management
  // ========================

  /**
   * Request data export
   */
  async requestDataExport(request: DataExportRequest = {}): Promise<{ download_url?: string; status: string } | null> {
    const response = await this.client.post<{ download_url?: string; status: string }>('/account/data-export', request);
    if (response.error) {
      console.error('Failed to request data export:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get data export status
   */
  async getDataExportStatus(): Promise<{ ready: boolean; download_url?: string; expires_at?: string } | null> {
    const response = await this.client.get<{ ready: boolean; download_url?: string; expires_at?: string }>('/account/data-export');
    if (response.error) {
      console.error('Failed to get data export status:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Request account deletion
   */
  async requestAccountDeletion(request: AccountDeletionRequest): Promise<{ status: string; deletion_date?: string } | null> {
    const response = await this.client.post<{ status: string; deletion_date?: string }>('/account/delete', request);
    if (response.error) {
      console.error('Failed to request account deletion:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Cancel pending account deletion
   */
  async cancelAccountDeletion(): Promise<boolean> {
    const response = await this.client.delete('/account/delete');
    return response.status === 200 || response.status === 204;
  }

  /**
   * Get account deletion status
   */
  async getAccountDeletionStatus(): Promise<{ pending: boolean; deletion_date?: string } | null> {
    const response = await this.client.get<{ pending: boolean; deletion_date?: string }>('/account/delete/status');
    if (response.error) {
      console.error('Failed to get account deletion status:', response.error);
      return null;
    }
    return response.data || null;
  }
}

// Types are exported inline above with their interface declarations


