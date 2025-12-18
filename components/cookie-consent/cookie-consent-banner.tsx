/**
 * Cookie Consent Banner Component
 * Comprehensive cookie consent with preference management per PRD E.8 / GDPR compliance
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Switch,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp?: number;
}

export interface CookieConsentBannerProps {
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onSavePreferences?: (preferences: CookiePreferences) => void;
  cookiePolicyUrl?: string;
  privacyPolicyUrl?: string;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "leetgaming_cookie_consent";

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  functional: true,
  analytics: false,
  marketing: false,
};

const COOKIE_CATEGORIES = [
  {
    key: "essential" as const,
    title: "Essential Cookies",
    description:
      "These cookies are necessary for the website to function and cannot be disabled. They are usually only set in response to actions made by you, such as setting your privacy preferences, logging in, or filling in forms.",
    examples: [
      "Authentication",
      "Security tokens",
      "Session management",
      "Cookie consent",
    ],
    required: true,
  },
  {
    key: "functional" as const,
    title: "Functional Cookies",
    description:
      "These cookies enable enhanced functionality and personalization, such as remembering your language preferences, region settings, and display preferences like dark mode.",
    examples: [
      "Language preference",
      "Theme settings",
      "Game filters",
      "Recently viewed",
    ],
    required: false,
  },
  {
    key: "analytics" as const,
    title: "Analytics Cookies",
    description:
      "These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. This helps us improve our services and user experience.",
    examples: [
      "Page views",
      "Feature usage",
      "Performance metrics",
      "Error tracking",
    ],
    required: false,
  },
  {
    key: "marketing" as const,
    title: "Marketing Cookies",
    description:
      "These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.",
    examples: [
      "Ad personalization",
      "Campaign tracking",
      "Social media integration",
    ],
    required: false,
  },
];

// ============================================================================
// Hook
// ============================================================================

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    null
  );
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has already consented
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
        setHasConsent(true);
      } catch {
        setHasConsent(false);
      }
    } else {
      setHasConsent(false);
    }
  }, []);

  const savePreferences = useCallback((prefs: CookiePreferences) => {
    const withTimestamp = { ...prefs, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
    setPreferences(withTimestamp);
    setHasConsent(true);
  }, []);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferences(null);
    setHasConsent(false);
  }, []);

  return {
    preferences,
    hasConsent,
    savePreferences,
    resetConsent,
  };
}

// ============================================================================
// Main Component
// ============================================================================

export function CookieConsentBanner({
  onAcceptAll,
  onRejectAll,
  onSavePreferences,
  cookiePolicyUrl = "/legal/cookies",
  privacyPolicyUrl = "/legal/privacy",
}: CookieConsentBannerProps) {
  const { preferences, hasConsent, savePreferences } = useCookieConsent();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempPreferences, setTempPreferences] =
    useState<CookiePreferences>(DEFAULT_PREFERENCES);

  // Don't show if already consented
  if (hasConsent === null || hasConsent === true) {
    return null;
  }

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    onAcceptAll?.();
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyEssential);
    onRejectAll?.();
  };

  const handleSaveSettings = () => {
    savePreferences(tempPreferences);
    onSavePreferences?.(tempPreferences);
    setIsSettingsOpen(false);
  };

  const handleOpenSettings = () => {
    setTempPreferences(preferences || DEFAULT_PREFERENCES);
    setIsSettingsOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed inset-x-0 bottom-0 z-50 pointer-events-none"
        >
          <div className="pointer-events-auto mx-4 mb-4 md:mx-auto md:max-w-4xl">
            <div className="rounded-xl border border-divider bg-background/95 backdrop-blur-xl shadow-lg p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Icon and Text */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon="solar:cookie-bold"
                      className="w-6 h-6 text-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Cookie Settings
                    </h3>
                    <p className="text-sm text-default-600">
                      We use cookies to enhance your gaming experience, analyze
                      site usage, and assist in our marketing efforts. Read our{" "}
                      <Link
                        href={cookiePolicyUrl}
                        size="sm"
                        className="underline"
                      >
                        Cookie Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href={privacyPolicyUrl}
                        size="sm"
                        className="underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                  <Button
                    variant="flat"
                    size="sm"
                    onClick={handleOpenSettings}
                    className="order-3 sm:order-1"
                  >
                    Manage Preferences
                  </Button>
                  <Button
                    variant="bordered"
                    size="sm"
                    onClick={handleRejectAll}
                    className="order-2"
                  >
                    Reject All
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={handleAcceptAll}
                    className="order-1 sm:order-3"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon icon="solar:cookie-bold" className="w-5 h-5 text-primary" />
            </div>
            <span>Cookie Preferences</span>
          </ModalHeader>

          <ModalBody>
            <p className="text-sm text-default-600 mb-4">
              We use different types of cookies to optimize your experience on
              our platform. You can choose which categories of cookies you want
              to allow. Note that blocking some types of cookies may impact your
              experience.
            </p>

            <Accordion
              selectionMode="multiple"
              defaultExpandedKeys={["essential"]}
            >
              {COOKIE_CATEGORIES.map((category) => (
                <AccordionItem
                  key={category.key}
                  aria-label={category.title}
                  title={
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium">{category.title}</span>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          isSelected={tempPreferences[category.key]}
                          isDisabled={category.required}
                          onValueChange={(checked) => {
                            setTempPreferences((prev) => ({
                              ...prev,
                              [category.key]: checked,
                            }));
                          }}
                          size="sm"
                        />
                      </div>
                    </div>
                  }
                >
                  <div className="pb-2">
                    <p className="text-sm text-default-600 mb-3">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.examples.map((example) => (
                        <span
                          key={example}
                          className="px-2 py-1 text-xs bg-default-100 rounded-md text-default-600"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                    {category.required && (
                      <p className="text-xs text-warning mt-2 flex items-center gap-1">
                        <Icon
                          icon="solar:info-circle-bold"
                          className="w-3 h-3"
                        />
                        These cookies are required and cannot be disabled
                      </p>
                    )}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveSettings}>
              Save Preferences
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// ============================================================================
// Trigger Button (for settings page)
// ============================================================================

export function CookieSettingsButton() {
  const { resetConsent } = useCookieConsent();

  return (
    <Button
      variant="flat"
      startContent={<Icon icon="solar:cookie-bold" className="w-4 h-4" />}
      onClick={resetConsent}
    >
      Manage Cookie Preferences
    </Button>
  );
}

export default CookieConsentBanner;
