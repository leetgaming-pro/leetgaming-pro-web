'use client';

/**
 * Vault Settings Page
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Switch,
  Chip,
  Skeleton,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';
import { useVault } from '@/hooks/use-vault';
import { useSDK } from '@/contexts/sdk-context';
import { formatVaultAmount } from '@/types/replay-api/vault.types';

export default function VaultSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { sdk } = useSDK();
  const squadId = params.id as string;
  const { vault, isLoadingVault: isLoading, refreshVault } = useVault(squadId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyLimit, setDailyLimit] = useState('');
  const [onChainThreshold, setOnChainThreshold] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);
  const confirmModal = useDisclosure();

  useEffect(() => {
    if (vault?.settings) {
      setDailyLimit(
        vault.settings.daily_withdraw_limit
          ? (vault.settings.daily_withdraw_limit / 100).toString()
          : ''
      );
      setOnChainThreshold(
        vault.settings.on_chain_threshold
          ? (vault.settings.on_chain_threshold / 100).toString()
          : ''
      );
      setWhitelistedAddresses(vault.settings.whitelisted_addresses || []);
    }
  }, [vault]);

  const handleSave = async () => {
    if (!sdk || !vault) return;
    try {
      setIsSubmitting(true);
      await sdk.vault.updateSettings(squadId, {
        daily_withdraw_limit: dailyLimit ? Math.round(parseFloat(dailyLimit) * 100) : undefined,
        on_chain_threshold: onChainThreshold
          ? Math.round(parseFloat(onChainThreshold) * 100)
          : undefined,
        whitelisted_addresses: whitelistedAddresses,
      });
      confirmModal.onClose();
      await refreshVault();
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAddress = () => {
    const trimmed = newAddress.trim();
    if (trimmed && !whitelistedAddresses.includes(trimmed)) {
      setWhitelistedAddresses((prev) => [...prev, trimmed]);
      setNewAddress('');
    }
  };

  const removeAddress = (addr: string) => {
    setWhitelistedAddresses((prev) => prev.filter((a) => a !== addr));
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  if (!vault) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Icon icon="solar:settings-bold" className="text-5xl text-default-400" />
          <p className="text-default-500">Vault not found</p>
          <Button variant="flat" onPress={() => router.push(`/teams/${squadId}/vault`)}>
            Back to Vault
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push(`/teams/${squadId}/vault`)}
          >
            <Icon icon="solar:arrow-left-bold" className="text-xl" />
          </Button>
          <h1 className="text-2xl font-bold">Vault Settings</h1>
        </div>

        {/* General Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:info-circle-bold" className="text-primary text-xl" />
              <h3 className="font-semibold">General</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-default-500">Vault Name</p>
                <p className="font-medium">{vault.name}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Status</p>
                <Chip
                  color={vault.is_locked ? 'danger' : 'success'}
                  variant="dot"
                  size="sm"
                >
                  {vault.is_locked ? 'Locked' : 'Active'}
                </Chip>
              </div>
              <div>
                <p className="text-xs text-default-500">Created</p>
                <p className="text-sm">{new Date(vault.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Pending Proposals</p>
                <p className="text-sm font-medium">{vault.pending_proposals}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Approval Policy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:shield-check-bold" className="text-warning text-xl" />
              <h3 className="font-semibold">Approval Policy</h3>
            </div>
          </CardHeader>
          <CardBody>
            {vault.settings?.approval_policy?.tiers ? (
              <div className="space-y-3">
                {vault.settings.approval_policy.tiers.map((tier: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-default-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {tier.max_amount
                          ? `Up to ${formatVaultAmount(tier.max_amount, 'USD')}`
                          : 'Unlimited'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Chip size="sm" variant="flat">
                        {tier.required_approvals} approval
                        {tier.required_approvals !== 1 ? 's' : ''}
                      </Chip>
                      {tier.require_on_chain && (
                        <Chip size="sm" variant="flat" color="secondary">
                          On-chain
                        </Chip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-default-400">Default approval policy in use</p>
            )}
          </CardBody>
        </Card>

        {/* Limits */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:ruler-bold" className="text-primary text-xl" />
              <h3 className="font-semibold">Limits</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              type="number"
              label="Daily Withdrawal Limit (USD)"
              placeholder="0.00"
              value={dailyLimit}
              onValueChange={setDailyLimit}
              startContent={
                <span className="text-sm text-default-400">$</span>
              }
              description="Maximum total withdrawals per day. Leave empty for no limit."
            />
            <Input
              type="number"
              label="On-Chain Threshold (USD)"
              placeholder="0.00"
              value={onChainThreshold}
              onValueChange={setOnChainThreshold}
              startContent={
                <span className="text-sm text-default-400">$</span>
              }
              description="Transactions above this amount require on-chain verification."
            />
          </CardBody>
        </Card>

        {/* Whitelisted Addresses */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:bookmark-bold" className="text-success text-xl" />
              <h3 className="font-semibold">Whitelisted Addresses</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-xs text-default-500">
              Withdrawals to whitelisted addresses may have reduced approval requirements.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter wallet address"
                value={newAddress}
                onValueChange={setNewAddress}
                className="flex-1"
                size="sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addAddress();
                }}
              />
              <Button size="sm" color="primary" onPress={addAddress} isIconOnly>
                <Icon icon="solar:add-circle-bold" />
              </Button>
            </div>
            {whitelistedAddresses.length > 0 ? (
              <div className="space-y-2">
                {whitelistedAddresses.map((addr) => (
                  <div
                    key={addr}
                    className="flex items-center justify-between rounded-lg bg-default-50 p-2"
                  >
                    <code className="text-xs break-all flex-1">{addr}</code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => removeAddress(addr)}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-default-400 text-center py-2">
                No whitelisted addresses
              </p>
            )}
          </CardBody>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button color="primary" onPress={confirmModal.onOpen}>
            Save Settings
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmModal.isOpen} onOpenChange={confirmModal.onOpenChange}>
        <ModalContent>
          <ModalHeader>Confirm Settings Update</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500">
              Settings changes may require approval from other vault members. Are you sure
              you want to submit these changes?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={confirmModal.onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave} isLoading={isSubmitting}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}
