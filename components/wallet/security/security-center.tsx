"use client";

/**
 * Wallet Security Center
 * Comprehensive security dashboard for MPC wallet management,
 * device trust, session control, and emergency features
 */

import React, { useState, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";
import type { CustodialWalletStatus } from "@/types/replay-api/escrow-wallet.types";
import { getSecurityScoreColor } from "@/types/replay-api/escrow-wallet.types";

// Extended Security Factor type for this component
interface ExtendedSecurityFactor {
  id: string;
  name: string;
  icon: string;
  status: "enabled" | "disabled" | "pending" | "expired";
  description: string;
  recommendation?: string;
}

// Types
interface TrustedDevice {
  device_id: string;
  name: string;
  type: "mobile" | "desktop" | "browser" | "hardware";
  platform: string;
  browser?: string;
  last_used: string;
  created_at: string;
  is_current: boolean;
  mpc_shard_holder: boolean;
  location?: string;
}

interface ActiveSession {
  session_id: string;
  device_id: string;
  device_name: string;
  ip_address: string;
  location: string;
  started_at: string;
  last_activity: string;
  is_current: boolean;
}

interface SecurityAuditEntry {
  id: string;
  action: string;
  details: string;
  ip_address: string;
  device: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  success: boolean;
}

interface WithdrawalAddress {
  address: string;
  label: string;
  chain_id: string;
  added_at: string;
  last_used?: string;
  is_verified: boolean;
}

interface SecurityCenterProps {
  wallet: CustodialWalletStatus;
  devices?: TrustedDevice[];
  sessions?: ActiveSession[];
  auditLog?: SecurityAuditEntry[];
  withdrawalAddresses?: WithdrawalAddress[];
  onRevokeDevice?: (deviceId: string) => void;
  onRevokeSession?: (sessionId: string) => void;
  onAddWithdrawalAddress?: (
    address: string,
    label: string,
    chainId: string,
  ) => void;
  onRemoveWithdrawalAddress?: (address: string) => void;
  onRotateKeys?: () => void;
  onEmergencyFreeze?: () => void;
  onUpdateSecuritySettings?: (settings: Partial<SecuritySettings>) => void;
}

interface SecuritySettings {
  require_2fa_for_withdrawals: boolean;
  require_2fa_for_login: boolean;
  withdrawal_whitelist_enabled: boolean;
  withdrawal_delay_hours: number;
  max_daily_withdrawal: number;
  notify_on_login: boolean;
  notify_on_withdrawal: boolean;
  notify_on_new_device: boolean;
  auto_lock_minutes: number;
}

// Security Score Ring Component
function SecurityScoreRing({
  score,
  size = 160,
}: {
  score: number;
  size?: number;
}) {
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getSecurityScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="70"
          cy="70"
          r="60"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-default-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx="70"
          cy="70"
          r="60"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-sm text-default-500">Security Score</span>
      </div>
    </div>
  );
}

// Device Icon Component
function DeviceIcon({ type }: { type: TrustedDevice["type"] }) {
  const icons: Record<TrustedDevice["type"], string> = {
    mobile: "solar:smartphone-bold",
    desktop: "solar:monitor-bold",
    browser: "solar:global-bold",
    hardware: "solar:shield-keyhole-bold",
  };

  return <Icon icon={icons[type]} width={20} />;
}

