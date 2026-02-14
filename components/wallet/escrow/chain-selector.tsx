"use client";

/**
 * Chain Selector Component
 * Multi-chain wallet selector supporting EVM and Solana
 * Displays balances per chain with animated transitions
 * Features award-winning LeetGaming branding
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  Badge,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";
import type { WalletChainAddress } from "@/types/replay-api/escrow-wallet.types";
import { getChainIcon } from "@/types/replay-api/escrow-wallet.types";
import type { ChainID } from "@/types/replay-api/blockchain.types";
import { CHAIN_CONFIGS } from "@/types/replay-api/blockchain.types";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface ChainSelectorProps {
  addresses: WalletChainAddress[];
  selectedChain?: ChainID;
  onSelectChain?: (chainId: ChainID) => void;
  onAddChain?: () => void;
  onCopyAddress?: (address: string) => void;
  isLoading?: boolean;
  showTestnets?: boolean;
  compact?: boolean;
  className?: string;
}

// Chain category groupings
const CHAIN_CATEGORIES = {
  "Layer 1": ["eip155:1", "solana:mainnet"],
  "Layer 2": ["eip155:137", "eip155:8453", "eip155:42161", "eip155:10"],
  Testnets: [
    "eip155:11155111",
    "eip155:80001",
    "eip155:84532",
    "solana:devnet",
  ],
};

// Chain badge colors
const getChainColor = (chainId: ChainID): string => {
  const colors: Partial<Record<ChainID, string>> = {
    "solana:mainnet": "bg-gradient-to-r from-purple-500 to-purple-600",
    "solana:devnet": "bg-gradient-to-r from-purple-400 to-purple-500",
    "eip155:1": "bg-gradient-to-r from-blue-500 to-indigo-600",
    "eip155:137": "bg-gradient-to-r from-purple-500 to-violet-600",
    "eip155:8453": "bg-gradient-to-r from-blue-500 to-blue-600",
    "eip155:42161": "bg-gradient-to-r from-blue-400 to-cyan-500",
    "eip155:10": "bg-gradient-to-r from-red-500 to-red-600",
    "eip155:56": "bg-gradient-to-r from-yellow-400 to-yellow-500",
  };
  return colors[chainId] || "bg-gradient-to-r from-gray-500 to-gray-600";
};

// Chain card component
function ChainCard({
  address,
  isSelected,
  onSelect,
  onCopy,
}: {
  address: WalletChainAddress;
  isSelected: boolean;
  onSelect: () => void;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const config = CHAIN_CONFIGS[address.chain_id];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const totalUsdValue = useMemo(() => {
    if (!address.balance) return 0;
    const nativeUsd = address.balance.native.dollars || 0;
    const tokensUsd =
      address.balance.tokens?.reduce(
        (sum, t) => sum + (t.usd_value?.dollars || 0),
        0,
      ) || 0;
    return nativeUsd + tokensUsd;
  }, [address.balance]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        isPressable
        onPress={onSelect}
        className={cn(
          "rounded-none border-2 transition-all duration-200",
          isSelected
            ? "border-[#DCFF37] dark:border-[#DCFF37] bg-[#DCFF37]/10 dark:bg-[#DCFF37]/10"
            : "border-[#34445C]/20 dark:border-[#DCFF37]/20 bg-white/50 dark:bg-black/20 hover:border-[#DCFF37]/50",
        )}
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
        }}
      >
        <CardBody className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Chain Icon with Badge */}
              <Badge
                content={
                  <Icon
                    icon={
                      address.is_smart_wallet ? "solar:verified-check-bold" : ""
                    }
                    className="w-2 h-2"
                  />
                }
                color="success"
                size="sm"
                isInvisible={!address.is_smart_wallet}
                placement="bottom-right"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    getChainColor(address.chain_id),
                  )}
                >
                  <Icon
                    icon={getChainIcon(address.chain_id)}
                    className="w-5 h-5 text-white"
                  />
                </div>
              </Badge>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#34445C] dark:text-white">
                    {config?.name || address.chain_id}
                  </span>
                  {isSelected && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="secondary"
                      className="rounded-none h-5 text-xs"
                    >
                      Active
                    </Chip>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <code className="text-xs text-default-500">
                    {formatAddress(address.address)}
                  </code>
                  <Tooltip content={copied ? "Copied!" : "Copy address"}>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="min-w-5 w-5 h-5"
                      onPress={handleCopy}
                    >
                      <Icon
                        icon={
                          copied ? "solar:check-circle-bold" : "solar:copy-bold"
                        }
                        className={copied ? "text-success" : "text-default-400"}
                        width={12}
                      />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Balance Display */}
            <div className="text-right">
              <p className="font-bold text-sm text-[#34445C] dark:text-white">
                <AnimatedCounter
                  value={totalUsdValue}
                  prefix="$"
                  decimals={2}
                />
              </p>
              {address.balance && (
                <p className="text-xs text-default-500">
                  {address.balance.native.dollars.toFixed(4)}{" "}
                  {address.balance.native_symbol}
                </p>
              )}
            </div>
          </div>

          {/* Token List (if expanded or selected) */}
          <AnimatePresence>
            {isSelected &&
              address.balance?.tokens &&
              address.balance.tokens.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-[#34445C]/10 dark:border-[#DCFF37]/10"
                >
                  <div className="space-y-2">
                    {address.balance.tokens.slice(0, 3).map((token) => (
                      <div
                        key={token.symbol}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {token.logo_uri ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={token.logo_uri}
                              alt={token.symbol}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-default-200 flex items-center justify-center">
                              <Icon
                                icon="solar:dollar-bold"
                                width={12}
                                className="text-default-500"
                              />
                            </div>
                          )}
                          <span className="text-xs text-default-600">
                            {token.symbol}
                          </span>
                        </div>
                        <span className="text-xs text-default-500">
                          {token.balance.dollars.toFixed(2)} ($
                          {token.usd_value?.dollars.toFixed(2)})
                        </span>
                      </div>
                    ))}
                    {address.balance.tokens.length > 3 && (
                      <Button
                        size="sm"
                        variant="light"
                        className="w-full text-xs h-6"
                        endContent={
                          <Icon icon="solar:alt-arrow-right-bold" width={12} />
                        }
                      >
                        +{address.balance.tokens.length - 3} more tokens
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Main Chain Selector
export function ChainSelector({
  addresses,
  selectedChain,
  onSelectChain,
  onAddChain,
  onCopyAddress,
  isLoading = false,
  showTestnets = false,
  compact = false,
  className,
}: ChainSelectorProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter chains based on testnet visibility
  const filteredAddresses = useMemo(() => {
    return addresses.filter((addr) => {
      const config = CHAIN_CONFIGS[addr.chain_id];
      if (!showTestnets && config?.is_testnet) return false;
      return true;
    });
  }, [addresses, showTestnets]);

  // Calculate total balance across all chains
  const totalBalance = useMemo(() => {
    return filteredAddresses.reduce((total, addr) => {
      if (!addr.balance) return total;
      const nativeUsd = addr.balance.native.dollars || 0;
      const tokensUsd =
        addr.balance.tokens?.reduce(
          (sum, t) => sum + (t.usd_value?.dollars || 0),
          0,
        ) || 0;
      return total + nativeUsd + tokensUsd;
    }, 0);
  }, [filteredAddresses]);

  // Group addresses by category
  const groupedAddresses = useMemo(() => {
    const groups: Record<string, WalletChainAddress[]> = {};

    for (const addr of filteredAddresses) {
      let category = "Other";
      for (const [cat, chains] of Object.entries(CHAIN_CATEGORIES)) {
        if (chains.includes(addr.chain_id)) {
          category = cat;
          break;
        }
      }
      if (!groups[category]) groups[category] = [];
      groups[category].push(addr);
    }

    return groups;
  }, [filteredAddresses]);

  if (isLoading) {
    return (
      <Card className={cn("rounded-none", className)}>
        <CardBody className="gap-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-[#34445C]/5 to-[#FF4654]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/10",
        "border-2 border-[#34445C]/20 dark:border-[#DCFF37]/20 rounded-none overflow-hidden",
        className,
      )}
      style={{
        clipPath: compact
          ? "none"
          : "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
      }}
    >
      {/* Header */}
      <CardHeader className="flex items-center justify-between bg-[#34445C]/5 dark:bg-[#DCFF37]/5 pb-3">
        <div className="flex items-center gap-2">
          <Icon
            icon="solar:planet-bold-duotone"
            width={24}
            className="text-[#FF4654] dark:text-[#DCFF37]"
          />
          <span className="font-semibold text-[#34445C] dark:text-white">
            Connected Chains
          </span>
          <Chip size="sm" variant="flat" className="rounded-none">
            {filteredAddresses.length}
          </Chip>
        </div>

        <div className="flex items-center gap-2">
          {/* Total Balance */}
          <div className="text-right mr-2">
            <p className="text-xs text-default-500">Total Value</p>
            <p className="font-bold text-[#34445C] dark:text-white">
              <AnimatedCounter value={totalBalance} prefix="$" decimals={2} />
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-default-100 rounded-lg p-0.5">
            <Button
              isIconOnly
              size="sm"
              variant={viewMode === "grid" ? "solid" : "light"}
              className="rounded-lg"
              onPress={() => setViewMode("grid")}
            >
              <Icon icon="solar:widget-bold" width={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant={viewMode === "list" ? "solid" : "light"}
              className="rounded-lg"
              onPress={() => setViewMode("list")}
            >
              <Icon icon="solar:list-bold" width={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="gap-4">
        {/* Chain Dropdown for Quick Select */}
        <div className="flex items-center gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="rounded-none flex-1 justify-between border-[#34445C]/30 dark:border-[#DCFF37]/30"
                endContent={
                  <Icon icon="solar:alt-arrow-down-bold" width={16} />
                }
              >
                {selectedChain ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center",
                        getChainColor(selectedChain),
                      )}
                    >
                      <Icon
                        icon={getChainIcon(selectedChain)}
                        className="w-3 h-3 text-white"
                      />
                    </div>
                    <span>
                      {CHAIN_CONFIGS[selectedChain]?.name || selectedChain}
                    </span>
                  </div>
                ) : (
                  "Select Chain"
                )}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Select chain"
              selectionMode="single"
              selectedKeys={
                selectedChain ? new Set([selectedChain]) : new Set()
              }
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as ChainID;
                onSelectChain?.(selected);
              }}
            >
              {filteredAddresses.map((addr) => {
                const config = CHAIN_CONFIGS[addr.chain_id];
                return (
                  <DropdownItem
                    key={addr.chain_id}
                    startContent={
                      <div
                        className={cn(
                          "w-5 h-5 rounded flex items-center justify-center",
                          getChainColor(addr.chain_id),
                        )}
                      >
                        <Icon
                          icon={getChainIcon(addr.chain_id)}
                          className="w-3 h-3 text-white"
                        />
                      </div>
                    }
                    description={config?.is_testnet ? "Testnet" : undefined}
                  >
                    {config?.name || addr.chain_id}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>

          <Button
            isIconOnly
            variant="flat"
            className="rounded-none"
            onPress={onAddChain}
          >
            <Icon icon="solar:add-circle-bold" width={20} />
          </Button>
        </div>

        {/* Chain Cards */}
        <AnimatePresence mode="wait">
          {Object.entries(groupedAddresses).map(([category, addrs]) => (
            <div key={category}>
              <p className="text-xs text-default-500 uppercase tracking-wider mb-2 px-1">
                {category}
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "gap-3",
                  viewMode === "grid" ? "grid grid-cols-2" : "flex flex-col",
                )}
              >
                {addrs.map((addr) => (
                  <ChainCard
                    key={addr.chain_id}
                    address={addr}
                    isSelected={selectedChain === addr.chain_id}
                    onSelect={() => onSelectChain?.(addr.chain_id)}
                    onCopy={() => onCopyAddress?.(addr.address)}
                  />
                ))}
              </motion.div>
            </div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filteredAddresses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon
              icon="solar:planet-bold-duotone"
              width={48}
              className="text-default-300 mb-4"
            />
            <p className="text-default-500">No chains connected</p>
            <p className="text-sm text-default-400 mt-1">
              Add a blockchain to get started
            </p>
            <Button
              color="primary"
              variant="flat"
              className="mt-4 rounded-none"
              startContent={<Icon icon="solar:add-circle-bold" width={18} />}
              onPress={onAddChain}
            >
              Connect Chain
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default ChainSelector;
