/**
 * Wallet SDK Tests
 * Unit tests for the WalletAPI SDK
 */

import { WalletAPI } from './wallet.sdk';
import type { ReplayApiClient, ApiResponse } from './replay-api.client';
import type {
  WalletBalance,
  Transaction,
  TransactionsResult,
  DepositRequest,
  WithdrawRequest,
} from './wallet.types';

// Mock client
const createMockClient = (): jest.Mocked<ReplayApiClient> => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  getResource: jest.fn(),
  setDefaultTimeout: jest.fn(),
  setMaxRetries: jest.fn(),
  setRetryDelay: jest.fn(),
} as unknown as jest.Mocked<ReplayApiClient>);

const mockBalance: WalletBalance = {
  wallet_id: 'wallet-123',
  user_id: 'user-456',
  balances: { USD: '100.00' },
  total_deposited: '500.00',
  total_withdrawn: '200.00',
  total_prizes_won: '150.00',
  is_locked: false,
};

const mockTransaction: Transaction = {
  id: 'tx-123',
  transaction_id: 'tx-123',
  type: 'deposit',
  entry_type: 'credit',
  asset_type: 'fiat',
  currency: 'USD',
  amount: '50.00',
  balance_after: '150.00',
  description: 'Test deposit',
  created_at: '2024-01-01T00:00:00Z',
  is_reversed: false,
};

describe('WalletAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let walletApi: WalletAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    walletApi = new WalletAPI(mockClient);
  });

  describe('getBalance', () => {
    it('should return wallet balance on success', async () => {
      const response: ApiResponse<WalletBalance> = {
        data: mockBalance,
        status: 200,
      };
      mockClient.get.mockResolvedValue(response);

      const result = await walletApi.getBalance();

      expect(result).toEqual(mockBalance);
      expect(mockClient.get).toHaveBeenCalledWith('/wallet/balance');
    });

    it('should return null on error', async () => {
      const response: ApiResponse<WalletBalance> = {
        error: { message: 'Failed to fetch', status: 500 },
        status: 500,
      };
      mockClient.get.mockResolvedValue(response);

      const result = await walletApi.getBalance();

      expect(result).toBeNull();
    });

    it('should return null when data is undefined', async () => {
      const response: ApiResponse<WalletBalance> = {
        status: 200,
      };
      mockClient.get.mockResolvedValue(response);

      const result = await walletApi.getBalance();

      expect(result).toBeNull();
    });
  });

  describe('deposit', () => {
    const depositRequest: DepositRequest = {
      currency: 'USD',
      amount: 5000,
      payment_method: 'credit_card',
    };

    it('should return transaction on successful deposit', async () => {
      const response: ApiResponse<Transaction> = {
        data: mockTransaction,
        status: 201,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await walletApi.deposit(depositRequest);

      expect(result).toEqual(mockTransaction);
      expect(mockClient.post).toHaveBeenCalledWith('/wallet/deposit', depositRequest);
    });

    it('should return null on deposit error', async () => {
      const response: ApiResponse<Transaction> = {
        error: { message: 'Insufficient funds', status: 400 },
        status: 400,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await walletApi.deposit(depositRequest);

      expect(result).toBeNull();
    });
  });

  describe('withdraw', () => {
    const withdrawRequest: WithdrawRequest = {
      currency: 'USD',
      amount: 2500,
      destination_address: '0x1234567890abcdef',
    };

    it('should return transaction on successful withdrawal', async () => {
      const response: ApiResponse<Transaction> = {
        data: { ...mockTransaction, type: 'withdrawal', entry_type: 'debit' },
        status: 201,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await walletApi.withdraw(withdrawRequest);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('withdrawal');
      expect(mockClient.post).toHaveBeenCalledWith('/wallet/withdraw', withdrawRequest);
    });

    it('should return null on withdrawal error', async () => {
      const response: ApiResponse<Transaction> = {
        error: { message: 'Wallet locked', status: 403 },
        status: 403,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await walletApi.withdraw(withdrawRequest);

      expect(result).toBeNull();
    });
  });

  describe('getTransactions', () => {
    const mockTransactionsResult: TransactionsResult = {
      transactions: [mockTransaction],
      total_count: 1,
      limit: 50,
      offset: 0,
    };

    it('should return transactions with default filters', async () => {
      const response: ApiResponse<TransactionsResult> = {
        data: mockTransactionsResult,
        status: 200,
      };
      mockClient.get.mockResolvedValue(response);

      const result = await walletApi.getTransactions();

      expect(result).toEqual(mockTransactionsResult);
      expect(mockClient.get).toHaveBeenCalledWith('/wallet/transactions');
    });

    it('should build query string from filters', async () => {
      const response: ApiResponse<TransactionsResult> = {
        data: mockTransactionsResult,
        status: 200,
      };
      mockClient.get.mockResolvedValue(response);

      await walletApi.getTransactions({
        currency: 'USD',
        type: 'deposit',
        limit: 10,
        offset: 20,
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/wallet/transactions?')
      );
    });

    it('should return null on error', async () => {
      const response: ApiResponse<TransactionsResult> = {
        error: { message: 'Server error', status: 500 },
        status: 500,
      };
      mockClient.get.mockResolvedValue(response);

      const result = await walletApi.getTransactions();

      expect(result).toBeNull();
    });
  });

  describe('getTransaction', () => {
    it('should return specific transaction', async () => {
      const response: ApiResponse<Transaction> = {
        data: mockTransaction,
        status: 200,
      };
      mockClient.get.mockResolvedValue(response);

      const result = await walletApi.getTransaction('tx-123');

      expect(result).toEqual(mockTransaction);
      expect(mockClient.get).toHaveBeenCalledWith('/wallet/transactions/tx-123');
    });

    it('should return null when not found', async () => {
      const response: ApiResponse<Transaction> = {
        error: { message: 'Not found', status: 404 },
        status: 404,
      };
      mockClient.get.mockResolvedValue(response);

      const result = await walletApi.getTransaction('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('cancelTransaction', () => {
    it('should cancel transaction successfully', async () => {
      const canceledTx: Transaction = {
        ...mockTransaction,
        status: 'cancelled',
      };
      const response: ApiResponse<Transaction> = {
        data: canceledTx,
        status: 200,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await walletApi.cancelTransaction('tx-123');

      expect(result).not.toBeNull();
      expect(result?.status).toBe('cancelled');
      expect(mockClient.post).toHaveBeenCalledWith('/wallet/transactions/tx-123/cancel', {});
    });

    it('should return null when cancel fails', async () => {
      const response: ApiResponse<Transaction> = {
        error: { message: 'Cannot cancel confirmed transaction', status: 400 },
        status: 400,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await walletApi.cancelTransaction('tx-123');

      expect(result).toBeNull();
    });
  });
});

