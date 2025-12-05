'use client';

/**
 * Profile Step
 * Set up user profile information
 */

import React, { useState } from 'react';
import {
  Input,
  Textarea,
  Button,
  Avatar,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useOnboarding } from '../onboarding-context';

const COUNTRIES = [
  { key: 'US', label: 'United States' },
  { key: 'CA', label: 'Canada' },
  { key: 'BR', label: 'Brazil' },
  { key: 'GB', label: 'United Kingdom' },
  { key: 'DE', label: 'Germany' },
  { key: 'FR', label: 'France' },
  { key: 'ES', label: 'Spain' },
  { key: 'PT', label: 'Portugal' },
  { key: 'SE', label: 'Sweden' },
  { key: 'DK', label: 'Denmark' },
  { key: 'PL', label: 'Poland' },
  { key: 'RU', label: 'Russia' },
  { key: 'AU', label: 'Australia' },
  { key: 'JP', label: 'Japan' },
  { key: 'KR', label: 'South Korea' },
  { key: 'CN', label: 'China' },
];

export function ProfileStep() {
  const { state, updateProfile, goToNextStep, skipStep } = useOnboarding();
  const [isValid, setIsValid] = useState(false);

  const handleDisplayNameChange = (value: string) => {
    updateProfile({ displayName: value });
    setIsValid(value.length >= 3);
  };

  const handleSubmit = () => {
    if (state.profile.displayName.length >= 3) {
      goToNextStep();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Set Up Your Profile</h2>
        <p className="text-default-500">
          Tell us a bit about yourself
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Avatar
            src={state.profile.avatarUrl}
            className="w-24 h-24"
            showFallback
            fallback={
              <Icon icon="solar:user-bold" className="w-12 h-12 text-default-400" />
            }
          />
          <Button
            isIconOnly
            size="sm"
            color="primary"
            className="absolute bottom-0 right-0"
            radius="full"
          >
            <Icon icon="solar:camera-bold" width={16} />
          </Button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <Input
          label="Display Name"
          placeholder="Enter your gamer tag"
          description="This is how other players will see you"
          value={state.profile.displayName}
          onValueChange={handleDisplayNameChange}
          startContent={<Icon icon="solar:user-bold" width={20} className="text-default-400" />}
          isRequired
          minLength={3}
          maxLength={20}
        />

        <Textarea
          label="Bio"
          placeholder="Tell other players about yourself..."
          description="Share your gaming interests and achievements"
          value={state.profile.bio}
          onValueChange={(value) => updateProfile({ bio: value })}
          maxLength={200}
          minRows={2}
          maxRows={4}
        />

        <Select
          label="Country"
          placeholder="Select your country"
          selectedKeys={state.profile.country ? [state.profile.country] : []}
          onChange={(e) => updateProfile({ country: e.target.value })}
          startContent={<Icon icon="solar:global-bold" width={20} className="text-default-400" />}
        >
          {COUNTRIES.map((country) => (
            <SelectItem key={country.key} value={country.key}>
              {country.label}
            </SelectItem>
          ))}
        </Select>
      </div>

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
          onPress={handleSubmit}
          isDisabled={!isValid}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