// Security Factor Card
function SecurityFactorCard({
  factor,
  onAction,
}: {
  factor: ExtendedSecurityFactor;
  onAction?: () => void;
}) {
  const statusColors = {
    enabled: "success",
    disabled: "default",
    pending: "warning",
    expired: "danger",
  } as const;

  return (
    <Card className="rounded-none border border-default-200">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                factor.status === "enabled"
                  ? "bg-success/10 text-success"
                  : "bg-default-100 text-default-400",
              )}
            >
              <Icon icon={factor.icon} width={20} />
            </div>
            <div>
              <p className="font-medium text-[#34445C] dark:text-white">
                {factor.name}
              </p>
              <p className="text-xs text-default-500">{factor.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              color={statusColors[factor.status]}
              variant="flat"
              className="rounded-none capitalize"
            >
              {factor.status}
            </Chip>
            {onAction && factor.status !== "enabled" && (
              <Button
                size="sm"
                variant="flat"
                className="rounded-none"
                onPress={onAction}
              >
                Enable
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function SecurityCenter({
  wallet,
  devices = [],
  sessions = [],
  auditLog = [],
  withdrawalAddresses = [],
  onRevokeDevice,
  onRevokeSession,
  onAddWithdrawalAddress,
  onRemoveWithdrawalAddress,
  onRotateKeys,
  onEmergencyFreeze,
  onUpdateSecuritySettings,
}: SecurityCenterProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [settings, setSettings] = useState<SecuritySettings>({
    require_2fa_for_withdrawals: true,
    require_2fa_for_login: true,
    withdrawal_whitelist_enabled: false,
    withdrawal_delay_hours: 0,
    max_daily_withdrawal: 10000,
    notify_on_login: true,
    notify_on_withdrawal: true,
    notify_on_new_device: true,
    auto_lock_minutes: 15,
  });

  const {
    isOpen: isEmergencyOpen,
    onOpen: openEmergency,
    onClose: closeEmergency,
  } = useDisclosure();

  const {
    isOpen: isAddAddressOpen,
    onOpen: openAddAddress,
    onClose: closeAddAddress,
  } = useDisclosure();

  const [newAddress, setNewAddress] = useState({
    address: "",
    label: "",
    chainId: "evm:137",
  });

  const handleSettingChange = useCallback(
    (key: keyof SecuritySettings, value: boolean | number) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      onUpdateSecuritySettings?.({ [key]: value });
    },
    [settings, onUpdateSecuritySettings],
  );

  // Mock data for demonstration
  const mockDevices: TrustedDevice[] = devices.length
    ? devices
    : [
        {
          device_id: "dev-001",
          name: "MacBook Pro",
          type: "desktop",
          platform: "macOS",
          browser: "Chrome",
          last_used: new Date().toISOString(),
          created_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          is_current: true,
          mpc_shard_holder: true,
          location: "São Paulo, Brazil",
        },
        {
          device_id: "dev-002",
          name: "iPhone 15 Pro",
          type: "mobile",
          platform: "iOS",
          last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(
            Date.now() - 60 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          is_current: false,
          mpc_shard_holder: false,
          location: "São Paulo, Brazil",
        },
        {
          device_id: "dev-003",
          name: "Ledger Nano X",
          type: "hardware",
          platform: "Hardware",
          last_used: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          created_at: new Date(
            Date.now() - 90 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          is_current: false,
          mpc_shard_holder: true,
          location: "N/A",
        },
      ];

  const mockSessions: ActiveSession[] = sessions.length
    ? sessions
    : [
        {
          session_id: "sess-001",
          device_id: "dev-001",
          device_name: "MacBook Pro - Chrome",
          ip_address: "189.xxx.xxx.xxx",
          location: "São Paulo, Brazil",
          started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date().toISOString(),
          is_current: true,
        },
        {
          session_id: "sess-002",
          device_id: "dev-002",
          device_name: "iPhone 15 Pro - Safari",
          ip_address: "189.xxx.xxx.xxx",
          location: "São Paulo, Brazil",
          started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date(
            Date.now() - 2 * 60 * 60 * 1000,
          ).toISOString(),
          is_current: false,
        },
      ];

  const mockAuditLog: SecurityAuditEntry[] = auditLog.length
    ? auditLog
    : [
        {
          id: "audit-001",
          action: "Login Success",
          details: "Logged in with 2FA",
          ip_address: "189.xxx.xxx.xxx",
          device: "MacBook Pro",
          timestamp: new Date().toISOString(),
          severity: "info",
          success: true,
        },
        {
          id: "audit-002",
          action: "Withdrawal Request",
          details: "Withdrew 50 USDC to 0x...abc",
          ip_address: "189.xxx.xxx.xxx",
          device: "MacBook Pro",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          severity: "info",
          success: true,
        },
        {
          id: "audit-003",
          action: "New Device Added",
          details: "iPhone 15 Pro added as trusted device",
          ip_address: "189.xxx.xxx.xxx",
          device: "iPhone 15 Pro",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          severity: "warning",
          success: true,
        },
        {
          id: "audit-004",
          action: "Failed Login Attempt",
          details: "Incorrect 2FA code",
          ip_address: "45.xxx.xxx.xxx",
          device: "Unknown",
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          severity: "critical",
          success: false,
        },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#34445C] dark:text-white flex items-center gap-2">
            <Icon
              icon="solar:shield-keyhole-bold-duotone"
              className="text-[#FF4654] dark:text-[#DCFF37]"
              width={28}
            />
            Security Center
          </h1>
          <p className="text-default-500 text-sm mt-1">
            Manage your wallet security, devices, and access controls
          </p>
        </div>
        <Button
          color="danger"
          variant="flat"
          className="rounded-none"
          startContent={<Icon icon="solar:shield-warning-bold" width={18} />}
          onPress={openEmergency}
        >
          Emergency Freeze
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        classNames={{
          tabList: "gap-2 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 p-1 rounded-none",
          cursor:
            "rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
          tab: "rounded-none",
          tabContent:
            "group-data-[selected=true]:text-white dark:group-data-[selected=true]:text-[#34445C]",
        }}
      >
        <Tab
          key="overview"
          title={
            <span className="flex items-center gap-2">
              <Icon icon="solar:home-2-bold" width={16} /> Overview
            </span>
          }
        />
        <Tab
          key="devices"
          title={
            <span className="flex items-center gap-2">
              <Icon icon="solar:devices-bold" width={16} /> Devices
            </span>
          }
        />
        <Tab
          key="sessions"
          title={
            <span className="flex items-center gap-2">
              <Icon icon="solar:login-3-bold" width={16} /> Sessions
            </span>
          }
        />
        <Tab
          key="whitelist"
          title={
            <span className="flex items-center gap-2">
              <Icon icon="solar:checklist-bold" width={16} /> Whitelist
            </span>
          }
        />
        <Tab
          key="audit"
          title={
            <span className="flex items-center gap-2">
              <Icon icon="solar:document-text-bold" width={16} /> Audit Log
            </span>
          }
        />
        <Tab
          key="settings"
          title={
            <span className="flex items-center gap-2">
              <Icon icon="solar:settings-bold" width={16} /> Settings
            </span>
          }
        />
      </Tabs>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Security Score */}
            <Card className="rounded-none border-2 border-[#34445C]/20 dark:border-[#DCFF37]/20">
              <CardBody className="p-6 flex flex-col items-center">
                <SecurityScoreRing score={wallet.security_score} />
                <div className="mt-4 text-center">
                  <p className="text-sm text-default-500">
                    {wallet.security_score >= 80
                      ? "Excellent! Your wallet is well protected."
                      : wallet.security_score >= 60
                        ? "Good security, but room for improvement."
                        : "Action needed to improve your security."}
                  </p>
                </div>
                <Divider className="my-4" />
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Wallet Type</span>
                    <Chip
                      size="sm"
                      color="secondary"
                      variant="flat"
                      className="rounded-none capitalize"
                    >
                      {wallet.wallet_type.replace("_", " ")}
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">KYC Level</span>
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="rounded-none capitalize"
                    >
                      {wallet.kyc_level}
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Trusted Devices</span>
                    <span className="font-medium">{mockDevices.length}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Security Factors */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-[#34445C] dark:text-white flex items-center gap-2">
                <Icon
                  icon="solar:shield-check-bold"
                  width={20}
                  className="text-success"
                />
                Security Factors
              </h3>
              <div className="space-y-3">
                {wallet.security_factors.map((factor, index) => {
                  const extendedFactor: ExtendedSecurityFactor = {
                    id: `factor-${index}`,
                    name: factor.factor,
                    icon: "solar:shield-check-bold",
                    status: factor.enabled ? "enabled" : "disabled",
                    description: factor.description,
                    recommendation: factor.recommendation,
                  };
                  return (
                    <SecurityFactorCard
                      key={extendedFactor.id}
                      factor={extendedFactor}
                    />
                  );
                })}
              </div>
            </div>

            {/* MPC Key Status */}
            {wallet.wallet_type === "semi_custodial" && wallet.mpc_config && (
              <Card className="lg:col-span-3 rounded-none border-2 border-[#DCFF37]/30 bg-[#DCFF37]/5">
                <CardHeader className="flex items-center gap-2">
                  <Icon
                    icon="solar:key-bold-duotone"
                    className="text-[#DCFF37]"
                    width={24}
                  />
                  <span className="font-semibold text-[#34445C] dark:text-white">
                    MPC Key Shards
                  </span>
                  <Chip
                    size="sm"
                    variant="flat"
                    className="rounded-none ml-auto"
                  >
                    {wallet.mpc_config.threshold} of{" "}
                    {wallet.mpc_config.total_shards} required
                  </Chip>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {wallet.mpc_config.shards.map((shard) => (
                      <Card
                        key={shard.shard_id}
                        className={cn(
                          "rounded-none border",
                          shard.is_available
                            ? "border-success/30 bg-success/5"
                            : "border-warning/30 bg-warning/5",
                        )}
                      >
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">
                              {shard.holder.replace("_", " ")}
                            </span>
                            <Chip
                              size="sm"
                              color={shard.is_available ? "success" : "warning"}
                              variant="flat"
                              className="rounded-none"
                            >
                              {shard.is_available ? "Active" : "Inactive"}
                            </Chip>
                          </div>
                          <p className="text-xs text-default-500">
                            {shard.holder_name}
                          </p>
                          {shard.last_verified_at && (
                            <p className="text-xs text-default-400 mt-1">
                              Verified:{" "}
                              {new Date(
                                shard.last_verified_at,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="flat"
                      className="rounded-none"
                      startContent={
                        <Icon icon="solar:refresh-bold" width={16} />
                      }
                      onPress={onRotateKeys}
                    >
                      Rotate Keys
                    </Button>
                    <Button
                      variant="flat"
                      className="rounded-none"
                      startContent={
                        <Icon icon="solar:download-bold" width={16} />
                      }
                    >
                      Backup Recovery Codes
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}
          </motion.div>
        )}

        {/* Devices Tab */}
        {activeTab === "devices" && (
          <motion.div
            key="devices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="rounded-none">
              <CardHeader className="flex items-center justify-between">
                <span className="font-semibold">Trusted Devices</span>
                <Button
                  size="sm"
                  variant="flat"
                  className="rounded-none"
                  startContent={
                    <Icon icon="solar:add-circle-bold" width={16} />
                  }
                >
                  Add Device
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <Table aria-label="Trusted devices" removeWrapper>
                  <TableHeader>
                    <TableColumn>DEVICE</TableColumn>
                    <TableColumn>PLATFORM</TableColumn>
                    <TableColumn>MPC SHARD</TableColumn>
                    <TableColumn>LAST USED</TableColumn>
                    <TableColumn>LOCATION</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {mockDevices.map((device) => (
                      <TableRow key={device.device_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DeviceIcon type={device.type} />
                            <div>
                              <p className="font-medium">{device.name}</p>
                              {device.is_current && (
                                <Chip
                                  size="sm"
                                  color="primary"
                                  variant="flat"
                                  className="rounded-none mt-1"
                                >
                                  Current
                                </Chip>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            {device.platform}
                            {device.browser && ` / ${device.browser}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          {device.mpc_shard_holder ? (
                            <Chip
                              size="sm"
                              color="success"
                              variant="flat"
                              className="rounded-none"
                            >
                              Shard Holder
                            </Chip>
                          ) : (
                            <span className="text-default-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            {new Date(device.last_used).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            {device.location}
                          </span>
                        </TableCell>
                        <TableCell>
                          {!device.is_current && (
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              className="rounded-none"
                              onPress={() => onRevokeDevice?.(device.device_id)}
                            >
                              Remove
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="rounded-none">
              <CardHeader className="flex items-center justify-between">
                <span className="font-semibold">Active Sessions</span>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  className="rounded-none"
                  startContent={<Icon icon="solar:logout-2-bold" width={16} />}
                >
                  Revoke All Others
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <Table aria-label="Active sessions" removeWrapper>
                  <TableHeader>
                    <TableColumn>DEVICE</TableColumn>
                    <TableColumn>IP ADDRESS</TableColumn>
                    <TableColumn>LOCATION</TableColumn>
                    <TableColumn>STARTED</TableColumn>
                    <TableColumn>LAST ACTIVITY</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {mockSessions.map((session) => (
                      <TableRow key={session.session_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:monitor-bold" width={20} />
                            <div>
                              <p className="font-medium">
                                {session.device_name}
                              </p>
                              {session.is_current && (
                                <Chip
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  className="rounded-none mt-1"
                                >
                                  This session
                                </Chip>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500 font-mono text-sm">
                            {session.ip_address}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            {session.location}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            {new Date(session.started_at).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            {new Date(session.last_activity).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {!session.is_current && (
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              className="rounded-none"
                              onPress={() =>
                                onRevokeSession?.(session.session_id)
                              }
                            >
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Whitelist Tab */}
        {activeTab === "whitelist" && (
          <motion.div
            key="whitelist"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="rounded-none border-2 border-warning/30 bg-warning/5">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="solar:shield-check-bold"
                      width={24}
                      className="text-warning"
                    />
                    <div>
                      <p className="font-medium text-[#34445C] dark:text-white">
                        Withdrawal Whitelist
                      </p>
                      <p className="text-sm text-default-500">
                        Only allow withdrawals to pre-approved addresses
                      </p>
                    </div>
                  </div>
                  <Switch
                    isSelected={settings.withdrawal_whitelist_enabled}
                    onValueChange={(v) =>
                      handleSettingChange("withdrawal_whitelist_enabled", v)
                    }
                  />
                </div>
              </CardBody>
            </Card>

            <Card className="rounded-none">
              <CardHeader className="flex items-center justify-between">
                <span className="font-semibold">Whitelisted Addresses</span>
                <Button
                  size="sm"
                  className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
                  startContent={
                    <Icon icon="solar:add-circle-bold" width={16} />
                  }
                  onPress={openAddAddress}
                >
                  Add Address
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                {withdrawalAddresses.length === 0 ? (
                  <div className="p-8 text-center">
                    <Icon
                      icon="solar:checklist-bold-duotone"
                      width={48}
                      className="mx-auto text-default-300 mb-4"
                    />
                    <p className="text-default-500">
                      No whitelisted addresses yet
                    </p>
                    <p className="text-sm text-default-400">
                      Add addresses you trust for withdrawals
                    </p>
                  </div>
                ) : (
                  <Table aria-label="Whitelisted addresses" removeWrapper>
                    <TableHeader>
                      <TableColumn>LABEL</TableColumn>
                      <TableColumn>ADDRESS</TableColumn>
                      <TableColumn>CHAIN</TableColumn>
                      <TableColumn>ADDED</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {withdrawalAddresses.map((addr) => (
                        <TableRow key={addr.address}>
                          <TableCell>{addr.label}</TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {addr.address}
                            </span>
                          </TableCell>
                          <TableCell>{addr.chain_id}</TableCell>
                          <TableCell>
                            {new Date(addr.added_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              className="rounded-none"
                              onPress={() =>
                                onRemoveWithdrawalAddress?.(addr.address)
                              }
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Audit Log Tab */}
        {activeTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="rounded-none">
              <CardHeader className="flex items-center justify-between">
                <span className="font-semibold">Security Audit Log</span>
                <Button
                  size="sm"
                  variant="flat"
                  className="rounded-none"
                  startContent={<Icon icon="solar:download-bold" width={16} />}
                >
                  Export
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <Table aria-label="Audit log" removeWrapper>
                  <TableHeader>
                    <TableColumn>ACTION</TableColumn>
                    <TableColumn>DETAILS</TableColumn>
                    <TableColumn>DEVICE</TableColumn>
                    <TableColumn>IP</TableColumn>
                    <TableColumn>TIME</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {mockAuditLog.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon
                              icon={
                                entry.severity === "critical"
                                  ? "solar:danger-circle-bold"
                                  : entry.severity === "warning"
                                    ? "solar:info-circle-bold"
                                    : "solar:check-circle-bold"
                              }
                              className={cn(
                                entry.severity === "critical"
                                  ? "text-danger"
                                  : entry.severity === "warning"
                                    ? "text-warning"
                                    : "text-success",
                              )}
                              width={16}
                            />
                            <span className="font-medium">{entry.action}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            {entry.details}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            {entry.device}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-default-500">
                            {entry.ip_address}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={entry.success ? "success" : "danger"}
                            variant="flat"
                            className="rounded-none"
                          >
                            {entry.success ? "Success" : "Failed"}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* 2FA Settings */}
            <Card className="rounded-none">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2">
                  <Icon
                    icon="solar:shield-check-bold"
                    width={20}
                    className="text-[#FF4654] dark:text-[#DCFF37]"
                  />
                  Two-Factor Authentication
                </span>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require 2FA for Login</p>
                    <p className="text-sm text-default-500">
                      Always require 2FA when signing in
                    </p>
                  </div>
                  <Switch
                    isSelected={settings.require_2fa_for_login}
                    onValueChange={(v) =>
                      handleSettingChange("require_2fa_for_login", v)
                    }
                  />
                </div>
                <Divider />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require 2FA for Withdrawals</p>
                    <p className="text-sm text-default-500">
                      Additional verification for withdrawals
                    </p>
                  </div>
                  <Switch
                    isSelected={settings.require_2fa_for_withdrawals}
                    onValueChange={(v) =>
                      handleSettingChange("require_2fa_for_withdrawals", v)
                    }
                  />
                </div>
              </CardBody>
            </Card>

            {/* Withdrawal Settings */}
            <Card className="rounded-none">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2">
                  <Icon
                    icon="solar:wallet-money-bold"
                    width={20}
                    className="text-[#FF4654] dark:text-[#DCFF37]"
                  />
                  Withdrawal Limits
                </span>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Daily Withdrawal Limit
                  </label>
                  <Input
                    type="number"
                    value={String(settings.max_daily_withdrawal)}
                    onValueChange={(v) =>
                      handleSettingChange("max_daily_withdrawal", Number(v))
                    }
                    startContent={<span className="text-default-400">$</span>}
                    classNames={{ inputWrapper: "rounded-none" }}
                  />
                  <p className="text-xs text-default-500 mt-1">
                    Used: ${wallet.daily_withdrawal_used.dollars.toFixed(2)} / $
                    {wallet.daily_withdrawal_limit.dollars.toFixed(2)}
                  </p>
                </div>
                <Divider />
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Withdrawal Delay
                  </label>
                  <Input
                    type="number"
                    value={String(settings.withdrawal_delay_hours)}
                    onValueChange={(v) =>
                      handleSettingChange("withdrawal_delay_hours", Number(v))
                    }
                    endContent={<span className="text-default-400">hours</span>}
                    classNames={{ inputWrapper: "rounded-none" }}
                  />
                  <p className="text-xs text-default-500 mt-1">
                    Delay before new addresses can receive withdrawals
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Notifications */}
            <Card className="rounded-none">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2">
                  <Icon
                    icon="solar:bell-bold"
                    width={20}
                    className="text-[#FF4654] dark:text-[#DCFF37]"
                  />
                  Security Notifications
                </span>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Login Alerts</p>
                    <p className="text-sm text-default-500">
                      Get notified on new sign-ins
                    </p>
                  </div>
                  <Switch
                    isSelected={settings.notify_on_login}
                    onValueChange={(v) =>
                      handleSettingChange("notify_on_login", v)
                    }
                  />
                </div>
                <Divider />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Withdrawal Alerts</p>
                    <p className="text-sm text-default-500">
                      Get notified on withdrawals
                    </p>
                  </div>
                  <Switch
                    isSelected={settings.notify_on_withdrawal}
                    onValueChange={(v) =>
                      handleSettingChange("notify_on_withdrawal", v)
                    }
                  />
                </div>
                <Divider />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Device Alerts</p>
                    <p className="text-sm text-default-500">
                      Get notified on new trusted devices
                    </p>
                  </div>
                  <Switch
                    isSelected={settings.notify_on_new_device}
                    onValueChange={(v) =>
                      handleSettingChange("notify_on_new_device", v)
                    }
                  />
                </div>
              </CardBody>
            </Card>

            {/* Auto-Lock */}
            <Card className="rounded-none">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2">
                  <Icon
                    icon="solar:lock-bold"
                    width={20}
                    className="text-[#FF4654] dark:text-[#DCFF37]"
                  />
                  Session Security
                </span>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Auto-Lock Timer
                  </label>
                  <Input
                    type="number"
                    value={String(settings.auto_lock_minutes)}
                    onValueChange={(v) =>
                      handleSettingChange("auto_lock_minutes", Number(v))
                    }
                    endContent={
                      <span className="text-default-400">minutes</span>
                    }
                    classNames={{ inputWrapper: "rounded-none" }}
                  />
                  <p className="text-xs text-default-500 mt-1">
                    Auto-lock after inactivity (0 to disable)
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Freeze Modal */}
      <Modal isOpen={isEmergencyOpen} onClose={closeEmergency} size="md">
        <ModalContent className="rounded-none">
          <ModalHeader className="flex items-center gap-2 bg-danger/10">
            <Icon
              icon="solar:shield-warning-bold"
              className="text-danger"
              width={24}
            />
            <span>Emergency Freeze</span>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="text-center">
              <Icon
                icon="solar:lock-bold-duotone"
                width={64}
                className="mx-auto text-danger mb-4"
              />
              <h3 className="text-lg font-semibold text-[#34445C] dark:text-white mb-2">
                Freeze Your Wallet?
              </h3>
              <p className="text-default-500 mb-4">
                This will immediately block all transactions from your wallet.
                You will need to contact support to unfreeze.
              </p>
              <div className="p-4 rounded-lg bg-danger/10 text-left">
                <p className="text-sm font-medium text-danger mb-2">
                  This action will:
                </p>
                <ul className="text-sm text-danger/80 space-y-1">
                  <li>• Block all withdrawals</li>
                  <li>• Cancel pending transactions</li>
                  <li>• Prevent match entry</li>
                  <li>• Require support verification to unfreeze</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              className="rounded-none"
              onPress={closeEmergency}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              className="rounded-none"
              startContent={<Icon icon="solar:lock-bold" width={18} />}
              onPress={() => {
                onEmergencyFreeze?.();
                closeEmergency();
              }}
            >
              Freeze Wallet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Address Modal */}
      <Modal isOpen={isAddAddressOpen} onClose={closeAddAddress} size="md">
        <ModalContent className="rounded-none">
          <ModalHeader>Add Whitelisted Address</ModalHeader>
          <ModalBody className="py-4 space-y-4">
            <Input
              label="Label"
              placeholder="e.g., My Binance"
              value={newAddress.label}
              onValueChange={(v) => setNewAddress({ ...newAddress, label: v })}
              classNames={{ inputWrapper: "rounded-none" }}
            />
            <Input
              label="Address"
              placeholder="0x... or wallet address"
              value={newAddress.address}
              onValueChange={(v) =>
                setNewAddress({ ...newAddress, address: v })
              }
              classNames={{ inputWrapper: "rounded-none" }}
            />
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning-700 dark:text-warning">
                New addresses have a 24-hour cooling period before withdrawals
                are enabled.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              className="rounded-none"
              onPress={closeAddAddress}
            >
              Cancel
            </Button>
            <Button
              className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
              onPress={() => {
                onAddWithdrawalAddress?.(
                  newAddress.address,
                  newAddress.label,
                  newAddress.chainId,
                );
                setNewAddress({ address: "", label: "", chainId: "evm:137" });
                closeAddAddress();
              }}
            >
              Add Address
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default SecurityCenter;
