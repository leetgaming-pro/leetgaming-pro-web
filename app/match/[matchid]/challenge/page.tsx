"use client";

/**
 * Match Challenge Page
 * Create or view challenges for a specific match
 * Supports VAR review, round restart, bug reports, and disputes
 */

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  Button,
  Spinner,
  Input,
  Textarea,
  Select,
  SelectItem,
  RadioGroup,
  Radio,
  Divider,
  Tooltip,
  Progress,
  Breadcrumbs,
  BreadcrumbItem,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";
import { PageContainer } from "@/components/layout/page-container";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import {
  ChallengeType,
  ChallengePriority,
  CreateChallengeRequest,
} from "@/types/replay-api/challenge.types";

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

// Challenge type configurations
const challengeTypes: {
  key: ChallengeType;
  label: string;
  description: string;
  icon: string;
  color: string;
}[] = [
  {
    key: "var_review",
    label: "VAR Review",
    description: "Request a video review of a specific moment in the match",
    icon: "solar:video-frame-play-vertical-bold",
    color: "from-blue-500 to-cyan-500",
  },
  {
    key: "round_restart",
    label: "Round Restart",
    description: "Request to restart a round due to technical issues",
    icon: "solar:refresh-circle-bold",
    color: "from-amber-500 to-orange-500",
  },
  {
    key: "bug_report",
    label: "Bug Report",
    description: "Report a game bug that affected the match outcome",
    icon: "solar:bug-bold",
    color: "from-purple-500 to-pink-500",
  },
  {
    key: "player_dispute",
    label: "Player Dispute",
    description: "Dispute player conduct or potential rule violations",
    icon: "solar:users-group-rounded-bold",
    color: "from-red-500 to-rose-500",
  },
];

