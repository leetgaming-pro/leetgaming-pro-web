/**
 * LeetVault contract ABI (read-only subset)
 *
 * Source: replay-api/test/blockchain/contracts/LeetVault.sol
 * Prize pool management: entry fees, escrow, distribution
 *
 * Only includes view/pure functions needed by the frontend:
 *  - prizePools(bytes32) → PrizePool struct
 *  - userBalances(address, address) → uint256
 *  - supportedTokens(address) → bool
 *  - escrowPeriod() → uint256
 *  - treasury() → address
 *
 * Also includes user-callable functions:
 *  - depositEntryFee(bytes32) — player joins match
 *  - withdraw(address, uint256) — player withdraws winnings
 */
export const LEET_VAULT_ABI = [
  // --- View Functions ---
  {
    inputs: [{ name: "matchId", type: "bytes32" }],
    name: "prizePools",
    outputs: [
      { name: "matchId", type: "bytes32" },
      { name: "token", type: "address" },
      { name: "totalAmount", type: "uint256" },
      { name: "platformContribution", type: "uint256" },
      { name: "entryFeePerPlayer", type: "uint256" },
      { name: "platformFeePercent", type: "uint256" },
      { name: "createdAt", type: "uint256" },
      { name: "lockedAt", type: "uint256" },
      { name: "escrowEndTime", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
    ],
    name: "userBalances",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "token", type: "address" }],
    name: "supportedTokens",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "escrowPeriod",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformContributionPerMatch",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // --- User Functions ---
  {
    inputs: [{ name: "matchId", type: "bytes32" }],
    name: "depositEntryFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // --- Events ---
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "matchId", type: "bytes32" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "entryFee", type: "uint256" },
      { indexed: false, name: "platformFee", type: "uint256" },
    ],
    name: "PrizePoolCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "matchId", type: "bytes32" },
      { indexed: true, name: "player", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "EntryFeeDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "matchId", type: "bytes32" },
      { indexed: false, name: "totalAmount", type: "uint256" },
    ],
    name: "PrizePoolLocked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "matchId", type: "bytes32" },
      { indexed: true, name: "winner", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "rank", type: "uint8" },
    ],
    name: "PrizeDistributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "matchId", type: "bytes32" },
    ],
    name: "PrizePoolCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "matchId", type: "bytes32" },
      { indexed: true, name: "player", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "RefundIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "UserWithdrawal",
    type: "event",
  },
] as const;
