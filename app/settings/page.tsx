"use client";

/**
 * Settings Page
 * User preferences, account settings, privacy, billing, and notifications
 * Supports URL-based tab selection via ?tab= query parameter
 * Mobile-first responsive design with native app-like experience
 *
 * @protected - Requires authentication
 */

import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useRef,
} from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Tabs,
  Tab,
  Input,
  Button,
  Switch,
  Select,
  SelectItem,
  Divider,
  Avatar,
  Spinner,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layouts/centered-content";
import { PrivacySettings } from "@/components/account/privacy-settings";
import { SubscriptionManagement } from "@/components/checkout/subscription-management";
import { PaymentHistory } from "@/components/checkout/payment-history";
import { MobileNavigation } from "@/components/ui";
import { logger } from "@/lib/logger";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { UserSettingsAPI } from "@/types/replay-api/settings.sdk";
import { useRequireAuth } from "@/hooks";

/**
 * Settings tab keys - matches URL query params
 */
enum SettingsTab {
  PROFILE = "profile",
  NOTIFICATIONS = "notifications",
  PRIVACY = "privacy",
  SECURITY = "security",
  BILLING = "billing",
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    isRedirecting,
  } = useRequireAuth();
  const tabParam = searchParams.get("tab") as SettingsTab | null;
  const sdkRef = useRef<ReplayAPISDK>();

  // Initialize SDK once
  if (!sdkRef.current) {
    sdkRef.current = new ReplayAPISDK(ReplayApiSettingsMock, logger);
  }

  // All useState hooks must be declared before any conditional returns
  const [selectedTab, setSelectedTab] = useState<string>(
    tabParam || SettingsTab.PROFILE,
  );
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    nickname: "",
    email: "",
    bio: "",
    country: "",
    timezone: "",
    avatarUri: "",
  });
  const [notifications, setNotifications] = useState({
    email_matches: true,
    email_teams: true,
    email_friends: true,
    email_marketing: false,
    push_matches: true,
    push_friends: true,
    push_messages: true,
  });
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  const handleTabChange = useCallback(
    (key: React.Key) => {
      const tab = key as string;
      setSelectedTab(tab);
      router.push(`/settings?tab=${tab}`, { scroll: false });
    },
    [router],
  );

  // Sync tab with URL
  useEffect(() => {
    if (tabParam && Object.values(SettingsTab).includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [tabParam]);

  // Fetch user profile from API
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setProfileLoading(true);
    try {
      const profile = await sdkRef.current?.playerProfiles.getMyProfile();
      if (profile) {
        setProfileId(profile.id);
        setProfileData({
          nickname: profile.nickname || user.name || "",
          email: user.email || "",
          bio: profile.description || "",
          country: profile.region || "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          avatarUri: profile.avatar_uri || user.image || "",
        });
      } else {
        // Fallback to user data if no profile exists
        setProfileData({
          nickname: user.name || "",
          email: user.email || "",
          bio: "",
          country: "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          avatarUri: user.image || "",
        });
      }
    } catch (error) {
      logger.error("Failed to fetch profile", error);
      // Fallback to user data on error
      setProfileData({
        nickname: user.name || "",
        email: user.email || "",
        bio: "",
        country: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatarUri: user.image || "",
      });
    } finally {
      setProfileLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Show loading while checking auth or redirecting
  if (authLoading || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner
          size="lg"
          label={
            authLoading
              ? "Checking authentication..."
              : "Redirecting to sign in..."
          }
        />
      </div>
    );
  }

  const handleProfileUpdate = async () => {
    if (!profileId) {
      logger.warn("Cannot update profile: no profile ID");
      return;
    }
    setSaving(true);
    try {
      await sdkRef.current?.playerProfiles.updatePlayerProfile(profileId, {
        nickname: profileData.nickname,
        description: profileData.bio,
        region: profileData.country,
        avatar_uri: profileData.avatarUri,
      });
      showToast("success", "Profile updated successfully!");
    } catch (error) {
      logger.error("Failed to update profile", error);
      showToast("error", "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      if (!sdkRef.current) return;
      // Use SDK instead of direct fetch
      const settingsApi = new UserSettingsAPI(sdkRef.current.client);
      const success =
        await settingsApi.updateNotificationSettings(notifications);
      if (!success) throw new Error("Failed to update notifications");
      showToast("success", "Notification settings saved!");
    } catch (error) {
      logger.error("Failed to update notification settings", error);
      showToast(
        "error",
        "Could not save notification settings. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E1] dark:bg-[#0a0a0a] pb-20 md:pb-0">
      <PageContainer
        title="Settings"
        description="Manage your account and preferences"
        maxWidth="7xl"
      >
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
            <Chip
              color={toast.type === "success" ? "success" : "danger"}
              variant="solid"
              size="lg"
              className="px-4 py-2"
              onClose={() => setToast(null)}
            >
              {toast.message}
            </Chip>
          </div>
        )}
        <Tabs
          aria-label="Settings tabs"
          size="lg"
          className="w-full"
          selectedKey={selectedTab}
          onSelectionChange={handleTabChange}
          classNames={{
            base: "w-full",
            tabList:
              "bg-white/90 dark:bg-[#1a1a1a] p-1 rounded-xl sm:rounded-none gap-0.5 sm:gap-1 shadow-sm overflow-x-auto flex-nowrap scrollbar-hide",
            tab: "text-xs sm:text-sm font-medium rounded-lg sm:rounded-none text-[#34445C] dark:text-white/70 data-[selected=true]:bg-[#34445C] dark:data-[selected=true]:bg-[#DCFF37] data-[selected=true]:text-white dark:data-[selected=true]:text-[#1a1a1a] min-w-max px-2 sm:px-4 py-2 sm:py-2.5",
            cursor: "bg-[#34445C] dark:bg-[#DCFF37] rounded-lg sm:rounded-none",
            panel: "pt-4",
          }}
        >
          <Tab
            key={SettingsTab.PROFILE}
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon
                  icon="solar:user-bold"
                  width={18}
                  className="sm:w-5 sm:h-5"
                />
                <span className="hidden sm:inline">Profile</span>
              </div>
            }
          >
            <Card className="rounded-xl sm:rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="bg-[#34445C]/5 dark:bg-[#DCFF37]/5 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#34445C] dark:text-white">
                  Profile Information
                </h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {profileLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="lg" label="Loading profile..." />
                  </div>
                ) : (
                  <>
                    {/* Avatar Upload - Mobile Responsive */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                      <Avatar
                        src={profileData.avatarUri || undefined}
                        name={profileData.nickname?.charAt(0) || "U"}
                        className="w-20 h-20 sm:w-24 sm:h-24"
                      />
                      <div className="text-center sm:text-left">
                        <Button
                          className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C] rounded-xl sm:rounded-none min-h-[44px]"
                          size="sm"
                          startContent={
                            <Icon icon="solar:camera-bold" width={18} />
                          }
                        >
                          Change Avatar
                        </Button>
                        <p className="text-xs text-default-500 mt-2">
                          JPG, PNG or GIF. Max size 2MB.
                        </p>
                      </div>
                    </div>

                    <Divider />

                    {/* Profile Fields - Mobile Stack */}
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Nickname"
                        placeholder="Enter your nickname"
                        value={profileData.nickname}
                        onValueChange={(value) =>
                          setProfileData({ ...profileData, nickname: value })
                        }
                        startContent={
                          <Icon icon="solar:user-bold" width={20} />
                        }
                        classNames={{
                          inputWrapper: "min-h-[48px]",
                          input: "text-base",
                        }}
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={profileData.email}
                        onValueChange={(value) =>
                          setProfileData({ ...profileData, email: value })
                        }
                        startContent={
                          <Icon icon="solar:letter-bold" width={20} />
                        }
                        classNames={{
                          inputWrapper: "min-h-[48px]",
                          input: "text-base",
                        }}
                      />
                    </div>

                    <Input
                      label="Bio"
                      placeholder="Tell us about yourself"
                      value={profileData.bio}
                      onValueChange={(value) =>
                        setProfileData({ ...profileData, bio: value })
                      }
                      startContent={<Icon icon="solar:text-bold" width={20} />}
                      classNames={{
                        inputWrapper: "min-h-[48px]",
                        input: "text-base",
                      }}
                    />

                    <div className="grid grid-cols-1 gap-4">
                      <Select
                        label="Country"
                        placeholder="Select your country"
                        selectedKeys={[profileData.country]}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            country: e.target.value,
                          })
                        }
                        startContent={
                          <Icon icon="solar:global-bold" width={20} />
                        }
                        classNames={{
                          trigger: "min-h-[48px]",
                        }}
                      >
                        <SelectItem key="USA" value="USA">
                          United States
                        </SelectItem>
                        <SelectItem key="CAN" value="CAN">
                          Canada
                        </SelectItem>
                        <SelectItem key="BRA" value="BRA">
                          Brazil
                        </SelectItem>
                        <SelectItem key="GER" value="GER">
                          Germany
                        </SelectItem>
                        <SelectItem key="FRA" value="FRA">
                          France
                        </SelectItem>
                      </Select>

                      <Select
                        label="Timezone"
                        placeholder="Select your timezone"
                        selectedKeys={[profileData.timezone]}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            timezone: e.target.value,
                          })
                        }
                        startContent={
                          <Icon icon="solar:clock-circle-bold" width={20} />
                        }
                        classNames={{
                          trigger: "min-h-[48px]",
                        }}
                      >
                        <SelectItem
                          key="America/New_York"
                          value="America/New_York"
                        >
                          Eastern Time (ET)
                        </SelectItem>
                        <SelectItem
                          key="America/Chicago"
                          value="America/Chicago"
                        >
                          Central Time (CT)
                        </SelectItem>
                        <SelectItem key="America/Denver" value="America/Denver">
                          Mountain Time (MT)
                        </SelectItem>
                        <SelectItem
                          key="America/Los_Angeles"
                          value="America/Los_Angeles"
                        >
                          Pacific Time (PT)
                        </SelectItem>
                        <SelectItem key="Europe/London" value="Europe/London">
                          London (GMT)
                        </SelectItem>
                        <SelectItem key="Europe/Paris" value="Europe/Paris">
                          Paris (CET)
                        </SelectItem>
                      </Select>
                    </div>

                    <Divider />

                    {/* Mobile-friendly action buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
                      <Button
                        variant="flat"
                        className="rounded-xl sm:rounded-none min-h-[44px] w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C] rounded-xl sm:rounded-none min-h-[44px] w-full sm:w-auto"
                        onPress={handleProfileUpdate}
                        isLoading={saving}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key={SettingsTab.NOTIFICATIONS}
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon
                  icon="solar:bell-bold"
                  width={18}
                  className="sm:w-5 sm:h-5"
                />
                <span className="hidden sm:inline">Notifications</span>
              </div>
            }
          >
            <Card className="rounded-xl sm:rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="bg-[#34445C]/5 dark:bg-[#DCFF37]/5 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  Notification Preferences
                </h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <Icon icon="solar:letter-bold" width={20} />
                    Email Notifications
                  </h3>
                  <div className="space-y-1">
                    {/* Mobile-optimized notification toggles */}
                    <div className="mobile-list-item !border-x-0 !px-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">
                          Match Updates
                        </div>
                        <div className="text-xs sm:text-sm text-default-500">
                          Receive emails about your matches
                        </div>
                      </div>
                      <Switch
                        isSelected={notifications.email_matches}
                        onValueChange={(value) =>
                          setNotifications({
                            ...notifications,
                            email_matches: value,
                          })
                        }
                        size="sm"
                      />
                    </div>
                    <div className="mobile-list-item !border-x-0 !px-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">
                          Team Invitations
                        </div>
                        <div className="text-xs sm:text-sm text-default-500">
                          Get notified when you&apos;re invited to teams
                        </div>
                      </div>
                      <Switch
                        isSelected={notifications.email_teams}
                        onValueChange={(value) =>
                          setNotifications({
                            ...notifications,
                            email_teams: value,
                          })
                        }
                        size="sm"
                      />
                    </div>
                    <div className="mobile-list-item !border-x-0 !px-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">
                          Friend Requests
                        </div>
                        <div className="text-xs sm:text-sm text-default-500">
                          Email notifications for friend requests
                        </div>
                      </div>
                      <Switch
                        isSelected={notifications.email_friends}
                        onValueChange={(value) =>
                          setNotifications({
                            ...notifications,
                            email_friends: value,
                          })
                        }
                        size="sm"
                      />
                    </div>
                    <div className="mobile-list-item !border-x-0 !px-0 !border-b-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">
                          Marketing & Updates
                        </div>
                        <div className="text-xs sm:text-sm text-default-500">
                          News, features, and special offers
                        </div>
                      </div>
                      <Switch
                        isSelected={notifications.email_marketing}
                        onValueChange={(value) =>
                          setNotifications({
                            ...notifications,
                            email_marketing: value,
                          })
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Push Notifications */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <Icon icon="solar:notification-unread-bold" width={20} />
                    Push Notifications
                  </h3>
                  <div className="space-y-1">
                    <div className="mobile-list-item !border-x-0 !px-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">
                          Match Results
                        </div>
                        <div className="text-xs sm:text-sm text-default-500">
                          Push notifications for match results
                        </div>
                      </div>
                      <Switch
                        isSelected={notifications.push_matches}
                        onValueChange={(value) =>
                          setNotifications({
                            ...notifications,
                            push_matches: value,
                          })
                        }
                        size="sm"
                      />
                    </div>
                    <div className="mobile-list-item !border-x-0 !px-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">
                          Friend Activity
                        </div>
                        <div className="text-xs sm:text-sm text-default-500">
                          When friends come online or send requests
                        </div>
                      </div>
                      <Switch
                        isSelected={notifications.push_friends}
                        onValueChange={(value) =>
                          setNotifications({
                            ...notifications,
                            push_friends: value,
                          })
                        }
                        size="sm"
                      />
                    </div>
                    <div className="mobile-list-item !border-x-0 !px-0 !border-b-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">
                          Direct Messages
                        </div>
                        <div className="text-xs sm:text-sm text-default-500">
                          Push notifications for new messages
                        </div>
                      </div>
                      <Switch
                        isSelected={notifications.push_messages}
                        onValueChange={(value) =>
                          setNotifications({
                            ...notifications,
                            push_messages: value,
                          })
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                <Divider />

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    variant="flat"
                    className="rounded-xl sm:rounded-none min-h-[44px] w-full sm:w-auto"
                  >
                    Reset to Defaults
                  </Button>
                  <Button
                    className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] rounded-xl sm:rounded-none min-h-[44px] w-full sm:w-auto"
                    onPress={handleNotificationUpdate}
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key={SettingsTab.PRIVACY}
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon
                  icon="solar:shield-check-bold"
                  width={18}
                  className="sm:w-5 sm:h-5"
                />
                <span className="hidden sm:inline">Privacy</span>
              </div>
            }
          >
            <PrivacySettings />
          </Tab>

          <Tab
            key={SettingsTab.SECURITY}
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon
                  icon="solar:lock-password-bold"
                  width={18}
                  className="sm:w-5 sm:h-5"
                />
                <span className="hidden sm:inline">Security</span>
              </div>
            }
          >
            <Card className="rounded-xl sm:rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="bg-[#34445C]/5 dark:bg-[#DCFF37]/5 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  Security Settings
                </h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <Input
                      type="password"
                      label="Current Password"
                      placeholder="Enter current password"
                      startContent={
                        <Icon icon="solar:lock-password-bold" width={20} />
                      }
                      classNames={{
                        inputWrapper: "min-h-[48px]",
                        input: "text-base",
                      }}
                    />
                    <Input
                      type="password"
                      label="New Password"
                      placeholder="Enter new password"
                      startContent={
                        <Icon icon="solar:lock-password-bold" width={20} />
                      }
                      classNames={{
                        inputWrapper: "min-h-[48px]",
                        input: "text-base",
                      }}
                    />
                    <Input
                      type="password"
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                      startContent={
                        <Icon icon="solar:lock-password-bold" width={20} />
                      }
                      classNames={{
                        inputWrapper: "min-h-[48px]",
                        input: "text-base",
                      }}
                    />
                    <Button
                      color="primary"
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="p-3 sm:p-4 bg-default-100 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Icon
                        icon="solar:shield-check-bold"
                        width={24}
                        className="text-success mt-1 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium mb-1 text-sm sm:text-base">
                          Protect your account
                        </div>
                        <div className="text-xs sm:text-sm text-default-600 mb-3">
                          Add an extra layer of security to your account
                        </div>
                        <Button
                          size="sm"
                          variant="flat"
                          className="min-h-[40px]"
                        >
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                    Connected Accounts
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="mobile-list-item rounded-xl !bg-default-100">
                      <div className="flex items-center gap-3 flex-1">
                        <Icon icon="solar:gameboy-bold" width={24} />
                        <div>
                          <div className="font-medium text-sm sm:text-base">
                            Steam
                          </div>
                          <div className="text-xs text-default-500">
                            Connected
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        className="min-h-[36px]"
                      >
                        Disconnect
                      </Button>
                    </div>
                    <div className="mobile-list-item rounded-xl !bg-default-100">
                      <div className="flex items-center gap-3 flex-1">
                        <Icon icon="solar:chat-round-bold" width={24} />
                        <div>
                          <div className="font-medium text-sm sm:text-base">
                            Discord
                          </div>
                          <div className="text-xs text-default-500">
                            Not connected
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="min-h-[36px]"
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key={SettingsTab.BILLING}
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon
                  icon="solar:card-bold"
                  width={18}
                  className="sm:w-5 sm:h-5"
                />
                <span className="hidden sm:inline">Billing</span>
              </div>
            }
          >
            <div className="space-y-4 sm:space-y-6">
              <SubscriptionManagement />
              <PaymentHistory />
            </div>
          </Tab>
        </Tabs>
      </PageContainer>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" label="Loading settings..." />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
