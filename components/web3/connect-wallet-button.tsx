"use client";

/**
 * ConnectWalletButton — RainbowKit-powered wallet connection button
 *
 * Renders a branded connect button that opens the RainbowKit modal.
 * Supports MetaMask, WalletConnect, Coinbase Wallet, and other injected wallets.
 *
 * States:
 *  - Disconnected: Shows "Connect Wallet" with wallet icon
 *  - Connected: Shows truncated address + chain badge + balance
 *  - Wrong chain: Shows chain switch prompt
 */

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button, Chip, Avatar } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { isWeb3Enabled } from "@/config/web3";

interface ConnectWalletButtonProps {
  /** Compact mode for navbar/header placement */
  compact?: boolean;
  /** Show balance alongside address */
  showBalance?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function ConnectWalletButton({
  compact = false,
  showBalance = true,
  className = "",
}: ConnectWalletButtonProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isWeb3Enabled()) {
    return null;
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!ready) {
          return (
            <div
              className={className}
              aria-hidden="true"
              style={{
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          );
        }

        // --- Not Connected ---
        if (!connected) {
          return (
            <Button
              className={`${className} font-medium`}
              color="secondary"
              variant={compact ? "flat" : "shadow"}
              size={compact ? "sm" : "md"}
              startContent={
                <Icon icon="solar:wallet-bold" width={compact ? 16 : 20} />
              }
              onPress={openConnectModal}
            >
              {compact ? "Connect" : "Connect Wallet"}
            </Button>
          );
        }

        // --- Wrong Chain ---
        if (chain.unsupported) {
          return (
            <Button
              className={className}
              color="danger"
              variant="flat"
              size={compact ? "sm" : "md"}
              startContent={<Icon icon="solar:danger-triangle-bold" width={18} />}
              onPress={openChainModal}
            >
              Wrong Network
            </Button>
          );
        }

        // --- Connected ---
        return (
          <div className={`flex items-center gap-2 ${className}`}>
            {/* Chain indicator */}
            {!compact && (
              <Chip
                as="button"
                variant="flat"
                color="default"
                size="sm"
                className="cursor-pointer hover:bg-default-200 transition-colors"
                startContent={
                  chain.hasIcon ? (
                    <Avatar
                      src={chain.iconUrl}
                      alt={chain.name ?? "Chain icon"}
                      className="w-4 h-4"
                      size="sm"
                    />
                  ) : (
                    <Icon icon="solar:planet-bold" width={14} />
                  )
                }
                onClick={openChainModal}
              >
                {chain.name}
              </Chip>
            )}

            {/* Account button */}
            <Button
              className="font-mono text-sm"
              color="default"
              variant="bordered"
              size={compact ? "sm" : "md"}
              startContent={
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              }
              endContent={
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  width={14}
                  className="text-default-400"
                />
              }
              onPress={openAccountModal}
            >
              {showBalance && account.displayBalance
                ? `${account.displayBalance} • `
                : ""}
              {account.displayName}
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
