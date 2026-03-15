/**
 * ScoreOracle contract ABI (read-only subset)
 *
 * Source: replay-api/contracts/ScoreOracle.sol
 * Deployed on: Polygon Amoy (chainId 80002)
 *
 * Only includes view/pure functions needed by the frontend:
 *  - scores(bytes32) → MatchScore struct
 *  - totalPublished() → uint256
 *  - totalFinalized() → uint256
 *  - disputeWindowSeconds() → uint256
 */
export const SCORE_ORACLE_ABI = [
  {
    inputs: [{ name: "oracleResultId", type: "bytes32" }],
    name: "scores",
    outputs: [
      { name: "externalMatchId", type: "bytes32" },
      { name: "teamAId", type: "bytes32" },
      { name: "teamBId", type: "bytes32" },
      { name: "teamAScore", type: "uint16" },
      { name: "teamBScore", type: "uint16" },
      { name: "winnerId", type: "bytes32" },
      { name: "isDraw", type: "bool" },
      { name: "roundsPlayed", type: "uint32" },
      { name: "gameId", type: "string" },
      { name: "sourceHash", type: "bytes32" },
      { name: "publishedAt", type: "uint256" },
      { name: "finalized", type: "bool" },
      { name: "disputed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalPublished",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalFinalized",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "disputeWindowSeconds",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "publishedIds",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "publishers",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // Events (for log filtering)
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "oracleResultId", type: "bytes32" },
      { indexed: true, name: "externalMatchId", type: "bytes32" },
      { indexed: false, name: "teamAScore", type: "uint16" },
      { indexed: false, name: "teamBScore", type: "uint16" },
      { indexed: false, name: "gameId", type: "string" },
      { indexed: false, name: "publishedAt", type: "uint256" },
    ],
    name: "ScorePublished",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "oracleResultId", type: "bytes32" },
      { indexed: false, name: "finalizedAt", type: "uint256" },
    ],
    name: "ScoreFinalized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "oracleResultId", type: "bytes32" },
      { indexed: true, name: "disputedBy", type: "address" },
      { indexed: false, name: "reason", type: "string" },
      { indexed: false, name: "disputedAt", type: "uint256" },
    ],
    name: "ScoreDisputed",
    type: "event",
  },
] as const;
