'use client';

/**
 * Award-Winning Player Creation Modal
 * Multi-step form with excellent UX, validation, and visual feedback
 */

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Avatar,
  Chip,
  Progress,
  Card,
  CardBody,
  Autocomplete,
  AutocompleteItem,
  Divider,
  Switch,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import AvatarUploader from '@/components/avatar/avatar-uploader';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

interface PlayerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: any) => void;
}

const GAMES = [
  { id: 'cs2', name: 'Counter-Strike 2', icon: '🎮' },
  { id: 'valorant', name: 'Valorant', icon: '🎯' },
  { id: 'csgo', name: 'CS:GO', icon: '🔫' },
  { id: 'lol', name: 'League of Legends', icon: '⚔️' },
  { id: 'dota2', name: 'Dota 2', icon: '🏰' },
];

const ROLES = {
  cs2: ['AWPer', 'Entry Fragger', 'Support', 'In-Game Leader (IGL)', 'Lurker', 'Rifler'],
  valorant: ['Duelist', 'Controller', 'Initiator', 'Sentinel'],
  csgo: ['AWPer', 'Entry Fragger', 'Support', 'In-Game Leader (IGL)', 'Lurker', 'Rifler'],
  default: ['Player', 'Captain', 'Coach', 'Analyst'],
};

const RANKS = {
  cs2: ['Silver', 'Gold Nova', 'Master Guardian', 'Legendary Eagle', 'Supreme', 'Global Elite'],
  valorant: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'],
  default: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Pro'],
};

