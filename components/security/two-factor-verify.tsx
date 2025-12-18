/**
 * Two-Factor Verification Modal
 * Modal for verifying 2FA codes during sensitive operations
 * Per PRD E.8.2 Security Requirements - Financial Operations
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export type VerificationMethod = "totp" | "sms" | "email" | "backup";

export interface TwoFactorVerifyProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string, method: VerificationMethod) => Promise<boolean>;
  availableMethods?: VerificationMethod[];
  defaultMethod?: VerificationMethod;
  title?: string;
  description?: string;
  operationType?: "withdrawal" | "login" | "settings" | "general";
  isLoading?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const METHOD_INFO: Record<
  VerificationMethod,
  {
    label: string;
    description: string;
    icon: string;
    codeLength: number;
  }
> = {
  totp: {
    label: "Authenticator App",
    description: "Enter the code from your authenticator app",
    icon: "solar:shield-check-bold",
    codeLength: 6,
  },
  sms: {
    label: "SMS Code",
    description: "We sent a code to your phone",
    icon: "solar:smartphone-bold",
    codeLength: 6,
  },
  email: {
    label: "Email Code",
    description: "We sent a code to your email",
    icon: "solar:mail-bold",
    codeLength: 6,
  },
  backup: {
    label: "Backup Code",
    description: "Use one of your saved backup codes",
    icon: "solar:key-bold",
    codeLength: 9, // XXXX-XXXX format
  },
};

const OPERATION_MESSAGES: Record<
  string,
  { title: string; description: string }
> = {
  withdrawal: {
    title: "Verify Withdrawal",
    description: "Enter your verification code to confirm this withdrawal",
  },
  login: {
    title: "Verify Login",
    description: "Enter your verification code to sign in",
  },
  settings: {
    title: "Verify Changes",
    description: "Enter your verification code to save these changes",
  },
  general: {
    title: "Verification Required",
    description: "Enter your verification code to continue",
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function TwoFactorVerify({
  isOpen,
  onClose,
  onVerify,
  availableMethods = ["totp"],
  defaultMethod = "totp",
  title,
  description,
  operationType = "general",
  isLoading: externalLoading = false,
}: TwoFactorVerifyProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<VerificationMethod>(defaultMethod);
  const [code, setCode] = useState("");
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const methodInfo = METHOD_INFO[selectedMethod];
  const codeLength = methodInfo.codeLength;
  const operationInfo = OPERATION_MESSAGES[operationType];

  // Reset state when modal opens or method changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCode("");
      setDigits(Array(codeLength).fill(""));
    }
  }, [isOpen, selectedMethod, codeLength]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown((prev) => prev - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendCooldown]);

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      // Handle paste
      if (value.length > 1) {
        const cleanValue =
          selectedMethod === "backup"
            ? value
                .toUpperCase()
                .replace(/[^A-Z0-9-]/g, "")
                .slice(0, codeLength)
            : value.replace(/\D/g, "").slice(0, codeLength);

        if (selectedMethod === "backup") {
          // For backup codes, handle the full string
          setCode(cleanValue);
          setDigits([cleanValue]);
        } else {
          const pastedDigits = cleanValue.split("");
          const newDigits = Array(codeLength).fill("");
          pastedDigits.forEach((digit, i) => {
            if (i < codeLength) {
              newDigits[i] = digit;
            }
          });
          setDigits(newDigits);
          setCode(newDigits.join(""));
          const nextEmptyIndex = Math.min(pastedDigits.length, codeLength - 1);
          inputRefs.current[nextEmptyIndex]?.focus();
        }
        return;
      }

      if (selectedMethod === "backup") {
        setCode(value.toUpperCase());
        return;
      }

      const newDigits = [...digits];
      newDigits[index] = value.replace(/\D/g, "");
      setDigits(newDigits);
      setCode(newDigits.join(""));

      // Auto-focus next input
      if (value && index < codeLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [selectedMethod, codeLength, digits]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const handleVerify = async () => {
    if (!code || (selectedMethod !== "backup" && code.length !== codeLength)) {
      setError("Please enter the complete code");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const success = await onVerify(code, selectedMethod);
      if (!success) {
        setError("Invalid code. Please try again.");
        // Clear code on error
        setCode("");
        setDigits(Array(codeLength).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    // In production, trigger API to resend code
    setResendCooldown(60);
    setError(null);
    // Show toast or notification that code was sent
  };

  const handleMethodChange = (method: VerificationMethod) => {
    setSelectedMethod(method);
    setError(null);
    setCode("");
    setDigits(Array(METHOD_INFO[method].codeLength).fill(""));
  };

  const isLoading = externalLoading || isVerifying;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon
              icon="solar:lock-password-bold"
              className="w-5 h-5 text-primary"
            />
          </div>
          <span>{title || operationInfo.title}</span>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <p className="text-sm text-default-600">
            {description || operationInfo.description}
          </p>

          {/* Method selector (if multiple methods available) */}
          {availableMethods.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {availableMethods.map((method) => (
                <Chip
                  key={method}
                  variant={selectedMethod === method ? "solid" : "bordered"}
                  color={selectedMethod === method ? "primary" : "default"}
                  className="cursor-pointer"
                  onClick={() => handleMethodChange(method)}
                >
                  <div className="flex items-center gap-1">
                    <Icon icon={METHOD_INFO[method].icon} className="w-4 h-4" />
                    <span>{METHOD_INFO[method].label}</span>
                  </div>
                </Chip>
              ))}
            </div>
          )}

          {/* Method description */}
          <div className="flex items-center gap-2 text-sm text-default-500">
            <Icon icon={methodInfo.icon} className="w-4 h-4" />
            <span>{methodInfo.description}</span>
          </div>

          {/* Code input */}
          {selectedMethod === "backup" ? (
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => handleDigitChange(0, e.target.value)}
                placeholder="XXXX-XXXX"
                className={`
                  w-full px-4 py-3 text-center text-xl font-mono tracking-widest
                  bg-default-100 border-2 rounded-lg uppercase
                  focus:outline-none focus:border-primary
                  ${error ? "border-danger" : "border-transparent"}
                `}
              />
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              {Array(codeLength)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={codeLength}
                    value={digits[index] || ""}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`
                    w-11 h-14 text-center text-2xl font-bold
                    bg-default-100 border-2 rounded-lg
                    focus:outline-none focus:border-primary
                    transition-colors
                    ${error ? "border-danger" : "border-transparent"}
                  `}
                  />
                ))}
            </div>
          )}

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-danger text-sm text-center flex items-center justify-center gap-2"
            >
              <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
              {error}
            </motion.p>
          )}

          {/* Resend option for SMS/Email */}
          {(selectedMethod === "sms" || selectedMethod === "email") && (
            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className={`
                  text-sm transition-colors
                  ${
                    resendCooldown > 0
                      ? "text-default-400 cursor-not-allowed"
                      : "text-primary hover:underline cursor-pointer"
                  }
                `}
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Didn't receive a code? Resend"}
              </button>
            </div>
          )}

          {/* Backup code option */}
          {availableMethods.includes("backup") &&
            selectedMethod !== "backup" && (
              <div className="text-center">
                <button
                  onClick={() => handleMethodChange("backup")}
                  className="text-sm text-default-500 hover:text-primary transition-colors"
                >
                  Use a backup code instead
                </button>
              </div>
            )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleVerify}
            isLoading={isLoading}
            isDisabled={
              !code ||
              (selectedMethod !== "backup" && code.length !== codeLength)
            }
          >
            Verify
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default TwoFactorVerify;
