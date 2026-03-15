"use client";

/**
 * OnChainBadge — Visual indicator that a score/match result is verified on-chain
 *
 * Reads from ScoreOracle to display verification status:
 *  - Published (pending finalization)
 *  - Finalized (fully verified, dispute window passed)
 *  - Disputed (challenged by a participant)
 *  - Not published (no on-chain record)
 *
 * Used on match detail pages, score cards, and tournament results.
 */

import React from "react";
import { Chip, Tooltip, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useReadContract, useChainId } from "wagmi";
import { type Address } from "viem";
import { SCORE_ORACLE_ABI } from "@/lib/contracts/score-oracle-abi";
import { getContractAddresses } from "@/config/web3";

interface OnChainBadgeProps {
  /** Oracle result ID (bytes32 hex) used to look up the on-chain score */
  oracleResultId: `0x${string}`;
  /** Compact mode — just an icon, no text */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

type VerificationStatus = "finalized" | "published" | "disputed" | "not-found" | "loading" | "no-contract";

const STATUS_CONFIG: Record<
  Exclude<VerificationStatus, "loading" | "no-contract">,
  {
    label: string;
    icon: string;
    color: "success" | "warning" | "danger" | "default";
    tooltip: string;
  }
> = {
  finalized: {
    label: "On-Chain Verified",
    icon: "solar:verified-check-bold",
    color: "success",
    tooltip: "This score has been published and finalized on the blockchain. Dispute window has passed.",
  },
  published: {
    label: "On-Chain",
    icon: "solar:shield-check-bold",
    color: "warning",
    tooltip: "This score has been published on-chain but is still within the dispute window.",
  },
  disputed: {
    label: "Disputed",
    icon: "solar:danger-triangle-bold",
    color: "danger",
    tooltip: "This on-chain score has been disputed and is under review.",
  },
  "not-found": {
    label: "Off-Chain",
    icon: "solar:cloud-bold",
    color: "default",
    tooltip: "This score has not been published to the blockchain yet.",
  },
};

export function OnChainBadge({
  oracleResultId,
  compact = false,
  className = "",
}: OnChainBadgeProps) {
  const chainId = useChainId();
  const contractAddresses = getContractAddresses(chainId);
  const scoreOracleAddr = contractAddresses?.scoreOracle;

  const hasContract =
    !!scoreOracleAddr &&
    scoreOracleAddr !== "0x0000000000000000000000000000000000000000";

  const { data, isLoading, isError } = useReadContract({
    address: scoreOracleAddr as Address,
    abi: SCORE_ORACLE_ABI,
    functionName: "scores",
    args: [oracleResultId],
    query: {
      enabled: hasContract,
      staleTime: 60_000,
    },
  });

  // Determine status
  let status: VerificationStatus;

  if (!hasContract) {
    status = "no-contract";
  } else if (isLoading) {
    status = "loading";
  } else if (isError || !data) {
    status = "not-found";
  } else {
    const result = data as readonly [
      `0x${string}`, `0x${string}`, `0x${string}`,
      number, number, `0x${string}`,
      boolean, number, string, `0x${string}`,
      bigint, boolean, boolean,
    ];

    const publishedAt = result[10];
    const finalized = result[11];
    const disputed = result[12];

    if (publishedAt === BigInt(0)) {
      status = "not-found";
    } else if (disputed) {
      status = "disputed";
    } else if (finalized) {
      status = "finalized";
    } else {
      status = "published";
    }
  }

  // No contract configured — don't render anything
  if (status === "no-contract") return null;

  // Loading state
  if (status === "loading") {
    return compact ? (
      <Spinner size="sm" />
    ) : (
      <Chip size="sm" variant="flat" className={className}>
        <Spinner size="sm" />
      </Chip>
    );
  }

  const config = STATUS_CONFIG[status];

  if (compact) {
    return (
      <Tooltip content={config.tooltip} delay={300}>
        <span className={`inline-flex items-center ${className}`}>
          <Icon
            icon={config.icon}
            width={18}
            className={`text-${config.color}`}
          />
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={config.tooltip} delay={300}>
      <Chip
        size="sm"
        color={config.color}
        variant="flat"
        startContent={<Icon icon={config.icon} width={14} />}
        className={`cursor-help ${className}`}
      >
        {config.label}
      </Chip>
    </Tooltip>
  );
}
