/**
 * useAuthExtensions Hook
 * React hook for extended auth operations: MFA, email verification, password reset
 * Uses SDK for type-safe API access - DO NOT use direct fetch calls
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import {
  AuthAPI,
  MFASetupResponse,
  MFAVerifyResponse,
  EmailVerificationResponse,
  PasswordResetResponse,
} from '@/types/replay-api/auth.sdk';

const getApiBaseUrl = (): string =>
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';

export interface UseAuthExtensionsResult {
  // MFA State
  mfaSetup: MFASetupResponse | null;
  isMFALoading: boolean;
  mfaError: string | null;
  // MFA Actions
  setupMFA: () => Promise<MFASetupResponse | null>;
  confirmMFASetup: (code: string) => Promise<boolean>;
  disableMFA: (code: string) => Promise<boolean>;
  verifyMFA: (code: string, type?: 'totp' | 'recovery') => Promise<boolean>;
  generateRecoveryCodes: (code: string) => Promise<string[] | null>;
  // Email Verification State
  isEmailVerificationLoading: boolean;
  emailVerificationError: string | null;
  // Email Verification Actions
  sendVerificationEmail: (email?: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  // Password Reset State
  isPasswordResetLoading: boolean;
  passwordResetError: string | null;
  // Password Reset Actions
  requestPasswordReset: (email: string) => Promise<boolean>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<boolean>;
  // Clear errors
  clearErrors: () => void;
}

export function useAuthExtensions(): UseAuthExtensionsResult {
  // MFA State
  const [mfaSetup, setMfaSetup] = useState<MFASetupResponse | null>(null);
  const [isMFALoading, setIsMFALoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  // Email Verification State
  const [isEmailVerificationLoading, setIsEmailVerificationLoading] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState<string | null>(null);

  // Password Reset State
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);

  // Create API client
  const api = useMemo(() => {
    const baseUrl = getApiBaseUrl();
    const sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);
    return new AuthAPI(sdk.client);
  }, []);

  // ========================
  // MFA Actions
  // ========================

  const setupMFA = useCallback(async (): Promise<MFASetupResponse | null> => {
    setIsMFALoading(true);
    setMfaError(null);
    try {
      const result = await api.setupMFA();
      if (result) {
        setMfaSetup(result);
      } else {
        setMfaError('Failed to setup MFA');
      }
      return result;
    } catch (err: unknown) {
      logger.error('[useAuthExtensions] MFA setup failed:', err);
      setMfaError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsMFALoading(false);
    }
  }, [api]);

  const confirmMFASetup = useCallback(async (code: string): Promise<boolean> => {
    setIsMFALoading(true);
    setMfaError(null);
    try {
      const result = await api.confirmMFASetup(code);
      if (result?.success) {
        return true;
      }
      setMfaError(result?.message || 'Invalid verification code');
      return false;
    } catch (err: unknown) {
      logger.error('[useAuthExtensions] MFA confirmation failed:', err);
      setMfaError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsMFALoading(false);
    }
  }, [api]);

  const disableMFA = useCallback(async (code: string): Promise<boolean> => {
    setIsMFALoading(true);
    setMfaError(null);
    try {
      const result = await api.disableMFA(code);
      if (result?.success) {
        setMfaSetup(null);
        return true;
      }
      setMfaError(result?.message || 'Invalid verification code');
      return false;
    } catch (err: unknown) {
      logger.error('[useAuthExtensions] MFA disable failed:', err);
      setMfaError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsMFALoading(false);
    }
  }, [api]);

  const verifyMFA = useCallback(async (code: string, type: 'totp' | 'recovery' = 'totp'): Promise<boolean> => {
    setIsMFALoading(true);
    setMfaError(null);
    try {
      const result = await api.verifyMFA({ code, type });
      if (result?.success) {
        return true;
      }
      setMfaError(result?.message || 'Invalid verification code');
      return false;
    } catch (err: unknown) {
      logger.error('[useAuthExtensions] MFA verification failed:', err);
      setMfaError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsMFALoading(false);
    }
  }, [api]);

  const generateRecoveryCodes = useCallback(async (code: string): Promise<string[] | null> => {
    setIsMFALoading(true);
    setMfaError(null);
    try {
      const result = await api.generateRecoveryCodes(code);
      if (result?.recovery_codes) {
        return result.recovery_codes;
      }
      setMfaError('Failed to generate recovery codes');
      return null;
    } catch (err: unknown) {
      logger.error('[useAuthExtensions] Generate recovery codes failed:', err);
      setMfaError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsMFALoading(false);
    }
  }, [api]);

  // ========================
  // Email Verification Actions
  // ========================

  const sendVerificationEmail = useCallback(async (email?: string): Promise<boolean> => {
    setIsEmailVerificationLoading(true);
    setEmailVerificationError(null);
    try {
      const result = await api.sendVerificationEmail(email);
      if (result?.success) {
        return true;
      }
      setEmailVerificationError(result?.message || 'Failed to send verification email');
      return false;
    } catch (err: unknown) {
      logger.error('[useAuthExtensions] Send verification email failed:', err);
      setEmailVerificationError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsEmailVerificationLoading(false);
    }
  }, [api]);

  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    setIsEmailVerificationLoading(true);
    setEmailVerificationError(null);
    try {
      const result = await api.verifyEmail(token);
      if (result?.success || result?.verified) {
        return true;
      }
      setEmailVerificationError(result?.message || 'Failed to verify email');
      return false;
    } catch (err: unknown) {
      logger.error('[useAuthExtensions] Email verification failed:', err);
      setEmailVerificationError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsEmailVerificationLoading(false);
    }
  }, [api]);

  // ========================
  // Password Reset Actions
  // ========================

  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    setIsPasswordResetLoading(true);
    setPasswordResetError(null);
    try {
      const result = await api.requestPasswordReset(email);
      if (result?.success) {
        return true;
      }
      setPasswordResetError(result?.message || 'Failed to request password reset');
      return false;
    } catch (err: unknown) {
      logger.error('[useAuthExtensions] Password reset request failed:', err);
      setPasswordResetError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsPasswordResetLoading(false);
    }
  }, [api]);

  const confirmPasswordReset = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
    setIsPasswordResetLoading(true);
    setPasswordResetError(null);
    try {
      const result = await api.confirmPasswordReset(token, newPassword);
      if (result?.success) {
        return true;
      }
      setPasswordResetError(result?.message || 'Failed to reset password');
      return false;
    } catch (err: unknown) {
      logger.error('[useAuthExtensions] Password reset confirmation failed:', err);
      setPasswordResetError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsPasswordResetLoading(false);
    }
  }, [api]);

  // ========================
  // Utility
  // ========================

  const clearErrors = useCallback(() => {
    setMfaError(null);
    setEmailVerificationError(null);
    setPasswordResetError(null);
  }, []);

  return {
    // MFA
    mfaSetup,
    isMFALoading,
    mfaError,
    setupMFA,
    confirmMFASetup,
    disableMFA,
    verifyMFA,
    generateRecoveryCodes,
    // Email Verification
    isEmailVerificationLoading,
    emailVerificationError,
    sendVerificationEmail,
    verifyEmail,
    // Password Reset
    isPasswordResetLoading,
    passwordResetError,
    requestPasswordReset,
    confirmPasswordReset,
    // Utility
    clearErrors,
  };
}

// Re-export types
export type { MFASetupResponse, MFAVerifyResponse, EmailVerificationResponse, PasswordResetResponse };


