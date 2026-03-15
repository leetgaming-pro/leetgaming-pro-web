'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING — GAME CONNECTION CARD                                        ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Branded server connection details with clip-path corners, Solar icons,      ║
 * ║  monospace copy snippets, masked passcode, QR box, and launch button.        ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { useSound } from '@/hooks/use-sound';
import { EsportsButton } from '@/components/ui/esports-button';
import { electrolize } from '@/config/fonts';

/** Game connection information received after all players confirm readiness */
export interface GameConnectionInfo {
  server_url?: string;
  server_ip?: string;
  port?: number;
  passcode?: string;
  qr_code_data?: string;
  deep_link?: string;
  instructions: string;
  expires_at?: string;
  game_id: string;
  region: string;
}

export interface GameConnectionCardProps {
  connectionInfo: GameConnectionInfo;
  gameName: string;
}

/**
 * GameConnectionCard displays server connection details after all players confirm readiness.
 * Supports multiple connection mechanisms:
 * - Server URL / IP + Port (FPS games like CS2)
 * - Passcode (lobby password)
 * - QR Code (console games)
 * - Deep Link (mobile apps)
 *
 * @example
 * ```tsx
 * <GameConnectionCard
 *   connectionInfo={connInfo}
 *   gameName="Counter-Strike 2"
 * />
 * ```
 */
