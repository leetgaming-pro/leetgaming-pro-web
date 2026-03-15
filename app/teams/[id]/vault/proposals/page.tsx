'use client';

/**
 * Vault Proposals Listing Page
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Chip,
  Select,
  SelectItem,
  Skeleton,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';
import { useVaultProposals } from '@/hooks/use-vault-proposals';
import { ProposalList } from '@/components/vault/proposal-list';
import type { ProposalStatus, ProposalType } from '@/types/replay-api/vault.types';

export default function VaultProposalsPage() {
  const params = useParams();
  const router = useRouter();
  const squadId = params.id as string;

  const [statusFilter, setStatusFilter] = useState<ProposalStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<ProposalType | undefined>();

  const { proposals, isLoading, refreshProposals } = useVaultProposals(squadId, true, {
    limit: 20,
    offset: 0,
    status: statusFilter,
    type: typeFilter,
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push(`/teams/${squadId}/vault`)}
            >
              <Icon icon="solar:arrow-left-bold" className="text-xl" />
            </Button>
            <h1 className="text-2xl font-bold">Proposals</h1>
            {proposals && (
              <Chip variant="flat" size="sm">
                {proposals.total_count} total
              </Chip>
            )}
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="solar:add-circle-bold" />}
            onPress={() => router.push(`/teams/${squadId}/vault/proposals/new`)}
          >
            New Proposal
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select
            label="Status"
            placeholder="All statuses"
            size="sm"
            className="max-w-[200px]"
            selectedKeys={statusFilter ? [statusFilter] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as ProposalStatus | undefined;
              setStatusFilter(val);
              refreshProposals({ status: val, type: typeFilter, limit: 20, offset: 0 });
            }}
          >
            <SelectItem key="PENDING">Pending</SelectItem>
            <SelectItem key="APPROVED">Approved</SelectItem>
            <SelectItem key="EXECUTED">Executed</SelectItem>
            <SelectItem key="REJECTED">Rejected</SelectItem>
            <SelectItem key="EXPIRED">Expired</SelectItem>
            <SelectItem key="CANCELLED">Cancelled</SelectItem>
          </Select>

          <Select
            label="Type"
            placeholder="All types"
            size="sm"
            className="max-w-[200px]"
            selectedKeys={typeFilter ? [typeFilter] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as ProposalType | undefined;
              setTypeFilter(val);
              refreshProposals({ status: statusFilter, type: val, limit: 20, offset: 0 });
            }}
          >
            <SelectItem key="WITHDRAWAL">Withdrawal</SelectItem>
            <SelectItem key="TRANSFER">Transfer</SelectItem>
            <SelectItem key="ITEM_TRANSFER">Item Transfer</SelectItem>
            <SelectItem key="SETTINGS_CHANGE">Settings Change</SelectItem>
          </Select>
        </div>

        <ProposalList
          proposals={proposals?.proposals || []}
          isLoading={isLoading}
          onViewProposal={(id) =>
            router.push(`/teams/${squadId}/vault/proposals/${id}`)
          }
          showActions
        />
      </div>
    </PageContainer>
  );
}
