'use client';

/**
 * Reusable Proposal List Component
 */

import React from 'react';
import {
  Card,
  CardBody,
  Chip,
  Button,
  Skeleton,
  Avatar,
  Progress,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import type { VaultProposal } from '@/types/replay-api/vault.types';
import {
  getProposalStatusColor,
  getProposalTypeLabel,
  formatVaultAmount,
} from '@/types/replay-api/vault.types';

interface ProposalListProps {
  proposals: VaultProposal[];
  isLoading?: boolean;
  onViewProposal?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function ProposalList({
  proposals,
  isLoading,
  onViewProposal,
  showActions = false,
  compact = false,
}: ProposalListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!proposals.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Icon icon="solar:document-medicine-bold" className="text-4xl text-default-300" />
        <p className="text-sm text-default-500">No proposals found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => {
        const approvalCount =
          proposal.approvals?.filter((a) => a.decision === 'APPROVED').length || 0;
        const progress =
          proposal.required_approvals > 0
            ? (approvalCount / proposal.required_approvals) * 100
            : 0;

        return (
          <Card
            key={proposal.id}
            isPressable={!!onViewProposal}
            onPress={() => onViewProposal?.(proposal.id)}
            className="hover:bg-default-50 transition-colors"
          >
            <CardBody className={compact ? 'p-3' : 'p-4'}>
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="rounded-lg bg-default-100 p-2">
                  <Icon
                    icon={
                      proposal.type === 'WITHDRAWAL'
                        ? 'solar:arrow-up-bold'
                        : proposal.type === 'TRANSFER'
                        ? 'solar:transfer-horizontal-bold'
                        : proposal.type === 'ITEM_TRANSFER'
                        ? 'solar:box-bold'
                        : 'solar:settings-bold'
                    }
                    className="text-xl text-default-600"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${compact ? 'text-sm' : ''} truncate`}>
                      {proposal.title || getProposalTypeLabel(proposal.type)}
                    </p>
                    <Chip
                      color={getProposalStatusColor(proposal.status) as any}
                      variant="flat"
                      size="sm"
                      className="shrink-0"
                    >
                      {proposal.status}
                    </Chip>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    {proposal.amount != null && proposal.currency && (
                      <span className="text-sm font-semibold">
                        {formatVaultAmount(proposal.amount, proposal.currency)}
                      </span>
                    )}
                    <span className="text-xs text-default-400">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Approval Progress */}
                {!compact && proposal.status === 'PENDING' && (
                  <div className="hidden sm:flex items-center gap-2 w-32">
                    <Progress
                      value={progress}
                      size="sm"
                      color={progress >= 100 ? 'success' : 'primary'}
                    />
                    <span className="text-xs text-default-500 whitespace-nowrap">
                      {approvalCount}/{proposal.required_approvals}
                    </span>
                  </div>
                )}

                {/* Action */}
                {showActions && onViewProposal && (
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => onViewProposal(proposal.id)}
                  >
                    <Icon icon="solar:arrow-right-bold" />
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
