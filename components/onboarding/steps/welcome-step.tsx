'use client';

/**
 * Welcome Step
 * First step of onboarding - introduces the platform
 */

import React from 'react';
import { Button, Divider } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useOnboarding } from '../onboarding-context';

const FEATURES = [
  {
    icon: 'solar:cloud-upload-bold',
    title: 'Upload & Analyze',
    description: 'Upload your replay files for AI-powered analysis',
  },
  {
    icon: 'solar:chart-2-bold',
    title: 'Track Progress',
    description: 'Monitor your stats and improve over time',
  },
  {
    icon: 'solar:users-group-rounded-bold',
    title: 'Find Your Team',
    description: 'Connect with players and build your squad',
  },
  {
    icon: 'solar:cup-star-bold',
    title: 'Compete',
    description: 'Join tournaments and climb the leaderboards',
  },
];

export function WelcomeStep() {
  const { goToNextStep } = useOnboarding();

  return (
    <div className="text-center">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Icon icon="solar:gamepad-bold" className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to LeetGaming</h1>
        <p className="text-default-500 text-lg">
          Your journey to competitive gaming greatness starts here
        </p>
      </div>

      <Divider className="my-6" />

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="p-4 rounded-lg bg-default-50 text-left"
          >
            <Icon
              icon={feature.icon}
              className="w-8 h-8 text-primary mb-2"
            />
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-xs text-default-500">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <Button
          color="primary"
          size="lg"
          className="w-full"
          endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
          onPress={goToNextStep}
        >
          Get Started
        </Button>
        <p className="text-xs text-default-400">
          Takes about 2 minutes to complete
        </p>
      </div>
    </div>
  );
}
