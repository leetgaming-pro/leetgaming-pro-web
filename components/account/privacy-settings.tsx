'use client';

/**
 * Privacy & Data Management Component
 * GDPR/CCPA/LGPD Compliant Account Management
 */

import React, { useState, useEffect } from 'react';
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

  // Fetch data export status
  const fetchDataExportStatus = async () => {
    try {
      const response = await fetch('/api/account/data-export');
      const data = await response.json();
      if (data.success && data.data) {
        setDataExportRequest(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch data export status:', error);
    }
  };

  // Fetch deletion status
  const fetchDeletionStatus = async () => {
    try {
      const response = await fetch('/api/account/delete');
      const data = await response.json();
      if (data.success && data.data) {
        setDeletionRequest(data.data);
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
      const response = await fetch('/api/account/data-export', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setDataExportRequest(data.data);
        exportModal.onClose();
      } else {
        console.error('Export request failed:', data.error);
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
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason }),
      });
      const data = await response.json();

      if (data.success) {
        setDeletionRequest(data.data);
        deleteModal.onClose();
        setDeleteReason('');
        setDeleteConfirmation('');
        setDeleteAcknowledged(false);
      } else {
        console.error('Delete request failed:', data.error);
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
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setDeletionRequest(null);
      } else {
        console.error('Cancel deletion failed:', data.error);
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
      <Card>
        <CardHeader className="flex gap-3">
          <Icon icon="solar:shield-check-bold" className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Your Privacy Rights</h3>
            <p className="text-sm text-default-500">
              We comply with GDPR, CCPA, and LGPD regulations
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-default-50 rounded-lg">
              <Icon icon="solar:eye-bold" className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-semibold mb-1">Right to Access</h4>
              <p className="text-xs text-default-500">
                Request a copy of all your personal data
              </p>
            </div>
            <div className="p-4 bg-default-50 rounded-lg">
              <Icon icon="solar:pen-bold" className="w-8 h-8 text-warning mb-2" />
              <h4 className="font-semibold mb-1">Right to Rectify</h4>
              <p className="text-xs text-default-500">
                Update or correct your personal information
              </p>
            </div>
            <div className="p-4 bg-default-50 rounded-lg">
              <Icon icon="solar:trash-bin-trash-bold" className="w-8 h-8 text-danger mb-2" />
              <h4 className="font-semibold mb-1">Right to Erasure</h4>
              <p className="text-xs text-default-500">
                Request deletion of your account and data
              </p>
            </div>
            <div className="p-4 bg-default-50 rounded-lg">
              <Icon icon="solar:download-bold" className="w-8 h-8 text-success mb-2" />
              <h4 className="font-semibold mb-1">Data Portability</h4>
              <p className="text-xs text-default-500">
                Export your data in a portable format
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader className="flex justify-between items-start">
          <div className="flex gap-3">
            <Icon icon="solar:settings-bold" className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Consent Preferences</h3>
              <p className="text-sm text-default-500">
                Control how we use your data
              </p>
            </div>
          </div>
          {isSavingConsent && (
            <Chip size="sm" variant="flat" color="primary">
              Saving...
            </Chip>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          {/* Essential - Always On */}
          <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="solar:lock-bold" className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium">Essential Cookies & Data</p>
                <p className="text-xs text-default-500">
                  Required for the service to function properly
                </p>
              </div>
            </div>
            <Chip color="success" variant="flat" size="sm">
              Always On
            </Chip>
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="solar:chart-2-bold" className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Analytics & Performance</p>
                <p className="text-xs text-default-500">
                  Help us understand how you use the platform
                </p>
              </div>
            </div>
            <Switch
              isSelected={consent.analytics}
              onValueChange={(value) => handleConsentChange('analytics', value)}
              size="sm"
            />
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="solar:letter-bold" className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium">Marketing Communications</p>
                <p className="text-xs text-default-500">
                  Receive news, updates, and promotional offers
                </p>
              </div>
            </div>
            <Switch
              isSelected={consent.marketing}
              onValueChange={(value) => handleConsentChange('marketing', value)}
              size="sm"
            />
          </div>

          {/* Personalization */}
          <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="solar:magic-stick-bold" className="w-5 h-5 text-secondary" />
              <div>
                <p className="font-medium">Personalization</p>
                <p className="text-xs text-default-500">
                  Customize your experience based on your activity
                </p>
              </div>
            </div>
            <Switch
              isSelected={consent.personalization}
              onValueChange={(value) => handleConsentChange('personalization', value)}
              size="sm"
            />
          </div>

          {/* Third Party */}
          <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="solar:share-bold" className="w-5 h-5 text-default-500" />
              <div>
                <p className="font-medium">Third-Party Sharing</p>
                <p className="text-xs text-default-500">
                  Share data with trusted partners for enhanced services
                </p>
              </div>
            </div>
            <Switch
              isSelected={consent.thirdParty}
              onValueChange={(value) => handleConsentChange('thirdParty', value)}
              size="sm"
            />
          </div>
        </CardBody>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader className="flex gap-3">
          <Icon icon="solar:download-bold" className="w-6 h-6 text-success" />
          <div>
            <h3 className="text-lg font-semibold">Export Your Data</h3>
            <p className="text-sm text-default-500">
              Download a copy of all your personal data
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          {dataExportRequest?.status === DataExportStatus.PROCESSING ? (
            <div className="text-center py-6">
              <Progress
                isIndeterminate
                size="sm"
                color="primary"
                className="max-w-md mx-auto mb-4"
              />
              <p className="font-medium">Preparing your data export...</p>
              <p className="text-sm text-default-500 mt-1">
                This may take a few minutes. We&apos;ll email you when it&apos;s ready.
              </p>
            </div>
          ) : dataExportRequest?.status === DataExportStatus.READY ? (
            <div className="text-center py-6">
              <Icon
                icon="solar:check-circle-bold"
                className="w-12 h-12 text-success mx-auto mb-4"
              />
              <p className="font-medium">Your data export is ready!</p>
              <p className="text-sm text-default-500 mt-1 mb-4">
                Available until {dataExportRequest.expiresAt ? new Date(dataExportRequest.expiresAt).toLocaleDateString() : 'N/A'}
              </p>
              <Button
                color="success"
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
                className="w-12 h-12 text-warning mx-auto mb-4"
              />
              <p className="font-medium">Export request pending</p>
              <p className="text-sm text-default-500 mt-1">
                Your data export request is being processed. We&apos;ll notify you when it&apos;s ready.
              </p>
            </div>
          ) : (
            <>
              <Accordion variant="bordered" className="mb-4">
                <AccordionItem
                  key="data-included"
                  aria-label="Data included"
                  title="What data is included?"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DATA_CATEGORIES.map((category) => (
                      <div key={category.id} className="flex items-start gap-2">
                        <Icon icon={category.icon} className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{category.name}</p>
                          <p className="text-xs text-default-500">{category.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>

              <Button
                color="primary"
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
      <Card className="border-danger/20">
        <CardHeader className="flex gap-3">
          <Icon icon="solar:trash-bin-trash-bold" className="w-6 h-6 text-danger" />
          <div>
            <h3 className="text-lg font-semibold text-danger">Delete Account</h3>
            <p className="text-sm text-default-500">
              Permanently delete your account and all associated data
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          {deletionRequest?.status === DeletionStatus.SCHEDULED ? (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon icon="solar:clock-circle-bold" className="w-6 h-6 text-danger mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-danger">Account deletion scheduled</p>
                  <p className="text-sm text-default-500 mt-1">
                    Your account will be permanently deleted on{' '}
                    {deletionRequest.scheduledFor ? new Date(deletionRequest.scheduledFor).toLocaleDateString() : 'N/A'}
                  </p>
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    className="mt-3"
                    onPress={handleCancelDeletion}
                    isLoading={isCanceling}
                  >
                    Cancel Deletion Request
                  </Button>
                </div>
              </div>
            </div>
          ) : deletionRequest?.status === DeletionStatus.PENDING ? (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon icon="solar:clock-circle-bold" className="w-6 h-6 text-warning mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-warning">Deletion request pending</p>
                  <p className="text-sm text-default-500 mt-1">
                    Your account deletion request is being reviewed.
                  </p>
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    className="mt-3"
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
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Icon icon="solar:danger-triangle-bold" className="w-6 h-6 text-danger mt-0.5" />
                  <div>
                    <p className="font-medium text-danger">Warning: This action is irreversible</p>
                    <ul className="text-sm text-default-500 mt-2 space-y-1 list-disc list-inside">
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
      <Card>
        <CardHeader className="flex gap-3">
          <Icon icon="solar:clock-circle-bold" className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Data Retention Policy</h3>
            <p className="text-sm text-default-500">
              How long we keep your data
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-divider">
              <span>Profile Information</span>
              <span className="text-default-500">Until account deletion</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-divider">
              <span>Gaming Statistics</span>
              <span className="text-default-500">Until account deletion</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-divider">
              <span>Replay Files</span>
              <span className="text-default-500">90 days after upload (free) / indefinite (Pro)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-divider">
              <span>Payment Records</span>
              <span className="text-default-500">7 years (legal requirement)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-divider">
              <span>Activity Logs</span>
              <span className="text-default-500">30 days</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Marketing Preferences</span>
              <span className="text-default-500">Until changed or account deletion</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Export Modal */}
      <Modal isOpen={exportModal.isOpen} onClose={exportModal.onClose}>
        <ModalContent>
          <ModalHeader>Request Data Export</ModalHeader>
          <ModalBody>
            <p className="text-default-500">
              We&apos;ll prepare a complete export of your personal data. This includes:
            </p>
            <ul className="text-sm text-default-500 mt-2 space-y-1 list-disc list-inside">
              <li>Profile and account information</li>
              <li>Match history and gaming statistics</li>
              <li>Social connections and team data</li>
              <li>Payment and subscription history</li>
              <li>Uploaded files and media</li>
            </ul>
            <p className="text-sm text-default-500 mt-4">
              The export will be ready within 24-48 hours and available for download for 7 days.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={exportModal.onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleExportRequest}
              isLoading={isExporting}
            >
              Request Export
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="lg">
        <ModalContent>
          <ModalHeader className="text-danger">Delete Account</ModalHeader>
          <ModalBody>
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-4">
              <p className="text-danger font-medium">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Why are you deleting your account?
                </label>
                <div className="mt-2 space-y-2">
                  {DELETION_REASONS.map((reason) => (
                    <div
                      key={reason}
                      className={`
                        p-3 rounded-lg cursor-pointer border transition-colors
                        ${deleteReason === reason
                          ? 'border-danger bg-danger/10'
                          : 'border-default-200 hover:border-default-400'}
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
                color={deleteConfirmation === 'DELETE' ? 'success' : 'default'}
              />

              <Checkbox
                isSelected={deleteAcknowledged}
                onValueChange={setDeleteAcknowledged}
              >
                <span className="text-sm">
                  I understand that this action is permanent and my data cannot be recovered
                </span>
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={deleteModal.onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
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
