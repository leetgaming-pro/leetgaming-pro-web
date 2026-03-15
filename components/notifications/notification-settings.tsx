'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔔 LEETGAMING — NOTIFICATION SETTINGS                                      ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Branded settings panel for notification preferences:                        ║
 * ║   - Sound on/off, volume slider, haptic feedback                             ║
 * ║   - Channel preferences (in-app, email, push, SMS/WhatsApp)                  ║
 * ║   - Do Not Disturb mode with schedule                                        ║
 * ║   - Per-type notification toggle                                             ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { useSound, SoundPreferences, saveSoundPrefs, loadSoundPrefs } from '@/hooks/use-sound';
import { EsportsButton } from '@/components/ui/esports-button';
import { electrolize } from '@/config/fonts';

// ── Types ───────────────────────────────────────────────────────────────────

export type NotificationChannelPref = 'in_app' | 'email' | 'push' | 'sms';

export interface ChannelPreferences {
  in_app: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface NotificationTypePreference {
  type: string;
  label: string;
  icon: string;
  enabled: boolean;
  channels: ChannelPreferences;
}

export interface DoNotDisturbConfig {
  enabled: boolean;
  startHour: number; // 0-23
  endHour: number;   // 0-23
}

export interface NotificationSettingsProps {
  /** Current channel preferences by notification type */
  typePreferences?: NotificationTypePreference[];
  /** DND configuration */
  dndConfig?: DoNotDisturbConfig;
  /** Called when any setting changes */
  onSave?: (settings: {
    sound: SoundPreferences;
    types: NotificationTypePreference[];
    dnd: DoNotDisturbConfig;
  }) => void;
  /** Extra className */
  className?: string;
}

// ── Default Type Preferences ────────────────────────────────────────────────

const DEFAULT_TYPE_PREFS: NotificationTypePreference[] = [
  {
    type: 'match',
    label: 'Match Found',
    icon: 'solar:gameboy-bold',
    enabled: true,
    channels: { in_app: true, email: false, push: true, sms: false },
  },
  {
    type: 'ready_check',
    label: 'Ready Check',
    icon: 'solar:shield-check-bold',
    enabled: true,
    channels: { in_app: true, email: false, push: true, sms: false },
  },
  {
    type: 'team',
    label: 'Team Updates',
    icon: 'solar:users-group-rounded-bold',
    enabled: true,
    channels: { in_app: true, email: true, push: true, sms: false },
  },
  {
    type: 'friend',
    label: 'Friend Requests',
    icon: 'solar:user-plus-bold',
    enabled: true,
    channels: { in_app: true, email: true, push: false, sms: false },
  },
  {
    type: 'achievement',
    label: 'Achievements',
    icon: 'solar:cup-star-bold',
    enabled: true,
    channels: { in_app: true, email: false, push: false, sms: false },
  },
  {
    type: 'system',
    label: 'System Alerts',
    icon: 'solar:bell-bold',
    enabled: true,
    channels: { in_app: true, email: true, push: false, sms: false },
  },
];

const DEFAULT_DND: DoNotDisturbConfig = {
  enabled: false,
  startHour: 22,
  endHour: 8,
};

// ── Component ───────────────────────────────────────────────────────────────

export function NotificationSettings({
  typePreferences,
  dndConfig,
  onSave,
  className,
}: NotificationSettingsProps) {
  const sound = useSound();
  const [soundPrefs, setSoundPrefs] = useState<SoundPreferences>(loadSoundPrefs);
  const [types, setTypes] = useState<NotificationTypePreference[]>(
    typePreferences ?? DEFAULT_TYPE_PREFS,
  );
  const [dnd, setDnd] = useState<DoNotDisturbConfig>(dndConfig ?? DEFAULT_DND);
  const [isDirty, setIsDirty] = useState(false);

  // Sync sound prefs to localStorage
  useEffect(() => {
    if (isDirty) {
      saveSoundPrefs(soundPrefs);
    }
  }, [soundPrefs, isDirty]);

  const updateSoundPref = useCallback(
    (key: keyof SoundPreferences, value: boolean | number) => {
      setSoundPrefs((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const toggleType = useCallback((index: number) => {
    setTypes((prev) =>
      prev.map((t, i) => (i === index ? { ...t, enabled: !t.enabled } : t)),
    );
    setIsDirty(true);
  }, []);

  const toggleChannel = useCallback(
    (typeIndex: number, channel: NotificationChannelPref) => {
      setTypes((prev) =>
        prev.map((t, i) =>
          i === typeIndex
            ? {
                ...t,
                channels: { ...t.channels, [channel]: !t.channels[channel] },
              }
            : t,
        ),
      );
      setIsDirty(true);
    },
    [],
  );

  const handleSave = useCallback(() => {
    onSave?.({ sound: soundPrefs, types, dnd });
    setIsDirty(false);
    sound.play('ready-confirm');
  }, [onSave, soundPrefs, types, dnd, sound]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* ── Sound Settings ─────────────────────────────────────────────── */}
      <SettingsSection title="Sound & Haptics" icon="solar:volume-loud-bold">
        <SettingsRow
          label="Sound Effects"
          description="Play audio cues for notifications and events"
          icon="solar:music-note-bold"
        >
          <Toggle
            checked={soundPrefs.enabled}
            onChange={(v) => updateSoundPref('enabled', v)}
            accentColor="#DCFF37"
            lightAccentColor="#FF4654"
            aria-label="Toggle sound effects"
          />
        </SettingsRow>

        {soundPrefs.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-3"
          >
            <div className="flex items-center gap-3">
              <Icon
                icon="solar:volume-cross-bold"
                width={14}
                className="text-[#34445C]/40 dark:text-[#F5F0E1]/40"
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={soundPrefs.masterVolume}
                onChange={(e) => updateSoundPref('masterVolume', parseFloat(e.target.value))}
                className="flex-1 accent-leet-orange dark:accent-[#DCFF37] h-1"
                aria-label="Master volume"
              />
              <Icon
                icon="solar:volume-loud-bold"
                width={14}
                className="text-[#34445C]/40 dark:text-[#F5F0E1]/40"
              />
              <span className="text-[10px] font-mono text-[#34445C]/40 dark:text-[#F5F0E1]/40 w-8 text-right">
                {Math.round(soundPrefs.masterVolume * 100)}%
              </span>
            </div>
          </motion.div>
        )}

        <SettingsRow
          label="Haptic Feedback"
          description="Vibration on mobile for important events"
          icon="solar:smartphone-vibration-bold"
        >
          <Toggle
            checked={soundPrefs.hapticEnabled}
            onChange={(v) => updateSoundPref('hapticEnabled', v)}
            accentColor="#DCFF37"
            lightAccentColor="#FF4654"
            aria-label="Toggle haptic feedback"
          />
        </SettingsRow>

        <div className="px-4 pb-3">
          <EsportsButton
            variant="ghost"
            size="sm"
            onClick={() => {
              sound.play('match-found');
            }}
            startContent={<Icon icon="solar:play-bold" width={14} />}
          >
            Test Sound
          </EsportsButton>
        </div>
      </SettingsSection>

      {/* ── Do Not Disturb ─────────────────────────────────────────────── */}
      <SettingsSection title="Do Not Disturb" icon="solar:moon-bold">
        <SettingsRow
          label="Enable DND"
          description="Silence non-critical notifications during set hours"
          icon="solar:moon-sleep-bold"
        >
          <Toggle
            checked={dnd.enabled}
            onChange={(v) => {
              setDnd((prev) => ({ ...prev, enabled: v }));
              setIsDirty(true);
            }}
            accentColor="#FFC700"
            aria-label="Toggle Do Not Disturb mode"
          />
        </SettingsRow>

        {dnd.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 pb-3 flex items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[#34445C]/40 dark:text-[#F5F0E1]/40">
                From
              </span>
              <select
                value={dnd.startHour}
                onChange={(e) => {
                  setDnd((prev) => ({ ...prev, startHour: parseInt(e.target.value) }));
                  setIsDirty(true);
                }}
                className="text-xs font-mono bg-[#34445C]/5 dark:bg-[#F5F0E1]/5 border border-[#34445C]/10 dark:border-[#F5F0E1]/10 px-2 py-1 text-[#34445C] dark:text-[#F5F0E1]"
                aria-label="DND start hour"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
            <Icon
              icon="solar:arrow-right-bold"
              width={14}
              className="text-[#34445C]/30 dark:text-[#F5F0E1]/30"
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[#34445C]/40 dark:text-[#F5F0E1]/40">
                To
              </span>
              <select
                value={dnd.endHour}
                onChange={(e) => {
                  setDnd((prev) => ({ ...prev, endHour: parseInt(e.target.value) }));
                  setIsDirty(true);
                }}
                className="text-xs font-mono bg-[#34445C]/5 dark:bg-[#F5F0E1]/5 border border-[#34445C]/10 dark:border-[#F5F0E1]/10 px-2 py-1 text-[#34445C] dark:text-[#F5F0E1]"
                aria-label="DND end hour"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </SettingsSection>

      {/* ── Per-Type Preferences ───────────────────────────────────────── */}
      <SettingsSection title="Notification Types" icon="solar:tuning-2-bold">
        {types.map((typePref, index) => (
          <div key={typePref.type} className="border-b border-[#34445C]/5 dark:border-[#F5F0E1]/5 last:border-0">
            <SettingsRow
              label={typePref.label}
              icon={typePref.icon}
            >
              <Toggle
                checked={typePref.enabled}
                onChange={() => toggleType(index)}
                accentColor="#DCFF37"
                lightAccentColor="#FF4654"
                aria-label={`Toggle ${typePref.label} notifications`}
              />
            </SettingsRow>

            {typePref.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-4 pb-3 flex gap-2"
              >
                {(['in_app', 'email', 'push', 'sms'] as const).map((channel) => {
                  const channelIcons: Record<NotificationChannelPref, string> = {
                    in_app: 'solar:bell-bold',
                    email: 'solar:letter-bold',
                    push: 'solar:smartphone-bold',
                    sms: 'solar:chat-round-bold',
                  };
                  const channelLabels: Record<NotificationChannelPref, string> = {
                    in_app: 'App',
                    email: 'Email',
                    push: 'Push',
                    sms: 'SMS',
                  };
                  const isActive = typePref.channels[channel];

                  return (
                    <button
                      key={channel}
                      onClick={() => toggleChannel(index, channel)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider font-medium',
                        'transition-all duration-200',
                        isActive
                          ? 'bg-leet-orange/10 text-leet-orange border border-leet-orange/30 dark:bg-[#DCFF37]/10 dark:text-[#DCFF37] dark:border-[#DCFF37]/30'
                          : 'text-[#34445C]/30 dark:text-[#F5F0E1]/30 border border-[#34445C]/10 dark:border-[#F5F0E1]/10',
                      )}
                      style={{
                        clipPath:
                          'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
                      }}
                      aria-label={`${channelLabels[channel]} notifications for ${typePref.label}`}
                    >
                      <Icon icon={channelIcons[channel]} width={10} />
                      {channelLabels[channel]}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        ))}
      </SettingsSection>

      {/* ── Save Button ────────────────────────────────────────────────── */}
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4"
        >
          <EsportsButton
            variant="primary"
            size="md"
            fullWidth
            glow
            onClick={handleSave}
            startContent={<Icon icon="solar:check-circle-bold" width={18} />}
          >
            Save Settings
          </EsportsButton>
        </motion.div>
      )}
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function SettingsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden border border-[#34445C]/10 dark:border-[#F5F0E1]/10"
      style={{
        clipPath:
          'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
      }}
    >
      <div className="px-4 py-3 bg-[#34445C]/3 dark:bg-[#F5F0E1]/3 border-b border-[#34445C]/5 dark:border-[#F5F0E1]/5">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 flex items-center justify-center bg-leet-orange/10 dark:bg-[#DCFF37]/10"
            style={{
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
            }}
          >
            <Icon icon={icon} width={14} className="text-leet-orange dark:text-[#DCFF37]" />
          </div>
          <h4
            className={cn(
              'text-xs font-bold uppercase tracking-[0.15em]',
              'text-[#34445C] dark:text-[#F5F0E1]',
              electrolize.className,
            )}
          >
            {title}
          </h4>
        </div>
      </div>
      {children}
    </div>
  );
}

function SettingsRow({
  label,
  description,
  icon,
  children,
}: {
  label: string;
  description?: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon icon={icon} width={16} className="text-[#34445C]/40 dark:text-[#F5F0E1]/40 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#34445C] dark:text-[#F5F0E1]">{label}</p>
          {description && (
            <p className="text-[10px] text-[#34445C]/40 dark:text-[#F5F0E1]/40 mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  accentColor = '#DCFF37',
  lightAccentColor,
  'aria-label': ariaLabel,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  accentColor?: string;
  lightAccentColor?: string;
  'aria-label'?: string;
}) {
  const { theme } = useTheme();
  const resolvedAccent = theme === 'dark' ? accentColor : (lightAccentColor ?? accentColor);

  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-9 h-5 flex-shrink-0 transition-colors duration-200',
        checked ? 'bg-opacity-100' : 'bg-[#34445C]/20 dark:bg-[#F5F0E1]/20',
      )}
      style={{
        backgroundColor: checked ? `${resolvedAccent}30` : undefined,
        clipPath:
          'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
      }}
    >
      <motion.div
        className="absolute top-0.5 w-4 h-4"
        animate={{ left: checked ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          backgroundColor: checked ? resolvedAccent : '#34445C80',
          clipPath:
            'polygon(0 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%)',
        }}
      />
    </button>
  );
}
