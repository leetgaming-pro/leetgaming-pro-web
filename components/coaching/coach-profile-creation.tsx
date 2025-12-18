/**
 * Coach Profile Creation Component
 * Multi-step onboarding flow for coaches to create their profiles
 * Per PRD D.4.3 - Coach Profile Creation (Missing)
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Avatar,
  Progress,
  Checkbox,
  CheckboxGroup,
  Slider,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export type CoachSpecialty =
  | "aim_training"
  | "game_sense"
  | "positioning"
  | "communication"
  | "economy"
  | "utility"
  | "team_play"
  | "mental_coaching"
  | "vod_review";

export type CoachRank =
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "immortal"
  | "radiant"
  | "global_elite"
  | "faceit_10"
  | "professional";

export interface CoachProfileData {
  // Basic Info
  displayName: string;
  bio: string;
  tagline: string;
  avatar?: string;

  // Experience
  games: string[];
  specialties: CoachSpecialty[];
  yearsExperience: number;
  rank: CoachRank;
  achievements: string[];

  // Availability
  languages: string[];
  timezone: string;
  availableHours: number; // hours per week

  // Pricing
  hourlyRate: number;
  sessionLengths: number[]; // in minutes
  trialEnabled: boolean;
  trialDuration: number; // minutes

  // Social
  discordUsername?: string;
  twitchUsername?: string;
  youtubeChannel?: string;
  linkedinUrl?: string;
}

export interface CoachProfileCreationProps {
  onComplete: (profile: CoachProfileData) => void;
  onCancel: () => void;
  initialData?: Partial<CoachProfileData>;
}

type Step = "basic" | "experience" | "availability" | "pricing" | "review";

// ============================================================================
// Constants
// ============================================================================

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: "basic", label: "Basic Info", icon: "solar:user-bold" },
  {
    key: "experience",
    label: "Experience",
    icon: "solar:medal-ribbons-star-bold",
  },
  { key: "availability", label: "Availability", icon: "solar:calendar-bold" },
  { key: "pricing", label: "Pricing", icon: "solar:wallet-bold" },
  { key: "review", label: "Review", icon: "solar:check-circle-bold" },
];

const GAMES = [
  { key: "cs2", label: "Counter-Strike 2" },
  { key: "valorant", label: "Valorant" },
  { key: "lol", label: "League of Legends" },
  { key: "dota2", label: "Dota 2" },
  { key: "fortnite", label: "Fortnite" },
  { key: "apex", label: "Apex Legends" },
  { key: "overwatch", label: "Overwatch 2" },
  { key: "r6", label: "Rainbow Six Siege" },
];

const SPECIALTIES: { key: CoachSpecialty; label: string; icon: string }[] = [
  { key: "aim_training", label: "Aim Training", icon: "solar:target-bold" },
  { key: "game_sense", label: "Game Sense", icon: "solar:brain-bold" },
  { key: "positioning", label: "Positioning", icon: "solar:map-point-bold" },
  {
    key: "communication",
    label: "Communication",
    icon: "solar:chat-round-bold",
  },
  { key: "economy", label: "Economy", icon: "solar:wallet-bold" },
  { key: "utility", label: "Utility Usage", icon: "solar:bomb-bold" },
  {
    key: "team_play",
    label: "Team Play",
    icon: "solar:users-group-rounded-bold",
  },
  {
    key: "mental_coaching",
    label: "Mental Coaching",
    icon: "solar:heart-bold",
  },
  { key: "vod_review", label: "VOD Review", icon: "solar:video-frame-bold" },
];

const RANKS: { key: CoachRank; label: string }[] = [
  { key: "silver", label: "Silver/Iron" },
  { key: "gold", label: "Gold/Bronze" },
  { key: "platinum", label: "Platinum" },
  { key: "diamond", label: "Diamond" },
  { key: "immortal", label: "Immortal/Supreme" },
  { key: "radiant", label: "Radiant/Global Elite" },
  { key: "faceit_10", label: "FACEIT Level 10" },
  { key: "professional", label: "Professional/Ex-Pro" },
];

const LANGUAGES = [
  { key: "en", label: "English" },
  { key: "es", label: "Spanish" },
  { key: "pt", label: "Portuguese" },
  { key: "zh", label: "Chinese" },
  { key: "ru", label: "Russian" },
  { key: "de", label: "German" },
  { key: "fr", label: "French" },
  { key: "ko", label: "Korean" },
  { key: "ja", label: "Japanese" },
];

const SESSION_LENGTHS = [30, 60, 90, 120];

const DEFAULT_PROFILE: CoachProfileData = {
  displayName: "",
  bio: "",
  tagline: "",
  games: [],
  specialties: [],
  yearsExperience: 1,
  rank: "diamond",
  achievements: [],
  languages: ["en"],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  availableHours: 20,
  hourlyRate: 25,
  sessionLengths: [60],
  trialEnabled: true,
  trialDuration: 15,
};

// ============================================================================
// Sub-Components
// ============================================================================

function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: typeof STEPS;
  currentStep: Step;
  onStepClick: (step: Step) => void;
}) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = step.key === currentStep;

        return (
          <React.Fragment key={step.key}>
            <button
              onClick={() => isComplete && onStepClick(step.key)}
              disabled={!isComplete && !isCurrent}
              className={`
                flex flex-col items-center gap-2 transition-all
                ${isComplete ? "cursor-pointer" : isCurrent ? "" : "opacity-50"}
              `}
            >
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${
                  isComplete
                    ? "bg-success text-white"
                    : isCurrent
                    ? "bg-primary text-white"
                    : "bg-default-100 text-default-500"
                }
              `}
              >
                {isComplete ? (
                  <Icon icon="solar:check-bold" className="w-5 h-5" />
                ) : (
                  <Icon icon={step.icon} className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrent ? "text-primary" : "text-default-500"
                }`}
              >
                {step.label}
              </span>
            </button>

            {index < steps.length - 1 && (
              <div
                className={`
                flex-1 h-0.5 mx-2
                ${index < currentIndex ? "bg-success" : "bg-default-200"}
              `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function BasicInfoStep({
  data,
  onChange,
}: {
  data: CoachProfileData;
  onChange: (updates: Partial<CoachProfileData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar
            src={data.avatar}
            name={data.displayName}
            className="w-24 h-24"
            isBordered
            color="primary"
          />
          <Button size="sm" variant="flat">
            Upload Photo
          </Button>
        </div>

        <div className="flex-1 space-y-4">
          <Input
            label="Display Name"
            placeholder="How students will see you"
            value={data.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            isRequired
            startContent={
              <Icon icon="solar:user-bold" className="text-default-400" />
            }
          />

          <Input
            label="Tagline"
            placeholder="e.g., 'Ex-Pro AWPer | 5000+ hours coached'"
            value={data.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            maxLength={100}
            description={`${data.tagline.length}/100 characters`}
          />
        </div>
      </div>

      <Textarea
        label="Bio"
        placeholder="Tell students about your background, coaching style, and what makes you unique..."
        value={data.bio}
        onChange={(e) => onChange({ bio: e.target.value })}
        minRows={4}
        maxRows={8}
        maxLength={1000}
        description={`${data.bio.length}/1000 characters`}
      />

      <Divider />

      <div className="space-y-4">
        <h4 className="font-semibold">Social Links (Optional)</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Discord"
            placeholder="username#1234"
            value={data.discordUsername || ""}
            onChange={(e) => onChange({ discordUsername: e.target.value })}
            startContent={
              <Icon icon="ic:baseline-discord" className="text-[#5865F2]" />
            }
          />
          <Input
            label="Twitch"
            placeholder="twitch.tv/username"
            value={data.twitchUsername || ""}
            onChange={(e) => onChange({ twitchUsername: e.target.value })}
            startContent={<Icon icon="mdi:twitch" className="text-[#9146FF]" />}
          />
          <Input
            label="YouTube"
            placeholder="youtube.com/@channel"
            value={data.youtubeChannel || ""}
            onChange={(e) => onChange({ youtubeChannel: e.target.value })}
            startContent={
              <Icon icon="mdi:youtube" className="text-[#FF0000]" />
            }
          />
          <Input
            label="LinkedIn"
            placeholder="linkedin.com/in/username"
            value={data.linkedinUrl || ""}
            onChange={(e) => onChange({ linkedinUrl: e.target.value })}
            startContent={
              <Icon icon="mdi:linkedin" className="text-[#0A66C2]" />
            }
          />
        </div>
      </div>
    </div>
  );
}

function ExperienceStep({
  data,
  onChange,
}: {
  data: CoachProfileData;
  onChange: (updates: Partial<CoachProfileData>) => void;
}) {
  const [newAchievement, setNewAchievement] = useState("");

  const addAchievement = () => {
    if (newAchievement.trim()) {
      onChange({ achievements: [...data.achievements, newAchievement.trim()] });
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    onChange({ achievements: data.achievements.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Games You Coach</h4>
        <CheckboxGroup
          value={data.games}
          onChange={(games) => onChange({ games: games as string[] })}
          orientation="horizontal"
          classNames={{
            wrapper: "gap-3",
          }}
        >
          {GAMES.map((game) => (
            <Checkbox key={game.key} value={game.key}>
              {game.label}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>

      <Divider />

      <div>
        <h4 className="font-semibold mb-3">Specialties</h4>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((specialty) => (
            <Chip
              key={specialty.key}
              variant={
                data.specialties.includes(specialty.key) ? "solid" : "bordered"
              }
              color={
                data.specialties.includes(specialty.key) ? "primary" : "default"
              }
              className="cursor-pointer"
              startContent={<Icon icon={specialty.icon} className="w-4 h-4" />}
              onClick={() => {
                const newSpecialties = data.specialties.includes(specialty.key)
                  ? data.specialties.filter((s) => s !== specialty.key)
                  : [...data.specialties, specialty.key];
                onChange({ specialties: newSpecialties });
              }}
            >
              {specialty.label}
            </Chip>
          ))}
        </div>
      </div>

      <Divider />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Highest Rank Achieved</h4>
          <Select
            selectedKeys={[data.rank]}
            onChange={(e) => onChange({ rank: e.target.value as CoachRank })}
            label="Rank"
          >
            {RANKS.map((rank) => (
              <SelectItem key={rank.key}>{rank.label}</SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Years of Experience</h4>
          <Slider
            label="Years"
            step={1}
            minValue={0}
            maxValue={15}
            value={data.yearsExperience}
            onChange={(value) => onChange({ yearsExperience: value as number })}
            marks={[
              { value: 0, label: "0" },
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 15, label: "15+" },
            ]}
          />
        </div>
      </div>

      <Divider />

      <div>
        <h4 className="font-semibold mb-3">Achievements & Credentials</h4>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="e.g., 'ESEA Main Champion 2023'"
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAchievement()}
          />
          <Button onClick={addAchievement} isDisabled={!newAchievement.trim()}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.achievements.map((achievement, index) => (
            <Chip
              key={index}
              onClose={() => removeAchievement(index)}
              variant="flat"
            >
              {achievement}
            </Chip>
          ))}
          {data.achievements.length === 0 && (
            <p className="text-sm text-default-500">
              No achievements added yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AvailabilityStep({
  data,
  onChange,
}: {
  data: CoachProfileData;
  onChange: (updates: Partial<CoachProfileData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Languages</h4>
        <CheckboxGroup
          value={data.languages}
          onChange={(languages) =>
            onChange({ languages: languages as string[] })
          }
          orientation="horizontal"
          classNames={{
            wrapper: "gap-3",
          }}
        >
          {LANGUAGES.map((lang) => (
            <Checkbox key={lang.key} value={lang.key}>
              {lang.label}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>

      <Divider />

      <div>
        <h4 className="font-semibold mb-3">Timezone</h4>
        <Select
          selectedKeys={[data.timezone]}
          onChange={(e) => onChange({ timezone: e.target.value })}
          label="Your timezone"
        >
          {Intl.supportedValuesOf("timeZone")
            .slice(0, 50)
            .map((tz) => (
              <SelectItem key={tz}>{tz}</SelectItem>
            ))}
        </Select>
      </div>

      <Divider />

      <div>
        <h4 className="font-semibold mb-3">Weekly Availability</h4>
        <Slider
          label="Hours per week"
          step={5}
          minValue={5}
          maxValue={40}
          value={data.availableHours}
          onChange={(value) => onChange({ availableHours: value as number })}
          marks={[
            { value: 5, label: "5h" },
            { value: 20, label: "20h" },
            { value: 40, label: "40h" },
          ]}
        />
        <p className="text-sm text-default-500 mt-2">
          You&apos;ll be able to set specific available time slots later
        </p>
      </div>
    </div>
  );
}

function PricingStep({
  data,
  onChange,
}: {
  data: CoachProfileData;
  onChange: (updates: Partial<CoachProfileData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Hourly Rate</h4>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            value={String(data.hourlyRate)}
            onChange={(e) => onChange({ hourlyRate: Number(e.target.value) })}
            startContent={<span className="text-default-500">$</span>}
            endContent={<span className="text-default-500">/hour</span>}
            className="max-w-[200px]"
            min={5}
            max={500}
          />
          <div className="flex-1">
            <Slider
              step={5}
              minValue={5}
              maxValue={200}
              value={data.hourlyRate}
              onChange={(value) => onChange({ hourlyRate: value as number })}
            />
          </div>
        </div>
        <p className="text-sm text-default-500 mt-2">
          Recommended: $20-50/hour for new coaches, $50-150/hour for experienced
          coaches
        </p>
      </div>

      <Divider />

      <div>
        <h4 className="font-semibold mb-3">Session Lengths</h4>
        <CheckboxGroup
          value={data.sessionLengths.map(String)}
          onChange={(lengths) =>
            onChange({ sessionLengths: lengths.map(Number) })
          }
          orientation="horizontal"
        >
          {SESSION_LENGTHS.map((length) => (
            <Checkbox key={length} value={String(length)}>
              {length} minutes (${((length / 60) * data.hourlyRate).toFixed(0)})
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>

      <Divider />

      <div>
        <h4 className="font-semibold mb-3">Free Trial Session</h4>
        <div className="flex items-center gap-4">
          <Checkbox
            isSelected={data.trialEnabled}
            onValueChange={(checked) => onChange({ trialEnabled: checked })}
          >
            Offer free trial sessions
          </Checkbox>
          {data.trialEnabled && (
            <Select
              selectedKeys={[String(data.trialDuration)]}
              onChange={(e) =>
                onChange({ trialDuration: Number(e.target.value) })
              }
              label="Duration"
              className="max-w-[150px]"
            >
              <SelectItem key="15">15 minutes</SelectItem>
              <SelectItem key="20">20 minutes</SelectItem>
              <SelectItem key="30">30 minutes</SelectItem>
            </Select>
          )}
        </div>
        <p className="text-sm text-default-500 mt-2">
          Trial sessions help students get to know your coaching style
        </p>
      </div>

      <Divider />

      <Card className="bg-primary/10 border-none">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <Icon
              icon="solar:info-circle-bold"
              className="w-5 h-5 text-primary mt-0.5"
            />
            <div>
              <h5 className="font-semibold text-sm">Platform Fee</h5>
              <p className="text-sm text-default-600">
                LeetGaming.PRO takes a 15% commission on completed sessions.
                You&apos;ll receive 85% of your hourly rate.
              </p>
              <p className="text-sm font-medium mt-2">
                At ${data.hourlyRate}/hour, you&apos;ll earn $
                {(data.hourlyRate * 0.85).toFixed(2)}/hour
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function ReviewStep({ data }: { data: CoachProfileData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-0">
          <h4 className="font-semibold">Profile Preview</h4>
        </CardHeader>
        <CardBody>
          <div className="flex items-start gap-4">
            <Avatar
              src={data.avatar}
              name={data.displayName}
              className="w-20 h-20"
              isBordered
              color="primary"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold">
                {data.displayName || "Your Name"}
              </h3>
              <p className="text-default-500">
                {data.tagline || "Your tagline"}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.specialties.slice(0, 3).map((s) => {
                  const specialty = SPECIALTIES.find((sp) => sp.key === s);
                  return specialty ? (
                    <Chip key={s} size="sm" variant="flat">
                      {specialty.label}
                    </Chip>
                  ) : null;
                })}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                ${data.hourlyRate}
              </p>
              <p className="text-sm text-default-500">per hour</p>
            </div>
          </div>

          <Divider className="my-4" />

          <p className="text-sm text-default-600">
            {data.bio || "Your bio will appear here..."}
          </p>
        </CardBody>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardBody className="p-4">
            <h5 className="font-semibold mb-2">Games</h5>
            <div className="flex flex-wrap gap-1">
              {data.games.map((g) => {
                const game = GAMES.find((gm) => gm.key === g);
                return game ? (
                  <Chip key={g} size="sm" variant="bordered">
                    {game.label}
                  </Chip>
                ) : null;
              })}
              {data.games.length === 0 && (
                <span className="text-sm text-default-500">
                  No games selected
                </span>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <h5 className="font-semibold mb-2">Languages</h5>
            <div className="flex flex-wrap gap-1">
              {data.languages.map((l) => {
                const lang = LANGUAGES.find((lg) => lg.key === l);
                return lang ? (
                  <Chip key={l} size="sm" variant="bordered">
                    {lang.label}
                  </Chip>
                ) : null;
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <h5 className="font-semibold mb-2">Session Options</h5>
            <div className="space-y-1 text-sm">
              {data.sessionLengths.map((length) => (
                <p key={length}>
                  {length} min - ${((length / 60) * data.hourlyRate).toFixed(0)}
                </p>
              ))}
              {data.trialEnabled && (
                <p className="text-success">
                  ✓ {data.trialDuration} min free trial available
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <h5 className="font-semibold mb-2">Availability</h5>
            <p className="text-sm">{data.availableHours} hours/week</p>
            <p className="text-xs text-default-500 mt-1">{data.timezone}</p>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-success/10 border-none">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <Icon
              icon="solar:check-circle-bold"
              className="w-6 h-6 text-success"
            />
            <div>
              <h5 className="font-semibold">Ready to publish!</h5>
              <p className="text-sm text-default-600">
                Your profile will be reviewed and published within 24 hours.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CoachProfileCreation({
  onComplete,
  onCancel,
  initialData,
}: CoachProfileCreationProps) {
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [profileData, setProfileData] = useState<CoachProfileData>({
    ...DEFAULT_PROFILE,
    ...initialData,
  });

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const updateProfile = useCallback((updates: Partial<CoachProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  const handleSubmit = () => {
    onComplete(profileData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case "basic":
        return profileData.displayName.length >= 2;
      case "experience":
        return (
          profileData.games.length > 0 && profileData.specialties.length > 0
        );
      case "availability":
        return profileData.languages.length > 0;
      case "pricing":
        return (
          profileData.hourlyRate >= 5 && profileData.sessionLengths.length > 0
        );
      case "review":
        return true;
      default:
        return false;
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="flex flex-col gap-2 pb-0">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-bold">Become a Coach</h2>
          <Button variant="light" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <Progress
          value={progress}
          size="sm"
          color="primary"
          className="max-w-full"
        />
      </CardHeader>

      <CardBody className="p-6">
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={goToStep}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === "basic" && (
              <BasicInfoStep data={profileData} onChange={updateProfile} />
            )}
            {currentStep === "experience" && (
              <ExperienceStep data={profileData} onChange={updateProfile} />
            )}
            {currentStep === "availability" && (
              <AvailabilityStep data={profileData} onChange={updateProfile} />
            )}
            {currentStep === "pricing" && (
              <PricingStep data={profileData} onChange={updateProfile} />
            )}
            {currentStep === "review" && <ReviewStep data={profileData} />}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-divider">
          <Button
            variant="flat"
            onClick={prevStep}
            isDisabled={currentStepIndex === 0}
            startContent={
              <Icon icon="solar:arrow-left-bold" className="w-4 h-4" />
            }
          >
            Back
          </Button>

          {currentStep === "review" ? (
            <Button
              color="success"
              onClick={handleSubmit}
              endContent={<Icon icon="solar:check-bold" className="w-4 h-4" />}
            >
              Submit Profile
            </Button>
          ) : (
            <Button
              color="primary"
              onClick={nextStep}
              isDisabled={!isStepValid()}
              endContent={
                <Icon icon="solar:arrow-right-bold" className="w-4 h-4" />
              }
            >
              Continue
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default CoachProfileCreation;
