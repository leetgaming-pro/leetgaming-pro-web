'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';

interface MFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string; // Description of the action being verified (e.g., "payment", "delete account")
  onVerified: (token: string) => void;
}

/**
 * MFAModal - Multi-Factor Authentication verification modal
 * Used for sensitive operations like payments, account changes, etc.
 */
export function MFAModal({
  isOpen,
  onClose,
  action,
  onVerified,
}: MFAModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send MFA code when modal opens
  useEffect(() => {
    if (isOpen && !codeSent) {
      sendMFACode();
    }
  }, [isOpen]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cooldown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCode(['', '', '', '', '', '']);
      setError(null);
      setCodeSent(false);
    }
  }, [isOpen]);

  const sendMFACode = async () => {
    if (cooldown > 0) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send MFA code');
      }

      setCodeSent(true);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send MFA code');
    } finally {
      setIsSending(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && newCode.join('').length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      verifyCode(pastedData);
    }
  };

  const verifyCode = async (verificationCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid MFA code');
      }

      onVerified(data.token);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode(['', '', '', '', '', '']);
    setError(null);
    onClose();
  };

  const getActionIcon = () => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('payment') || actionLower.includes('withdraw')) {
      return 'solar:wallet-money-bold';
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return 'solar:trash-bin-trash-bold';
    }
    if (actionLower.includes('password') || actionLower.includes('security')) {
      return 'solar:lock-password-bold';
    }
    return 'solar:shield-check-bold';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      classNames={{
        backdrop: 'bg-black/80 backdrop-blur-sm',
        base: 'bg-content1 border border-content3',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon icon="solar:shield-keyhole-bold" className="w-5 h-5 text-primary" />
            <span>Security Verification</span>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon icon={getActionIcon()} className="w-8 h-8 text-primary" />
            </div>
            <p className="text-default-500 text-sm">
              For your security, please enter the verification code
            </p>
            <p className="text-sm text-default-400 mt-1">
              to confirm: <span className="font-medium text-foreground">{action}</span>
            </p>
          </div>

          {/* Code Input */}
          <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el as HTMLInputElement | null; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                classNames={{
                  base: 'w-12',
                  input: 'text-center text-xl font-bold',
                  inputWrapper: 'h-14',
                }}
                isDisabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm">
              <Icon icon="solar:danger-triangle-bold" className="w-4 h-4 text-danger" />
              <span className="text-danger">{error}</span>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Spinner size="sm" />
              <span className="text-default-500">Verifying...</span>
            </div>
          )}

          {/* Resend Code */}
          <div className="text-center mt-4">
            <p className="text-sm text-default-400">
              Didn&apos;t receive the code?{' '}
              {cooldown > 0 ? (
                <span className="text-default-500">Resend in {cooldown}s</span>
              ) : (
                <Button
                  variant="light"
                  size="sm"
                  className="text-primary p-0 h-auto"
                  onPress={sendMFACode}
                  isLoading={isSending}
                >
                  Resend code
                </Button>
              )}
            </p>
          </div>

          {/* Help text */}
          <div className="mt-4 p-3 bg-content2/50 rounded-lg">
            <p className="text-xs text-default-400 text-center">
              <Icon icon="solar:info-circle-bold" className="w-3 h-3 inline mr-1" />
              Check your email for the 6-digit code
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
