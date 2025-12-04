'use client';

/**
 * Connect Accounts Step
 * Link gaming and social accounts
 */

import React, { useState } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useOnboarding } from '../onboarding-context';
import { signIn } from 'next-auth/react';

const ACCOUNTS = [
  {
    id: 'steam',
    name: 'Steam',
    icon: 'simple-icons:steam',
    color: '#1B2838',
    description: 'Import your gaming stats and achievements',
    recommended: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'simple-icons:discord',
    color: '#5865F2',
    description: 'Connect with teammates and communities',
    recommended: false,
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: 'simple-icons:twitch',
    color: '#9146FF',
    description: 'Share your streams and clips',
    recommended: false,
  },
];

export function ConnectAccountsStep() {
  const { state, updateConnectedAccounts, goToNextStep, skipStep } = useOnboarding();
  const { connectedAccounts } = state;
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (accountId: string) => {
    setConnecting(accountId);
    try {
      // Trigger OAuth flow
      await signIn(accountId, { redirect: false });
      // Note: In production, this would be handled by the OAuth callback
    } catch (error) {
      console.error(`Failed to connect ${accountId}:`, error);
    } finally {
      setConnecting(null);
    }
  };

  const isConnected = (accountId: string) => {
    return !!connectedAccounts[accountId as keyof typeof connectedAccounts];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Connect Your Accounts</h2>
        <p className="text-default-500">
          Link your gaming accounts for the best experience
        </p>
      </div>

      {/* Benefits */}
      <div className="p-4 bg-primary/10 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <Icon icon="solar:info-circle-bold" className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-primary mb-1">Why connect accounts?</p>
            <ul className="text-sm text-default-600 space-y-1">
              <li>• Automatically import your stats and history</li>
              <li>• Verify your identity and skill level</li>
              <li>• Easy login and team invitations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="space-y-3">
        {ACCOUNTS.map((account) => {
          const connected = isConnected(account.id);
          const isConnecting = connecting === account.id;

          return (
            <div
              key={account.id}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${connected ? 'border-success bg-success/10' : 'border-default-200'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: account.color }}
                  >
                    <Icon icon={account.icon} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{account.name}</span>
                      {account.recommended && (
                        <Chip size="sm" color="primary" variant="flat">
                          Recommended
                        </Chip>
                      )}
                    </div>
                    <p className="text-xs text-default-500">{account.description}</p>
                  </div>
                </div>

                {connected ? (
                  <div className="flex items-center gap-2 text-success">
                    <Icon icon="solar:check-circle-bold" width={20} />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    isLoading={isConnecting}
                    onPress={() => handleConnect(account.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Steam Connection Notice */}
      {!connectedAccounts.steam && (
        <div className="p-3 bg-warning/10 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon icon="solar:danger-triangle-bold" className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-warning-600">
              Connecting Steam is highly recommended for CS2/Valorant players to import your match history and stats.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="flat"
          className="flex-1"
          onPress={skipStep}
        >
          Skip for Now
        </Button>
        <Button
          color="primary"
          className="flex-1"
          endContent={<Icon icon="solar:arrow-right-linear" width={18} />}
          onPress={goToNextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
