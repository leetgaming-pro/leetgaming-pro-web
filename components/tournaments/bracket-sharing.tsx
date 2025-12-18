/**
 * Bracket Sharing Component
 * Public URLs for tournament brackets per PRD D.5.1
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Switch,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface BracketTeam {
  id: string;
  name: string;
  logo?: string;
  seed?: number;
  score?: number;
  isWinner?: boolean;
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  team1?: BracketTeam;
  team2?: BracketTeam;
  winnerId?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  streamUrl?: string;
  vodUrl?: string;
}

export interface BracketData {
  id: string;
  tournamentId: string;
  tournamentName: string;
  format: "single-elimination" | "double-elimination" | "round-robin" | "swiss";
  size: number;
  matches: BracketMatch[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareSettings {
  isPublic: boolean;
  allowEmbed: boolean;
  showScores: boolean;
  showSchedule: boolean;
  showTeamLogos: boolean;
  expiresAt?: Date;
  customSlug?: string;
}

export interface BracketShareProps {
  bracket: BracketData;
  shareUrl: string;
  embedCode?: string;
  settings: ShareSettings;
  onSettingsChange: (settings: ShareSettings) => void;
  onGenerateLink?: () => void;
  className?: string;
}

export interface BracketEmbedPreviewProps {
  bracket: BracketData;
  settings: ShareSettings;
  className?: string;
}

export interface BracketPublicViewProps {
  bracket: BracketData;
  settings: ShareSettings;
  isEmbed?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SHARE_PLATFORMS = [
  { id: "twitter", name: "Twitter/X", icon: "mdi:twitter", color: "#1DA1F2" },
  { id: "discord", name: "Discord", icon: "mdi:discord", color: "#5865F2" },
  { id: "reddit", name: "Reddit", icon: "mdi:reddit", color: "#FF4500" },
  { id: "facebook", name: "Facebook", icon: "mdi:facebook", color: "#1877F2" },
  { id: "telegram", name: "Telegram", icon: "mdi:telegram", color: "#0088CC" },
];

// ============================================================================
// Utils
// ============================================================================

function generateShareUrl(platform: string, url: string, text: string): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case "discord":
      // Discord doesn't have a share URL, copy to clipboard
      return url;
    case "reddit":
      return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    default:
      return url;
  }
}

function getEmbedCode(
  url: string,
  width: number = 800,
  height: number = 600
): string {
  return `<iframe 
  src="${url}?embed=true" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  allowfullscreen
  title="Tournament Bracket"
></iframe>`;
}

function getRoundName(round: number, totalRounds: number): string {
  const fromFinal = totalRounds - round;
  switch (fromFinal) {
    case 0:
      return "Finals";
    case 1:
      return "Semifinals";
    case 2:
      return "Quarterfinals";
    default:
      return `Round ${round}`;
  }
}

// ============================================================================
// Components
// ============================================================================

/**
 * Bracket Share Dialog
 */