export default function MatchChallengePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const matchId = params?.matchid as string;

  // Form state
  const [step, setStep] = useState(1);
  const [challengeType, setChallengeType] = useState<ChallengeType | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    round_number: "",
    tick_start: "",
    tick_end: "",
    priority: "normal" as ChallengePriority,
    affected_player_ids: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totalSteps = 3;

  const handleTypeSelect = (type: ChallengeType) => {
    setChallengeType(type);
    setStep(2);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!challengeType || !session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const request: CreateChallengeRequest = {
        match_id: matchId,
        type: challengeType,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        round_number: formData.round_number
          ? parseInt(formData.round_number)
          : undefined,
        affected_player_ids: formData.affected_player_ids.length > 0
          ? formData.affected_player_ids
          : undefined,
      };

      const result = await sdk.challenges.create(request);

      if (result) {
        setSuccess(true);
        setStep(4);
      } else {
        setError("Failed to create challenge. Please try again.");
      }
    } catch (err) {
      console.error("Challenge creation failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`
              w-10 h-10 flex items-center justify-center font-bold text-sm
              ${
                s < step
                  ? "bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C]"
                  : s === step
                    ? "bg-[#FF4654]/20 dark:bg-[#DCFF37]/20 text-[#FF4654] dark:text-[#DCFF37] border-2 border-[#FF4654] dark:border-[#DCFF37]"
                    : "bg-default-100 text-default-400"
              }
            `}
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
            }}
          >
            {s < step ? (
              <Icon icon="solar:check-circle-bold" width={20} />
            ) : (
              s
            )}
          </div>
        ))}
      </div>
      <Progress
        value={(step / totalSteps) * 100}
        classNames={{
          base: "h-1",
          indicator: "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
          track: "bg-default-200 dark:bg-default-100/20",
        }}
      />
      <div className="flex items-center justify-between mt-2 text-xs text-default-500">
        <span>Select Type</span>
        <span>Details</span>
        <span>Review</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {challengeTypes.map((type) => (
        <Card
          key={type.key}
          isPressable
          onPress={() => handleTypeSelect(type.key)}
          className={`
            bg-default-50/50 dark:bg-default-50/10 rounded-none border-2 
            ${
              challengeType === type.key
                ? "border-[#FF4654] dark:border-[#DCFF37]"
                : "border-transparent hover:border-default-300"
            }
            transition-all duration-200
          `}
        >
          <CardBody className="gap-4">
            <div
              className={`w-14 h-14 flex items-center justify-center bg-gradient-to-br ${type.color}`}
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
              }}
            >
              <Icon icon={type.icon} width={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                {type.label}
              </h3>
              <p className="text-sm text-default-500 mt-1">{type.description}</p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  const renderStep2 = () => (
    <Card className="bg-default-50/50 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10">
      <CardHeader className="border-b border-default-200 dark:border-default-100/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon={
                challengeTypes.find((t) => t.key === challengeType)?.icon ||
                "solar:shield-check-bold"
              }
              width={24}
              className="text-[#F5F0E1] dark:text-[#34445C]"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
              {challengeTypes.find((t) => t.key === challengeType)?.label}
            </h3>
            <p className="text-sm text-default-500">
              Provide details for your challenge
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="gap-6 py-6">
        <Input
          label="Challenge Title"
          placeholder="Brief summary of the issue"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          isRequired
          classNames={{
            inputWrapper:
              "bg-default-100 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10",
          }}
        />

        <Textarea
          label="Description"
          placeholder="Describe the issue in detail. Include what happened, when it occurred, and why you believe this warrants a challenge."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          minRows={4}
          isRequired
          classNames={{
            inputWrapper:
              "bg-default-100 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10",
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Round Number"
            placeholder="e.g., 15"
            type="number"
            value={formData.round_number}
            onChange={(e) => handleInputChange("round_number", e.target.value)}
            classNames={{
              inputWrapper:
                "bg-default-100 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10",
            }}
          />

          <Select
            label="Priority"
            selectedKeys={[formData.priority]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as ChallengePriority;
              handleInputChange("priority", value);
            }}
            classNames={{
              trigger:
                "bg-default-100 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10",
            }}
          >
            <SelectItem key="low">Low</SelectItem>
            <SelectItem key="normal">Normal</SelectItem>
            <SelectItem key="high">High</SelectItem>
            <SelectItem key="critical">Critical</SelectItem>
          </Select>
        </div>

        {(challengeType === "var_review" ||
          challengeType === "round_restart") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Tick"
              placeholder="Game tick where issue begins"
              type="number"
              value={formData.tick_start}
              onChange={(e) => handleInputChange("tick_start", e.target.value)}
              classNames={{
                inputWrapper:
                  "bg-default-100 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10",
              }}
            />
            <Input
              label="End Tick"
              placeholder="Game tick where issue ends"
              type="number"
              value={formData.tick_end}
              onChange={(e) => handleInputChange("tick_end", e.target.value)}
              classNames={{
                inputWrapper:
                  "bg-default-100 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10",
              }}
            />
          </div>
        )}
      </CardBody>
      <CardFooter className="border-t border-default-200 dark:border-default-100/10 justify-between">
        <Button
          variant="light"
          onPress={() => setStep(1)}
          startContent={<Icon icon="solar:arrow-left-linear" width={18} />}
          className="rounded-none"
        >
          Back
        </Button>
        <Button
          className="bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C] rounded-none"
          onPress={() => setStep(3)}
          isDisabled={!formData.title || !formData.description}
          endContent={<Icon icon="solar:arrow-right-linear" width={18} />}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="bg-default-50/50 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10">
      <CardHeader className="border-b border-default-200 dark:border-default-100/10">
        <div className="flex items-center gap-3">
          <Icon
            icon="solar:clipboard-check-bold"
            width={24}
            className="text-[#FF4654] dark:text-[#DCFF37]"
          />
          <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
            Review Your Challenge
          </h3>
        </div>
      </CardHeader>
      <CardBody className="gap-6 py-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-sm text-default-500">Type</span>
            <Chip
              className="rounded-none capitalize"
              startContent={
                <Icon
                  icon={
                    challengeTypes.find((t) => t.key === challengeType)?.icon ||
                    ""
                  }
                  width={16}
                />
              }
            >
              {challengeTypes.find((t) => t.key === challengeType)?.label}
            </Chip>
          </div>
          <Divider />
          <div className="flex justify-between items-start">
            <span className="text-sm text-default-500">Match ID</span>
            <span className="text-sm font-mono">{matchId}</span>
          </div>
          <Divider />
          <div className="flex justify-between items-start">
            <span className="text-sm text-default-500">Title</span>
            <span className="text-sm font-medium text-right max-w-xs">
              {formData.title}
            </span>
          </div>
          <Divider />
          <div>
            <span className="text-sm text-default-500">Description</span>
            <p className="mt-2 text-sm bg-default-100 dark:bg-default-50/10 p-4">
              {formData.description}
            </p>
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <span className="text-sm text-default-500">Round</span>
            <span className="text-sm">{formData.round_number || "N/A"}</span>
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <span className="text-sm text-default-500">Priority</span>
            <Chip
              size="sm"
              color={
                formData.priority === "critical"
                  ? "danger"
                  : formData.priority === "high"
                    ? "warning"
                    : "primary"
              }
              variant="flat"
              className="rounded-none capitalize"
            >
              {formData.priority}
            </Chip>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-danger-50 dark:bg-danger-900/20 text-danger">
            <Icon icon="solar:danger-triangle-bold" width={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </CardBody>
      <CardFooter className="border-t border-default-200 dark:border-default-100/10 justify-between">
        <Button
          variant="light"
          onPress={() => setStep(2)}
          startContent={<Icon icon="solar:arrow-left-linear" width={18} />}
          className="rounded-none"
          isDisabled={loading}
        >
          Back
        </Button>
        <Button
          className="bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C] rounded-none"
          onPress={handleSubmit}
          isLoading={loading}
          startContent={
            !loading && <Icon icon="solar:shield-check-bold" width={18} />
          }
        >
          Submit Challenge
        </Button>
      </CardFooter>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="bg-default-50/50 dark:bg-default-50/10 rounded-none border border-success/30 text-center">
      <CardBody className="gap-6 py-12">
        <div className="flex justify-center">
          <div
            className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-success to-success-600"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
            }}
          >
            <Icon icon="solar:check-circle-bold" width={48} className="text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            Challenge Submitted!
          </h2>
          <p className="text-default-500 mt-2 max-w-md mx-auto">
            Your challenge has been submitted for review. You will receive
            notifications as the review progresses.
          </p>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="light"
            className="rounded-none"
            onPress={() => router.push(`/match/${matchId}`)}
            startContent={<Icon icon="solar:arrow-left-linear" width={18} />}
          >
            Back to Match
          </Button>
          <Button
            className="bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C] rounded-none"
            onPress={() => router.push("/challenges")}
            startContent={<Icon icon="solar:list-bold" width={18} />}
          >
            View All Challenges
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  // Check authentication
  if (sessionStatus === "loading") {
    return (
      <PageContainer maxWidth="xl" padding="md">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner
            size="lg"
            classNames={{
              circle1: "border-b-[#FF4654] dark:border-b-[#DCFF37]",
              circle2: "border-b-[#FF4654] dark:border-b-[#DCFF37]",
            }}
          />
        </div>
      </PageContainer>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <PageContainer maxWidth="xl" padding="md">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <Icon
            icon="solar:lock-keyhole-bold"
            width={64}
            className="text-default-300"
          />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[#34445C] dark:text-[#F5F0E1]">
              Authentication Required
            </h2>
            <p className="text-default-500 mt-2">
              You must be signed in to submit a challenge.
            </p>
          </div>
          <Button
            className="bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C] rounded-none"
            onPress={() => router.push("/signin")}
          >
            Sign In
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl" padding="md">
      <div className="flex w-full flex-col items-center gap-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="self-start">
          <BreadcrumbItem href="/match-making">Matches</BreadcrumbItem>
          <BreadcrumbItem href={`/match/${matchId}`}>
            Match {matchId?.slice(0, 8)}
          </BreadcrumbItem>
          <BreadcrumbItem>Challenge</BreadcrumbItem>
        </Breadcrumbs>

        {/* Header */}
        <div className="flex w-full flex-col items-center text-center gap-4">
          <div
            className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon="solar:shield-plus-bold"
              width={36}
              className="text-[#F5F0E1] dark:text-[#34445C]"
            />
          </div>
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium">
            Match Integrity
          </h2>
          <h1
            className={title({
              size: "lg",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            Submit Challenge
          </h1>
          <p className={subtitle({ class: "mt-2 max-w-lg" })}>
            Report issues, request reviews, or dispute match outcomes
          </p>
        </div>

        {/* Step Indicator */}
        {step < 4 && renderStepIndicator()}

        {/* Step Content */}
        <div className="w-full max-w-3xl">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderSuccess()}
        </div>
      </div>
    </PageContainer>
  );
}

