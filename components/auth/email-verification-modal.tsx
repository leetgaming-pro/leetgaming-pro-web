'use client';

/**
 * Email Verification Modal
 * Uses SDK via useAuthExtensions hook - DO NOT use direct fetch calls
 */

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
import { useAuthExtensions } from '@/hooks/use-auth-extensions';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
}

export function EmailVerificationModal({
  isOpen,
  onClose,
  email,
  onVerified,
}: EmailVerificationModalProps) {
  // Use SDK-powered auth hook instead of direct fetch
  const {
    isEmailVerificationLoading,
    emailVerificationError,
    sendVerificationEmail,
    verifyEmail,
    clearErrors,
  } = useAuthExtensions();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send verification code when modal opens
  useEffect(() => {
    if (isOpen && !codeSent) {
      sendVerificationCode();
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

  const sendVerificationCode = async () => {
    if (cooldown > 0) return;

    setIsSending(true);
    setError(null);

    try {
      // Use SDK hook to send verification email
      const success = await sendVerificationEmail(email);

      if (success) {
        setCodeSent(true);
        setCooldown(60); // 60 second cooldown before resending
      } else {
        setError(emailVerificationError || 'Failed to send verification code');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code';
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
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
      // Use SDK hook to verify email with code
      const success = await verifyEmail(verificationCode);

      if (success) {
        onVerified();
      } else {
        setError(emailVerificationError || 'Invalid verification code');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode(['', '', '', '', '', '']);
    setError(null);
    clearErrors();
    onClose();
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
            <Icon icon="solar:letter-bold" className="w-5 h-5 text-primary" />
            <span>Verify Your Email</span>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon icon="solar:mailbox-bold" className="w-8 h-8 text-primary" />
            </div>
            <p className="text-default-500 text-sm">
              We sent a 6-digit verification code to
            </p>
            <p className="font-medium mt-1">{email}</p>
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
                  onPress={sendVerificationCode}
                  isLoading={isSending}
                >
                  Resend code
                </Button>
              )}
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
