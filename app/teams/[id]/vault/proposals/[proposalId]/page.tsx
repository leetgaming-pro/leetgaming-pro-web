'use client';

/**
 * Vault Proposal Detail Page
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Avatar,
  Progress,
  Divider,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';
import { useSDK } from '@/contexts/sdk-context';
import type { VaultProposal } from '@/types/replay-api/vault.types';
import {
  getProposalStatusColor,
  getProposalTypeLabel,
  formatVaultAmount,
} from '@/types/replay-api/vault.types';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { sdk } = useSDK();
  const squadId = params.id as string;
  const proposalId = params.proposalId as string;

  const [proposal, setProposal] = useState<VaultProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const rejectModal = useDisclosure();

  const fetchProposal = useCallback(async () => {
    if (!sdk || !squadId || !proposalId) return;
    try {
      setIsLoading(true);
      const data = await sdk.vault.getProposalById(squadId, proposalId);
      setProposal(data);
    } catch (err) {
      console.error('Failed to fetch proposal:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sdk, squadId, proposalId]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  const handleApprove = async () => {
    if (!sdk || !proposal) return;
    try {
      setIsSubmitting(true);
      await sdk.vault.approveProposal(squadId, proposal.id);
      await fetchProposal();
    } catch (err) {
      console.error('Failed to approve proposal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!sdk || !proposal) return;
    try {
      setIsSubmitting(true);
      await sdk.vault.rejectProposal(squadId, proposal.id, { reason: comment || '' });
      rejectModal.onClose();
      setComment('');
      await fetchProposal();
    } catch (err) {
      console.error('Failed to reject proposal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!sdk || !proposal) return;
    try {
      setIsSubmitting(true);
      await sdk.vault.cancelProposal(squadId, proposal.id);
      await fetchProposal();
    } catch (err) {
      console.error('Failed to cancel proposal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  if (!proposal) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Icon icon="solar:document-medicine-bold" className="text-5xl text-default-400" />
          <p className="text-default-500">Proposal not found</p>
          <Button
            variant="flat"
            onPress={() => router.push(`/teams/${squadId}/vault/proposals`)}
          >
            Back to Proposals
          </Button>
        </div>
      </PageContainer>
    );
  }

  const approvalCount = proposal.approvals?.filter((a) => a.decision === 'APPROVED').length || 0;
  const rejectionCount = proposal.approvals?.filter((a) => a.decision === 'REJECTED').length || 0;
  const isPending = proposal.status === 'PENDING';

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push(`/teams/${squadId}/vault/proposals`)}
          >
            <Icon icon="solar:arrow-left-bold" className="text-xl" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{proposal.title || getProposalTypeLabel(proposal.type)}</h1>
              <Chip
                color={getProposalStatusColor(proposal.status) as any}
                variant="flat"
                size="sm"
              >
                {proposal.status}
              </Chip>
            </div>
            <p className="text-sm text-default-500">
              Created {new Date(proposal.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:document-text-bold" className="text-primary text-xl" />
              <h3 className="font-semibold">Proposal Details</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-default-500">Type</p>
                <p className="font-medium">{getProposalTypeLabel(proposal.type)}</p>
              </div>
              {proposal.amount != null && proposal.currency && (
                <div>
                  <p className="text-xs text-default-500">Amount</p>
                  <p className="font-medium">
                    {formatVaultAmount(proposal.amount, proposal.currency)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-default-500">Required Approvals</p>
                <p className="font-medium">{proposal.required_approvals}</p>
              </div>
              {proposal.expires_at && (
                <div>
                  <p className="text-xs text-default-500">Expires</p>
                  <p className="font-medium">
                    {new Date(proposal.expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {proposal.description && (
              <>
                <Divider />
                <div>
                  <p className="text-xs text-default-500 mb-1">Description</p>
                  <p className="text-sm">{proposal.description}</p>
                </div>
              </>
            )}

            {proposal.destination && (
              <div>
                <p className="text-xs text-default-500 mb-1">Destination</p>
                <code className="rounded bg-default-100 px-2 py-1 text-xs">
                  {proposal.destination}
                </code>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Approval Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:shield-check-bold" className="text-success text-xl" />
              <h3 className="font-semibold">Approval Progress</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              <Progress
                value={(approvalCount / proposal.required_approvals) * 100}
                color={approvalCount >= proposal.required_approvals ? 'success' : 'primary'}
                className="flex-1"
                showValueLabel
                label={`${approvalCount} / ${proposal.required_approvals} approvals`}
              />
            </div>

            {rejectionCount > 0 && (
              <Chip color="danger" variant="flat" size="sm">
                {rejectionCount} rejection{rejectionCount !== 1 ? 's' : ''}
              </Chip>
            )}

            {/* Approval list */}
            {proposal.approvals && proposal.approvals.length > 0 && (
              <div className="space-y-2">
                <Divider />
                {proposal.approvals.map((approval, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={approval.user_id?.substring(0, 2).toUpperCase()}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {approval.user_id?.substring(0, 8)}...
                        </p>
                        <p className="text-xs text-default-400">
                          {new Date(approval.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Chip
                      color={approval.decision === 'APPROVED' ? 'success' : 'danger'}
                      variant="dot"
                      size="sm"
                    >
                      {approval.decision}
                    </Chip>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Actions */}
        {isPending && (
          <div className="flex gap-3 justify-end">
            <Button
              color="danger"
              variant="flat"
              startContent={<Icon icon="solar:close-circle-bold" />}
              onPress={rejectModal.onOpen}
              isDisabled={isSubmitting}
            >
              Reject
            </Button>
            <Button
              color="warning"
              variant="flat"
              startContent={<Icon icon="solar:undo-left-bold" />}
              onPress={handleCancel}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              color="success"
              startContent={<Icon icon="solar:check-circle-bold" />}
              onPress={handleApprove}
              isLoading={isSubmitting}
            >
              Approve
            </Button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.isOpen} onOpenChange={rejectModal.onOpenChange}>
        <ModalContent>
          <ModalHeader>Reject Proposal</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500">
              Are you sure you want to reject this proposal?
            </p>
            <Textarea
              label="Reason (optional)"
              placeholder="Provide a reason for rejection..."
              value={comment}
              onValueChange={setComment}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={rejectModal.onClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleReject} isLoading={isSubmitting}>
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}