export function PlayerCreationModal({ isOpen, onClose, onSuccess }: PlayerCreationModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    game: '',
    displayName: '',
    slug: '',
    avatar: null as File | null,
    role: '',
    rank: '',
    bio: '',
    lookingForTeam: true,
    visibility: 'public',
    country: 'US',
    timezone: 'America/New_York',
    discordUsername: '',
    twitchUsername: '',
    twitterUsername: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Auto-generate slug from display name
  const handleDisplayNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      displayName: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.game) newErrors.game = 'Please select a game';
      if (!formData.displayName) newErrors.displayName = 'Display name is required';
      if (formData.displayName.length < 3) newErrors.displayName = 'Display name must be at least 3 characters';
      if (!formData.slug) newErrors.slug = 'URL slug is required';
    }

    if (currentStep === 2) {
      if (!formData.role) newErrors.role = 'Please select your role';
      if (!formData.bio || formData.bio.length < 20) newErrors.bio = 'Bio must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(totalSteps, prev + 1));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create player profile via SDK
      const profile = await sdk.playerProfiles.createPlayerProfile({
        game_id: formData.game,
        nickname: formData.displayName,
        slug_uri: formData.slug,
        roles: formData.role ? [formData.role] : undefined,
        description: formData.bio,
      });

      if (!profile) {
        throw new Error('Failed to create player profile');
      }

      logger.info('Player profile created successfully', {
        profileId: profile.id,
        nickname: formData.displayName
      });

      // Reset form
      setStep(1);
      setFormData({
        game: '',
        displayName: '',
        slug: '',
        avatar: null,
        role: '',
        rank: '',
        bio: '',
        lookingForTeam: true,
        visibility: 'public',
        country: 'US',
        timezone: 'America/New_York',
        discordUsername: '',
        twitchUsername: '',
        twitterUsername: '',
      });

      onSuccess?.(profile);
      onClose();

      // Navigate to the new profile
      router.push(`/players/${formData.slug}`);
    } catch (error: any) {
      logger.error('Failed to create player profile', error);
      setSubmitError(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedGame = GAMES.find(g => g.id === formData.game);
  const availableRoles = formData.game ? (ROLES[formData.game as keyof typeof ROLES] || ROLES.default) : ROLES.default;
  const availableRanks = formData.game ? (RANKS[formData.game as keyof typeof RANKS] || RANKS.default) : RANKS.default;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-background",
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon icon="solar:user-plus-bold-duotone" width={28} className="text-primary" />
                <h2 className="text-2xl font-bold">Create Player Profile</h2>
              </div>
              <p className="text-sm text-default-500 font-normal">
                {step === 1 && 'Let&apos;s start with the basics'}
                {step === 2 && 'Tell us about your playstyle'}
                {step === 3 && 'Final touches and social links'}
              </p>
              <Progress value={progress} className="mt-2" color="primary" size="sm" />
              <div className="flex justify-center gap-2 mt-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i + 1 === step ? 'bg-primary w-8' : i + 1 < step ? 'bg-success' : 'bg-default-300'
                    }`}
                  />
                ))}
              </div>
            </ModalHeader>

            <ModalBody className="py-6">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Game Selection */}
                    <div className="md:col-span-2">
                      <Select
                        label="Select Game"
                        placeholder="Choose your primary game"
                        selectedKeys={formData.game ? [formData.game] : []}
                        onSelectionChange={(keys) => {
                          const game = Array.from(keys)[0] as string;
                          setFormData(prev => ({ ...prev, game, role: '', rank: '' }));
                        }}
                        variant="bordered"
                        startContent={selectedGame && <span className="text-2xl">{selectedGame.icon}</span>}
                        isInvalid={!!errors.game}
                        errorMessage={errors.game}
                        classNames={{
                          trigger: "h-14",
                        }}
                      >
                        {GAMES.map((game) => (
                          <SelectItem
                            key={game.id}
                            value={game.id}
                            startContent={<span className="text-2xl">{game.icon}</span>}
                          >
                            {game.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex justify-center md:col-span-2">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-default-600 font-medium">Profile Avatar</p>
                        <AvatarUploader
                          onUpload={(file) => setFormData(prev => ({ ...prev, avatar: file }))}
                        />
                        <p className="text-xs text-default-400">Recommended: 400x400px, max 2MB</p>
                      </div>
                    </div>

                    {/* Display Name */}
                    <Input
                      label="Display Name"
                      placeholder="Your in-game name"
                      value={formData.displayName}
                      onValueChange={handleDisplayNameChange}
                      variant="bordered"
                      startContent={<Icon icon="solar:user-bold-duotone" className="text-default-400" />}
                      isInvalid={!!errors.displayName}
                      errorMessage={errors.displayName}
                      isRequired
                    />

                    {/* Profile URL */}
                    <Input
                      label="Profile URL"
                      placeholder="your-custom-url"
                      value={formData.slug}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, slug: value }))}
                      variant="bordered"
                      startContent={<span className="text-xs text-default-400">leetgaming.pro/players/</span>}
                      isInvalid={!!errors.slug}
                      errorMessage={errors.slug}
                      isRequired
                    />
                  </div>

                  <Card className="bg-primary-50/50">
                    <CardBody className="flex-row gap-3 items-start">
                      <Icon icon="solar:info-circle-bold-duotone" width={24} className="text-primary flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-primary mb-1">Profile Visibility</p>
                        <p className="text-default-600">
                          Your profile will be visible to teams and players. You can change this later in settings.
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              {/* Step 2: Gaming Info */}
              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role */}
                    <Autocomplete
                      label="Primary Role"
                      placeholder="Select your main role"
                      selectedKey={formData.role}
                      onSelectionChange={(key) => setFormData(prev => ({ ...prev, role: key as string }))}
                      variant="bordered"
                      startContent={<Icon icon="solar:star-bold-duotone" className="text-warning" />}
                      isInvalid={!!errors.role}
                      errorMessage={errors.role}
                      isRequired
                    >
                      {availableRoles.map((role) => (
                        <AutocompleteItem key={role} value={role}>
                          {role}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>

                    {/* Rank */}
                    <Select
                      label="Current Rank"
                      placeholder="Select your rank"
                      selectedKeys={formData.rank ? [formData.rank] : []}
                      onSelectionChange={(keys) => setFormData(prev => ({ ...prev, rank: Array.from(keys)[0] as string }))}
                      variant="bordered"
                      startContent={<Icon icon="solar:medal-ribbons-star-bold-duotone" className="text-warning" />}
                    >
                      {availableRanks.map((rank) => (
                        <SelectItem key={rank} value={rank}>
                          {rank}
                        </SelectItem>
                      ))}
                    </Select>

                    {/* Bio */}
                    <div className="md:col-span-2">
                      <Textarea
                        label="About You"
                        placeholder="Tell us about your playstyle, experience, and what you're looking for..."
                        value={formData.bio}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, bio: value }))}
                        variant="bordered"
                        minRows={4}
                        maxLength={500}
                        isInvalid={!!errors.bio}
                        errorMessage={errors.bio}
                        description={`${formData.bio.length}/500 characters`}
                        isRequired
                      />
                    </div>

                    {/* Looking for Team */}
                    <div className="md:col-span-2">
                      <Card className="bg-default-50">
                        <CardBody>
                          <Switch
                            isSelected={formData.lookingForTeam}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, lookingForTeam: value }))}
                            classNames={{
                              wrapper: "group-data-[selected=true]:bg-success",
                            }}
                          >
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold">Looking for Team</p>
                              <p className="text-xs text-default-500">
                                Show that you&apos;re actively looking for a team. You&apos;ll appear in LFT searches.
                              </p>
                            </div>
                          </Switch>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Social Links & Settings */}
              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Social Links</h3>
                    <p className="text-sm text-default-500 mb-4">
                      Connect your social accounts to make it easier for teams to reach you
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Discord Username"
                        placeholder="username#1234"
                        value={formData.discordUsername}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, discordUsername: value }))}
                        variant="bordered"
                        startContent={<Icon icon="ic:baseline-discord" className="text-[#5865F2]" width={20} />}
                      />
                      <Input
                        label="Twitch Username"
                        placeholder="@username"
                        value={formData.twitchUsername}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, twitchUsername: value }))}
                        variant="bordered"
                        startContent={<Icon icon="mdi:twitch" className="text-[#9146FF]" width={20} />}
                      />
                      <Input
                        label="Twitter/X Username"
                        placeholder="@username"
                        value={formData.twitterUsername}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, twitterUsername: value }))}
                        variant="bordered"
                        startContent={<Icon icon="mdi:twitter" className="text-[#1DA1F2]" width={20} />}
                      />
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                    <Select
                      label="Profile Visibility"
                      selectedKeys={[formData.visibility]}
                      onSelectionChange={(keys) => setFormData(prev => ({ ...prev, visibility: Array.from(keys)[0] as string }))}
                      variant="bordered"
                    >
                      <SelectItem key="public" startContent={<Icon icon="solar:earth-bold-duotone" className="text-success" />}>
                        Public - Anyone can view your profile
                      </SelectItem>
                      <SelectItem key="restricted" startContent={<Icon icon="solar:users-group-rounded-bold-duotone" className="text-warning" />}>
                        Restricted - Only teams can view
                      </SelectItem>
                      <SelectItem key="private" startContent={<Icon icon="solar:lock-bold-duotone" className="text-danger" />}>
                        Private - Only you can view
                      </SelectItem>
                    </Select>
                  </div>

                  {/* Preview Card */}
                  <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
                    <CardBody className="gap-3">
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:eye-bold-duotone" className="text-primary" width={20} />
                        <p className="font-semibold">Profile Preview</p>
                      </div>
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={formData.avatar ? URL.createObjectURL(formData.avatar) : undefined}
                          showFallback
                          name={formData.displayName}
                          size="lg"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">{formData.displayName || 'Your Name'}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.game && (
                              <Chip size="sm" variant="flat">
                                {GAMES.find(g => g.id === formData.game)?.name}
                              </Chip>
                            )}
                            {formData.role && (
                              <Chip size="sm" variant="flat" color="primary">
                                {formData.role}
                              </Chip>
                            )}
                            {formData.lookingForTeam && (
                              <Chip size="sm" variant="flat" color="success">
                                Looking for Team
                              </Chip>
                            )}
                          </div>
                          {formData.bio && (
                            <p className="text-xs text-default-600 mt-2 line-clamp-2">
                              {formData.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="gap-3">
              <Button
                variant="flat"
                onPress={step === 1 ? onCloseModal : handleBack}
                isDisabled={isSubmitting}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>

              {step < totalSteps ? (
                <Button
                  color="primary"
                  onPress={handleNext}
                  endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  color="success"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  startContent={!isSubmitting && <Icon icon="solar:check-circle-bold" width={20} />}
                >
                  {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
