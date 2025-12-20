/**
 * Payment SDK Unit Tests
 * Tests for the PaymentAPI class to ensure proper API integration
 * Target: 85%+ coverage for payment module
 */

import { PaymentAPI } from './payment.sdk';
import { ReplayApiClient } from './replay-api.client';
import type {
  Payment,
  PaymentsResult,
  PaymentIntentResult,
  PaymentFilters,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  RefundPaymentRequest,
  CancelPaymentRequest,
} from './payment.types';

// Mock the ReplayApiClient
const mockClient = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
};

describe('PaymentAPI', () => {
  let paymentApi: PaymentAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentApi = new PaymentAPI(mockClient as unknown as ReplayApiClient);
  });

  describe('getPayment', () => {
    const mockPayment: Payment = {
      id: 'pay_123',
      user_id: 'user_456',
      wallet_id: 'wallet_789',
      type: 'deposit',
      provider: 'stripe',
      status: 'succeeded',
      amount: 10000,
      currency: 'USD',
      fee: 100,
      provider_fee: 50,
      net_amount: 9850,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should successfully fetch a payment by ID', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: mockPayment,
        error: null,
      });

      const result = await paymentApi.getPayment('pay_123');

      expect(result).toEqual(mockPayment);
      expect(mockClient.get).toHaveBeenCalledWith('/payments/pay_123');
    });

    it('should return null on error', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Payment not found',
      });

      const result = await paymentApi.getPayment('invalid_id');

      expect(result).toBeNull();
    });

    it('should handle payment with all optional fields', async () => {
      const fullPayment: Payment = {
        ...mockPayment,
        description: 'Test deposit',
        failure_reason: undefined,
        provider_payment_id: 'pi_stripe_123',
        completed_at: '2024-01-01T00:00:01Z',
      };

      mockClient.get.mockResolvedValueOnce({
        data: fullPayment,
        error: null,
      });

      const result = await paymentApi.getPayment('pay_123');

      expect(result?.provider_payment_id).toBe('pi_stripe_123');
      expect(result?.completed_at).toBe('2024-01-01T00:00:01Z');
    });
  });

  describe('getPayments', () => {
    const mockPaymentsResult: PaymentsResult = {
      payments: [
        {
          id: 'pay_1',
          user_id: 'user_1',
          wallet_id: 'wallet_1',
          type: 'deposit',
          provider: 'stripe',
          status: 'succeeded',
          amount: 5000,
          currency: 'USD',
          fee: 50,
          provider_fee: 25,
          net_amount: 4925,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'pay_2',
          user_id: 'user_1',
          wallet_id: 'wallet_1',
          type: 'withdrawal',
          provider: 'paypal',
          status: 'pending',
          amount: 2500,
          currency: 'USD',
          fee: 25,
          provider_fee: 10,
          net_amount: 2465,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ],
      total_count: 2,
      limit: 20,
      offset: 0,
    };

    it('should fetch payments without filters', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: mockPaymentsResult,
        error: null,
      });

      const result = await paymentApi.getPayments();

      expect(result).toEqual(mockPaymentsResult);
      expect(mockClient.get).toHaveBeenCalledWith('/payments');
    });

    it('should fetch payments with filters', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: mockPaymentsResult,
        error: null,
      });

      const filters: PaymentFilters = {
        status: 'succeeded',
        provider: 'stripe',
        type: 'deposit',
        limit: 10,
        offset: 0,
      };

      const result = await paymentApi.getPayments(filters);

      expect(result).toEqual(mockPaymentsResult);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments?status=succeeded&provider=stripe&type=deposit&limit=10&offset=0'
      );
    });

    it('should handle pagination filters', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: mockPaymentsResult,
        error: null,
      });

      const filters: PaymentFilters = {
        limit: 50,
        offset: 100,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      await paymentApi.getPayments(filters);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments?limit=50&offset=100&sort_by=created_at&sort_order=desc'
      );
    });

    it('should return null on error', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch payments',
      });

      const result = await paymentApi.getPayments();

      expect(result).toBeNull();
    });

    it('should handle date range filters', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: mockPaymentsResult,
        error: null,
      });

      const filters: PaymentFilters = {
        from_date: '2024-01-01',
        to_date: '2024-01-31',
      };

      await paymentApi.getPayments(filters);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments?from_date=2024-01-01&to_date=2024-01-31'
      );
    });
  });

  describe('createPaymentIntent', () => {
    const mockIntentResult: PaymentIntentResult = {
      payment: {
        id: 'pay_new',
        user_id: 'user_1',
        wallet_id: 'wallet_1',
        type: 'deposit',
        provider: 'stripe',
        status: 'pending',
        amount: 10000,
        currency: 'USD',
        fee: 100,
        provider_fee: 0,
        net_amount: 9900,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      client_secret: 'cs_test_secret_123',
    };

    it('should create a payment intent with Stripe', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: mockIntentResult,
        error: null,
      });

      const request: CreatePaymentIntentRequest = {
        wallet_id: 'wallet_1',
        amount: 10000,
        currency: 'USD',
        payment_type: 'deposit',
        provider: 'stripe',
      };

      const result = await paymentApi.createPaymentIntent(request);

      expect(result).toEqual(mockIntentResult);
      expect(mockClient.post).toHaveBeenCalledWith('/payments/intent', request);
    });

    it('should create a payment intent with PayPal redirect', async () => {
      const paypalResult: PaymentIntentResult = {
        payment: {
          id: 'pay_paypal',
          user_id: 'user_1',
          wallet_id: 'wallet_1',
          type: 'deposit',
          provider: 'paypal',
          status: 'pending',
          amount: 5000,
          currency: 'USD',
          fee: 50,
          provider_fee: 0,
          net_amount: 4950,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        redirect_url: 'https://paypal.com/checkout/abc',
      };

      mockClient.post.mockResolvedValueOnce({
        data: paypalResult,
        error: null,
      });

      const request: CreatePaymentIntentRequest = {
        wallet_id: 'wallet_1',
        amount: 5000,
        currency: 'USD',
        payment_type: 'deposit',
        provider: 'paypal',
      };

      const result = await paymentApi.createPaymentIntent(request);

      expect(result?.redirect_url).toBe('https://paypal.com/checkout/abc');
    });

    it('should create a payment intent with crypto address', async () => {
      const cryptoResult: PaymentIntentResult = {
        payment: {
          id: 'pay_crypto',
          user_id: 'user_1',
          wallet_id: 'wallet_1',
          type: 'deposit',
          provider: 'crypto',
          status: 'pending',
          amount: 20000,
          currency: 'USD',
          fee: 200,
          provider_fee: 0,
          net_amount: 19800,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        crypto_address: '0x1234567890abcdef1234567890abcdef12345678',
      };

      mockClient.post.mockResolvedValueOnce({
        data: cryptoResult,
        error: null,
      });

      const request: CreatePaymentIntentRequest = {
        wallet_id: 'wallet_1',
        amount: 20000,
        currency: 'USD',
        payment_type: 'deposit',
        provider: 'crypto',
        metadata: { network: 'ethereum' },
      };

      const result = await paymentApi.createPaymentIntent(request);

      expect(result?.crypto_address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    });

    it('should return null on error', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Invalid amount',
      });

      const request: CreatePaymentIntentRequest = {
        wallet_id: 'wallet_1',
        amount: -100,
        currency: 'USD',
        payment_type: 'deposit',
        provider: 'stripe',
      };

      const result = await paymentApi.createPaymentIntent(request);

      expect(result).toBeNull();
    });
  });

  describe('confirmPayment', () => {
    const mockConfirmedPayment: Payment = {
      id: 'pay_123',
      user_id: 'user_1',
      wallet_id: 'wallet_1',
      type: 'deposit',
      provider: 'stripe',
      status: 'succeeded',
      amount: 10000,
      currency: 'USD',
      fee: 100,
      provider_fee: 30,
      net_amount: 9870,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:01Z',
      completed_at: '2024-01-01T00:00:01Z',
    };

    it('should confirm a payment successfully', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: mockConfirmedPayment,
        error: null,
      });

      const request: ConfirmPaymentRequest = {
        payment_id: 'pay_123',
        payment_method_id: 'pm_card_visa',
      };

      const result = await paymentApi.confirmPayment(request);

      expect(result).toEqual(mockConfirmedPayment);
      expect(mockClient.post).toHaveBeenCalledWith('/payments/pay_123/confirm', {
        payment_method_id: 'pm_card_visa',
      });
    });

    it('should return null on error', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Card declined',
      });

      const request: ConfirmPaymentRequest = {
        payment_id: 'pay_123',
        payment_method_id: 'pm_card_declined',
      };

      const result = await paymentApi.confirmPayment(request);

      expect(result).toBeNull();
    });
  });

  describe('refundPayment', () => {
    const mockRefundedPayment: Payment = {
      id: 'pay_123',
      user_id: 'user_1',
      wallet_id: 'wallet_1',
      type: 'deposit',
      provider: 'stripe',
      status: 'refunded',
      amount: 10000,
      currency: 'USD',
      fee: 100,
      provider_fee: 30,
      net_amount: 9870,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    };

    it('should process full refund successfully', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: mockRefundedPayment,
        error: null,
      });

      const request: RefundPaymentRequest = {
        payment_id: 'pay_123',
        reason: 'Customer requested',
      };

      const result = await paymentApi.refundPayment(request);

      expect(result?.status).toBe('refunded');
      expect(mockClient.post).toHaveBeenCalledWith('/payments/pay_123/refund', {
        amount: undefined,
        reason: 'Customer requested',
      });
    });

    it('should process partial refund successfully', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: mockRefundedPayment,
        error: null,
      });

      const request: RefundPaymentRequest = {
        payment_id: 'pay_123',
        amount: 5000,
        reason: 'Partial refund',
      };

      const result = await paymentApi.refundPayment(request);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/pay_123/refund', {
        amount: 5000,
        reason: 'Partial refund',
      });
    });

    it('should return null on error', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Payment already refunded',
      });

      const request: RefundPaymentRequest = {
        payment_id: 'pay_refunded',
        reason: 'Test',
      };

      const result = await paymentApi.refundPayment(request);

      expect(result).toBeNull();
    });
  });

  describe('cancelPayment', () => {
    const mockCanceledPayment: Payment = {
      id: 'pay_123',
      user_id: 'user_1',
      wallet_id: 'wallet_1',
      type: 'deposit',
      provider: 'stripe',
      status: 'canceled',
      amount: 10000,
      currency: 'USD',
      fee: 0,
      provider_fee: 0,
      net_amount: 10000,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:01:00Z',
    };

    it('should cancel a pending payment successfully', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: mockCanceledPayment,
        error: null,
      });

      const request: CancelPaymentRequest = {
        payment_id: 'pay_123',
        reason: 'User changed mind',
      };

      const result = await paymentApi.cancelPayment(request);

      expect(result?.status).toBe('canceled');
      expect(mockClient.post).toHaveBeenCalledWith('/payments/pay_123/cancel', {
        reason: 'User changed mind',
      });
    });

    it('should cancel without reason', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: mockCanceledPayment,
        error: null,
      });

      const request: CancelPaymentRequest = {
        payment_id: 'pay_123',
      };

      const result = await paymentApi.cancelPayment(request);

      expect(result).not.toBeNull();
      expect(mockClient.post).toHaveBeenCalledWith('/payments/pay_123/cancel', {
        reason: undefined,
      });
    });

    it('should return null on error', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Payment cannot be canceled',
      });

      const request: CancelPaymentRequest = {
        payment_id: 'pay_completed',
      };

      const result = await paymentApi.cancelPayment(request);

      expect(result).toBeNull();
    });
  });
});

