/**
 * Discord Webhook Integration Component
 * Per PRD D.5.1 - Discord Notifications (Missing)
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Avatar,
  Switch,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export type NotificationEventType =
  | "tournament_start"
  | "tournament_registration"
  | "tournament_end"
  | "match_ready"
  | "match_result"
  | "match_reminder"
  | "team_invite"
  | "team_join"
  | "scrim_request"
  | "scrim_accepted"
  | "coaching_session"
  | "replay_analyzed"
  | "achievement_unlocked";

export interface DiscordWebhook {
  id: string;
  name: string;
  webhookUrl: string;
  serverName?: string;
  channelName?: string;
  avatarUrl?: string;
  enabled: boolean;
  events: NotificationEventType[];
  createdAt: Date;
  lastUsedAt?: Date;
  testStatus?: "success" | "failed" | "pending";
}

export interface DiscordWebhookFormData {
  name: string;
  webhookUrl: string;
  events: NotificationEventType[];
}

export interface DiscordWebhookManagerProps {
  webhooks: DiscordWebhook[];
  onAddWebhook: (data: DiscordWebhookFormData) => Promise<void>;
  onUpdateWebhook: (
    id: string,
    data: Partial<DiscordWebhookFormData>
  ) => Promise<void>;
  onDeleteWebhook: (id: string) => Promise<void>;
  onTestWebhook: (id: string) => Promise<boolean>;
  onToggleWebhook: (id: string, enabled: boolean) => Promise<void>;
  maxWebhooks?: number;
  className?: string;
}

export interface NotificationPreviewProps {
  eventType: NotificationEventType;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const EVENT_CONFIG: Record<
  NotificationEventType,
  {
    label: string;
    description: string;
    icon: string;
    category: "tournament" | "match" | "team" | "coaching" | "other";
    color: string;
  }
> = {
  tournament_start: {
    label: "Tournament Started",
    description: "When a tournament you registered for begins",
    icon: "solar:flag-bold",
    category: "tournament",
    color: "#5865F2",
  },
  tournament_registration: {
    label: "Tournament Registration",
    description: "New tournament registrations open",
    icon: "solar:clipboard-list-bold",
    category: "tournament",
    color: "#57F287",
  },
  tournament_end: {
    label: "Tournament Ended",
    description: "Final results and standings",
    icon: "solar:trophy-bold",
    category: "tournament",
    color: "#FEE75C",
  },
  match_ready: {
    label: "Match Ready",
    description: "Your match is ready to start",
    icon: "solar:play-bold",
    category: "match",
    color: "#ED4245",
  },
  match_result: {
    label: "Match Result",
    description: "Match scores and outcomes",
    icon: "solar:checklist-minimalistic-bold",
    category: "match",
    color: "#57F287",
  },
  match_reminder: {
    label: "Match Reminder",
    description: "Upcoming match reminders (15 min before)",
    icon: "solar:alarm-bold",
    category: "match",
    color: "#FEE75C",
  },
  team_invite: {
    label: "Team Invite",
    description: "When you receive a team invitation",
    icon: "solar:user-plus-bold",
    category: "team",
    color: "#5865F2",
  },
  team_join: {
    label: "Team Join",
    description: "When someone joins your team",
    icon: "solar:users-group-two-rounded-bold",
    category: "team",
    color: "#57F287",
  },
  scrim_request: {
    label: "Scrim Request",
    description: "Practice match requests from other teams",
    icon: "solar:gamepad-bold",
    category: "team",
    color: "#EB459E",
  },
  scrim_accepted: {
    label: "Scrim Accepted",
    description: "When a scrim request is accepted",
    icon: "solar:check-circle-bold",
    category: "team",
    color: "#57F287",
  },
  coaching_session: {
    label: "Coaching Session",
    description: "Session reminders and confirmations",
    icon: "solar:diploma-bold",
    category: "coaching",
    color: "#5865F2",
  },
  replay_analyzed: {
    label: "Replay Analyzed",
    description: "When your replay analysis is complete",
    icon: "solar:chart-bold",
    category: "other",
    color: "#57F287",
  },
  achievement_unlocked: {
    label: "Achievement Unlocked",
    description: "New achievements and milestones",
    icon: "solar:medal-ribbons-star-bold",
    category: "other",
    color: "#FEE75C",
  },
};

const EVENT_CATEGORIES: {
  key: string;
  label: string;
  events: NotificationEventType[];
}[] = [
  {
    key: "tournament",
    label: "Tournament Events",
    events: ["tournament_start", "tournament_registration", "tournament_end"],
  },
  {
    key: "match",
    label: "Match Events",
    events: ["match_ready", "match_result", "match_reminder"],
  },
  {
    key: "team",
    label: "Team Events",
    events: ["team_invite", "team_join", "scrim_request", "scrim_accepted"],
  },
  {
    key: "coaching",
    label: "Coaching",
    events: ["coaching_session"],
  },
  {
    key: "other",
    label: "Other",
    events: ["replay_analyzed", "achievement_unlocked"],
  },
];

// ============================================================================
// Utils
// ============================================================================

function validateWebhookUrl(url: string): boolean {
  // Discord webhook URL format: https://discord.com/api/webhooks/{webhook_id}/{webhook_token}
  const discordWebhookRegex =
    /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
  return discordWebhookRegex.test(url);
}

// ============================================================================
// Components
// ============================================================================

/**
 * Discord Webhook Manager
 */
