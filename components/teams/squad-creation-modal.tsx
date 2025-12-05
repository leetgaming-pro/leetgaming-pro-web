'use client';

/**
 * Award-Winning Squad/Team Creation Modal
 * Multi-step form with member management, team customization, and preview
 */

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
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
  Divider,
  Switch,
  User,
  Autocomplete,
  AutocompleteItem,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import AvatarUploader from '@/components/avatar/avatar-uploader';
import { logger } from '@/lib/logger';

interface SquadCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GAMES = [
  { id: 'cs2', name: 'Counter-Strike 2', icon: '🎮', maxTeamSize: 5 },
  { id: 'valorant', name: 'Valorant', icon: '🎯', maxTeamSize: 5 },
  { id: 'csgo', name: 'CS:GO', icon: '🔫', maxTeamSize: 5 },
  { id: 'lol', name: 'League of Legends', icon: '⚔️', maxTeamSize: 5 },
  { id: 'dota2', name: 'Dota 2', icon: '🏰', maxTeamSize: 5 },
];

const COMPETITIVE_LEVELS = [
  { id: 'casual', name: 'Casual', description: 'Playing for fun' },
  { id: 'semi-pro', name: 'Semi-Pro', description: 'Regular practice and tournaments' },
  { id: 'professional', name: 'Professional', description: 'Full-time competitive' },
];

