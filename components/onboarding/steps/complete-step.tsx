'use client';

/**
 * Complete Step
 * Onboarding completion celebration
 */

import React, { useEffect, useState } from 'react';
import { Button, Divider } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '../onboarding-context';
import { GAME_INFO } from '../types';

const QUICK_ACTIONS = [
  {
    href: '/upload',
    icon: 'solar:cloud-upload-bold',
    title: 'Upload Replay',
    description: 'Start analyzing your gameplay',
    color: 'primary',
  },
  {
    href: '/teams',
    icon: 'solar:users-group-rounded-bold',
    title: 'Find Team',
    description: 'Connect with players',
    color: 'secondary',
  },
  {
    href: '/leaderboards',
    icon: 'solar:ranking-bold',
    title: 'Leaderboards',
    description: 'See top players',
    color: 'warning',
  },
  {
    href: '/tournaments',
    icon: 'solar:cup-star-bold',
    title: 'Tournaments',
    description: 'Compete and win',
    color: 'success',
  },
];

export function CompleteStep() {
  const router = useRouter();
  const { state } = useOnboarding();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const primaryGame = state.gamingPreferences.primaryGame
    ? GAME_INFO[state.gamingPreferences.primaryGame]
    : null;

  return (
    <div className="text-center space-y-6">
      {/* Success Animation */}
      <div className="relative">
        <div className={`
          w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-success to-primary
          flex items-center justify-center
          ${showConfetti ? 'animate-bounce' : ''}
        `}>
          <Icon icon="solar:check-circle-bold" className="w-12 h-12 text-white" />
        </div>

        {/* Confetti particles (CSS animation) */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{
                  backgroundColor: ['#7C3AED', '#EC4899', '#F59E0B', '#10B981'][i % 4],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Welcome Message */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          Welcome to LeetGaming, {state.profile.displayName || 'Player'}!
        </h2>
        <p className="text-default-500">
          Your account is all set up and ready to go
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 bg-default-50 rounded-lg text-left">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Icon icon="solar:document-text-bold" width={20} />
          Account Summary
        </h3>
        <div className="space-y-2 text-sm">
          {state.profile.displayName && (
            <div className="flex justify-between">
              <span className="text-default-500">Display Name</span>
              <span className="font-medium">{state.profile.displayName}</span>
            </div>
          )}
          {primaryGame && (
            <div className="flex justify-between">
              <span className="text-default-500">Primary Game</span>
              <span className="font-medium">{primaryGame.name}</span>
            </div>
          )}
          {state.selectedPlan && (
            <div className="flex justify-between">
              <span className="text-default-500">Plan</span>
              <span className="font-medium capitalize">
                {state.selectedPlan === 'free' ? 'Free' : `${state.selectedPlan} Plan`}
              </span>
            </div>
          )}
          {Object.keys(state.connectedAccounts).length > 0 && (
            <div className="flex justify-between">
              <span className="text-default-500">Connected Accounts</span>
              <span className="font-medium">
                {Object.keys(state.connectedAccounts).length} connected
              </span>
            </div>
          )}
        </div>
      </div>

      <Divider />

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold mb-3">What&apos;s Next?</h3>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              className="p-3 rounded-lg border border-default-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <Icon
                icon={action.icon}
                className={`w-6 h-6 mb-2 text-${action.color}`}
              />
              <p className="font-medium text-sm">{action.title}</p>
              <p className="text-xs text-default-500">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main CTA */}
      <Button
        color="primary"
        size="lg"
        className="w-full"
        endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
        onPress={() => router.push('/replays')}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
