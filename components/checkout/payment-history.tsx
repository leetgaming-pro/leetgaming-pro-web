'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import {
  PaymentHistoryItem,
  PaymentStatus,
  PaymentType,
  PAYMENT_STATUS_COLORS,
} from './types';
import { paymentsSDK, Payment } from '@/types/replay-api/payments.sdk';

// ============================================================================
// Types
// ============================================================================

interface PaymentHistoryProps {
  limit?: number;
  showPagination?: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

const formatAmount = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getTypeIcon = (type: PaymentType): string => {
  switch (type) {
    case PaymentType.DEPOSIT:
      return 'solar:arrow-down-bold';
    case PaymentType.WITHDRAWAL:
      return 'solar:arrow-up-bold';
    case PaymentType.SUBSCRIPTION:
      return 'solar:refresh-circle-bold';
    default:
      return 'solar:wallet-bold';
  }
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'deposit':
      return 'Deposit';
    case 'withdrawal':
      return 'Withdrawal';
    case 'subscription':
      return 'Subscription';
    default:
      return type;
  }
};

// ============================================================================
// Component
// ============================================================================

export function PaymentHistory({ limit = 10, showPagination = true }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(payments.length / limit);
  const paginatedPayments = payments.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const result = await paymentsSDK.getUserPayments();
        setPayments(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load payment history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Payment History</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-danger/10 border border-danger/20">
        <CardBody className="p-6 text-center">
          <Icon icon="solar:danger-triangle-bold" className="text-danger w-8 h-8 mx-auto mb-2" />
          <p className="text-danger">{error}</p>
        </CardBody>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Payment History</h3>
        </CardHeader>
        <CardBody className="p-8 text-center">
          <Icon
            icon="solar:wallet-bold"
            className="w-12 h-12 text-default-300 mx-auto mb-4"
          />
          <p className="text-default-500">No payment history yet</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment History</h3>
        <Chip size="sm" variant="flat">
          {payments.length} transactions
        </Chip>
      </CardHeader>
      <Divider />
      <CardBody className="p-0">
        <Table
          aria-label="Payment history table"
          removeWrapper
          classNames={{
            th: 'bg-transparent text-default-500 font-medium',
            td: 'py-4',
          }}
        >
          <TableHeader>
            <TableColumn>DATE</TableColumn>
            <TableColumn>TYPE</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>PROVIDER</TableColumn>
          </TableHeader>
          <TableBody>
            {paginatedPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <span className="text-sm">{formatDate(payment.created_at)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={getTypeIcon(payment.type as PaymentType)}
                      className={`w-4 h-4 ${
                        payment.type === 'deposit' ? 'text-success' : 'text-default-500'
                      }`}
                    />
                    <span className="text-sm">{getTypeLabel(payment.type)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      payment.type === 'deposit' ? 'text-success' : ''
                    }`}
                  >
                    {payment.type === 'deposit' ? '+' : ''}
                    {formatAmount(payment.amount, payment.currency)}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    color={PAYMENT_STATUS_COLORS[payment.status as PaymentStatus] || 'default'}
                    variant="flat"
                    size="sm"
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">{payment.provider}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {showPagination && totalPages > 1 && (
          <div className="flex justify-center py-4">
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              showControls
              size="sm"
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
