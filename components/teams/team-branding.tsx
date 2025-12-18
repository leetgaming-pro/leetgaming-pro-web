"use client";

/**
 * Team Branding Component
 * Per PRD D.5.3 - Team Premium Feature
 *
 * Features:
 * - Team logo upload with preview
 * - Team banner upload with preview
 * - Image cropping and resizing
 * - Color theme customization
 * - Social media links management
 * - Branding preview across platform
 */

import React, { useState, useCallback, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Input,
  Chip,
  Divider,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Slider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface TeamBrandingData {
  teamId: string;
  name: string;
  tag: string;
  logo?: TeamImage;
  banner?: TeamImage;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  socialLinks: SocialLinks;
  description: string;
  tagline?: string;
}

export interface TeamImage {
  url: string;
  thumbnailUrl?: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  uploadedAt: string;
}

export interface SocialLinks {
  twitter?: string;
  discord?: string;
  youtube?: string;
  twitch?: string;
  instagram?: string;
  website?: string;
}

export interface ImageUploadResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

// ============================================================================
// Component Props
// ============================================================================

interface TeamBrandingProps {
  branding: TeamBrandingData;
  onUploadLogo: (file: File) => Promise<ImageUploadResult>;
  onUploadBanner: (file: File) => Promise<ImageUploadResult>;
  onRemoveLogo: () => void;
  onRemoveBanner: () => void;
  onUpdateColors: (colors: {
    primary: string;
    secondary: string;
    accent: string;
  }) => void;
  onUpdateSocialLinks: (links: SocialLinks) => void;
  onUpdateInfo: (info: { description: string; tagline?: string }) => void;
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function TeamBranding({
  branding,
  onUploadLogo,
  onUploadBanner,
  onRemoveLogo,
  onRemoveBanner,
  onUpdateColors,
  onUpdateSocialLinks,
  onUpdateInfo,
  className = "",
}: TeamBrandingProps) {
  const [activeTab, setActiveTab] = useState("logo-banner");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const previewModal = useDisclosure();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Branding</h2>
          <p className="text-default-500">
            Customize your team&apos;s visual identity
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            onPress={previewModal.onOpen}
            startContent={<Icon icon="mdi:eye" />}
          >
            Preview
          </Button>
          <Chip
            color="warning"
            variant="flat"
            startContent={<Icon icon="mdi:crown" />}
          >
            Team Premium
          </Chip>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            fullWidth
            classNames={{
              tabList: "rounded-none",
            }}
          >
            <Tab key="logo-banner" title="Logo & Banner" />
            <Tab key="colors" title="Colors" />
            <Tab key="social" title="Social Links" />
            <Tab key="info" title="Info" />
          </Tabs>

          <div className="p-6">
            {activeTab === "logo-banner" && (
              <LogoBannerTab
                branding={branding}
                onUploadLogo={onUploadLogo}
                onUploadBanner={onUploadBanner}
                onRemoveLogo={onRemoveLogo}
                onRemoveBanner={onRemoveBanner}
                isUploadingLogo={isUploadingLogo}
                setIsUploadingLogo={setIsUploadingLogo}
                isUploadingBanner={isUploadingBanner}
                setIsUploadingBanner={setIsUploadingBanner}
              />
            )}
            {activeTab === "colors" && (
              <ColorsTab branding={branding} onUpdateColors={onUpdateColors} />
            )}
            {activeTab === "social" && (
              <SocialLinksTab
                socialLinks={branding.socialLinks}
                onUpdateSocialLinks={onUpdateSocialLinks}
              />
            )}
            {activeTab === "info" && (
              <InfoTab branding={branding} onUpdateInfo={onUpdateInfo} />
            )}
          </div>
        </CardBody>
      </Card>

      {/* Preview Modal */}
      <BrandingPreviewModal
        isOpen={previewModal.isOpen}
        onClose={previewModal.onClose}
        branding={branding}
      />
    </div>
  );
}

// ============================================================================
// Logo & Banner Tab
// ============================================================================

interface LogoBannerTabProps {
  branding: TeamBrandingData;
  onUploadLogo: (file: File) => Promise<ImageUploadResult>;
  onUploadBanner: (file: File) => Promise<ImageUploadResult>;
  onRemoveLogo: () => void;
  onRemoveBanner: () => void;
  isUploadingLogo: boolean;
  setIsUploadingLogo: (v: boolean) => void;
  isUploadingBanner: boolean;
  setIsUploadingBanner: (v: boolean) => void;
}

function LogoBannerTab({
  branding,
  onUploadLogo,
  onUploadBanner,
  onRemoveLogo,
  onRemoveBanner,
  isUploadingLogo,
  setIsUploadingLogo,
  isUploadingBanner,
  setIsUploadingBanner,
}: LogoBannerTabProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingLogo(true);
      try {
        await onUploadLogo(file);
      } finally {
        setIsUploadingLogo(false);
        if (logoInputRef.current) {
          logoInputRef.current.value = "";
        }
      }
    },
    [onUploadLogo, setIsUploadingLogo]
  );

  const handleBannerUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingBanner(true);
      try {
        await onUploadBanner(file);
      } finally {
        setIsUploadingBanner(false);
        if (bannerInputRef.current) {
          bannerInputRef.current.value = "";
        }
      }
    },
    [onUploadBanner, setIsUploadingBanner]
  );

  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Logo</h3>
        <div className="flex gap-6">
          {/* Logo Preview */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-32 h-32 rounded-xl bg-content2 border-2 border-dashed border-default-300 flex items-center justify-center overflow-hidden"
              style={{
                backgroundImage: branding.logo
                  ? `url(${branding.logo.url})`
                  : undefined,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              {!branding.logo && (
                <Icon
                  icon="mdi:image-plus"
                  className="text-4xl text-default-400"
                />
              )}
            </div>
            <p className="text-xs text-default-500">128×128 px</p>
          </div>

          {/* Logo Controls */}
          <div className="flex-1 space-y-4">
            <div className="p-4 bg-content2 rounded-lg">
              <h4 className="font-medium mb-2">Logo Guidelines</h4>
              <ul className="text-sm text-default-500 space-y-1">
                <li>• Recommended size: 256×256 pixels or larger</li>
                <li>• Supported formats: PNG, JPG, WebP</li>
                <li>• Max file size: 5MB</li>
                <li>• Transparent background recommended</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                color="primary"
                variant="flat"
                isLoading={isUploadingLogo}
                onPress={() => logoInputRef.current?.click()}
                startContent={!isUploadingLogo && <Icon icon="mdi:upload" />}
              >
                Upload Logo
              </Button>
              {branding.logo && (
                <Button
                  color="danger"
                  variant="flat"
                  onPress={onRemoveLogo}
                  startContent={<Icon icon="mdi:trash" />}
                >
                  Remove
                </Button>
              )}
            </div>

            {branding.logo && (
              <div className="text-sm text-default-500">
                <p>Current: {branding.logo.originalFilename}</p>
                <p>
                  {branding.logo.width}×{branding.logo.height}px •{" "}
                  {(branding.logo.size / 1024).toFixed(1)}KB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Divider />

      {/* Banner Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Banner</h3>
        <div className="space-y-4">
          {/* Banner Preview */}
          <div
            className="w-full h-48 rounded-xl bg-content2 border-2 border-dashed border-default-300 flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: branding.banner
                ? `url(${branding.banner.url})`
                : undefined,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            {!branding.banner && (
              <div className="text-center">
                <Icon
                  icon="mdi:panorama-wide-angle"
                  className="text-4xl text-default-400 mb-2"
                />
                <p className="text-sm text-default-500">
                  Upload a banner image
                </p>
              </div>
            )}
          </div>

          {/* Banner Controls */}
          <div className="flex justify-between items-start">
            <div className="p-4 bg-content2 rounded-lg flex-1 mr-4">
              <h4 className="font-medium mb-2">Banner Guidelines</h4>
              <ul className="text-sm text-default-500 space-y-1">
                <li>• Recommended size: 1200×300 pixels</li>
                <li>• Supported formats: PNG, JPG, WebP</li>
                <li>• Max file size: 10MB</li>
                <li>
                  • Will be displayed on team profiles and tournament pages
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <Button
                color="primary"
                variant="flat"
                isLoading={isUploadingBanner}
                onPress={() => bannerInputRef.current?.click()}
                startContent={!isUploadingBanner && <Icon icon="mdi:upload" />}
              >
                Upload Banner
              </Button>
              {branding.banner && (
                <Button
                  color="danger"
                  variant="flat"
                  onPress={onRemoveBanner}
                  startContent={<Icon icon="mdi:trash" />}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {branding.banner && (
            <div className="text-sm text-default-500">
              <p>Current: {branding.banner.originalFilename}</p>
              <p>
                {branding.banner.width}×{branding.banner.height}px •{" "}
                {(branding.banner.size / 1024).toFixed(1)}KB
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Colors Tab
// ============================================================================

interface ColorsTabProps {
  branding: TeamBrandingData;
  onUpdateColors: (colors: {
    primary: string;
    secondary: string;
    accent: string;
  }) => void;
}

function ColorsTab({ branding, onUpdateColors }: ColorsTabProps) {
  const [colors, setColors] = useState({
    primary: branding.primaryColor,
    secondary: branding.secondaryColor,
    accent: branding.accentColor,
  });

  const handleColorChange = (
    key: "primary" | "secondary" | "accent",
    value: string
  ) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdateColors(colors);
  };

  const presetPalettes = [
    {
      name: "Classic",
      primary: "#3B82F6",
      secondary: "#1E3A8A",
      accent: "#FBBF24",
    },
    {
      name: "Fire",
      primary: "#EF4444",
      secondary: "#7C2D12",
      accent: "#F97316",
    },
    {
      name: "Forest",
      primary: "#22C55E",
      secondary: "#14532D",
      accent: "#A3E635",
    },
    {
      name: "Royal",
      primary: "#8B5CF6",
      secondary: "#4C1D95",
      accent: "#F472B6",
    },
    {
      name: "Ocean",
      primary: "#06B6D4",
      secondary: "#164E63",
      accent: "#2DD4BF",
    },
    {
      name: "Stealth",
      primary: "#64748B",
      secondary: "#1E293B",
      accent: "#F1F5F9",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Custom Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Colors</h3>
        <div className="grid grid-cols-3 gap-6">
          <ColorPicker
            label="Primary Color"
            value={colors.primary}
            onChange={(v) => handleColorChange("primary", v)}
            description="Main team color for logos and highlights"
          />
          <ColorPicker
            label="Secondary Color"
            value={colors.secondary}
            onChange={(v) => handleColorChange("secondary", v)}
            description="Background and accent elements"
          />
          <ColorPicker
            label="Accent Color"
            value={colors.accent}
            onChange={(v) => handleColorChange("accent", v)}
            description="CTAs and important highlights"
          />
        </div>
      </div>

      <Divider />

      {/* Preset Palettes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Preset Palettes</h3>
        <div className="grid grid-cols-3 gap-4">
          {presetPalettes.map((palette) => (
            <Card
              key={palette.name}
              isPressable
              isHoverable
              onPress={() => {
                setColors({
                  primary: palette.primary,
                  secondary: palette.secondary,
                  accent: palette.accent,
                });
              }}
              className={`${
                colors.primary === palette.primary &&
                colors.secondary === palette.secondary &&
                colors.accent === palette.accent
                  ? "border-2 border-primary"
                  : ""
              }`}
            >
              <CardBody className="p-3">
                <p className="font-medium mb-2">{palette.name}</p>
                <div className="flex gap-1">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: palette.secondary }}
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: palette.accent }}
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <Divider />

      {/* Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <Card>
          <CardBody
            className="p-4"
            style={{
              background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary}20)`,
            }}
          >
            <div className="flex items-center gap-4">
              <Avatar
                src={branding.logo?.url}
                name={branding.tag}
                size="lg"
                className="w-16 h-16"
                style={{
                  borderColor: colors.primary,
                  borderWidth: 3,
                }}
              />
              <div>
                <h4
                  className="text-xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {branding.name}
                </h4>
                <p className="text-sm" style={{ color: colors.accent }}>
                  [{branding.tag}]
                </p>
              </div>
              <Button
                size="sm"
                className="ml-auto"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.secondary,
                }}
              >
                Follow
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          color="primary"
          onPress={handleSave}
          startContent={<Icon icon="mdi:content-save" />}
        >
          Save Colors
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Color Picker Component
// ============================================================================

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorPicker({
  label,
  value,
  onChange,
  description,
}: ColorPickerProps) {
  const [hue, setHue] = useState(() => {
    const rgb = hexToRgb(value);
    if (!rgb) return 0;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return hsl.h;
  });

  const handleHueChange = (newHue: number | number[]) => {
    const h = Array.isArray(newHue) ? newHue[0] : newHue;
    setHue(h);
    const rgb = hslToRgb(h, 80, 50);
    onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="font-medium">{label}</label>
        {description && (
          <p className="text-xs text-default-500">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg border border-default-200"
          style={{ backgroundColor: value }}
        />
        <Input
          value={value}
          onValueChange={onChange}
          size="sm"
          className="flex-1"
          startContent={<span className="text-default-400">#</span>}
        />
      </div>

      <Slider
        size="sm"
        step={1}
        maxValue={360}
        minValue={0}
        value={hue}
        onChange={handleHueChange}
        className="w-full"
        renderThumb={({ index: _index, ...props }) => (
          <div
            {...props}
            className="group top-1/2 bg-background border-small border-default-200 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing w-5 h-5"
          >
            <span
              className="block w-full h-full rounded-full"
              style={{ backgroundColor: value }}
            />
          </div>
        )}
      />
    </div>
  );
}

// ============================================================================
// Social Links Tab
// ============================================================================

interface SocialLinksTabProps {
  socialLinks: SocialLinks;
  onUpdateSocialLinks: (links: SocialLinks) => void;
}

function SocialLinksTab({
  socialLinks,
  onUpdateSocialLinks,
}: SocialLinksTabProps) {
  const [links, setLinks] = useState<SocialLinks>(socialLinks);

  const handleLinkChange = (key: keyof SocialLinks, value: string) => {
    setLinks((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const handleSave = () => {
    onUpdateSocialLinks(links);
  };

  const socialPlatforms = [
    {
      key: "twitter" as const,
      label: "Twitter / X",
      icon: "mdi:twitter",
      placeholder: "https://twitter.com/yourteam",
    },
    {
      key: "discord" as const,
      label: "Discord",
      icon: "mdi:discord",
      placeholder: "https://discord.gg/invite",
    },
    {
      key: "youtube" as const,
      label: "YouTube",
      icon: "mdi:youtube",
      placeholder: "https://youtube.com/@channel",
    },
    {
      key: "twitch" as const,
      label: "Twitch",
      icon: "mdi:twitch",
      placeholder: "https://twitch.tv/channel",
    },
    {
      key: "instagram" as const,
      label: "Instagram",
      icon: "mdi:instagram",
      placeholder: "https://instagram.com/yourteam",
    },
    {
      key: "website" as const,
      label: "Website",
      icon: "mdi:web",
      placeholder: "https://yourteam.com",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
        <p className="text-default-500 mb-6">
          Add your team&apos;s social media profiles to help fans follow you
          across platforms.
        </p>

        <div className="space-y-4">
          {socialPlatforms.map((platform) => (
            <div key={platform.key} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-content2 flex items-center justify-center">
                <Icon icon={platform.icon} className="text-xl" />
              </div>
              <Input
                label={platform.label}
                placeholder={platform.placeholder}
                value={links[platform.key] || ""}
                onValueChange={(v) => handleLinkChange(platform.key, v)}
                startContent={
                  links[platform.key] && (
                    <Icon icon="mdi:check-circle" className="text-success" />
                  )
                }
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Connected Accounts Summary */}
      <div className="p-4 bg-content2 rounded-lg">
        <h4 className="font-medium mb-2">Connected Accounts</h4>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(links).filter(([, v]) => v).length === 0 ? (
            <p className="text-sm text-default-500">
              No accounts connected yet
            </p>
          ) : (
            Object.entries(links)
              .filter(([, v]) => v)
              .map(([key]) => {
                const platform = socialPlatforms.find((p) => p.key === key);
                return (
                  <Chip
                    key={key}
                    startContent={<Icon icon={platform?.icon || "mdi:link"} />}
                    variant="flat"
                  >
                    {platform?.label}
                  </Chip>
                );
              })
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          color="primary"
          onPress={handleSave}
          startContent={<Icon icon="mdi:content-save" />}
        >
          Save Links
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Info Tab
// ============================================================================

interface InfoTabProps {
  branding: TeamBrandingData;
  onUpdateInfo: (info: { description: string; tagline?: string }) => void;
}

function InfoTab({ branding, onUpdateInfo }: InfoTabProps) {
  const [description, setDescription] = useState(branding.description);
  const [tagline, setTagline] = useState(branding.tagline || "");

  const handleSave = () => {
    onUpdateInfo({
      description,
      tagline: tagline || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Information</h3>

        <div className="space-y-4">
          <div>
            <Input
              label="Tagline"
              placeholder="Your team's catchphrase or motto"
              value={tagline}
              onValueChange={setTagline}
              maxLength={50}
              description={`${tagline.length}/50 characters`}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell fans about your team, your history, achievements, and goals..."
              className="w-full min-h-[150px] p-3 rounded-lg bg-content2 border border-default-200 focus:border-primary outline-none resize-y"
              maxLength={500}
            />
            <p className="text-xs text-default-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h4 className="font-medium mb-2">Preview</h4>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar src={branding.logo?.url} name={branding.tag} size="md" />
              <div>
                <h5 className="font-bold">{branding.name}</h5>
                {tagline && (
                  <p className="text-sm text-default-500 italic">
                    &ldquo;{tagline}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-sm text-default-600">
              {description || "No description provided"}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          color="primary"
          onPress={handleSave}
          startContent={<Icon icon="mdi:content-save" />}
        >
          Save Info
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Branding Preview Modal
// ============================================================================

interface BrandingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: TeamBrandingData;
}

function BrandingPreviewModal({
  isOpen,
  onClose,
  branding,
}: BrandingPreviewModalProps) {
  const [previewType, setPreviewType] = useState<
    "profile" | "card" | "tournament"
  >("profile");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>
          <div>
            <h3>Branding Preview</h3>
            <p className="text-sm text-default-500 font-normal">
              See how your branding looks across the platform
            </p>
          </div>
        </ModalHeader>
        <ModalBody>
          <Tabs
            selectedKey={previewType}
            onSelectionChange={(key) =>
              setPreviewType(key as typeof previewType)
            }
          >
            <Tab key="profile" title="Profile Page" />
            <Tab key="card" title="Team Card" />
            <Tab key="tournament" title="Tournament View" />
          </Tabs>

          <div className="mt-4">
            {previewType === "profile" && (
              <ProfilePreview branding={branding} />
            )}
            {previewType === "card" && <CardPreview branding={branding} />}
            {previewType === "tournament" && (
              <TournamentPreview branding={branding} />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ProfilePreview({ branding }: { branding: TeamBrandingData }) {
  return (
    <div className="rounded-lg overflow-hidden border border-default-200">
      {/* Banner */}
      <div
        className="h-32 bg-gradient-to-r from-primary to-secondary"
        style={{
          backgroundImage: branding.banner
            ? `url(${branding.banner.url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          background: !branding.banner
            ? `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
            : undefined,
        }}
      />
      {/* Content */}
      <div className="p-4 relative">
        <Avatar
          src={branding.logo?.url}
          name={branding.tag}
          className="w-20 h-20 -mt-14 border-4 border-background"
          style={{ borderColor: branding.primaryColor }}
        />
        <div className="mt-2">
          <h3 className="text-xl font-bold">{branding.name}</h3>
          {branding.tagline && (
            <p className="text-sm italic text-default-500">
              &ldquo;{branding.tagline}&rdquo;
            </p>
          )}
          <p className="text-sm text-default-600 mt-2 line-clamp-2">
            {branding.description}
          </p>
        </div>
        <div className="flex gap-2 mt-3">
          {Object.entries(branding.socialLinks)
            .filter(([, v]) => v)
            .slice(0, 4)
            .map(([key]) => (
              <Tooltip key={key} content={key}>
                <Button isIconOnly size="sm" variant="flat">
                  <Icon icon={`mdi:${key}`} />
                </Button>
              </Tooltip>
            ))}
        </div>
      </div>
    </div>
  );
}

function CardPreview({ branding }: { branding: TeamBrandingData }) {
  return (
    <div className="flex justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-72"
      >
        <Card
          className="overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${branding.secondaryColor}20, ${branding.primaryColor}10)`,
          }}
        >
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={branding.logo?.url}
                name={branding.tag}
                size="lg"
                className="border-2"
                style={{ borderColor: branding.primaryColor }}
              />
              <div>
                <h4 className="font-bold">{branding.name}</h4>
                <Chip
                  size="sm"
                  variant="flat"
                  style={{ backgroundColor: branding.accentColor + "30" }}
                >
                  [{branding.tag}]
                </Chip>
              </div>
            </div>
            {branding.tagline && (
              <p className="text-xs text-default-500 mt-3 italic">
                &ldquo;{branding.tagline}&rdquo;
              </p>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

function TournamentPreview({ branding }: { branding: TeamBrandingData }) {
  return (
    <div className="space-y-4">
      {/* Bracket Match Preview */}
      <Card>
        <CardBody className="p-4">
          <h4 className="text-sm font-medium text-default-500 mb-3">
            Bracket View
          </h4>
          <div className="flex items-center justify-between p-3 bg-content2 rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar
                src={branding.logo?.url}
                name={branding.tag}
                size="sm"
                style={{ borderColor: branding.primaryColor, borderWidth: 2 }}
              />
              <span className="font-bold">{branding.name}</span>
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: branding.primaryColor }}
            >
              13
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-content2 rounded-lg mt-1">
            <div className="flex items-center gap-3">
              <Avatar name="OPP" size="sm" />
              <span>Opponent Team</span>
            </div>
            <span className="text-xl">8</span>
          </div>
        </CardBody>
      </Card>

      {/* Stream Overlay Preview */}
      <Card>
        <CardBody className="p-4">
          <h4 className="text-sm font-medium text-default-500 mb-3">
            Stream Overlay
          </h4>
          <div
            className="p-4 rounded-lg flex items-center justify-between"
            style={{
              background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
            }}
          >
            <div className="flex items-center gap-3">
              <Avatar
                src={branding.logo?.url}
                name={branding.tag}
                size="md"
                className="border-2 border-white"
              />
              <span className="text-white font-bold text-lg">
                {branding.name}
              </span>
            </div>
            <span
              className="text-2xl font-bold px-4 py-1 rounded"
              style={{ backgroundColor: branding.accentColor }}
            >
              13
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ============================================================================
// Color Utility Functions
// ============================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// ============================================================================
// Compact Components
// ============================================================================

export function TeamLogoUploader({
  currentLogo,
  onUpload,
  isUploading,
}: {
  currentLogo?: TeamImage;
  onUpload: (file: File) => void;
  isUploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4">
      <Avatar
        src={currentLogo?.url}
        className="w-16 h-16"
        showFallback
        fallback={<Icon icon="mdi:account-group" className="text-2xl" />}
      />
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        <Button
          size="sm"
          variant="flat"
          isLoading={isUploading}
          onPress={() => inputRef.current?.click()}
          startContent={!isUploading && <Icon icon="mdi:upload" />}
        >
          Upload Logo
        </Button>
      </div>
    </div>
  );
}

export function TeamColorBadge({
  colors,
}: {
  colors: { primary: string; secondary: string; accent: string };
}) {
  return (
    <div className="flex gap-1">
      <Tooltip content="Primary">
        <div
          className="w-5 h-5 rounded-full border border-default-200"
          style={{ backgroundColor: colors.primary }}
        />
      </Tooltip>
      <Tooltip content="Secondary">
        <div
          className="w-5 h-5 rounded-full border border-default-200"
          style={{ backgroundColor: colors.secondary }}
        />
      </Tooltip>
      <Tooltip content="Accent">
        <div
          className="w-5 h-5 rounded-full border border-default-200"
          style={{ backgroundColor: colors.accent }}
        />
      </Tooltip>
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

const TeamBrandingComponents = {
  TeamBranding,
  TeamLogoUploader,
  TeamColorBadge,
};

export default TeamBrandingComponents;
