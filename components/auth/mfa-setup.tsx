'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Spinner,
  Divider,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';

interface MFASetupProps {
  onStatusChange?: (enabled: boolean) => void;
}

interface MFAStatus {
  enabled: boolean;
  method: string;
  backupCodesRemaining: number;
}

/**
 * MFASetup - Component for enabling/disabling MFA in user settings
 */
export function MFASetup({ onStatusChange }: MFASetupProps) {
  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      const response = await fetch('/api/auth/mfa/setup');
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          enabled: data.enabled,
          method: data.method || 'email',
          backupCodesRemaining: data.backupCodesRemaining || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch MFA status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const enableMFA = async () => {
    setIsEnabling(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'email' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable MFA');
      }

      setBackupCodes(data.backupCodes || []);
      setShowBackupCodes(true);
      setStatus({
        enabled: true,
        method: 'email',
        backupCodesRemaining: data.backupCodes?.length || 0,
      });
      onStatusChange?.(true);
    } catch (err: any) {
      setError(err.message || 'Failed to enable MFA');
    } finally {
      setIsEnabling(false);
    }
  };

  const disableMFA = async () => {
    if (!disableCode) {
      setError('Please enter your verification code');
      return;
    }

    setIsDisabling(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: disableCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable MFA');
      }

      setStatus({
        enabled: false,
        method: '',
        backupCodesRemaining: 0,
      });
      setShowDisableModal(false);
      setDisableCode('');
      onStatusChange?.(false);
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA');
    } finally {
      setIsDisabling(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  if (isLoading) {
    return (
      <Card className="bg-content2/50 border border-content3">
        <CardBody className="p-6 flex items-center justify-center">
          <Spinner size="sm" />
          <span className="ml-2 text-default-500">Loading security settings...</span>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-content2/50 border border-content3">
        <CardBody className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon icon="solar:shield-keyhole-bold" className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Two-Factor Authentication</h3>
                <p className="text-sm text-default-500 mb-3">
                  Add an extra layer of security to your account by requiring a verification code for sensitive actions.
                </p>
                {status?.enabled && (
                  <div className="flex items-center gap-2">
                    <Chip color="success" variant="flat" size="sm">
                      <Icon icon="solar:check-circle-bold" className="w-3 h-3 mr-1" />
                      Enabled
                    </Chip>
                    <span className="text-xs text-default-400">
                      via {status.method === 'email' ? 'Email' : 'Authenticator App'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Switch
              isSelected={status?.enabled}
              onValueChange={(checked) => {
                if (checked) {
                  enableMFA();
                } else {
                  setShowDisableModal(true);
                }
              }}
              isDisabled={isEnabling || isDisabling}
              color="success"
            />
          </div>

          {status?.enabled && (
            <>
              <Divider className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Backup Codes</p>
                  <p className="text-xs text-default-400">
                    {status.backupCodesRemaining} codes remaining
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Icon icon="solar:key-bold" className="w-4 h-4" />}
                  onPress={() => enableMFA()} // Regenerates backup codes
                >
                  Regenerate
                </Button>
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm">
              <Icon icon="solar:danger-triangle-bold" className="w-4 h-4 text-danger" />
              <span className="text-danger">{error}</span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        placement="center"
        classNames={{
          backdrop: 'bg-black/80 backdrop-blur-sm',
          base: 'bg-content1 border border-content3',
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:key-bold" className="w-5 h-5 text-warning" />
              <span>Save Your Backup Codes</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg mb-4">
              <p className="text-sm text-warning">
                <Icon icon="solar:danger-triangle-bold" className="w-4 h-4 inline mr-1" />
                Save these codes in a safe place. You can use them to access your account if you lose access to your authentication method.
              </p>
            </div>
            <div className="bg-content2 rounded-lg p-4 font-mono text-sm">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-content1 rounded">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              startContent={<Icon icon="solar:copy-bold" className="w-4 h-4" />}
              onPress={copyBackupCodes}
            >
              Copy All
            </Button>
            <Button color="primary" onPress={() => setShowBackupCodes(false)}>
              I&apos;ve Saved These Codes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Disable MFA Modal */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => {
          setShowDisableModal(false);
          setDisableCode('');
          setError(null);
        }}
        placement="center"
        classNames={{
          backdrop: 'bg-black/80 backdrop-blur-sm',
          base: 'bg-content1 border border-content3',
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:shield-warning-bold" className="w-5 h-5 text-danger" />
              <span>Disable Two-Factor Authentication</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg mb-4">
              <p className="text-sm text-danger">
                Disabling 2FA will make your account less secure. You will no longer be required to enter a verification code for sensitive actions.
              </p>
            </div>
            <p className="text-sm text-default-500 mb-4">
              Enter your current verification code to confirm:
            </p>
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full p-3 bg-content2 border border-content3 rounded-lg text-center text-lg font-mono tracking-widest"
              maxLength={6}
            />
            {error && (
              <p className="text-sm text-danger mt-2">{error}</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setShowDisableModal(false);
                setDisableCode('');
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={disableMFA}
              isLoading={isDisabling}
              isDisabled={disableCode.length !== 6}
            >
              Disable 2FA
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