export function BracketShareDialog({
  bracket,
  shareUrl,
  settings,
  onSettingsChange,
  onGenerateLink,
  className = "",
}: BracketShareProps) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const [activeTab, setActiveTab] = useState<"share" | "embed" | "settings">(
    "share"
  );
  const embedModal = useDisclosure();

  const embedCode = useMemo(() => getEmbedCode(shareUrl), [shareUrl]);
  const shareText = `Check out the ${bracket.tournamentName} bracket!`;

  const handleCopy = async (text: string, type: "link" | "embed") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSharePlatform = (platformId: string) => {
    const url = generateShareUrl(platformId, shareUrl, shareText);
    if (platformId === "discord") {
      handleCopy(shareUrl, "link");
    } else {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex items-center justify-between pb-0">
        <div className="flex items-center gap-2">
          <Icon icon="solar:share-bold" className="w-5 h-5 text-primary" />
          <span className="font-semibold">Share Bracket</span>
        </div>
        <Chip
          size="sm"
          variant="flat"
          color={settings.isPublic ? "success" : "default"}
        >
          {settings.isPublic ? "Public" : "Private"}
        </Chip>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-divider pb-2">
          {[
            { key: "share", label: "Share", icon: "solar:share-bold" },
            { key: "embed", label: "Embed", icon: "solar:code-bold" },
            { key: "settings", label: "Settings", icon: "solar:settings-bold" },
          ].map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={activeTab === tab.key ? "flat" : "light"}
              color={activeTab === tab.key ? "primary" : "default"}
              startContent={<Icon icon={tab.icon} className="w-4 h-4" />}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Share Tab */}
        {activeTab === "share" && (
          <div className="space-y-4">
            {/* Share URL */}
            <div>
              <label className="text-sm text-default-500 mb-1 block">
                Share Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  size="sm"
                  startContent={
                    <Icon icon="solar:link-bold" className="text-default-400" />
                  }
                  className="flex-1"
                />
                <Button
                  size="sm"
                  color={copied === "link" ? "success" : "primary"}
                  onClick={() => handleCopy(shareUrl, "link")}
                >
                  {copied === "link" ? (
                    <>
                      <Icon
                        icon="solar:check-circle-bold"
                        className="w-4 h-4 mr-1"
                      />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:copy-bold" className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Share Platforms */}
            <div>
              <label className="text-sm text-default-500 mb-2 block">
                Share to
              </label>
              <div className="flex gap-2 flex-wrap">
                {SHARE_PLATFORMS.map((platform) => (
                  <Tooltip key={platform.id} content={platform.name}>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onClick={() => handleSharePlatform(platform.id)}
                      style={{ color: platform.color }}
                    >
                      <Icon icon={platform.icon} className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="p-4 bg-default-50 rounded-lg flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-lg p-2 flex items-center justify-center">
                <Icon
                  icon="solar:qr-code-bold"
                  className="w-16 h-16 text-default-900"
                />
              </div>
              <div>
                <p className="font-medium">QR Code</p>
                <p className="text-sm text-default-500">
                  Scan to view bracket on mobile
                </p>
                <Button size="sm" variant="flat" className="mt-2">
                  Download QR
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Embed Tab */}
        {activeTab === "embed" && (
          <div className="space-y-4">
            {!settings.allowEmbed && (
              <div className="p-3 bg-warning-50 text-warning-700 rounded-lg flex items-center gap-2">
                <Icon icon="solar:info-circle-bold" className="w-5 h-5" />
                <span className="text-sm">
                  Embedding is disabled. Enable it in settings.
                </span>
              </div>
            )}

            <div>
              <label className="text-sm text-default-500 mb-1 block">
                Embed Code
              </label>
              <textarea
                value={embedCode}
                readOnly
                rows={4}
                className="w-full p-3 rounded-lg bg-default-100 font-mono text-sm"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  color={copied === "embed" ? "success" : "primary"}
                  onClick={() => handleCopy(embedCode, "embed")}
                  isDisabled={!settings.allowEmbed}
                >
                  {copied === "embed" ? "Copied!" : "Copy Code"}
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  onClick={embedModal.onOpen}
                  isDisabled={!settings.allowEmbed}
                >
                  Preview
                </Button>
              </div>
            </div>

            {/* Size Presets */}
            <div>
              <label className="text-sm text-default-500 mb-2 block">
                Size Presets
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "Small", width: 600, height: 400 },
                  { label: "Medium", width: 800, height: 600 },
                  { label: "Large", width: 1000, height: 700 },
                  { label: "Full Width", width: "100%" as const, height: 600 },
                ].map((preset) => (
                  <Button
                    key={preset.label}
                    size="sm"
                    variant="flat"
                    onClick={() =>
                      handleCopy(
                        getEmbedCode(
                          shareUrl,
                          preset.width as number,
                          preset.height
                        ),
                        "embed"
                      )
                    }
                    isDisabled={!settings.allowEmbed}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Public Access</p>
                <p className="text-sm text-default-500">
                  Anyone with the link can view
                </p>
              </div>
              <Switch
                isSelected={settings.isPublic}
                onValueChange={(v) =>
                  onSettingsChange({ ...settings, isPublic: v })
                }
              />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow Embedding</p>
                <p className="text-sm text-default-500">
                  Others can embed this bracket
                </p>
              </div>
              <Switch
                isSelected={settings.allowEmbed}
                onValueChange={(v) =>
                  onSettingsChange({ ...settings, allowEmbed: v })
                }
              />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Scores</p>
                <p className="text-sm text-default-500">
                  Display match scores publicly
                </p>
              </div>
              <Switch
                isSelected={settings.showScores}
                onValueChange={(v) =>
                  onSettingsChange({ ...settings, showScores: v })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Schedule</p>
                <p className="text-sm text-default-500">Display match times</p>
              </div>
              <Switch
                isSelected={settings.showSchedule}
                onValueChange={(v) =>
                  onSettingsChange({ ...settings, showSchedule: v })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Team Logos</p>
                <p className="text-sm text-default-500">Display team images</p>
              </div>
              <Switch
                isSelected={settings.showTeamLogos}
                onValueChange={(v) =>
                  onSettingsChange({ ...settings, showTeamLogos: v })
                }
              />
            </div>

            <Divider />

            {/* Custom Slug */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Custom URL Slug
              </label>
              <Input
                size="sm"
                placeholder="my-tournament"
                value={settings.customSlug || ""}
                onChange={(e) =>
                  onSettingsChange({ ...settings, customSlug: e.target.value })
                }
                startContent={
                  <span className="text-default-400 text-sm">
                    leetgaming.pro/b/
                  </span>
                }
              />
            </div>

            {onGenerateLink && (
              <Button
                color="primary"
                className="w-full"
                onClick={onGenerateLink}
              >
                Generate New Link
              </Button>
            )}
          </div>
        )}
      </CardBody>

      {/* Embed Preview Modal */}
      <Modal isOpen={embedModal.isOpen} onClose={embedModal.onClose} size="4xl">
        <ModalContent>
          <ModalHeader>Embed Preview</ModalHeader>
          <ModalBody>
            <BracketEmbedPreview bracket={bracket} settings={settings} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={embedModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}

/**
 * Bracket Embed Preview
 */
export function BracketEmbedPreview({
  bracket,
  settings,
  className = "",
}: BracketEmbedPreviewProps) {
  return (
    <div
      className={`border-2 border-dashed border-default-200 rounded-lg p-4 ${className}`}
    >
      <div className="text-center mb-4">
        <p className="text-sm text-default-500">Preview of embedded bracket</p>
      </div>
      <BracketPublicView bracket={bracket} settings={settings} isEmbed />
    </div>
  );
}

/**
 * Public Bracket View (for sharing and embedding)
 */
export function BracketPublicView({
  bracket,
  settings,
  isEmbed = false,
  className = "",
}: BracketPublicViewProps) {
  const rounds = useMemo(() => {
    const roundMap = new Map<number, BracketMatch[]>();
    bracket.matches.forEach((match) => {
      const existing = roundMap.get(match.round) || [];
      roundMap.set(match.round, [...existing, match]);
    });
    return Array.from(roundMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [bracket.matches]);

  const totalRounds = rounds.length;

  return (
    <Card className={`${className} ${isEmbed ? "shadow-none border-0" : ""}`}>
      {/* Header */}
      <CardHeader className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{bracket.tournamentName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Chip size="sm" variant="flat">
              {bracket.format.replace("-", " ")}
            </Chip>
            <Chip size="sm" variant="flat">
              {bracket.size} Teams
            </Chip>
          </div>
        </div>
        {!isEmbed && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              startContent={
                <Icon icon="solar:refresh-bold" className="w-4 h-4" />
              }
            >
              Refresh
            </Button>
          </div>
        )}
      </CardHeader>

      <CardBody className="overflow-x-auto">
        {/* Bracket Grid */}
        <div className="flex gap-8 min-w-max pb-4">
          {rounds.map(([roundNum, matches]) => (
            <div key={roundNum} className="flex flex-col">
              {/* Round Header */}
              <div className="text-center mb-4">
                <p className="font-semibold">
                  {getRoundName(roundNum, totalRounds)}
                </p>
                <p className="text-xs text-default-400">
                  {matches.length} matches
                </p>
              </div>

              {/* Matches */}
              <div className="flex flex-col gap-4 justify-around flex-1">
                {matches.map((match, idx) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    settings={settings}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Powered By Badge (for embeds) */}
        {isEmbed && (
          <div className="flex justify-center mt-4 pt-4 border-t border-divider">
            <a
              href="https://leetgaming.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-default-400 hover:text-primary transition-colors"
            >
              <Icon icon="solar:gameboy-bold" className="w-4 h-4" />
              Powered by LeetGaming Pro
            </a>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * Individual Match Card in Bracket
 */
function BracketMatchCard({
  match,
  settings,
  index,
}: {
  match: BracketMatch;
  settings: ShareSettings;
  index: number;
}) {
  const TeamRow = ({
    team,
    isWinner,
  }: {
    team?: BracketTeam;
    isWinner?: boolean;
  }) => (
    <div
      className={`
        flex items-center justify-between p-2 
        ${isWinner ? "bg-success-50" : "bg-default-50"}
        first:rounded-t-lg last:rounded-b-lg
      `}
    >
      <div className="flex items-center gap-2">
        {settings.showTeamLogos && team?.logo && (
          <Avatar src={team.logo} size="sm" className="w-6 h-6" />
        )}
        {team?.seed && (
          <span className="text-xs text-default-400 w-4">{team.seed}</span>
        )}
        <span className={`font-medium ${isWinner ? "text-success-700" : ""}`}>
          {team?.name || "TBD"}
        </span>
      </div>
      {settings.showScores && team?.score !== undefined && (
        <span className={`font-bold ${isWinner ? "text-success-700" : ""}`}>
          {team.score}
        </span>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="w-48"
    >
      <Card className="overflow-hidden">
        <div className="divide-y divide-divider">
          <TeamRow
            team={match.team1}
            isWinner={match.winnerId === match.team1?.id}
          />
          <TeamRow
            team={match.team2}
            isWinner={match.winnerId === match.team2?.id}
          />
        </div>
        {settings.showSchedule && match.scheduledAt && !match.completedAt && (
          <div className="px-2 py-1 bg-default-100 text-center">
            <p className="text-xs text-default-500">
              {new Date(match.scheduledAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
        {(match.streamUrl || match.vodUrl) && (
          <div className="flex gap-1 p-1 bg-default-50">
            {match.streamUrl && (
              <Tooltip content="Watch Live">
                <Button size="sm" variant="light" isIconOnly className="w-full">
                  <Icon
                    icon="solar:play-stream-bold"
                    className="w-4 h-4 text-danger"
                  />
                </Button>
              </Tooltip>
            )}
            {match.vodUrl && (
              <Tooltip content="Watch VOD">
                <Button size="sm" variant="light" isIconOnly className="w-full">
                  <Icon
                    icon="solar:video-frame-play-bold"
                    className="w-4 h-4"
                  />
                </Button>
              </Tooltip>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/**
 * Share Button (simple trigger)
 */
export function BracketShareButton({
  bracket,
  shareUrl,
  settings,
  onSettingsChange,
  variant = "solid",
  size = "md",
}: {
  bracket: BracketData;
  shareUrl: string;
  settings: ShareSettings;
  onSettingsChange: (settings: ShareSettings) => void;
  variant?: "solid" | "flat" | "light";
  size?: "sm" | "md" | "lg";
}) {
  const modal = useDisclosure();

  return (
    <>
      <Button
        color="primary"
        variant={variant}
        size={size}
        startContent={<Icon icon="solar:share-bold" className="w-4 h-4" />}
        onClick={modal.onOpen}
      >
        Share Bracket
      </Button>

      <Modal isOpen={modal.isOpen} onClose={modal.onClose} size="lg">
        <ModalContent>
          <BracketShareDialog
            bracket={bracket}
            shareUrl={shareUrl}
            settings={settings}
            onSettingsChange={onSettingsChange}
          />
        </ModalContent>
      </Modal>
    </>
  );
}

// Default export
const BracketSharingComponents = {
  BracketShareDialog,
  BracketEmbedPreview,
  BracketPublicView,
  BracketShareButton,
};

export default BracketSharingComponents;