describe('PaymentAPI - Edge Cases', () => {
  let paymentApi: PaymentAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentApi = new PaymentAPI(mockClient as unknown as ReplayApiClient);
  });

  it('should handle all payment statuses', async () => {
    const statuses = ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'] as const;

    for (const status of statuses) {
      mockClient.get.mockResolvedValueOnce({
        data: {
          id: `pay_${status}`,
          user_id: 'user_1',
          wallet_id: 'wallet_1',
          type: 'deposit',
          provider: 'stripe',
          status,
          amount: 1000,
          currency: 'USD',
          fee: 10,
          provider_fee: 5,
          net_amount: 985,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await paymentApi.getPayment(`pay_${status}`);

      expect(result?.status).toBe(status);
    }
  });

  it('should handle all payment types', async () => {
    const types = ['deposit', 'withdrawal', 'subscription'] as const;

    for (const type of types) {
      mockClient.get.mockResolvedValueOnce({
        data: {
          id: `pay_${type}`,
          user_id: 'user_1',
          wallet_id: 'wallet_1',
          type,
          provider: 'stripe',
          status: 'succeeded',
          amount: 1000,
          currency: 'USD',
          fee: 10,
          provider_fee: 5,
          net_amount: 985,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await paymentApi.getPayment(`pay_${type}`);

      expect(result?.type).toBe(type);
    }
  });

  it('should handle all payment providers', async () => {
    const providers = ['stripe', 'paypal', 'crypto', 'bank'] as const;

    for (const provider of providers) {
      mockClient.get.mockResolvedValueOnce({
        data: {
          id: `pay_${provider}`,
          user_id: 'user_1',
          wallet_id: 'wallet_1',
          type: 'deposit',
          provider,
          status: 'succeeded',
          amount: 1000,
          currency: 'USD',
          fee: 10,
          provider_fee: 5,
          net_amount: 985,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await paymentApi.getPayment(`pay_${provider}`);

      expect(result?.provider).toBe(provider);
    }
  });

  it('should handle failed payment with failure_reason', async () => {
    mockClient.get.mockResolvedValueOnce({
      data: {
        id: 'pay_failed',
        user_id: 'user_1',
        wallet_id: 'wallet_1',
        type: 'deposit',
        provider: 'stripe',
        status: 'failed',
        amount: 1000,
        currency: 'USD',
        fee: 0,
        provider_fee: 0,
        net_amount: 1000,
        failure_reason: 'Card declined',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      error: null,
    });

    const result = await paymentApi.getPayment('pay_failed');

    expect(result?.status).toBe('failed');
    expect(result?.failure_reason).toBe('Card declined');
  });

  it('should handle empty payments list', async () => {
    mockClient.get.mockResolvedValueOnce({
      data: {
        payments: [],
        total_count: 0,
        limit: 20,
        offset: 0,
      },
      error: null,
    });

    const result = await paymentApi.getPayments();

    expect(result?.payments).toHaveLength(0);
    expect(result?.total_count).toBe(0);
  });

  it('should handle payment with metadata', async () => {
    mockClient.post.mockResolvedValueOnce({
      data: {
        payment: {
          id: 'pay_with_meta',
          user_id: 'user_1',
          wallet_id: 'wallet_1',
          type: 'subscription',
          provider: 'stripe',
          status: 'pending',
          amount: 9900,
          currency: 'USD',
          fee: 99,
          provider_fee: 0,
          net_amount: 9801,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        client_secret: 'cs_test_123',
      },
      error: null,
    });

    const request: CreatePaymentIntentRequest = {
      wallet_id: 'wallet_1',
      amount: 9900,
      currency: 'USD',
      payment_type: 'subscription',
      provider: 'stripe',
      metadata: {
        plan_id: 'pro_monthly',
        plan_name: 'Pro Monthly',
        billing_period: 'monthly',
      },
    };

    const result = await paymentApi.createPaymentIntent(request);

    expect(result).not.toBeNull();
    expect(mockClient.post).toHaveBeenCalledWith('/payments/intent', expect.objectContaining({
      metadata: {
        plan_id: 'pro_monthly',
        plan_name: 'Pro Monthly',
        billing_period: 'monthly',
      },
    }));
  });
});

