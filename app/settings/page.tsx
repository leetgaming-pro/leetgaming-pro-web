'use client';

/**
 * Settings Page
 * User preferences, account settings, privacy, billing, and notifications
 * Supports URL-based tab selection via ?tab= query parameter
 */

import React, { useState, useEffect, Suspense } from 'react';
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
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layouts/centered-content';
import { PrivacySettings } from '@/components/account/privacy-settings';
import { SubscriptionManagement } from '@/components/checkout/subscription-management';
import { PaymentHistory } from '@/components/checkout/payment-history';
import { logger } from '@/lib/logger';

/**
 * Settings tab keys - matches URL query params
 */
enum SettingsTab {
  PROFILE = 'profile',
  NOTIFICATIONS = 'notifications',
  PRIVACY = 'privacy',
  SECURITY = 'security',
  BILLING = 'billing',
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as SettingsTab | null;

  const [selectedTab, setSelectedTab] = useState<string>(tabParam || SettingsTab.PROFILE);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam && Object.values(SettingsTab).includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (key: React.Key) => {
    const tab = key as string;
    setSelectedTab(tab);
    router.push(`/settings?tab=${tab}`, { scroll: false });
  };

  const [profileData, setProfileData] = useState({
    nickname: 'ProGamer_2024',
    email: 'user@example.com',
    bio: 'Competitive CS2 player',
    country: 'USA',
    timezone: 'America/New_York',
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

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
    } catch (error) {
      logger.error('Failed to update profile', error);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications),
      });
      if (!response.ok) throw new Error('Failed to update notifications');
    } catch (error) {
      logger.error('Failed to update notification settings', error);
    }
  };

  return (
    <PageContainer title="Settings" description="Manage your account and preferences" maxWidth="5xl">
      <Tabs
        aria-label="Settings tabs"
        size="lg"
        className="w-full"
        selectedKey={selectedTab}
        onSelectionChange={handleTabChange}
      >
        <Tab
          key={SettingsTab.PROFILE}
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:user-bold" width={20} />
              <span>Profile</span>
            </div>
          }
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Profile Information</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <Avatar
                  src="https://i.pravatar.cc/150?u=user"
                  className="w-24 h-24"
                />
                <div>
                  <Button color="primary" size="sm" startContent={<Icon icon="solar:camera-bold" width={18} />}>
                    Change Avatar
                  </Button>
                  <p className="text-xs text-default-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Divider />

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nickname"
                  placeholder="Enter your nickname"
                  value={profileData.nickname}
                  onValueChange={(value) => setProfileData({ ...profileData, nickname: value })}
                  startContent={<Icon icon="solar:user-bold" width={20} />}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={profileData.email}
                  onValueChange={(value) => setProfileData({ ...profileData, email: value })}
                  startContent={<Icon icon="solar:letter-bold" width={20} />}
                />
              </div>

              <Input
                label="Bio"
                placeholder="Tell us about yourself"
                value={profileData.bio}
                onValueChange={(value) => setProfileData({ ...profileData, bio: value })}
                startContent={<Icon icon="solar:text-bold" width={20} />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Country"
                  placeholder="Select your country"
                  selectedKeys={[profileData.country]}
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  startContent={<Icon icon="solar:global-bold" width={20} />}
                >
                  <SelectItem key="USA" value="USA">United States</SelectItem>
                  <SelectItem key="CAN" value="CAN">Canada</SelectItem>
                  <SelectItem key="BRA" value="BRA">Brazil</SelectItem>
                  <SelectItem key="GER" value="GER">Germany</SelectItem>
                  <SelectItem key="FRA" value="FRA">France</SelectItem>
                </Select>

                <Select
                  label="Timezone"
                  placeholder="Select your timezone"
                  selectedKeys={[profileData.timezone]}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  startContent={<Icon icon="solar:clock-circle-bold" width={20} />}
                >
                  <SelectItem key="America/New_York" value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem key="America/Chicago" value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem key="America/Denver" value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem key="America/Los_Angeles" value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem key="Europe/London" value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem key="Europe/Paris" value="Europe/Paris">Paris (CET)</SelectItem>
                </Select>
              </div>

              <Divider />

              <div className="flex justify-end gap-2">
                <Button variant="flat">Cancel</Button>
                <Button color="primary" onPress={handleProfileUpdate}>
                  Save Changes
                </Button>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key={SettingsTab.NOTIFICATIONS}
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:bell-bold" width={20} />
              <span>Notifications</span>
            </div>
          }
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Notification Preferences</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="solar:letter-bold" width={20} />
                  Email Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Match Updates</div>
                      <div className="text-sm text-default-500">Receive emails about your matches</div>
                    </div>
                    <Switch
                      isSelected={notifications.email_matches}
                      onValueChange={(value) => setNotifications({ ...notifications, email_matches: value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Team Invitations</div>
                      <div className="text-sm text-default-500">Get notified when you&apos;re invited to teams</div>
                    </div>
                    <Switch
                      isSelected={notifications.email_teams}
                      onValueChange={(value) => setNotifications({ ...notifications, email_teams: value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Friend Requests</div>
                      <div className="text-sm text-default-500">Email notifications for friend requests</div>
                    </div>
                    <Switch
                      isSelected={notifications.email_friends}
                      onValueChange={(value) => setNotifications({ ...notifications, email_friends: value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Marketing & Updates</div>
                      <div className="text-sm text-default-500">News, features, and special offers</div>
                    </div>
                    <Switch
                      isSelected={notifications.email_marketing}
                      onValueChange={(value) => setNotifications({ ...notifications, email_marketing: value })}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              {/* Push Notifications */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="solar:notification-unread-bold" width={20} />
                  Push Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Match Results</div>
                      <div className="text-sm text-default-500">Push notifications for match results</div>
                    </div>
                    <Switch
                      isSelected={notifications.push_matches}
                      onValueChange={(value) => setNotifications({ ...notifications, push_matches: value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Friend Activity</div>
                      <div className="text-sm text-default-500">When friends come online or send requests</div>
                    </div>
                    <Switch
                      isSelected={notifications.push_friends}
                      onValueChange={(value) => setNotifications({ ...notifications, push_friends: value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Direct Messages</div>
                      <div className="text-sm text-default-500">Push notifications for new messages</div>
                    </div>
                    <Switch
                      isSelected={notifications.push_messages}
                      onValueChange={(value) => setNotifications({ ...notifications, push_messages: value })}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              <div className="flex justify-end gap-2">
                <Button variant="flat">Reset to Defaults</Button>
                <Button color="primary" onPress={handleNotificationUpdate}>
                  Save Preferences
                </Button>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key={SettingsTab.PRIVACY}
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:shield-check-bold" width={20} />
              <span>Privacy & Data</span>
            </div>
          }
        >
          <PrivacySettings />
        </Tab>

        <Tab
          key={SettingsTab.SECURITY}
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:lock-password-bold" width={20} />
              <span>Security</span>
            </div>
          }
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Security Settings</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <Input
                    type="password"
                    label="Current Password"
                    placeholder="Enter current password"
                    startContent={<Icon icon="solar:lock-password-bold" width={20} />}
                  />
                  <Input
                    type="password"
                    label="New Password"
                    placeholder="Enter new password"
                    startContent={<Icon icon="solar:lock-password-bold" width={20} />}
                  />
                  <Input
                    type="password"
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    startContent={<Icon icon="solar:lock-password-bold" width={20} />}
                  />
                  <Button color="primary">Update Password</Button>
                </div>
              </div>

              <Divider />

              <div>
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="p-4 bg-default-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon icon="solar:shield-check-bold" width={24} className="text-success mt-1" />
                    <div className="flex-1">
                      <div className="font-medium mb-1">Protect your account</div>
                      <div className="text-sm text-default-600 mb-3">
                        Add an extra layer of security to your account
                      </div>
                      <Button size="sm" variant="flat">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="solar:gameboy-bold" width={24} />
                      <div>
                        <div className="font-medium">Steam</div>
                        <div className="text-xs text-default-500">Connected</div>
                      </div>
                    </div>
                    <Button size="sm" variant="flat" color="danger">
                      Disconnect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="solar:chat-round-bold" width={24} />
                      <div>
                        <div className="font-medium">Discord</div>
                        <div className="text-xs text-default-500">Not connected</div>
                      </div>
                    </div>
                    <Button size="sm" variant="flat" color="primary">
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
            <div className="flex items-center gap-2">
              <Icon icon="solar:card-bold" width={20} />
              <span>Billing</span>
            </div>
          }
        >
          <div className="space-y-6">
            <SubscriptionManagement />
            <PaymentHistory />
          </div>
        </Tab>
      </Tabs>
    </PageContainer>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label="Loading settings..." />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
