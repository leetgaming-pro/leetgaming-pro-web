"use client";

/**
 * useWeb3Wallet — Hook bridging wagmi wallet state with LeetGaming platform
 *
 * Provides:
 *  - Current wallet address and chain
 *  - Native + USDC token balances (on-chain)
 *  - Contract read helpers (ScoreOracle, LeetVault)
 *  - Link wallet to platform account (via backend API)
 */

import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import { formatUnits, type Address } from "viem";
import { getContractAddresses, DEFAULT_CHAIN } from "@/config/web3";
import { SCORE_ORACLE_ABI } from "@/lib/contracts/score-oracle-abi";
import { LEET_VAULT_ABI } from "@/lib/contracts/leet-vault-abi";

// Well-known USDC addresses per chain
const USDC_ADDRESSES: Record<number, Address> = {
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon USDC
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
  80002: "0x41E94Eb71898E8A6f6873d1585b20eBbeaD3eB68", // Amoy test USDC (mock)
};

export interface Web3WalletState {
  // Connection state
  address: Address | undefined;
  isConnected: boolean;
  chainId: number;
  chainName: string | undefined;

  // Balances
  nativeBalance: string;
  nativeSymbol: string;
  usdcBalance: string;
  isLoadingBalances: boolean;

  // Contract state
  contractAddresses: ReturnType<typeof getContractAddresses>;

  // On-chain score lookup
  lookupScore: (oracleResultId: `0x${string}`) => {
    teamAScore: number | undefined;
    teamBScore: number | undefined;
    finalized: boolean | undefined;
    isLoading: boolean;
  };

  // On-chain prize pool lookup
  lookupPrizePool: (matchId: `0x${string}`) => {
    totalAmount: bigint | undefined;
    status: number | undefined;
    isLoading: boolean;
  };
}

/**
 * Hook providing Web3 wallet state and on-chain read capabilities.
 *
 * Usage:
 * ```tsx
 * const { address, isConnected, nativeBalance, usdcBalance, lookupScore } = useWeb3Wallet();
 * ```
 */
export function useWeb3Wallet(): Web3WalletState {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();

  // Native balance (MATIC/ETH)
  const { data: nativeBalanceData, isLoading: isLoadingNative } = useBalance({
    address,
    query: {
      enabled: isConnected,
      refetchInterval: 30_000,
    },
  });

  // USDC balance
  const usdcAddress = USDC_ADDRESSES[chainId];
  const { data: usdcBalanceData, isLoading: isLoadingUsdc } = useBalance({
    address,
    token: usdcAddress,
    query: {
      enabled: isConnected && !!usdcAddress,
      refetchInterval: 30_000,
    },
  });

  const contractAddresses = getContractAddresses(chainId);

  // Format balances
  const nativeBalance = nativeBalanceData
    ? formatUnits(nativeBalanceData.value, nativeBalanceData.decimals)
    : "0";
  const nativeSymbol = nativeBalanceData?.symbol ?? chain?.nativeCurrency?.symbol ?? "ETH";
  const usdcBalance = usdcBalanceData
    ? formatUnits(usdcBalanceData.value, usdcBalanceData.decimals)
    : "0";

  // --- On-chain score lookup ---
  function lookupScore(oracleResultId: `0x${string}`) {
    const scoreOracleAddr = contractAddresses?.scoreOracle;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useReadContract({
      address: scoreOracleAddr as Address,
      abi: SCORE_ORACLE_ABI,
      functionName: "scores",
      args: [oracleResultId],
      query: {
        enabled:
          !!scoreOracleAddr &&
          scoreOracleAddr !== "0x0000000000000000000000000000000000000000",
      },
    });

    if (!data) {
      return {
        teamAScore: undefined,
        teamBScore: undefined,
        finalized: undefined,
        isLoading,
      };
    }

    // ScoreOracle.scores returns MatchScore struct
    const result = data as readonly [
      `0x${string}`, // externalMatchId
      `0x${string}`, // teamAId
      `0x${string}`, // teamBId
      number, // teamAScore
      number, // teamBScore
      `0x${string}`, // winnerId
      boolean, // isDraw
      number, // roundsPlayed
      string, // gameId
      `0x${string}`, // sourceHash
      bigint, // publishedAt
      boolean, // finalized
      boolean, // disputed
    ];

    return {
      teamAScore: result[3],
      teamBScore: result[4],
      finalized: result[11],
      isLoading,
    };
  }

  // --- On-chain prize pool lookup ---
  function lookupPrizePool(matchId: `0x${string}`) {
    const leetVaultAddr = contractAddresses?.leetVault;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useReadContract({
      address: leetVaultAddr as Address,
      abi: LEET_VAULT_ABI,
      functionName: "prizePools",
      args: [matchId],
      query: {
        enabled:
          !!leetVaultAddr &&
          leetVaultAddr !== "0x0000000000000000000000000000000000000000",
      },
    });

    if (!data) {
      return { totalAmount: undefined, status: undefined, isLoading };
    }

    // LeetVault.prizePools returns PrizePool struct (partial — mappings excluded)
    const result = data as readonly [
      `0x${string}`, // matchId
      Address, // token
      bigint, // totalAmount
      bigint, // platformContribution
      bigint, // entryFeePerPlayer
      bigint, // platformFeePercent
      bigint, // createdAt
      bigint, // lockedAt
      bigint, // escrowEndTime
      number, // status
    ];

    return {
      totalAmount: result[2],
      status: result[9],
      isLoading,
    };
  }

  return {
    address,
    isConnected,
    chainId,
    chainName: chain?.name,
    nativeBalance,
    nativeSymbol,
    usdcBalance,
    isLoadingBalances: isLoadingNative || isLoadingUsdc,
    contractAddresses,
    lookupScore,
    lookupPrizePool,
  };
}