export function GameConnectionCard({ connectionInfo, gameName }: GameConnectionCardProps) {
  const sound = useSound();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPasscode, setShowPasscode] = useState(false);

  // Play connection-ready sound on mount
  useEffect(() => {
    sound.playWithHaptic('all-ready');
  }, [sound]);

  const copyToClipboard = useCallback(
    (value: string, field: string) => {
      navigator.clipboard.writeText(value).then(() => {
        setCopiedField(field);
        sound.play('ready-confirm');
        setTimeout(() => setCopiedField(null), 2000);
      });
    },
    [sound],
  );

  const handleCopyAll = useCallback(() => {
    const parts = [
      connectionInfo.server_url ? `Server: ${connectionInfo.server_url}` : '',
      connectionInfo.server_ip ? `IP: ${connectionInfo.server_ip}` : '',
      connectionInfo.port ? `Port: ${connectionInfo.port}` : '',
      connectionInfo.passcode ? `Passcode: ${connectionInfo.passcode}` : '',
    ].filter(Boolean);

    copyToClipboard(parts.join('\n'), 'all');
  }, [connectionInfo, copyToClipboard]);

  const handleDeepLink = useCallback(() => {
    if (connectionInfo.deep_link) {
      sound.playWithHaptic('match-found');
      window.open(connectionInfo.deep_link, '_blank');
    }
  }, [connectionInfo.deep_link, sound]);

  const expiresIn = useMemo(() => {
    if (!connectionInfo.expires_at) return null;
    const ms = new Date(connectionInfo.expires_at).getTime() - Date.now();
    if (ms <= 0) return 'Expired';
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [connectionInfo.expires_at]);

  const maskedPasscode = useMemo(() => {
    if (!connectionInfo.passcode) return '';
    return showPasscode
      ? connectionInfo.passcode
      : '•'.repeat(connectionInfo.passcode.length);
  }, [connectionInfo.passcode, showPasscode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'relative overflow-hidden',
        'border border-[#17C964]/30',
        'bg-gradient-to-b from-[#17C964]/5 via-transparent to-[#34445C]/5',
        'dark:from-[#17C964]/8 dark:via-transparent dark:to-[#DCFF37]/3',
      )}
      role="region"
      aria-label={`Game connection details for ${gameName}`}
      style={{
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)',
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-8 bg-[#17C964]/40" />
      <div className="absolute top-0 left-0 w-8 h-3 bg-[#17C964]/40" />
      <div className="absolute bottom-0 right-0 w-3 h-8 bg-[#17C964]/40" />
      <div className="absolute bottom-0 right-0 w-8 h-3 bg-[#17C964]/40" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center bg-[#17C964]/10"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
              }}
            >
              <Icon icon="solar:server-bold" width={22} className="text-[#17C964]" />
            </div>
            <div>
              <h3
                className={cn(
                  'text-base font-bold uppercase tracking-[0.15em]',
                  'text-[#34445C] dark:text-[#F5F0E1]',
                  electrolize.className,
                )}
              >
                Game Server Ready
              </h3>
              <p className="text-xs text-[#34445C]/50 dark:text-[#F5F0E1]/50 mt-0.5">
                {gameName} — <span className="text-[#FFC700]">{connectionInfo.region}</span>
              </p>
            </div>
          </div>
          {expiresIn && (
            <div
              className={cn(
                'px-2.5 py-1 text-xs font-mono font-bold uppercase',
                expiresIn === 'Expired'
                  ? 'bg-[#FF4654]/10 text-[#FF4654]'
                  : 'bg-[#FFC700]/10 text-[#FFC700]',
              )}
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
              }}
              aria-live="polite"
              aria-atomic="true"
            >
              <Icon icon="solar:alarm-bold" width={12} className="inline mr-1 -mt-0.5" />
              {expiresIn}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#17C964]/30 to-transparent" />

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 space-y-3">
        {/* Instructions */}
        {connectionInfo.instructions && (
          <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 leading-relaxed">
            {connectionInfo.instructions}
          </p>
        )}

        {/* Server URL */}
        {connectionInfo.server_url && (
          <ConnectionField
            label="Server Address"
            icon="solar:global-bold"
            value={connectionInfo.server_url}
            onCopy={() => copyToClipboard(connectionInfo.server_url!, 'server_url')}
            copied={copiedField === 'server_url'}
          />
        )}

        {/* IP & Port row */}
        {connectionInfo.server_ip && (
          <div className="flex gap-2">
            <div className="flex-1">
              <ConnectionField
                label="IP Address"
                icon="solar:routing-bold"
                value={connectionInfo.server_ip}
                onCopy={() => copyToClipboard(connectionInfo.server_ip!, 'server_ip')}
                copied={copiedField === 'server_ip'}
              />
            </div>
            {connectionInfo.port && (
              <div className="w-28">
                <ConnectionField
                  label="Port"
                  icon="solar:hashtag-bold"
                  value={String(connectionInfo.port)}
                  onCopy={() => copyToClipboard(String(connectionInfo.port!), 'port')}
                  copied={copiedField === 'port'}
                />
              </div>
            )}
          </div>
        )}

        {/* Passcode */}
        {connectionInfo.passcode && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#34445C]/40 dark:text-[#F5F0E1]/40 mb-1 font-medium">
              <Icon icon="solar:lock-keyhole-bold" width={12} className="inline mr-1 -mt-0.5" />
              Passcode
            </p>
            <div
              className="flex items-center gap-2 px-3 py-2 bg-[#FFC700]/5 border border-[#FFC700]/20"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
              }}
            >
              <span className="flex-1 font-mono text-sm font-semibold tracking-widest text-[#34445C] dark:text-[#F5F0E1]">
                {maskedPasscode}
              </span>
              <button
                onClick={() => setShowPasscode((v) => !v)}
                className="p-1 hover:bg-[#FFC700]/10 transition-colors"
                aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
              >
                <Icon
                  icon={showPasscode ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  width={16}
                  className="text-[#FFC700]"
                />
              </button>
              <button
                onClick={() => copyToClipboard(connectionInfo.passcode!, 'passcode')}
                className="p-1 hover:bg-[#FFC700]/10 transition-colors"
                aria-label="Copy passcode"
              >
                <Icon
                  icon={copiedField === 'passcode' ? 'solar:check-circle-bold' : 'solar:copy-bold'}
                  width={16}
                  className={copiedField === 'passcode' ? 'text-[#17C964]' : 'text-[#FFC700]'}
                />
              </button>
            </div>
          </div>
        )}

        {/* QR Code */}
        {connectionInfo.qr_code_data && (
          <div className="flex justify-center py-3">
            <div
              className="leet-modal-qr-box p-3 bg-white"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
              }}
            >
              <img
                src={connectionInfo.qr_code_data}
                alt="QR Code to join server"
                className="w-36 h-36"
              />
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#17C964]/30 to-transparent" />

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 flex gap-2">
        <EsportsButton
          variant={copiedField === 'all' ? 'primary' : 'ghost'}
          size="md"
          fullWidth
          onClick={handleCopyAll}
          startContent={
            <Icon
              icon={copiedField === 'all' ? 'solar:check-circle-bold' : 'solar:copy-bold'}
              width={18}
            />
          }
        >
          {copiedField === 'all' ? 'Copied!' : 'Copy All'}
        </EsportsButton>
        {connectionInfo.deep_link && (
          <EsportsButton
            variant="matchmaking"
            size="md"
            fullWidth
            glow
            onClick={handleDeepLink}
            startContent={<Icon icon="solar:rocket-bold" width={18} />}
          >
            Launch Game
          </EsportsButton>
        )}
      </div>
    </motion.div>
  );
}

// ── Connection Field Sub-Component ──────────────────────────────────────────

function ConnectionField({
  label,
  icon,
  value,
  onCopy,
  copied,
}: {
  label: string;
  icon: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[#34445C]/40 dark:text-[#F5F0E1]/40 mb-1 font-medium">
        <Icon icon={icon} width={12} className="inline mr-1 -mt-0.5" />
        {label}
      </p>
      <div
        className="flex items-center gap-2 px-3 py-2 bg-[#34445C]/5 dark:bg-[#F5F0E1]/5 border border-[#34445C]/10 dark:border-[#F5F0E1]/10"
        style={{
          clipPath:
            'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
        }}
      >
        <span className="flex-1 font-mono text-sm font-medium text-[#34445C] dark:text-[#F5F0E1] truncate">
          {value}
        </span>
        <button
          onClick={onCopy}
          className="flex-shrink-0 p-1 hover:bg-[#34445C]/10 dark:hover:bg-[#F5F0E1]/10 transition-colors"
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          <Icon
            icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'}
            width={16}
            className={copied ? 'text-[#17C964]' : 'text-[#34445C]/50 dark:text-[#F5F0E1]/50'}
          />
        </button>
      </div>
    </div>
  );
}
