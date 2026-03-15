'use client';

/**
 * Team Vault Dashboard Page
 * Overview of team's shared vault: balance, recent proposals, activity
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Skeleton,
  Tabs,
  Tab,
  Divider,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';
import { useVault } from '@/hooks/use-vault';
import { useVaultProposals } from '@/hooks/use-vault-proposals';
import { useVaultActivity } from '@/hooks/use-vault-activity';
import { VaultBalanceCard } from '@/components/vault/vault-balance-card';
import { ProposalList } from '@/components/vault/proposal-list';
import { ActivityFeed } from '@/components/vault/activity-feed';
import { CreateVaultModal } from '@/components/vault/create-vault-modal';

export default function VaultDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const squadId = params.id as string;

  const { vault, balance, isLoadingVault, vaultError, hasVault, createVault, deposit, refreshBalance } =
    useVault(squadId);
  const { proposals, isLoading: isLoadingProposals, refreshProposals } =
    useVaultProposals(squadId, hasVault, { limit: 5, offset: 0, status: 'PENDING' as any });
  const { activity, isLoading: isLoadingActivity } =
    useVaultActivity(squadId, hasVault, { limit: 10, offset: 0 });

  const [showCreateModal, setShowCreateModal] = React.useState(false);

  if (isLoadingVault) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (!hasVault) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="p-6 rounded-full bg-default-100">
            <Icon icon="solar:vault-bold-duotone" className="text-5xl text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Team Vault</h2>
            <p className="text-default-500 max-w-md">
              Create a shared vault for your team to manage funds collectively with
              multisig approvals, inventory, and full audit history.
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<Icon icon="solar:add-circle-bold" />}
            onPress={() => setShowCreateModal(true)}
          >
            Create Team Vault
          </Button>
          <CreateVaultModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreateVault={async (name, description) => {
              const result = await createVault({ name, description });
              if (result) setShowCreateModal(false);
              return !!result;
            }}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Icon icon="solar:vault-bold-duotone" className="text-primary" />
              {vault?.name || 'Team Vault'}
            </h1>
            {vault?.description && (
              <p className="text-default-500 mt-1">{vault.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="flat"
              startContent={<Icon icon="solar:chart-bold" />}
              onPress={() => router.push(`/teams/${squadId}/vault/analytics`)}
            >
              Analytics
            </Button>
            <Button
              variant="flat"
              startContent={<Icon icon="solar:box-bold" />}
              onPress={() => router.push(`/teams/${squadId}/vault/inventory`)}
            >
              Inventory
            </Button>
            <Button
              variant="flat"
              startContent={<Icon icon="solar:settings-bold" />}
              onPress={() => router.push(`/teams/${squadId}/vault/settings`)}
            >
              Settings
            </Button>
          </div>
        </div>

        {/* Balance Card */}
        <VaultBalanceCard
          balance={balance ?? undefined}
          isLoading={isLoadingVault}
          onDeposit={deposit}
          onRefresh={refreshBalance}
        />

        {/* Tabs: Proposals & Activity */}
        <Tabs aria-label="Vault sections" variant="underlined" color="primary">
          <Tab
            key="proposals"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:document-text-bold" />
                <span>Pending Proposals</span>
                {proposals && proposals.total_count > 0 && (
                  <Chip size="sm" color="warning" variant="flat">
                    {proposals.total_count}
                  </Chip>
                )}
              </div>
            }
          >
            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Active Proposals</h3>
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  startContent={<Icon icon="solar:add-circle-bold" />}
                  onPress={() => router.push(`/teams/${squadId}/vault/proposals/new`)}
                >
                  New Proposal
                </Button>
              </div>
              <ProposalList
                proposals={proposals?.proposals || []}
                isLoading={isLoadingProposals}
                onViewProposal={(id) =>
                  router.push(`/teams/${squadId}/vault/proposals/${id}`)
                }
              />
              {proposals && proposals.total_count > 5 && (
                <Button
                  variant="light"
                  className="w-full"
                  onPress={() => router.push(`/teams/${squadId}/vault/proposals`)}
                >
                  View All Proposals ({proposals.total_count})
                </Button>
              )}
            </div>
          </Tab>
          <Tab
            key="activity"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:history-bold" />
                <span>Recent Activity</span>
              </div>
            }
          >
            <div className="pt-4">
              <ActivityFeed
                activities={activity?.activities || []}
                isLoading={isLoadingActivity}
              />
              {activity && activity.total_count > 10 && (
                <Button
                  variant="light"
                  className="w-full mt-4"
                  onPress={() => router.push(`/teams/${squadId}/vault/activity`)}
                >
                  View Full History
                </Button>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
    </PageContainer>
  );
}