export function DiscordWebhookManager({
  webhooks,
  onAddWebhook,
  onUpdateWebhook,
  onDeleteWebhook,
  onTestWebhook,
  onToggleWebhook,
  maxWebhooks = 5,
  className = "",
}: DiscordWebhookManagerProps) {
  const addModal = useDisclosure();
  const [editingWebhook, setEditingWebhook] = useState<DiscordWebhook | null>(
    null
  );

  const canAddMore = webhooks.length < maxWebhooks;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:discord" className="w-6 h-6 text-[#5865F2]" />
          <h3 className="text-lg font-semibold">Discord Notifications</h3>
        </div>
        <Tooltip
          content={
            canAddMore
              ? "Add new webhook"
              : `Maximum ${maxWebhooks} webhooks allowed`
          }
        >
          <Button
            color="primary"
            size="sm"
            startContent={
              <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
            }
            onClick={addModal.onOpen}
            isDisabled={!canAddMore}
          >
            Add Webhook
          </Button>
        </Tooltip>
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-[#5865F2]/10 rounded-lg mb-4 flex items-start gap-3">
        <Icon
          icon="solar:info-circle-bold"
          className="w-5 h-5 text-[#5865F2] mt-0.5"
        />
        <div>
          <p className="text-sm font-medium">
            How to get a Discord Webhook URL
          </p>
          <p className="text-xs text-default-500 mt-1">
            Server Settings → Integrations → Webhooks → New Webhook → Copy
            Webhook URL
          </p>
        </div>
      </div>

      {/* Webhook List */}
      <div className="space-y-3">
        <AnimatePresence>
          {webhooks.map((webhook) => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              onEdit={() => setEditingWebhook(webhook)}
              onDelete={() => onDeleteWebhook(webhook.id)}
              onTest={() => onTestWebhook(webhook.id)}
              onToggle={(enabled) => onToggleWebhook(webhook.id, enabled)}
            />
          ))}
        </AnimatePresence>

        {webhooks.length === 0 && (
          <Card>
            <CardBody className="text-center py-8">
              <Icon
                icon="mdi:discord"
                className="w-12 h-12 mx-auto text-default-300 mb-2"
              />
              <p className="font-medium">No webhooks configured</p>
              <p className="text-sm text-default-500 mt-1">
                Add a Discord webhook to receive notifications
              </p>
              <Button
                color="primary"
                className="mt-4"
                onClick={addModal.onOpen}
              >
                Add Your First Webhook
              </Button>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <WebhookFormModal
        isOpen={addModal.isOpen || !!editingWebhook}
        onClose={() => {
          addModal.onClose();
          setEditingWebhook(null);
        }}
        webhook={editingWebhook}
        onSubmit={async (data) => {
          if (editingWebhook) {
            await onUpdateWebhook(editingWebhook.id, data);
          } else {
            await onAddWebhook(data);
          }
          addModal.onClose();
          setEditingWebhook(null);
        }}
      />
    </div>
  );
}

/**
 * Individual Webhook Card
 */
function WebhookCard({
  webhook,
  onEdit,
  onDelete,
  onTest,
  onToggle,
}: {
  webhook: DiscordWebhook;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const deleteModal = useDisclosure();

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTest();
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      deleteModal.onClose();
    }
  };

  const enabledEventCount = webhook.events.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card>
        <CardBody className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar
                icon={<Icon icon="mdi:discord" className="w-5 h-5" />}
                classNames={{
                  base: "bg-[#5865F2]",
                  icon: "text-white",
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{webhook.name}</span>
                  {webhook.testStatus === "success" && (
                    <Chip size="sm" color="success" variant="flat">
                      Verified
                    </Chip>
                  )}
                  {webhook.testStatus === "failed" && (
                    <Chip size="sm" color="danger" variant="flat">
                      Failed
                    </Chip>
                  )}
                </div>
                {webhook.serverName && (
                  <p className="text-sm text-default-500 truncate">
                    {webhook.serverName} → #{webhook.channelName}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Chip size="sm" variant="flat">
                    {enabledEventCount} events
                  </Chip>
                  {webhook.lastUsedAt && (
                    <span className="text-xs text-default-400">
                      Last used{" "}
                      {new Date(webhook.lastUsedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Switch
                size="sm"
                isSelected={webhook.enabled}
                onValueChange={onToggle}
              />
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                onClick={handleTest}
                isLoading={isTesting}
              >
                <Icon icon="solar:test-tube-bold" className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="flat" isIconOnly onClick={onEdit}>
                <Icon icon="solar:pen-bold" className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="danger"
                isIconOnly
                onClick={deleteModal.onOpen}
              >
                <Icon
                  icon="solar:trash-bin-minimalistic-bold"
                  className="w-4 h-4"
                />
              </Button>
            </div>
          </div>

          {/* Event Pills */}
          {enabledEventCount > 0 && enabledEventCount <= 5 && (
            <div className="flex gap-1 mt-3 flex-wrap">
              {webhook.events.slice(0, 5).map((event) => (
                <Chip
                  key={event}
                  size="sm"
                  variant="dot"
                  classNames={{
                    dot: `bg-[${EVENT_CONFIG[event].color}]`,
                  }}
                >
                  {EVENT_CONFIG[event].label}
                </Chip>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Delete Webhook</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete <strong>{webhook.name}</strong>?
            </p>
            <p className="text-sm text-default-500 mt-2">
              You will stop receiving notifications to this channel.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={deleteModal.onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}

/**
 * Add/Edit Webhook Modal
 */
function WebhookFormModal({
  isOpen,
  onClose,
  webhook,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  webhook?: DiscordWebhook | null;
  onSubmit: (data: DiscordWebhookFormData) => Promise<void>;
}) {
  const [name, setName] = useState(webhook?.name || "");
  const [webhookUrl, setWebhookUrl] = useState(webhook?.webhookUrl || "");
  const [selectedEvents, setSelectedEvents] = useState<NotificationEventType[]>(
    webhook?.events || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState("");

  const isEditing = !!webhook;
  const isValid =
    name.trim() && validateWebhookUrl(webhookUrl) && selectedEvents.length > 0;

  const handleUrlChange = (url: string) => {
    setWebhookUrl(url);
    if (url && !validateWebhookUrl(url)) {
      setUrlError("Invalid Discord webhook URL");
    } else {
      setUrlError("");
    }
  };

  const toggleEvent = (event: NotificationEventType) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const toggleCategory = (events: NotificationEventType[]) => {
    const allSelected = events.every((e) => selectedEvents.includes(e));
    if (allSelected) {
      setSelectedEvents((prev) => prev.filter((e) => !events.includes(e)));
    } else {
      setSelectedEvents((prev) => Array.from(new Set([...prev, ...events])));
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        webhookUrl,
        events: selectedEvents,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when opening
  React.useEffect(() => {
    if (isOpen) {
      setName(webhook?.name || "");
      setWebhookUrl(webhook?.webhookUrl || "");
      setSelectedEvents(webhook?.events || []);
      setUrlError("");
    }
  }, [isOpen, webhook]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          {isEditing ? "Edit Webhook" : "Add Discord Webhook"}
        </ModalHeader>
        <ModalBody className="gap-4">
          {/* Name */}
          <Input
            label="Webhook Name"
            placeholder="e.g., Tournament Alerts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            startContent={
              <Icon icon="solar:text-bold" className="text-default-400" />
            }
          />

          {/* URL */}
          <Input
            label="Webhook URL"
            placeholder="https://discord.com/api/webhooks/..."
            value={webhookUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            errorMessage={urlError}
            isInvalid={!!urlError}
            startContent={
              <Icon icon="solar:link-bold" className="text-default-400" />
            }
          />

          <Divider />

          {/* Event Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Notification Events</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  onClick={() =>
                    setSelectedEvents(
                      Object.keys(EVENT_CONFIG) as NotificationEventType[]
                    )
                  }
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  onClick={() => setSelectedEvents([])}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {EVENT_CATEGORIES.map((category) => {
                const allSelected = category.events.every((e) =>
                  selectedEvents.includes(e)
                );
                const someSelected = category.events.some((e) =>
                  selectedEvents.includes(e)
                );

                return (
                  <div key={category.key}>
                    <div
                      className="flex items-center gap-2 mb-2 cursor-pointer"
                      onClick={() => toggleCategory(category.events)}
                    >
                      <Checkbox
                        isSelected={allSelected}
                        isIndeterminate={someSelected && !allSelected}
                        onValueChange={() => toggleCategory(category.events)}
                      />
                      <span className="font-medium">{category.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 ml-6">
                      {category.events.map((event) => {
                        const config = EVENT_CONFIG[event];
                        const isSelected = selectedEvents.includes(event);

                        return (
                          <div
                            key={event}
                            className={`
                              flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
                              ${
                                isSelected
                                  ? "bg-primary-50"
                                  : "hover:bg-default-100"
                              }
                            `}
                            onClick={() => toggleEvent(event)}
                          >
                            <Checkbox
                              isSelected={isSelected}
                              onValueChange={() => toggleEvent(event)}
                            />
                            <Icon
                              icon={config.icon}
                              className="w-4 h-4"
                              style={{ color: config.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {config.label}
                              </p>
                              <p className="text-xs text-default-400 truncate">
                                {config.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedEvents.length === 0 && (
            <div className="p-3 bg-warning-50 text-warning-700 rounded-lg flex items-center gap-2">
              <Icon icon="solar:info-circle-bold" className="w-5 h-5" />
              <span className="text-sm">
                Select at least one event to receive notifications
              </span>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={!isValid}
          >
            {isEditing ? "Save Changes" : "Add Webhook"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/**
 * Notification Preview Component
 */
export function NotificationPreview({
  eventType,
  className = "",
}: NotificationPreviewProps) {
  const config = EVENT_CONFIG[eventType];

  // Mock data for preview
  const previewData: Record<
    NotificationEventType,
    {
      title: string;
      description: string;
      fields?: { name: string; value: string }[];
    }
  > = {
    tournament_start: {
      title: "🎮 Tournament Started!",
      description: "The CS2 Weekly Cup has officially begun.",
      fields: [
        { name: "Tournament", value: "CS2 Weekly Cup #42" },
        { name: "Teams", value: "16" },
        { name: "Prize", value: "$500" },
      ],
    },
    tournament_registration: {
      title: "📋 New Tournament Open",
      description: "Registration is now open for a new tournament.",
      fields: [
        { name: "Tournament", value: "Pro League Qualifier" },
        { name: "Starts", value: "Dec 20, 2024" },
      ],
    },
    tournament_end: {
      title: "🏆 Tournament Ended",
      description: "Final results are in!",
      fields: [
        { name: "1st Place", value: "Team Alpha" },
        { name: "2nd Place", value: "Team Beta" },
      ],
    },
    match_ready: {
      title: "⚔️ Match Ready!",
      description: "Your match is ready to start now.",
      fields: [
        { name: "Opponent", value: "Team Omega" },
        { name: "Map", value: "de_dust2" },
      ],
    },
    match_result: {
      title: "✅ Match Complete",
      description: "Your team won!",
      fields: [
        { name: "Score", value: "16 - 12" },
        { name: "MVP", value: "player123" },
      ],
    },
    match_reminder: {
      title: "⏰ Match Reminder",
      description: "Your match starts in 15 minutes.",
      fields: [
        { name: "Opponent", value: "Team Delta" },
        { name: "Time", value: "3:00 PM EST" },
      ],
    },
    team_invite: {
      title: "💌 Team Invite",
      description: "You have been invited to join a team.",
      fields: [
        { name: "Team", value: "Pro Gamers" },
        { name: "From", value: "captain_john" },
      ],
    },
    team_join: {
      title: "👋 New Team Member",
      description: "A new player has joined your team.",
      fields: [
        { name: "Player", value: "new_player_99" },
        { name: "Role", value: "Rifler" },
      ],
    },
    scrim_request: {
      title: "🎮 Scrim Request",
      description: "A team wants to practice with you.",
      fields: [
        { name: "Team", value: "Team Sigma" },
        { name: "Proposed", value: "Tonight 8PM" },
      ],
    },
    scrim_accepted: {
      title: "✅ Scrim Confirmed",
      description: "Your practice match is scheduled.",
      fields: [
        { name: "Opponent", value: "Team Echo" },
        { name: "Time", value: "Tomorrow 6PM" },
      ],
    },
    coaching_session: {
      title: "📚 Coaching Session",
      description: "Your coaching session is starting soon.",
      fields: [
        { name: "Coach", value: "Coach_Pro" },
        { name: "Time", value: "In 30 minutes" },
      ],
    },
    replay_analyzed: {
      title: "📊 Replay Analyzed",
      description: "Your replay analysis is ready.",
      fields: [
        { name: "Match", value: "vs Team Zeta" },
        { name: "Rating", value: "A+" },
      ],
    },
    achievement_unlocked: {
      title: "🏅 Achievement Unlocked!",
      description: "You've earned a new achievement.",
      fields: [
        { name: "Achievement", value: "100 Wins" },
        { name: "XP Earned", value: "+500" },
      ],
    },
  };

  const preview = previewData[eventType];

  return (
    <Card className={`max-w-md ${className}`}>
      <CardBody className="p-0">
        {/* Discord-style embed preview */}
        <div
          className="p-3"
          style={{ borderLeft: `4px solid ${config.color}` }}
        >
          <div className="flex items-start gap-3">
            <Avatar
              icon={<Icon icon="solar:gameboy-bold" className="w-5 h-5" />}
              classNames={{ base: "bg-primary", icon: "text-white" }}
              size="sm"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">LeetGaming Pro</span>
                <Chip size="sm" variant="flat" className="h-4 text-[10px]">
                  BOT
                </Chip>
              </div>
              <div className="mt-2 bg-default-100 rounded-lg p-3">
                <p className="font-semibold">{preview.title}</p>
                <p className="text-sm text-default-500 mt-1">
                  {preview.description}
                </p>
                {preview.fields && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {preview.fields.map((field) => (
                      <div key={field.name}>
                        <p className="text-xs font-semibold text-default-400">
                          {field.name}
                        </p>
                        <p className="text-sm">{field.value}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3 text-xs text-default-400">
                  <Icon icon="solar:gameboy-bold" className="w-3 h-3" />
                  <span>LeetGaming Pro</span>
                  <span>•</span>
                  <span>Today at 3:45 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Quick Setup Guide
 */
export function DiscordSetupGuide({ className = "" }: { className?: string }) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Open Discord Server Settings",
      description: 'Right-click your server and select "Server Settings"',
      icon: "mdi:cog",
    },
    {
      title: "Go to Integrations",
      description: 'Click on "Integrations" in the left sidebar',
      icon: "solar:widget-bold",
    },
    {
      title: "Create Webhook",
      description: 'Click "Webhooks" → "New Webhook"',
      icon: "solar:add-circle-bold",
    },
    {
      title: "Copy URL",
      description: "Name your webhook, select channel, and copy the URL",
      icon: "solar:copy-bold",
    },
    {
      title: "Paste Here",
      description: "Add the webhook URL to LeetGaming Pro",
      icon: "solar:check-circle-bold",
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="solar:book-bold" className="w-5 h-5 text-primary" />
          <span className="font-semibold">Setup Guide</span>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {steps.map((s, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;

            return (
              <div
                key={stepNum}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
                  ${isActive ? "bg-primary-50" : "hover:bg-default-100"}
                `}
                onClick={() => setStep(stepNum)}
              >
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${
                    isCompleted
                      ? "bg-success text-white"
                      : isActive
                      ? "bg-primary text-white"
                      : "bg-default-200"
                  }
                `}
                >
                  {isCompleted ? (
                    <Icon icon="solar:check-bold" className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-bold">{stepNum}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-default-500">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-4">
          <Button
            size="sm"
            variant="flat"
            isDisabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            color="primary"
            isDisabled={step === steps.length}
            onClick={() => setStep((s) => s + 1)}
          >
            Next
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

// Default export
const DiscordWebhookComponents = {
  DiscordWebhookManager,
  NotificationPreview,
  DiscordSetupGuide,
};

export default DiscordWebhookComponents;
