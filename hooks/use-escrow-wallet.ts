"use client";

/**
 * useEscrowWallet Hook
 * Custom hook for escrow wallet operations including MPC signing,
 * multi-chain support, match entry, and prize claiming
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSDK } from "@/contexts/sdk-context";
import { logger } from "@/lib/logger";
import type {
  CustodialWalletStatus,
  EscrowMatch,
  EscrowHistoryEntry,
  UserEscrowStats,
  EnterMatchRequest,
  EnterMatchResponse,
  ClaimPrizeRequest,
  ClaimPrizeResponse,
  MPCSigningRequest,
  WalletNotification,
  EscrowFilterOptions,
} from "@/types/replay-api/escrow-wallet.types";
import type { ChainID } from "@/types/replay-api/blockchain.types";

export interface UseEscrowWalletResult {
  // Wallet State
  wallet: CustodialWalletStatus | null;
  isLoadingWallet: boolean;
  walletError: string | null;

  // Active Matches
  activeMatches: EscrowMatch[];
  isLoadingMatches: boolean;
  matchesError: string | null;

  // History & Stats
  history: EscrowHistoryEntry[];
  stats: UserEscrowStats | null;
  isLoadingHistory: boolean;
  historyError: string | null;

  // Signing Requests
  pendingSigningRequests: MPCSigningRequest[];

  // Notifications
  notifications: WalletNotification[];
  unreadCount: number;

  // Selected Chain
  selectedChain: ChainID | null;
  setSelectedChain: (chainId: ChainID) => void;

  // Actions
  refreshWallet: () => Promise<void>;
  refreshMatches: () => Promise<void>;
  refreshHistory: (filters?: EscrowFilterOptions) => Promise<void>;
  enterMatch: (request: EnterMatchRequest) => Promise<EnterMatchResponse>;
  claimPrize: (request: ClaimPrizeRequest) => Promise<ClaimPrizeResponse>;
  approveSigning: (requestId: string) => Promise<boolean>;
  rejectSigning: (requestId: string) => Promise<boolean>;
  markNotificationRead: (notificationId: string) => void;
  dismissNotification: (notificationId: string) => void;

  // Helpers
  getChainBalance: (chainId: ChainID) => number;
  canEnterMatch: (match: EscrowMatch) => { allowed: boolean; reason?: string };
  canClaimPrize: (match: EscrowMatch) => { allowed: boolean; reason?: string };
}

export function useEscrowWallet(autoFetch = true): UseEscrowWalletResult {
  const { sdk } = useSDK();

  // Wallet state
  const [wallet, setWallet] = useState<CustodialWalletStatus | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Matches state
  const [activeMatches, setActiveMatches] = useState<EscrowMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<EscrowHistoryEntry[]>([]);
  const [stats, setStats] = useState<UserEscrowStats | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Signing requests
  const [pendingSigningRequests, setPendingSigningRequests] = useState<
    MPCSigningRequest[]
  >([]);

  // Notifications
  const [notifications, setNotifications] = useState<WalletNotification[]>([]);

  // Selected chain
  const [selectedChain, setSelectedChain] = useState<ChainID | null>(null);

  // Unread notification count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read_at).length;
  }, [notifications]);

  // Refresh wallet status
  const refreshWallet = useCallback(async () => {
    setIsLoadingWallet(true);
    setWalletError(null);

    try {
      // Fetch from SDK - replace with actual SDK method
      const result = await sdk.wallet.getBalance();

      if (result) {
        // Transform to CustodialWalletStatus
        const walletStatus: CustodialWalletStatus = {
          wallet_id: result.wallet_id || "",
          user_id: result.user_id,
          wallet_type: "semi_custodial", // Default to MPC wallet
          addresses: [
            {
              chain_id: "eip155:137", // Polygon default
              address:
                typeof result.evm_address === "string"
                  ? result.evm_address
                  : result.evm_address?.address || "",
              is_smart_wallet: true,
              balance: {
                native: { cents: 0, dollars: 0 },
                native_symbol: "MATIC",
                tokens: [],
                last_updated_at: new Date().toISOString(),
              },
            },
          ],
          mpc_config: {
            wallet_id: result.wallet_id || "",
            threshold: 2,
            total_shards: 3,
            shards: [
              {
                shard_id: "user-shard-1",
                holder: "user",
                holder_name: "Your Device",
                created_at: new Date().toISOString(),
                is_available: true,
                backup_method: "cloud",
                security_level: "high",
              },
              {
                shard_id: "platform-shard-1",
                holder: "platform",
                holder_name: "LeetGaming Secure",
                created_at: new Date().toISOString(),
                is_available: true,
                security_level: "high",
              },
              {
                shard_id: "recovery-shard-1",
                holder: "recovery_service",
                holder_name: "Recovery Service",
                created_at: new Date().toISOString(),
                is_available: true,
                backup_method: "social_recovery",
                security_level: "medium",
              },
            ],
            signing_protocol: "gg20",
            created_at: new Date().toISOString(),
            recovery_enabled: true,
          },
          security_score: 85,
          security_factors: [
            {
              factor: "mpc_enabled",
              enabled: true,
              weight: 30,
              description: "MPC Wallet Protection",
            },
            {
              factor: "two_factor_auth",
              enabled: true,
              weight: 20,
              description: "2FA Authentication",
            },
            {
              factor: "recovery_setup",
              enabled: true,
              weight: 15,
              description: "Recovery Contacts",
            },
            {
              factor: "email_verified",
              enabled: true,
              weight: 10,
              description: "Email Verified",
            },
            {
              factor: "kyc_verified",
              enabled: false,
              weight: 15,
              description: "Identity Verified",
              recommendation: "Verify your identity to increase limits",
            },
            {
              factor: "withdrawal_whitelist",
              enabled: false,
              weight: 10,
              description: "Withdrawal Whitelist",
              recommendation: "Add trusted addresses for extra security",
            },
          ],
          daily_withdrawal_limit: { cents: 100000, dollars: 1000 },
          daily_withdrawal_used: { cents: 0, dollars: 0 },
          single_tx_limit: { cents: 50000, dollars: 500 },
          features_enabled: [
            "match_escrow",
            "tournament_entry",
            "prize_claim",
            "gasless_transactions",
          ],
          kyc_level: "basic",
          created_at: result.created_at || new Date().toISOString(),
          updated_at: result.updated_at || new Date().toISOString(),
        };

        setWallet(walletStatus);

        // Set default selected chain
        if (!selectedChain && walletStatus.addresses.length > 0) {
          setSelectedChain(walletStatus.addresses[0].chain_id);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load wallet";
      logger.error("Failed to refresh escrow wallet", err);
      setWalletError(message);
    } finally {
      setIsLoadingWallet(false);
    }
  }, [sdk, selectedChain]);

  // Refresh active matches
  const refreshMatches = useCallback(async () => {
    setIsLoadingMatches(true);
    setMatchesError(null);

    try {
      // Mock active matches - replace with actual SDK call
      // const matches = await sdk.escrow.getActiveMatches();

      // Demo data for now
      const mockMatches: EscrowMatch[] = [
        {
          match_id: "match-001",
          game_id: "cs2",
          game_mode: "Competitive 5v5",
          region: "NA",
          entry_fee: { cents: 1000, dollars: 10 },
          currency: "USD",
          chain_id: "eip155:137",
          total_pot: { cents: 10500, dollars: 105 },
          platform_contribution: { cents: 500, dollars: 5 },
          platform_fee_percent: 500,
          distribution_type: "winner_takes_all",
          participants: [],
          min_participants: 10,
          max_participants: 10,
          current_participants: 8,
          status: "filling",
          created_at: new Date().toISOString(),
          starts_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          escrow_address: "0x1234...5678",
          escrow_period_hours: 72,
          user_participation: {
            match_id: "match-001",
            user_id: "user-001",
            entry_tx_hash: "0xabc...def",
            entry_amount: { cents: 1000, dollars: 10 },
            entered_at: new Date().toISOString(),
            status: "entered",
            potential_winnings: {
              if_first: { cents: 9975, dollars: 99.75 },
            },
          },
        },
      ];

      setActiveMatches(mockMatches);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load matches";
      logger.error("Failed to refresh active matches", err);
      setMatchesError(message);
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  // Refresh history and stats
  const refreshHistory = useCallback(async (_filters?: EscrowFilterOptions) => {
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      // Mock history data - replace with actual SDK call
      // const result = await sdk.escrow.getHistory(filters);

      const mockHistory: EscrowHistoryEntry[] = [
        {
          match_id: "match-past-001",
          game_id: "cs2",
          game_mode: "Competitive 5v5",
          entry_fee: { cents: 1000, dollars: 10 },
          prize_won: { cents: 9500, dollars: 95 },
          rank: 1,
          total_participants: 10,
          total_pot: { cents: 10000, dollars: 100 },
          distribution_type: "winner_takes_all",
          status: "won",
          match_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          chain_id: "eip155:137",
          entry_tx_hash: "0x111...222",
          prize_tx_hash: "0x333...444",
          settlement_verified: true,
          explorer_url: "https://polygonscan.com/tx/0x333...444",
        },
        {
          match_id: "match-past-002",
          game_id: "valorant",
          game_mode: "Ranked 5v5",
          entry_fee: { cents: 500, dollars: 5 },
          rank: 4,
          total_participants: 10,
          total_pot: { cents: 5000, dollars: 50 },
          distribution_type: "tiered",
          status: "lost",
          match_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          chain_id: "eip155:137",
          entry_tx_hash: "0x555...666",
          settlement_verified: true,
        },
      ];

      const mockStats: UserEscrowStats = {
        total_matches_entered: 25,
        total_matches_won: 12,
        win_rate: 0.48,
        total_entry_fees_paid: { cents: 25000, dollars: 250 },
        total_prizes_won: { cents: 42000, dollars: 420 },
        net_profit: { cents: 17000, dollars: 170 },
        biggest_win: { cents: 15000, dollars: 150 },
        current_streak: 3,
        best_streak: 7,
        stats_by_game: {
          cs2: {
            game_id: "cs2",
            matches_played: 15,
            wins: 8,
            win_rate: 0.53,
            total_prizes: { cents: 30000, dollars: 300 },
          },
          valorant: {
            game_id: "valorant",
            matches_played: 10,
            wins: 4,
            win_rate: 0.4,
            total_prizes: { cents: 12000, dollars: 120 },
          },
        },
        last_30_days: {
          matches: 8,
          wins: 4,
          profit: { cents: 5000, dollars: 50 },
        },
      };

      setHistory(mockHistory);
      setStats(mockStats);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load history";
      logger.error("Failed to refresh escrow history", err);
      setHistoryError(message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Enter a match
  const enterMatch = useCallback(
    async (request: EnterMatchRequest): Promise<EnterMatchResponse> => {
      try {
        // Check if user can enter
        const match = activeMatches.find(
          (m) => m.match_id === request.match_id,
        );
        if (!match) {
          return { success: false, error: "Match not found" };
        }

        const canEnter = canEnterMatch(match);
        if (!canEnter.allowed) {
          return { success: false, error: canEnter.reason };
        }

        // Create MPC signing request
        const signingRequest: MPCSigningRequest = {
          request_id: `sign-${Date.now()}`,
          wallet_id: request.wallet_id,
          chain_id: request.chain_id,
          transaction_type: "match_entry",
          unsigned_tx: "0x...", // Would be actual transaction data
          shards_collected: 0,
          threshold_required: 2,
          status: "pending",
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        };

        setPendingSigningRequests((prev) => [...prev, signingRequest]);

        // Simulate success for demo
        return {
          success: true,
          signing_request_id: signingRequest.request_id,
          escrow_address: match.escrow_address,
          estimated_gas: { cents: 50, dollars: 0.5 },
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to enter match";
        logger.error("Failed to enter match", err);
        return { success: false, error: message };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [activeMatches],
  );

  // Claim prize
  const claimPrize = useCallback(
    async (request: ClaimPrizeRequest): Promise<ClaimPrizeResponse> => {
      try {
        const match = activeMatches.find(
          (m) => m.match_id === request.match_id,
        );
        if (!match) {
          return {
            success: false,
            error: "Match not found",
            prize_amount: { cents: 0, dollars: 0 },
            net_amount: { cents: 0, dollars: 0 },
          };
        }

        const canClaim = canClaimPrize(match);
        if (!canClaim.allowed) {
          return {
            success: false,
            error: canClaim.reason,
            prize_amount: { cents: 0, dollars: 0 },
            net_amount: { cents: 0, dollars: 0 },
          };
        }

        // Create signing request for prize claim
        const signingRequest: MPCSigningRequest = {
          request_id: `sign-${Date.now()}`,
          wallet_id: request.wallet_id,
          chain_id: match.chain_id,
          transaction_type: "prize_claim",
          unsigned_tx: "0x...",
          shards_collected: 0,
          threshold_required: 2,
          status: "pending",
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        };

        setPendingSigningRequests((prev) => [...prev, signingRequest]);

        const prizeAmount = match.user_participation?.prize_won || {
          cents: 0,
          dollars: 0,
        };
        const netAmount = {
          cents: Math.round(prizeAmount.cents * 0.95), // 5% fee
          dollars: prizeAmount.dollars * 0.95,
        };

        return {
          success: true,
          signing_request_id: signingRequest.request_id,
          prize_amount: prizeAmount,
          net_amount: netAmount,
          estimated_arrival: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to claim prize";
        logger.error("Failed to claim prize", err);
        return {
          success: false,
          error: message,
          prize_amount: { cents: 0, dollars: 0 },
          net_amount: { cents: 0, dollars: 0 },
        };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [activeMatches],
  );

  // Approve MPC signing request
  const approveSigning = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        // Find and update signing request
        setPendingSigningRequests((prev) =>
          prev.map((req) =>
            req.request_id === requestId
              ? {
                  ...req,
                  status: "signing",
                  shards_collected: req.shards_collected + 1,
                }
              : req,
          ),
        );

        // Simulate MPC coordination
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Complete signing
        setPendingSigningRequests((prev) =>
          prev.map((req) =>
            req.request_id === requestId
              ? {
                  ...req,
                  status: "complete",
                  signed_at: new Date().toISOString(),
                  tx_hash: `0x${Date.now().toString(16)}`,
                }
              : req,
          ),
        );

        // Refresh matches after successful signing
        await refreshMatches();

        return true;
      } catch (err) {
        logger.error("Failed to approve signing", err);
        return false;
      }
    },
    [refreshMatches],
  );

  // Reject MPC signing request
  const rejectSigning = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        setPendingSigningRequests((prev) =>
          prev.map((req) =>
            req.request_id === requestId ? { ...req, status: "failed" } : req,
          ),
        );
        return true;
      } catch (err) {
        logger.error("Failed to reject signing", err);
        return false;
      }
    },
    [],
  );

  // Mark notification as read
  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notification_id === notificationId
          ? { ...n, read_at: new Date().toISOString() }
          : n,
      ),
    );
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notification_id === notificationId
          ? { ...n, dismissed_at: new Date().toISOString() }
          : n,
      ),
    );
  }, []);

  // Get chain balance helper
  const getChainBalance = useCallback(
    (chainId: ChainID): number => {
      if (!wallet) return 0;
      const chainAddr = wallet.addresses.find((a) => a.chain_id === chainId);
      if (!chainAddr?.balance) return 0;

      const nativeUsd = chainAddr.balance.native.dollars || 0;
      const tokensUsd =
        chainAddr.balance.tokens?.reduce(
          (sum, t) => sum + (t.usd_value?.dollars || 0),
          0,
        ) || 0;
      return nativeUsd + tokensUsd;
    },
    [wallet],
  );

  // Check if user can enter a match
  const canEnterMatch = useCallback(
    (match: EscrowMatch): { allowed: boolean; reason?: string } => {
      if (!wallet) return { allowed: false, reason: "Wallet not connected" };

      if (match.status !== "open" && match.status !== "filling") {
        return { allowed: false, reason: "Match is not accepting entries" };
      }

      if (match.current_participants >= match.max_participants) {
        return { allowed: false, reason: "Match is full" };
      }

      if (match.user_participation) {
        return { allowed: false, reason: "Already entered this match" };
      }

      const chainBalance = getChainBalance(match.chain_id);
      if (chainBalance < match.entry_fee.dollars) {
        return { allowed: false, reason: "Insufficient balance" };
      }

      return { allowed: true };
    },
    [wallet, getChainBalance],
  );

  // Check if user can claim prize
  const canClaimPrize = useCallback(
    (match: EscrowMatch): { allowed: boolean; reason?: string } => {
      if (!wallet) return { allowed: false, reason: "Wallet not connected" };

      if (!match.user_participation) {
        return {
          allowed: false,
          reason: "You did not participate in this match",
        };
      }

      if (!match.user_participation.prize_claimable) {
        return { allowed: false, reason: "No prize available to claim" };
      }

      if (match.user_participation.prize_claimed) {
        return { allowed: false, reason: "Prize already claimed" };
      }

      if (match.status === "in_escrow") {
        return { allowed: false, reason: "Prize is still in escrow period" };
      }

      return { allowed: true };
    },
    [wallet],
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refreshWallet();
      refreshMatches();
      refreshHistory();
    }
  }, [autoFetch, refreshWallet, refreshMatches, refreshHistory]);

  // Set up polling for active matches
  useEffect(() => {
    if (!autoFetch) return;

    const interval = setInterval(() => {
      refreshMatches();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [autoFetch, refreshMatches]);

  return {
    // Wallet State
    wallet,
    isLoadingWallet,
    walletError,

    // Active Matches
    activeMatches,
    isLoadingMatches,
    matchesError,

    // History & Stats
    history,
    stats,
    isLoadingHistory,
    historyError,

    // Signing Requests
    pendingSigningRequests,

    // Notifications
    notifications,
    unreadCount,

    // Selected Chain
    selectedChain,
    setSelectedChain,

    // Actions
    refreshWallet,
    refreshMatches,
    refreshHistory,
    enterMatch,
    claimPrize,
    approveSigning,
    rejectSigning,
    markNotificationRead,
    dismissNotification,

    // Helpers
    getChainBalance,
    canEnterMatch,
    canClaimPrize,
  };
}

export default useEscrowWallet;
