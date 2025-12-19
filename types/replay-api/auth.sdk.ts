/**
 * Auth API SDK Extensions
 * Clean, minimal API wrapper for authentication operations including MFA
 */

import { ReplayApiClient } from './replay-api.client';

/**
 * MFA setup response
 */
export interface MFASetupResponse {
  secret: string;
  qr_code_url: string;
  recovery_codes?: string[];
}

/**
 * MFA verification request
 */
export interface MFAVerifyRequest {
  code: string;
  type?: 'totp' | 'recovery';
}

/**
 * MFA verification response
 */
export interface MFAVerifyResponse {
  success: boolean;
  message?: string;
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  email?: string;
  token?: string;
}

/**
 * Email verification response
 */
export interface EmailVerificationResponse {
  success: boolean;
  message?: string;
  verified?: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirm request
 */
export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

/**
 * Password reset response
 */
export interface PasswordResetResponse {
  success: boolean;
  message?: string;
}

/**
 * AuthAPI provides type-safe access to authentication endpoints
 */
export class AuthAPI {
  constructor(private client: ReplayApiClient) {}

  // ========================
  // MFA Operations
  // ========================

  /**
   * Initialize MFA setup - returns secret and QR code
   */
  async setupMFA(): Promise<MFASetupResponse | null> {
    const response = await this.client.get<MFASetupResponse>('/auth/mfa/setup');
    if (response.error) {
      console.error('Failed to setup MFA:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Confirm MFA setup with verification code
   */
  async confirmMFASetup(code: string): Promise<MFAVerifyResponse | null> {
    const response = await this.client.post<MFAVerifyResponse>('/auth/mfa/setup', { code });
    if (response.error) {
      console.error('Failed to confirm MFA setup:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Disable MFA
   */
  async disableMFA(code: string): Promise<MFAVerifyResponse | null> {
    const response = await this.client.post<MFAVerifyResponse>('/auth/mfa/disable', { code });
    if (response.error) {
      console.error('Failed to disable MFA:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Verify MFA code during login
   */
  async verifyMFA(request: MFAVerifyRequest): Promise<MFAVerifyResponse | null> {
    const response = await this.client.post<MFAVerifyResponse>('/auth/mfa/verify', request);
    if (response.error) {
      console.error('Failed to verify MFA:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Generate new recovery codes
   */
  async generateRecoveryCodes(code: string): Promise<{ recovery_codes: string[] } | null> {
    const response = await this.client.post<{ recovery_codes: string[] }>('/auth/mfa/recovery-codes', { code });
    if (response.error) {
      console.error('Failed to generate recovery codes:', response.error);
      return null;
    }
    return response.data || null;
  }

  // ========================
  // Email Verification
  // ========================

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email?: string): Promise<EmailVerificationResponse | null> {
    const response = await this.client.post<EmailVerificationResponse>('/auth/verify-email', { email });
    if (response.error) {
      console.error('Failed to send verification email:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<EmailVerificationResponse | null> {
    const response = await this.client.post<EmailVerificationResponse>('/auth/verify-email/confirm', { token });
    if (response.error) {
      console.error('Failed to verify email:', response.error);
      return null;
    }
    return response.data || null;
  }

  // ========================
  // Password Reset
  // ========================

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<PasswordResetResponse | null> {
    const response = await this.client.post<PasswordResetResponse>('/auth/password-reset', { email });
    if (response.error) {
      console.error('Failed to request password reset:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<PasswordResetResponse | null> {
    const response = await this.client.post<PasswordResetResponse>('/auth/password-reset/confirm', {
      token,
      new_password: newPassword,
    });
    if (response.error) {
      console.error('Failed to confirm password reset:', response.error);
      return null;
    }
    return response.data || null;
  }
}

// Types are exported inline above with their interface declarations