const REGIONS = [
  'North America',
  'Europe',
  'Asia',
  'South America',
  'Oceania',
  'Middle East',
  'Africa',
];

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export function SquadCreationModal({ isOpen, onClose }: SquadCreationModalProps) {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    game: '',
    teamName: '',
    teamTag: '',
    slug: '',
    logo: null as File | null,
    bio: '',
    region: 'North America',
    competitiveLevel: 'semi-pro',
    lookingForPlayers: true,
    requiredRoles: [] as string[],
    discordServer: '',
    website: '',
    twitterHandle: '',
    members: [] as TeamMember[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Auto-generate slug and tag from team name
  const handleTeamNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const tag = value
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 4);

    setFormData(prev => ({
      ...prev,
      teamName: value,
      slug,
      teamTag: tag,
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.game) newErrors.game = 'Please select a game';
      if (!formData.teamName) newErrors.teamName = 'Team name is required';
      if (formData.teamName.length < 3) newErrors.teamName = 'Team name must be at least 3 characters';
      if (!formData.teamTag) newErrors.teamTag = 'Team tag is required';
      if (formData.teamTag.length > 5) newErrors.teamTag = 'Team tag must be 5 characters or less';
    }

    if (currentStep === 2) {
      if (!formData.bio || formData.bio.length < 30) newErrors.bio = 'Team bio must be at least 30 characters';
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
    try {
      // TODO: Submit to API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      logger.info('Squad created', { teamName: formData.teamName, slug: formData.slug });
      onClose();
      // Reset form
      setStep(1);
      setFormData({
        game: '',
        teamName: '',
        teamTag: '',
        slug: '',
        logo: null,
        bio: '',
        region: 'North America',
        competitiveLevel: 'semi-pro',
        lookingForPlayers: true,
        requiredRoles: [],
        discordServer: '',
        website: '',
        twitterHandle: '',
        members: [],
      });
    } catch (error) {
      logger.error('Failed to create squad', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMember = () => {
    if (!searchQuery.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: searchQuery,
      role: 'Player',
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };

    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
    setSearchQuery('');
  };

  const removeMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id),
    }));
  };

  const selectedGame = GAMES.find(g => g.id === formData.game);
  const selectedLevel = COMPETITIVE_LEVELS.find(l => l.id === formData.competitiveLevel);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
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
                <Icon icon="solar:users-group-two-rounded-bold-duotone" width={28} className="text-primary" />
                <h2 className="text-2xl font-bold">Launch Your Squad</h2>
              </div>
              <p className="text-sm text-default-500 font-normal">
                {step === 1 && 'Set up your team identity'}
                {step === 2 && 'Build your team and define your goals'}
                {step === 3 && 'Review and launch your squad'}
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
              {/* Step 1: Team Identity */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Game Selection */}
                    <div className="md:col-span-2">
                      <Select
                        label="Select Game"
                        placeholder="Choose your game"
                        selectedKeys={formData.game ? [formData.game] : []}
                        onSelectionChange={(keys) => setFormData(prev => ({ ...prev, game: Array.from(keys)[0] as string }))}
                        variant="bordered"
                        startContent={selectedGame && <span className="text-2xl">{selectedGame.icon}</span>}
                        isInvalid={!!errors.game}
                        errorMessage={errors.game}
                        classNames={{
                          trigger: "h-14",
                        }}
                        isRequired
                      >
                        {GAMES.map((game) => (
                          <SelectItem
                            key={game.id}
                            value={game.id}
                            startContent={<span className="text-2xl">{game.icon}</span>}
                            description={`Max ${game.maxTeamSize} players`}
                          >
                            {game.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Logo Upload */}
                    <div className="flex justify-center md:col-span-2">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-default-600 font-medium">Team Logo</p>
                        <AvatarUploader
                          onUpload={(file) => setFormData(prev => ({ ...prev, logo: file }))}
                        />
                        <p className="text-xs text-default-400">Recommended: 400x400px, max 2MB</p>
                      </div>
                    </div>

                    {/* Team Name */}
                    <Input
                      label="Team Name"
                      placeholder="Your squad's name"
                      value={formData.teamName}
                      onValueChange={handleTeamNameChange}
                      variant="bordered"
                      startContent={<Icon icon="solar:users-group-rounded-bold-duotone" className="text-default-400" />}
                      isInvalid={!!errors.teamName}
                      errorMessage={errors.teamName}
                      isRequired
                    />

                    {/* Team Tag */}
                    <Input
                      label="Team Tag"
                      placeholder="TAG"
                      value={formData.teamTag}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, teamTag: value.toUpperCase().slice(0, 5) }))}
                      variant="bordered"
                      startContent={<span className="text-default-400">[</span>}
                      endContent={<span className="text-default-400">]</span>}
                      maxLength={5}
                      isInvalid={!!errors.teamTag}
                      errorMessage={errors.teamTag}
                      description="2-5 characters"
                      isRequired
                    />

                    {/* Team URL */}
                    <div className="md:col-span-2">
                      <Input
                        label="Team URL"
                        placeholder="your-team-name"
                        value={formData.slug}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, slug: value }))}
                        variant="bordered"
                        startContent={<span className="text-xs text-default-400">leetgaming.pro/teams/</span>}
                        isRequired
                      />
                    </div>

                    {/* Region */}
                    <Select
                      label="Region"
                      selectedKeys={[formData.region]}
                      onSelectionChange={(keys) => setFormData(prev => ({ ...prev, region: Array.from(keys)[0] as string }))}
                      variant="bordered"
                      startContent={<Icon icon="solar:map-point-bold-duotone" className="text-default-400" />}
                    >
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </Select>

                    {/* Competitive Level */}
                    <Select
                      label="Competitive Level"
                      selectedKeys={[formData.competitiveLevel]}
                      onSelectionChange={(keys) => setFormData(prev => ({ ...prev, competitiveLevel: Array.from(keys)[0] as string }))}
                      variant="bordered"
                      startContent={<Icon icon="solar:cup-star-bold-duotone" className="text-warning" />}
                      description={selectedLevel?.description}
                    >
                      {COMPETITIVE_LEVELS.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <Card className="bg-primary-50/50">
                    <CardBody className="flex-row gap-3 items-start">
                      <Icon icon="solar:lightbulb-bolt-bold-duotone" width={24} className="text-primary flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-primary mb-1">Pro Tip</p>
                        <p className="text-default-600">
                          Choose a memorable team name and tag. These will represent your squad in tournaments and matches.
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              {/* Step 2: Team Building */}
              {step === 2 && (
                <div className="flex flex-col gap-6">
                  {/* Team Bio */}
                  <Textarea
                    label="Team Bio"
                    placeholder="Describe your team's playstyle, goals, and what makes you unique..."
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

                  {/* Recruitment Status */}
                  <Card className="bg-default-50">
                    <CardBody>
                      <Switch
                        isSelected={formData.lookingForPlayers}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, lookingForPlayers: value }))}
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-success",
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold">Looking for Players</p>
                          <p className="text-xs text-default-500">
                            Show that your team is recruiting. Your team will appear in &quot;Recruiting&quot; searches.
                          </p>
                        </div>
                      </Switch>
                    </CardBody>
                  </Card>

                  {/* Current Members */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Team Members</h3>
                      <Chip size="sm" variant="flat">
                        {formData.members.length}/{selectedGame?.maxTeamSize || 5}
                      </Chip>
                    </div>

                    {/* Add Member Input */}
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Search players or enter username..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        variant="bordered"
                        startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" />}
                        onKeyPress={(e) => e.key === 'Enter' && addMember()}
                      />
                      <Button
                        color="primary"
                        onPress={addMember}
                        isDisabled={!searchQuery.trim() || formData.members.length >= (selectedGame?.maxTeamSize || 5)}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Members List */}
                    <div className="space-y-2">
                      {formData.members.length === 0 ? (
                        <Card className="bg-default-100">
                          <CardBody className="text-center py-8">
                            <Icon icon="solar:users-group-rounded-linear" width={48} className="mx-auto mb-2 text-default-400" />
                            <p className="text-sm text-default-500">No members added yet</p>
                            <p className="text-xs text-default-400 mt-1">Add players to build your squad</p>
                          </CardBody>
                        </Card>
                      ) : (
                        formData.members.map((member) => (
                          <Card key={member.id}>
                            <CardBody className="py-3">
                              <div className="flex items-center justify-between">
                                <User
                                  name={member.name}
                                  description={member.role}
                                  avatarProps={{
                                    src: member.avatar,
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  isIconOnly
                                  onPress={() => removeMember(member.id)}
                                >
                                  <Icon icon="solar:trash-bin-minimalistic-linear" width={18} />
                                </Button>
                              </div>
                            </CardBody>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>

                  <Card className="bg-warning-50/50">
                    <CardBody className="flex-row gap-3 items-start">
                      <Icon icon="solar:info-circle-bold-duotone" width={24} className="text-warning flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-warning-700 mb-1">Member Management</p>
                        <p className="text-default-600">
                          You can add members now or invite them later. Team members will receive invitations via the platform.
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              {/* Step 3: Social & Preview */}
              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Social & Communication</h3>
                    <p className="text-sm text-default-500 mb-4">
                      Help players find and connect with your team
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Discord Server"
                        placeholder="discord.gg/yourserver"
                        value={formData.discordServer}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, discordServer: value }))}
                        variant="bordered"
                        startContent={<Icon icon="ic:baseline-discord" className="text-[#5865F2]" width={20} />}
                      />
                      <Input
                        label="Website"
                        placeholder="https://yourteam.com"
                        value={formData.website}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, website: value }))}
                        variant="bordered"
                        startContent={<Icon icon="solar:link-bold-duotone" className="text-default-400" width={20} />}
                      />
                      <Input
                        label="Twitter/X Handle"
                        placeholder="@yourteam"
                        value={formData.twitterHandle}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, twitterHandle: value }))}
                        variant="bordered"
                        startContent={<Icon icon="mdi:twitter" className="text-[#1DA1F2]" width={20} />}
                      />
                    </div>
                  </div>

                  <Divider />

                  {/* Team Preview */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Team Preview</h3>
                    <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
                      <CardBody className="gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar
                            src={formData.logo ? URL.createObjectURL(formData.logo) : undefined}
                            showFallback
                            name={formData.teamTag || formData.teamName}
                            size="lg"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg truncate">
                                {formData.teamTag && `[${formData.teamTag}] `}
                                {formData.teamName || 'Your Team Name'}
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {formData.game && (
                                <Chip size="sm" variant="flat">
                                  {GAMES.find(g => g.id === formData.game)?.name}
                                </Chip>
                              )}
                              <Chip size="sm" variant="flat" color="warning">
                                {selectedLevel?.name}
                              </Chip>
                              <Chip size="sm" variant="flat" color="primary">
                                {formData.region}
                              </Chip>
                              {formData.lookingForPlayers && (
                                <Chip size="sm" variant="flat" color="success">
                                  Recruiting
                                </Chip>
                              )}
                            </div>
                            {formData.bio && (
                              <p className="text-xs text-default-600 line-clamp-2">
                                {formData.bio}
                              </p>
                            )}
                          </div>
                        </div>

                        {formData.members.length > 0 && (
                          <div className="pt-3 border-t border-divider">
                            <p className="text-xs text-default-500 mb-2">Team Members ({formData.members.length})</p>
                            <div className="flex -space-x-2">
                              {formData.members.slice(0, 5).map((member) => (
                                <Avatar
                                  key={member.id}
                                  src={member.avatar}
                                  size="sm"
                                  className="border-2 border-background"
                                />
                              ))}
                              {formData.members.length > 5 && (
                                <Avatar
                                  size="sm"
                                  name={`+${formData.members.length - 5}`}
                                  className="border-2 border-background bg-default-200"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </div>

                  <Card className="bg-success-50/50">
                    <CardBody className="flex-row gap-3 items-start">
                      <Icon icon="solar:check-circle-bold-duotone" width={24} className="text-success flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-success-700 mb-1">Ready to Launch!</p>
                        <p className="text-default-600">
                          Your squad will be visible to players and can start competing immediately after creation.
                        </p>
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
                  startContent={!isSubmitting && <Icon icon="solar:rocket-2-bold-duotone" width={20} />}
                >
                  {isSubmitting ? 'Launching Squad...' : 'Launch Squad'}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
