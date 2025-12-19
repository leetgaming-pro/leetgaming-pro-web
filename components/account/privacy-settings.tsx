'use client';

/**
 * Privacy & Data Management Component
 * GDPR/CCPA/LGPD Compliant Account Management
 * Branded for LeetGaming.PRO
 * Uses SDK via UserSettingsAPI - DO NOT use direct fetch calls
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Switch,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
  Progress,
  Chip,
  useDisclosure,
  Accordion,
  AccordionItem,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { UserSettingsAPI } from '@/types/replay-api/settings.sdk';
import { logger } from '@/lib/logger';

// ============================================================================
// Enums
// ============================================================================

export enum ConsentCategory {
  ESSENTIAL = 'essential',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  PERSONALIZATION = 'personalization',
  THIRD_PARTY = 'thirdParty',
}

export enum DataExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  EXPIRED = 'expired',
}

export enum DeletionStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
}

// ============================================================================
// Types
// ============================================================================

export interface PrivacyConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  thirdParty: boolean;
}

export interface DataExportRequest {
  id: string;
  status: DataExportStatus;
  requestedAt: string;
  expiresAt?: string;
  downloadUrl?: string;
}

export interface AccountDeletionRequest {
  id: string;
  status: DeletionStatus;
  requestedAt: string;
  scheduledFor?: string;
}

// ============================================================================
// Data Categories
// ============================================================================

const DATA_CATEGORIES = [
  {
    id: 'profile',
    name: 'Profile Information',
    description: 'Your account details, display name, avatar, and bio',
    icon: 'solar:user-bold',
  },
  {
    id: 'gaming',
    name: 'Gaming Data',
    description: 'Match history, statistics, rankings, and achievements',
    icon: 'solar:gamepad-bold',
  },
  {
    id: 'social',
    name: 'Social Connections',
    description: 'Friends list, team memberships, and communications',
    icon: 'solar:users-group-rounded-bold',
  },
  {
    id: 'files',
    name: 'Uploaded Files',
    description: 'Replay files, screenshots, and other uploads',
    icon: 'solar:cloud-upload-bold',
  },
  {
    id: 'financial',
    name: 'Financial Data',
    description: 'Payment history, wallet transactions, and subscriptions',
    icon: 'solar:wallet-bold',
  },
  {
    id: 'activity',
    name: 'Activity Logs',
    description: 'Login history, IP addresses, and device information',
    icon: 'solar:history-bold',
  },
];

const DELETION_REASONS = [
  'No longer interested in gaming',
  'Privacy concerns',
  'Creating a new account',
  'Not satisfied with the service',
  'Too many emails/notifications',
  'Other',
];

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_CONSENT: PrivacyConsent = {
  essential: true,
  analytics: true,
  marketing: false,
  personalization: true,
  thirdParty: false,
};

// ============================================================================
// Component
// ============================================================================

export function PrivacySettings() {
  const exportModal = useDisclosure();
  const deleteModal = useDisclosure();

  // Initialize SDK
  const settingsApi = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080'
      : 'http://localhost:8080';
    const sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);
    return new UserSettingsAPI(sdk.client);
  }, []);

  // State
  const [consent, setConsent] = useState<PrivacyConsent>(DEFAULT_CONSENT);
  const [dataExportRequest, setDataExportRequest] = useState<DataExportRequest | null>(null);
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionRequest | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);

  // Load data on mount
  useEffect(() => {
    fetchDataExportStatus();
    fetchDeletionStatus();
  }, []);

  // Fetch data export status using SDK
  const fetchDataExportStatus = async () => {
    try {
      const result = await settingsApi.getDataExportStatus();
      if (result) {
        setDataExportRequest({
          id: 'export-request',
          status: result.ready ? DataExportStatus.READY : DataExportStatus.PROCESSING,
          requestedAt: new Date().toISOString(),
          expiresAt: result.expires_at,
          downloadUrl: result.download_url,
        });
      }
    } catch (error) {
      console.error('Failed to fetch data export status:', error);
    }
  };

  // Fetch deletion status using SDK
  const fetchDeletionStatus = async () => {
    try {
      const result = await settingsApi.getAccountDeletionStatus();
      if (result && result.pending) {
        setDeletionRequest({
          id: 'deletion-request',
          status: DeletionStatus.SCHEDULED,
          requestedAt: new Date().toISOString(),
          scheduledFor: result.deletion_date,
        });
      }
    } catch (error) {
      console.error('Failed to fetch deletion status:', error);
    }
  };

  const handleConsentChange = async (key: keyof PrivacyConsent, value: boolean) => {
    const newConsent = { ...consent, [key]: value };
    setConsent(newConsent);

    // Save to API (debounced in production)
    setIsSavingConsent(true);
    try {
      // TODO: API call to save consent preferences
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsSavingConsent(false);
    }
  };

  const handleExportRequest = async () => {
    setIsExporting(true);
    try {
      // Use SDK instead of direct fetch
      const result = await settingsApi.requestDataExport({});

      if (result) {
        setDataExportRequest({
          id: 'export-request',
          status: DataExportStatus.PROCESSING,
          requestedAt: new Date().toISOString(),
        });
        exportModal.onClose();
      } else {
        console.error('Export request failed');
      }
    } catch (error) {
      console.error('Export request error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (deleteConfirmation !== 'DELETE' || !deleteAcknowledged || !deleteReason) return;

    setIsDeleting(true);
    try {
      // Use SDK instead of direct fetch
      const result = await settingsApi.requestAccountDeletion({
        confirmation: deleteConfirmation,
        reason: deleteReason,
      });

      if (result) {
        setDeletionRequest({
          id: 'deletion-request',
          status: DeletionStatus.SCHEDULED,
          requestedAt: new Date().toISOString(),
          scheduledFor: result.deletion_date,
        });
        deleteModal.onClose();
        setDeleteReason('');
        setDeleteConfirmation('');
        setDeleteAcknowledged(false);
      } else {
        console.error('Delete request failed');
      }
    } catch (error) {
      console.error('Delete request error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    setIsCanceling(true);
    try {
      // Use SDK instead of direct fetch
      const success = await settingsApi.cancelAccountDeletion();

      if (success) {
        setDeletionRequest(null);
      } else {
        console.error('Cancel deletion failed');
      }
    } catch (error) {
      console.error('Cancel deletion error:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Rights Overview */}
      <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="flex gap-3 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
          <Icon icon="solar:shield-check-bold" className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]" />
          <div>
            <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">Your Privacy Rights</h3>
            <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70">
              We comply with GDPR, CCPA, and LGPD regulations
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F5F0E1] dark:bg-[#1a1a1a] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 rounded-none">
              <Icon icon="solar:eye-bold" className="w-8 h-8 text-[#FF4654] dark:text-[#DCFF37] mb-2" />
              <h4 className="font-semibold mb-1 text-[#34445C] dark:text-[#F5F0E1]">Right to Access</h4>
              <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                Request a copy of all your personal data
              </p>
            </div>
            <div className="p-4 bg-[#F5F0E1] dark:bg-[#1a1a1a] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 rounded-none">
              <Icon icon="solar:pen-bold" className="w-8 h-8 text-[#FFC700] dark:text-[#FFC700] mb-2" />
              <h4 className="font-semibold mb-1 text-[#34445C] dark:text-[#F5F0E1]">Right to Rectify</h4>
              <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                Update or correct your personal information
              </p>
            </div>
            <div className="p-4 bg-[#F5F0E1] dark:bg-[#1a1a1a] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 rounded-none">
              <Icon icon="solar:trash-bin-trash-bold" className="w-8 h-8 text-danger mb-2" />
              <h4 className="font-semibold mb-1 text-[#34445C] dark:text-[#F5F0E1]">Right to Erasure</h4>
              <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                Request deletion of your account and data
              </p>
            </div>
            <div className="p-4 bg-[#F5F0E1] dark:bg-[#1a1a1a] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 rounded-none">
              <Icon icon="solar:download-bold" className="w-8 h-8 text-success mb-2" />
              <h4 className="font-semibold mb-1 text-[#34445C] dark:text-[#F5F0E1]">Data Portability</h4>
              <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                Export your data in a portable format
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Consent Management */}
      <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="flex justify-between items-start bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
          <div className="flex gap-3">
            <Icon icon="solar:settings-bold" className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]" />
            <div>
              <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">Consent Preferences</h3>
              <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                Control how we use your data
              </p>
            </div>
          </div>
          {isSavingConsent && (
            <Chip size="sm" variant="flat" className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#1a1a1a]">
              Saving...
            </Chip>
          )}
        </CardHeader>
        <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
        <CardBody className="space-y-4">
          {/* Essential - Always On */}
          <div className="flex items-center justify-between p-4 bg-[#F5F0E1] dark:bg-[#1a1a1a] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 rounded-none">
            <div className="flex items-center gap-3">
              <Icon icon="solar:lock-bold" className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-[#34445C] dark:text-[#F5F0E1]">Essential Cookies & Data</p>
                <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                  Required for the service to function properly
                </p>
              </div>
            </div>
            <Chip color="success" variant="flat" size="sm">
              Always On
            </Chip>
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between p-4 bg-[#F5F0E1] dark:bg-[#1a1a1a] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 rounded-none">
            <div className="flex items-center gap-3">
              <Icon icon="solar:chart-2-bold" className="w-5 h-5 text-[#FF4654] dark:text-[#DCFF37]" />
              <div>
                <p className="font-medium text-[#34445C] dark:text-[#F5F0E1]">Analytics & Performance</p>
                <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                  Help us understand how you use the platform
                </p>
              </div>
            </div>
            <Switch
              isSelected={consent.analytics}
              onValueChange={(value) => handleConsentChange('analytics', value)}
              size="sm"
              classNames={{
                wrapper: "group-data-[selected=true]:bg-[#FF4654] dark:group-data-[selected=true]:bg-[#DCFF37]",
              }}
            />
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between p-4 bg-[#F5F0E1] dark:bg-[#1a1a1a] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 rounded-none">
            <div className="flex items-center gap-3">
              <Icon icon="solar:letter-bold" className="w-5 h-5 text-[#FFC700]" />
              <div>
                <p className="font-medium text-[#34445C] dark:text-[#F5F0E1]">Marketing Communications</p>
                <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                  Receive news, updates, and promotional offers
                </p>
              </div>
            </div>
            <Switch
              isSelected={consent.marketing}
              onValueChange={(value) => handleConsentChange('marketing', value)}
              size="sm"
              classNames={{
                wrapper: "group-data-[selected=true]:bg-[#FF4654] dark:group-data-[selected=true]:bg-[#DCFF37]",
              }}
            />
          </div>

          {/* Personalization */}
          <div className="flex items-center justify-between p-4 bg-[#F5F0E1] dark:bg-[#1a1a1a] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 rounded-none">
            <div className="flex items-center gap-3">
              <Icon icon="solar:magic-stick-bold" className="w-5 h-5 text-[#34445C] dark:text-[#DCFF37]" />
              <div>
                <p className="font-medium text-[#34445C] dark:text-[#F5F0E1]">Personalization</p>
                <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                  Customize your experience based on your activity
                </p>
              </div>
            </div>
            <Switch
              isSelected={consent.personalization}
              onValueChange={(value) => handleConsentChange('personalization', value)}
              size="sm"
              classNames={{
                wrapper: "group-data-[selected=true]:bg-[#FF4654] dark:group-data-[selected=true]:bg-[#DCFF37]",
              }}
            />
          </div>

          {/* Third Party */}
          <div className="flex items-center justify-between p-4 bg-[#F5F0E1] dark:bg-[#1a1a1a] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 rounded-none">
            <div className="flex items-center gap-3">
              <Icon icon="solar:share-bold" className="w-5 h-5 text-[#34445C]/70 dark:text-[#F5F0E1]/70" />
              <div>
                <p className="font-medium text-[#34445C] dark:text-[#F5F0E1]">Third-Party Sharing</p>
                <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                  Share data with trusted partners for enhanced services
                </p>
              </div>
            </div>
            <Switch
              isSelected={consent.thirdParty}
              onValueChange={(value) => handleConsentChange('thirdParty', value)}
              size="sm"
              classNames={{
                wrapper: "group-data-[selected=true]:bg-[#FF4654] dark:group-data-[selected=true]:bg-[#DCFF37]",
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Data Export */}
      <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="flex gap-3 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
          <Icon icon="solar:download-bold" className="w-6 h-6 text-success" />
          <div>
            <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">Export Your Data</h3>
            <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70">
              Download a copy of all your personal data
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
        <CardBody>
          {dataExportRequest?.status === DataExportStatus.PROCESSING ? (
            <div className="text-center py-6">
              <Progress
                isIndeterminate
                size="sm"
                classNames={{
                  indicator: "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                }}
                className="max-w-md mx-auto mb-4"
              />
              <p className="font-medium text-[#34445C] dark:text-[#F5F0E1]">Preparing your data export...</p>
              <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-1">
                This may take a few minutes. We&apos;ll email you when it&apos;s ready.
              </p>
            </div>
          ) : dataExportRequest?.status === DataExportStatus.READY ? (
            <div className="text-center py-6">
              <Icon
                icon="solar:check-circle-bold"
                className="w-12 h-12 text-success mx-auto mb-4"
              />
              <p className="font-medium text-[#34445C] dark:text-[#F5F0E1]">Your data export is ready!</p>
              <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-1 mb-4">
                Available until {dataExportRequest.expiresAt ? new Date(dataExportRequest.expiresAt).toLocaleDateString() : 'N/A'}
              </p>
              <Button
                color="success"
                className="rounded-none"
                startContent={<Icon icon="solar:download-bold" className="w-5 h-5" />}
                onPress={() => dataExportRequest.downloadUrl && window.open(dataExportRequest.downloadUrl, '_blank')}
              >
                Download Data Export
              </Button>
            </div>
          ) : dataExportRequest?.status === DataExportStatus.PENDING ? (
            <div className="text-center py-6">
              <Icon
                icon="solar:clock-circle-bold"
                className="w-12 h-12 text-[#FFC700] mx-auto mb-4"
              />
              <p className="font-medium text-[#34445C] dark:text-[#F5F0E1]">Export request pending</p>
              <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-1">
                Your data export request is being processed. We&apos;ll notify you when it&apos;s ready.
              </p>
            </div>
          ) : (
            <>
              <Accordion 
                variant="bordered" 
                className="mb-4"
                itemClasses={{
                  base: "rounded-none border-[#FF4654]/20 dark:border-[#DCFF37]/20",
                  title: "text-[#34445C] dark:text-[#F5F0E1]",
                  trigger: "bg-[#F5F0E1] dark:bg-[#1a1a1a]",
                  content: "bg-[#F5F0E1]/50 dark:bg-[#1a1a1a]/50",
                }}
              >
                <AccordionItem
                  key="data-included"
                  aria-label="Data included"
                  title="What data is included?"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DATA_CATEGORIES.map((category) => (
                      <div key={category.id} className="flex items-start gap-2">
                        <Icon icon={category.icon} className="w-5 h-5 text-[#FF4654] dark:text-[#DCFF37] mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-[#34445C] dark:text-[#F5F0E1]">{category.name}</p>
                          <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">{category.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>

              <Button
                className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#1a1a1a] rounded-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                startContent={<Icon icon="solar:download-bold" className="w-5 h-5" />}
                onPress={exportModal.onOpen}
              >
                Request Data Export
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      {/* Account Deletion */}
      <Card className="rounded-none border-2 border-danger/30">
        <CardHeader className="flex gap-3 bg-danger/5">
          <Icon icon="solar:trash-bin-trash-bold" className="w-6 h-6 text-danger" />
          <div>
            <h3 className="text-lg font-semibold text-danger">Delete Account</h3>
            <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70">
              Permanently delete your account and all associated data
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-danger/20" />
        <CardBody>
          {deletionRequest?.status === DeletionStatus.SCHEDULED ? (
            <div className="bg-danger/10 border border-danger/20 rounded-none p-4">
              <div className="flex items-start gap-3">
                <Icon icon="solar:clock-circle-bold" className="w-6 h-6 text-danger mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-danger">Account deletion scheduled</p>
                  <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-1">
                    Your account will be permanently deleted on{' '}
                    {deletionRequest.scheduledFor ? new Date(deletionRequest.scheduledFor).toLocaleDateString() : 'N/A'}
                  </p>
                  <Button
                    className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#1a1a1a] rounded-none mt-3"
                    size="sm"
                    onPress={handleCancelDeletion}
                    isLoading={isCanceling}
                  >
                    Cancel Deletion Request
                  </Button>
                </div>
              </div>
            </div>
          ) : deletionRequest?.status === DeletionStatus.PENDING ? (
            <div className="bg-[#FFC700]/10 border border-[#FFC700]/20 rounded-none p-4">
              <div className="flex items-start gap-3">
                <Icon icon="solar:clock-circle-bold" className="w-6 h-6 text-[#FFC700] mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-[#FFC700]">Deletion request pending</p>
                  <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-1">
                    Your account deletion request is being reviewed.
                  </p>
                  <Button
                    className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#1a1a1a] rounded-none mt-3"
                    size="sm"
                    onPress={handleCancelDeletion}
                    isLoading={isCanceling}
                  >
                    Cancel Deletion Request
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-danger/10 border border-danger/20 rounded-none p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Icon icon="solar:danger-triangle-bold" className="w-6 h-6 text-danger mt-0.5" />
                  <div>
                    <p className="font-medium text-danger">Warning: This action is irreversible</p>
                    <ul className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-2 space-y-1 list-disc list-inside">
                      <li>All your profile data will be permanently deleted</li>
                      <li>Your match history and statistics will be removed</li>
                      <li>Uploaded replays and files will be deleted</li>
                      <li>Team memberships will be revoked</li>
                      <li>Active subscriptions will be canceled</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                color="danger"
                variant="bordered"
                className="rounded-none"
                startContent={<Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />}
                onPress={deleteModal.onOpen}
              >
                Request Account Deletion
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      {/* Data Retention Info */}
      <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="flex gap-3 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
          <Icon icon="solar:clock-circle-bold" className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]" />
          <div>
            <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">Data Retention Policy</h3>
            <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70">
              How long we keep your data
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
        <CardBody>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
              <span className="text-[#34445C] dark:text-[#F5F0E1]">Profile Information</span>
              <span className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">Until account deletion</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
              <span className="text-[#34445C] dark:text-[#F5F0E1]">Gaming Statistics</span>
              <span className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">Until account deletion</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
              <span className="text-[#34445C] dark:text-[#F5F0E1]">Replay Files</span>
              <span className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">90 days after upload (free) / indefinite (Pro)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
              <span className="text-[#34445C] dark:text-[#F5F0E1]">Payment Records</span>
              <span className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">7 years (legal requirement)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
              <span className="text-[#34445C] dark:text-[#F5F0E1]">Activity Logs</span>
              <span className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">30 days</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#34445C] dark:text-[#F5F0E1]">Marketing Preferences</span>
              <span className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">Until changed or account deletion</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Export Modal */}
      <Modal isOpen={exportModal.isOpen} onClose={exportModal.onClose} classNames={{ base: "rounded-none" }}>
        <ModalContent>
          <ModalHeader className="text-[#34445C] dark:text-[#F5F0E1]">Request Data Export</ModalHeader>
          <ModalBody>
            <p className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">
              We&apos;ll prepare a complete export of your personal data. This includes:
            </p>
            <ul className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-2 space-y-1 list-disc list-inside">
              <li>Profile and account information</li>
              <li>Match history and gaming statistics</li>
              <li>Social connections and team data</li>
              <li>Payment and subscription history</li>
              <li>Uploaded files and media</li>
            </ul>
            <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-4">
              The export will be ready within 24-48 hours and available for download for 7 days.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={exportModal.onClose} className="rounded-none">
              Cancel
            </Button>
            <Button
              className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#1a1a1a] rounded-none"
              onPress={handleExportRequest}
              isLoading={isExporting}
            >
              Request Export
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="lg" classNames={{ base: "rounded-none" }}>
        <ModalContent>
          <ModalHeader className="text-danger">Delete Account</ModalHeader>
          <ModalBody>
            <div className="bg-danger/10 border border-danger/20 rounded-none p-4 mb-4">
              <p className="text-danger font-medium">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#34445C] dark:text-[#F5F0E1]">
                  Why are you deleting your account?
                </label>
                <div className="mt-2 space-y-2">
                  {DELETION_REASONS.map((reason) => (
                    <div
                      key={reason}
                      className={`
                        p-3 rounded-none cursor-pointer border transition-colors
                        ${deleteReason === reason
                          ? 'border-danger bg-danger/10 text-[#34445C] dark:text-[#F5F0E1]'
                          : 'border-[#34445C]/20 dark:border-[#DCFF37]/20 hover:border-[#34445C]/40 dark:hover:border-[#DCFF37]/40 text-[#34445C]/70 dark:text-[#F5F0E1]/70'}
                      `}
                      onClick={() => setDeleteReason(reason)}
                    >
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              <Input
                label="Type DELETE to confirm"
                placeholder="DELETE"
                value={deleteConfirmation}
                onValueChange={setDeleteConfirmation}
                variant="bordered"
                classNames={{
                  inputWrapper: "rounded-none",
                }}
                color={deleteConfirmation === 'DELETE' ? 'success' : 'default'}
              />

              <Checkbox
                isSelected={deleteAcknowledged}
                onValueChange={setDeleteAcknowledged}
                classNames={{
                  label: "text-[#34445C] dark:text-[#F5F0E1]",
                }}
              >
                <span className="text-sm">
                  I understand that this action is permanent and my data cannot be recovered
                </span>
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={deleteModal.onClose} className="rounded-none">
              Cancel
            </Button>
            <Button
              color="danger"
              className="rounded-none"
              onPress={handleDeleteRequest}
              isLoading={isDeleting}
              isDisabled={deleteConfirmation !== 'DELETE' || !deleteAcknowledged || !deleteReason}
            >
              Delete My Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
