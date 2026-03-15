'use client';

/**
 * Vault Analytics Page
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Select,
  SelectItem,
  Skeleton,
  Divider,
  Progress,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';
import { useVaultAnalytics } from '@/hooks/use-vault-analytics';
import { formatVaultAmount } from '@/types/replay-api/vault.types';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function VaultAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const squadId = params.id as string;

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { analytics, isLoading } = useVaultAnalytics(squadId, true, timeRange);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push(`/teams/${squadId}/vault`)}
            >
              <Icon icon="solar:arrow-left-bold" className="text-xl" />
            </Button>
            <h1 className="text-2xl font-bold">Vault Analytics</h1>
          </div>
          <Select
            label="Time Range"
            size="sm"
            className="max-w-[160px]"
            selectedKeys={[timeRange]}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as TimeRange;
              if (val) setTimeRange(val);
            }}
          >
            <SelectItem key="7d">Last 7 days</SelectItem>
            <SelectItem key="30d">Last 30 days</SelectItem>
            <SelectItem key="90d">Last 90 days</SelectItem>
            <SelectItem key="1y">Last year</SelectItem>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : analytics ? (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardBody className="gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-success/10 p-2">
                      <Icon icon="solar:arrow-down-bold" className="text-success text-xl" />
                    </div>
                    <p className="text-sm text-default-500">Total Deposits</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatVaultAmount(analytics.total_deposits, 'USD')}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-danger/10 p-2">
                      <Icon icon="solar:arrow-up-bold" className="text-danger text-xl" />
                    </div>
                    <p className="text-sm text-default-500">Total Withdrawals</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatVaultAmount(analytics.total_withdrawals, 'USD')}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon icon="solar:document-text-bold" className="text-primary text-xl" />
                    </div>
                    <p className="text-sm text-default-500">Total Proposals</p>
                  </div>
                  <p className="text-2xl font-bold">{analytics.total_proposals}</p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-warning/10 p-2">
                      <Icon icon="solar:hourglass-bold" className="text-warning text-xl" />
                    </div>
                    <p className="text-sm text-default-500">Pending Proposals</p>
                  </div>
                  <p className="text-2xl font-bold">{analytics.pending_proposals}</p>
                </CardBody>
              </Card>
            </div>

            {/* Proposal Breakdown */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:pie-chart-bold" className="text-primary text-xl" />
                  <h3 className="font-semibold">Proposal Outcomes</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {analytics.total_proposals > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Approved</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (analytics.approved_proposals / analytics.total_proposals) * 100
                          }
                          color="success"
                          className="w-32"
                          size="sm"
                        />
                        <span className="text-sm font-medium w-12 text-right">
                          {analytics.approved_proposals}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rejected</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (analytics.rejected_proposals / analytics.total_proposals) * 100
                          }
                          color="danger"
                          className="w-32"
                          size="sm"
                        />
                        <span className="text-sm font-medium w-12 text-right">
                          {analytics.rejected_proposals}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (analytics.pending_proposals / analytics.total_proposals) * 100
                          }
                          color="warning"
                          className="w-32"
                          size="sm"
                        />
                        <span className="text-sm font-medium w-12 text-right">
                          {analytics.pending_proposals}
                        </span>
                      </div>
                    </div>
                    <Divider />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-default-500">Approval Rate</span>
                      <Chip
                        color={
                          analytics.approval_rate >= 0.7
                            ? 'success'
                            : analytics.approval_rate >= 0.4
                            ? 'warning'
                            : 'danger'
                        }
                        variant="flat"
                        size="sm"
                      >
                        {(analytics.approval_rate * 100).toFixed(1)}%
                      </Chip>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-default-500">Avg. Approval Time</span>
                      <span className="font-medium">{analytics.avg_approval_time || `${analytics.avg_approval_time_hrs}h`}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-sm text-default-400 py-4">
                    No proposals in this period
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:users-group-rounded-bold" className="text-primary text-xl" />
                  <h3 className="font-semibold">Top Contributors</h3>
                </div>
              </CardHeader>
              <CardBody>
                {analytics.top_contributors && analytics.top_contributors.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.top_contributors.map((contributor, idx) => (
                      <div key={contributor.member_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-default-400 w-6">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium">
                              {contributor.member_id.substring(0, 8)}...
                            </p>
                            <p className="text-xs text-default-400">
                              {contributor.transaction_count} transactions
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatVaultAmount(contributor.total_deposited, 'USD')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-default-400 py-4">
                    No contributor data available
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Inventory Stats */}
            {analytics.inventory_stats && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:box-bold" className="text-primary text-xl" />
                    <h3 className="font-semibold">Inventory Overview</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {analytics.inventory_stats.total_items}
                      </p>
                      <p className="text-xs text-default-500">Total Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {analytics.inventory_stats.unique_types}
                      </p>
                      <p className="text-xs text-default-500">Unique Types</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {analytics.inventory_stats.nft_count}
                      </p>
                      <p className="text-xs text-default-500">NFTs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {formatVaultAmount(
                          analytics.inventory_stats.estimated_value,
                          'USD'
                        )}
                      </p>
                      <p className="text-xs text-default-500">Est. Value</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Icon icon="solar:chart-bold" className="text-5xl text-default-300" />
            <p className="text-default-500">No analytics data available</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
