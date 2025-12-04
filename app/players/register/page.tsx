'use client';

/**
 * Player Profile Registration Page
 * Comprehensive multi-step registration flow
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Avatar,
  Chip,
  Progress,
  Switch,
  Spinner,
  Autocomplete,
  AutocompleteItem,
  Divider,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import AvatarUploader from '@/components/avatar/avatar-uploader';
import { playersSDK, CreatePlayerRequest, GameTitle, PlayerVisibility } from '@/types/replay-api/players.sdk';

// ============================================================================
// Constants
// ============================================================================

const GAMES = [
  { id: GameTitle.CS2, name: 'Counter-Strike 2', icon: 'simple-icons:counterstrike' },
  { id: GameTitle.VALORANT, name: 'Valorant', icon: 'simple-icons:valorant' },
  { id: GameTitle.LOL, name: 'League of Legends', icon: 'simple-icons:leagueoflegends' },
  { id: GameTitle.DOTA2, name: 'Dota 2', icon: 'simple-icons:dota2' },
];

const ROLES: Record<string, string[]> = {
  cs2: ['AWPer', 'Entry Fragger', 'Support', 'In-Game Leader (IGL)', 'Lurker', 'Rifler'],
  valorant: ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'Flex'],
  lol: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
  dota2: ['Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'],
  default: ['Player', 'Captain', 'Coach', 'Analyst'],
};

const RANKS: Record<string, string[]> = {
  cs2: ['Silver', 'Gold Nova', 'Master Guardian', 'Legendary Eagle', 'Supreme', 'Global Elite'],
  valorant: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
  lol: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
  dota2: ['Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal'],
  default: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Pro'],
};

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
];

// ============================================================================
// Component
// ============================================================================

export default function PlayerRegistrationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    game: '' as GameTitle | '',
    displayName: '',
    slug: '',
    avatarFile: null as File | null,
    avatarUrl: '',
    role: '',
    rank: '',
    bio: '',
    lookingForTeam: true,
    visibility: PlayerVisibility.PUBLIC,
    country: 'US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    discordUsername: '',
    twitchUsername: '',
    twitterUsername: '',
    steamId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // Check if user already has a profile
  useEffect(() => {
    if (status === 'authenticated') {
      playersSDK.getMyProfile().then((profile) => {
        if (profile) {
          router.push(`/players/${profile.slug}`);
        }
      }).catch(() => {
        // No profile exists, continue with registration
      });
    }
  }, [status, router]);

  // Debounced slug availability check
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      const available = await playersSDK.checkSlugAvailability(formData.slug);
      setSlugAvailable(available);
      setIsCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handleDisplayNameChange = (value: string) => {
    setFormData((prev) => ({
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
      if (!formData.slug) newErrors.slug = 'Profile URL is required';
      if (formData.slug.length < 3) newErrors.slug = 'Profile URL must be at least 3 characters';
      if (slugAvailable === false) newErrors.slug = 'This URL is already taken';
    }

    if (currentStep === 2) {
      if (!formData.role) newErrors.role = 'Please select your primary role';
      if (!formData.bio || formData.bio.length < 20) newErrors.bio = 'Bio must be at least 20 characters';
    }

    if (currentStep === 3) {
      if (!formData.country) newErrors.country = 'Please select your country';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(totalSteps, prev + 1));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload avatar if present
      let avatarUrl = formData.avatarUrl;
      if (formData.avatarFile) {
        avatarUrl = await playersSDK.uploadAvatar(formData.avatarFile);
      }

      const request: CreatePlayerRequest = {
        display_name: formData.displayName,
        slug: formData.slug,
        avatar_url: avatarUrl || undefined,
        bio: formData.bio,
        game: formData.game as GameTitle,
        role: formData.role,
        rank: formData.rank || undefined,
        country: formData.country,
        timezone: formData.timezone,
        looking_for_team: formData.lookingForTeam,
        visibility: formData.visibility,
        social_links: {
          discord: formData.discordUsername || undefined,
          twitch: formData.twitchUsername || undefined,
          twitter: formData.twitterUsername || undefined,
          steam_id: formData.steamId || undefined,
        },
      };

      const profile = await playersSDK.createPlayer(request);
      router.push(`/players/${profile.slug}?welcome=true`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading/Auth checks
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <Card>
          <CardBody className="p-8 text-center">
            <Icon icon="solar:lock-bold" className="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign in required</h2>
            <p className="text-default-500 mb-6">
              Please sign in to create your player profile.
            </p>
            <Button
              color="primary"
              size="lg"
              fullWidth
              onPress={() => router.push('/signin?callbackUrl=/players/register')}
            >
              Sign in to continue
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const selectedGame = GAMES.find((g) => g.id === formData.game);
  const availableRoles = formData.game ? (ROLES[formData.game] || ROLES.default) : ROLES.default;
  const availableRanks = formData.game ? (RANKS[formData.game] || RANKS.default) : RANKS.default;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Your Player Profile</h1>
        <p className="text-default-500">Join the competitive gaming community</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <Progress value={progress} color="primary" size="sm" className="mb-2" />
        <div className="flex justify-between text-sm text-default-500">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardBody className="p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Icon icon="solar:gamepad-bold" className="w-12 h-12 text-primary mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Basic Information</h2>
                <p className="text-default-500">Tell us about yourself</p>
              </div>

              {/* Game Selection */}
              <Select
                label="Primary Game"
                placeholder="Select your main game"
                selectedKeys={formData.game ? [formData.game] : []}
                onSelectionChange={(keys) => {
                  const game = Array.from(keys)[0] as GameTitle;
                  setFormData((prev) => ({ ...prev, game, role: '', rank: '' }));
                }}
                variant="bordered"
                size="lg"
                isInvalid={!!errors.game}
                errorMessage={errors.game}
                startContent={
                  selectedGame && (
                    <Icon icon={selectedGame.icon} className="w-5 h-5" />
                  )
                }
              >
                {GAMES.map((game) => (
                  <SelectItem
                    key={game.id}
                    startContent={<Icon icon={game.icon} className="w-5 h-5" />}
                  >
                    {game.name}
                  </SelectItem>
                ))}
              </Select>

              {/* Avatar */}
              <div className="flex justify-center">
                <div className="text-center">
                  <AvatarUploader
                    onUpload={(file) => setFormData((prev) => ({ ...prev, avatarFile: file }))}
                  />
                  <p className="text-xs text-default-400 mt-2">Optional: 400x400px recommended</p>
                </div>
              </div>

              {/* Display Name & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  placeholder="Your gaming name"
                  value={formData.displayName}
                  onValueChange={handleDisplayNameChange}
                  variant="bordered"
                  isInvalid={!!errors.displayName}
                  errorMessage={errors.displayName}
                  startContent={<Icon icon="solar:user-bold" className="text-default-400" />}
                  isRequired
                />

                <Input
                  label="Profile URL"
                  placeholder="your-profile-url"
                  value={formData.slug}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, slug: value }))}
                  variant="bordered"
                  isInvalid={!!errors.slug}
                  errorMessage={errors.slug}
                  startContent={<span className="text-xs text-default-400">leetgaming.pro/</span>}
                  endContent={
                    isCheckingSlug ? (
                      <Spinner size="sm" />
                    ) : slugAvailable === true ? (
                      <Icon icon="solar:check-circle-bold" className="text-success w-5 h-5" />
                    ) : slugAvailable === false ? (
                      <Icon icon="solar:close-circle-bold" className="text-danger w-5 h-5" />
                    ) : null
                  }
                  isRequired
                />
              </div>
            </div>
          )}

          {/* Step 2: Gaming Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Icon icon="solar:star-bold" className="w-12 h-12 text-warning mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Gaming Details</h2>
                <p className="text-default-500">Your role and experience</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Autocomplete
                  label="Primary Role"
                  placeholder="Select your main role"
                  selectedKey={formData.role}
                  onSelectionChange={(key) => setFormData((prev) => ({ ...prev, role: key as string }))}
                  variant="bordered"
                  isInvalid={!!errors.role}
                  errorMessage={errors.role}
                  isRequired
                >
                  {availableRoles.map((role) => (
                    <AutocompleteItem key={role}>{role}</AutocompleteItem>
                  ))}
                </Autocomplete>

                <Select
                  label="Current Rank"
                  placeholder="Select your rank"
                  selectedKeys={formData.rank ? [formData.rank] : []}
                  onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, rank: Array.from(keys)[0] as string }))}
                  variant="bordered"
                >
                  {availableRanks.map((rank) => (
                    <SelectItem key={rank}>{rank}</SelectItem>
                  ))}
                </Select>
              </div>

              <Textarea
                label="About You"
                placeholder="Tell teams about your playstyle, experience, achievements, and what you're looking for..."
                value={formData.bio}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, bio: value }))}
                variant="bordered"
                minRows={4}
                maxLength={500}
                isInvalid={!!errors.bio}
                errorMessage={errors.bio}
                description={`${formData.bio.length}/500 characters`}
                isRequired
              />

              <Card className="bg-default-50">
                <CardBody>
                  <Switch
                    isSelected={formData.lookingForTeam}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, lookingForTeam: value }))}
                    classNames={{
                      wrapper: 'group-data-[selected=true]:bg-success',
                    }}
                  >
                    <div>
                      <p className="font-semibold">Looking for Team</p>
                      <p className="text-xs text-default-500">
                        Appear in team searches and receive invitations
                      </p>
                    </div>
                  </Switch>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Step 3: Location & Social */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Icon icon="solar:earth-bold" className="w-12 h-12 text-success mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Location & Social</h2>
                <p className="text-default-500">Help teams find you</p>
              </div>

              <Select
                label="Country"
                placeholder="Select your country"
                selectedKeys={formData.country ? [formData.country] : []}
                onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, country: Array.from(keys)[0] as string }))}
                variant="bordered"
                isInvalid={!!errors.country}
                errorMessage={errors.country}
                isRequired
              >
                {COUNTRIES.map((country) => (
                  <SelectItem
                    key={country.code}
                    startContent={<span className="text-lg">{country.flag}</span>}
                  >
                    {country.name}
                  </SelectItem>
                ))}
              </Select>

              <Divider />

              <div className="space-y-4">
                <h3 className="font-semibold">Social Links (Optional)</h3>

                <Input
                  label="Discord"
                  placeholder="username#1234"
                  value={formData.discordUsername}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, discordUsername: value }))}
                  variant="bordered"
                  startContent={<Icon icon="ic:baseline-discord" className="text-[#5865F2]" />}
                />

                <Input
                  label="Twitch"
                  placeholder="username"
                  value={formData.twitchUsername}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, twitchUsername: value }))}
                  variant="bordered"
                  startContent={<Icon icon="mdi:twitch" className="text-[#9146FF]" />}
                />

                <Input
                  label="Twitter/X"
                  placeholder="@username"
                  value={formData.twitterUsername}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, twitterUsername: value }))}
                  variant="bordered"
                  startContent={<Icon icon="mdi:twitter" className="text-[#1DA1F2]" />}
                />

                <Input
                  label="Steam ID"
                  placeholder="76561198..."
                  value={formData.steamId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, steamId: value }))}
                  variant="bordered"
                  startContent={<Icon icon="mdi:steam" className="text-default-500" />}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Icon icon="solar:check-circle-bold" className="w-12 h-12 text-success mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Review Your Profile</h2>
                <p className="text-default-500">Make sure everything looks good</p>
              </div>

              {/* Preview Card */}
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={formData.avatarFile ? URL.createObjectURL(formData.avatarFile) : undefined}
                      showFallback
                      name={formData.displayName}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold">{formData.displayName}</h3>
                      <p className="text-sm text-default-500">
                        leetgaming.pro/players/{formData.slug}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedGame && (
                          <Chip
                            size="sm"
                            variant="flat"
                            startContent={<Icon icon={selectedGame.icon} className="w-3 h-3" />}
                          >
                            {selectedGame.name}
                          </Chip>
                        )}
                        {formData.role && (
                          <Chip size="sm" variant="flat" color="primary">
                            {formData.role}
                          </Chip>
                        )}
                        {formData.rank && (
                          <Chip size="sm" variant="flat" color="warning">
                            {formData.rank}
                          </Chip>
                        )}
                        {formData.lookingForTeam && (
                          <Chip size="sm" variant="flat" color="success">
                            Looking for Team
                          </Chip>
                        )}
                      </div>

                      {formData.bio && (
                        <p className="text-sm text-default-600 mt-3 line-clamp-3">
                          {formData.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Privacy Setting */}
              <Card>
                <CardBody className="p-4">
                  <Select
                    label="Profile Visibility"
                    selectedKeys={[formData.visibility]}
                    onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, visibility: Array.from(keys)[0] as PlayerVisibility }))}
                    variant="bordered"
                  >
                    <SelectItem
                      key={PlayerVisibility.PUBLIC}
                      startContent={<Icon icon="solar:earth-bold" className="text-success" />}
                    >
                      Public - Anyone can view
                    </SelectItem>
                    <SelectItem
                      key={PlayerVisibility.RESTRICTED}
                      startContent={<Icon icon="solar:users-group-rounded-bold" className="text-warning" />}
                    >
                      Restricted - Teams only
                    </SelectItem>
                    <SelectItem
                      key={PlayerVisibility.PRIVATE}
                      startContent={<Icon icon="solar:lock-bold" className="text-danger" />}
                    >
                      Private - Only you
                    </SelectItem>
                  </Select>
                </CardBody>
              </Card>

              {error && (
                <Card className="bg-danger/10 border border-danger/20">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:danger-triangle-bold" className="text-danger w-5 h-5" />
                      <p className="text-danger">{error}</p>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="bordered"
          onPress={step === 1 ? () => router.back() : handleBack}
          isDisabled={isSubmitting}
          startContent={<Icon icon="solar:arrow-left-linear" className="w-5 h-5" />}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < totalSteps ? (
          <Button
            color="primary"
            onPress={handleNext}
            endContent={<Icon icon="solar:arrow-right-linear" className="w-5 h-5" />}
          >
            Continue
          </Button>
        ) : (
          <Button
            color="success"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            startContent={!isSubmitting && <Icon icon="solar:check-circle-bold" className="w-5 h-5" />}
          >
            {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        )}
      </div>
    </div>
  );
}
