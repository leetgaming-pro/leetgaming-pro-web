/**
 * Two-Factor Authentication Setup Component
 * Complete 2FA setup flow with QR code, backup codes, and verification
 * Per PRD E.8.2 Security Requirements
 */

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Spinner,
  Chip,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export type TwoFactorMethod = "totp" | "sms" | "email";

export interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userEmail?: string;
  userPhone?: string;
  enabledMethods?: TwoFactorMethod[];
}

interface TwoFactorSecret {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
  method: TwoFactorMethod;
}

type SetupStep =
  | "select-method"
  | "scan-qr"
  | "verify"
  | "backup-codes"
  | "success";

// ============================================================================
// Constants
// ============================================================================

const METHOD_INFO: Record<
  TwoFactorMethod,
  {
    label: string;
    description: string;
    icon: string;
    recommended?: boolean;
  }
> = {
  totp: {
    label: "Authenticator App",
    description: "Use an app like Google Authenticator, Authy, or 1Password",
    icon: "solar:shield-check-bold",
    recommended: true,
  },
  sms: {
    label: "SMS",
    description: "Receive codes via text message",
    icon: "solar:smartphone-bold",
  },
  email: {
    label: "Email",
    description: "Receive codes via email",
    icon: "solar:mail-bold",
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

// Generate mock TOTP secret (in production, this comes from the API)
const generateMockSecret = (): TwoFactorSecret => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Generate backup codes
  const backupCodes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code =
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      "-" +
      Math.random().toString(36).substring(2, 6).toUpperCase();
    backupCodes.push(code);
  }

  return {
    secret,
    qrCodeUri: `otpauth://totp/LeetGaming.PRO?secret=${secret}&issuer=LeetGaming.PRO`,
    backupCodes,
    method: "totp",
  };
};

// ============================================================================
// Sub-Components
// ============================================================================

function MethodSelector({
  onSelect,
  enabledMethods = [],
  userPhone,
  userEmail,
}: {
  onSelect: (method: TwoFactorMethod) => void;
  enabledMethods: TwoFactorMethod[];
  userPhone?: string;
  userEmail?: string;
}) {
  const methods: TwoFactorMethod[] = ["totp", "sms", "email"];

  return (
    <div className="space-y-4">
      <p className="text-default-600 text-sm">
        Choose how you want to receive your verification codes:
      </p>

      <div className="space-y-3">
        {methods.map((method) => {
          const info = METHOD_INFO[method];
          const isEnabled = enabledMethods.includes(method);
          const isDisabled =
            (method === "sms" && !userPhone) ||
            (method === "email" && !userEmail);

          return (
            <motion.button
              key={method}
              onClick={() => !isEnabled && !isDisabled && onSelect(method)}
              disabled={isEnabled || isDisabled}
              whileHover={!isEnabled && !isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isEnabled && !isDisabled ? { scale: 0.98 } : {}}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${
                  isEnabled
                    ? "border-success/50 bg-success/10 cursor-default"
                    : isDisabled
                    ? "border-default-200 bg-default-100 cursor-not-allowed opacity-50"
                    : "border-default-200 hover:border-primary hover:bg-primary/5 cursor-pointer"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${isEnabled ? "bg-success/20" : "bg-default-100"}
                `}
                >
                  <Icon
                    icon={info.icon}
                    className={`w-5 h-5 ${
                      isEnabled ? "text-success" : "text-default-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{info.label}</span>
                    {info.recommended && !isEnabled && (
                      <Chip size="sm" color="primary" variant="flat">
                        Recommended
                      </Chip>
                    )}
                    {isEnabled && (
                      <Chip size="sm" color="success" variant="flat">
                        Enabled
                      </Chip>
                    )}
                  </div>
                  <p className="text-sm text-default-500 mt-1">
                    {info.description}
                  </p>
                  {method === "sms" && !userPhone && (
                    <p className="text-xs text-warning mt-1">
                      Add a phone number in your profile first
                    </p>
                  )}
                </div>
                {!isEnabled && !isDisabled && (
                  <Icon
                    icon="solar:alt-arrow-right-linear"
                    className="w-5 h-5 text-default-400"
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function QRCodeDisplay({
  secret,
  onCopySecret,
}: {
  secret: TwoFactorSecret;
  onCopySecret: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-default-600 text-sm">
        Scan this QR code with your authenticator app:
      </p>

      {/* QR Code Placeholder - In production, use a QR code library */}
      <div className="flex justify-center">
        <div className="w-48 h-48 bg-white rounded-lg p-4 flex items-center justify-center">
          <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCBmaWxsPSIjMDAwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48cmVjdCBmaWxsPSIjMDAwIiB4PSIyMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iIzAwMCIgeD0iNDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IGZpbGw9IiMwMDAiIHg9IjYwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48cmVjdCBmaWxsPSIjMDAwIiB4PSI4MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iIzAwMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IGZpbGw9IiMwMDAiIHg9IjQwIiB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iIzAwMCIgeD0iNjAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48cmVjdCBmaWxsPSIjMDAwIiB4PSI4MCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjwvc3ZnPg==')] bg-contain" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-default-400 mb-2">
          Or enter this code manually:
        </p>
        <div className="flex items-center justify-center gap-2">
          <code className="px-3 py-2 bg-default-100 rounded-lg font-mono text-sm tracking-wider">
            {secret.secret.match(/.{1,4}/g)?.join(" ")}
          </code>
          <Tooltip content="Copy secret">
            <Button isIconOnly size="sm" variant="flat" onClick={onCopySecret}>
              <Icon icon="solar:copy-bold" className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

function VerificationInput({
  onVerify,
  isLoading,
  error,
}: {
  onVerify: (code: string) => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [code, setCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedDigits = value.slice(0, 6).split("");
      const newDigits = [...digits];
      pastedDigits.forEach((digit, i) => {
        if (index + i < 6) {
          newDigits[index + i] = digit;
        }
      });
      setDigits(newDigits);
      const fullCode = newDigits.join("");
      setCode(fullCode);
      if (fullCode.length === 6) {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setCode(newDigits.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onVerify(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-default-600 text-sm text-center">
        Enter the 6-digit code from your authenticator app:
      </p>

      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={digit}
            onChange={(e) =>
              handleDigitChange(index, e.target.value.replace(/\D/g, ""))
            }
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`
              w-12 h-14 text-center text-2xl font-bold
              bg-default-100 border-2 rounded-lg
              focus:outline-none focus:border-primary
              transition-colors
              ${error ? "border-danger" : "border-transparent"}
            `}
          />
        ))}
      </div>

      {error && <p className="text-danger text-sm text-center">{error}</p>}

      <Button
        type="submit"
        color="primary"
        fullWidth
        isLoading={isLoading}
        isDisabled={code.length !== 6}
      >
        Verify Code
      </Button>
    </form>
  );
}

function BackupCodesDisplay({
  codes,
  onCopyCodes,
  onDownloadCodes,
}: {
  codes: string[];
  onCopyCodes: () => void;
  onDownloadCodes: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
        <div className="flex gap-3">
          <Icon
            icon="solar:danger-triangle-bold"
            className="w-5 h-5 text-warning flex-shrink-0"
          />
          <div>
            <p className="font-semibold text-warning">
              Save your backup codes!
            </p>
            <p className="text-sm text-default-600 mt-1">
              Store these codes in a safe place. Each code can only be used
              once. If you lose access to your authenticator app, you can use
              these codes to sign in.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {codes.map((code, index) => (
          <div
            key={index}
            className="px-3 py-2 bg-default-100 rounded-lg text-center font-mono text-sm"
          >
            {code}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="flat"
          fullWidth
          startContent={<Icon icon="solar:copy-bold" className="w-4 h-4" />}
          onClick={onCopyCodes}
        >
          Copy All
        </Button>
        <Button
          variant="flat"
          fullWidth
          startContent={<Icon icon="solar:download-bold" className="w-4 h-4" />}
          onClick={onDownloadCodes}
        >
          Download
        </Button>
      </div>
    </div>
  );
}

function SuccessDisplay({ method }: { method: TwoFactorMethod }) {
  return (
    <div className="text-center space-y-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center"
      >
        <Icon
          icon="solar:shield-check-bold"
          className="w-10 h-10 text-success"
        />
      </motion.div>

      <div>
        <h3 className="text-xl font-bold text-success">2FA Enabled!</h3>
        <p className="text-default-600 mt-2">
          Your account is now protected with {METHOD_INFO[method].label}.
        </p>
      </div>

      <Card className="bg-default-50">
        <CardBody className="text-sm text-default-600">
          <p>
            From now on, you&apos;ll need to enter a verification code when:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Signing in from a new device</li>
            <li>Making withdrawals from your wallet</li>
            <li>Changing sensitive account settings</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TwoFactorSetup({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  userPhone,
  enabledMethods = [],
}: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>("select-method");
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod>("totp");
  const [secret, setSecret] = useState<TwoFactorSecret | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("select-method");
      setSelectedMethod("totp");
      setSecret(null);
      setError(null);
    }
  }, [isOpen]);

  const handleMethodSelect = async (method: TwoFactorMethod) => {
    setSelectedMethod(method);
    setIsLoading(true);
    setError(null);

    try {
      // In production: POST /api/v1/users/2fa/enable
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (method === "totp") {
        const newSecret = generateMockSecret();
        setSecret(newSecret);
        setStep("scan-qr");
      } else {
        // For SMS/email, skip to verification
        setStep("verify");
      }
    } catch {
      setError("Failed to initialize 2FA setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = useCallback(() => {
    if (secret) {
      navigator.clipboard.writeText(secret.secret);
    }
  }, [secret]);

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // In production: POST /api/v1/users/2fa/verify
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate verification (in production, validate code server-side)
      if (code === "123456" || code.length === 6) {
        setStep("backup-codes");
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBackupCodes = useCallback(() => {
    if (secret) {
      const codesText = secret.backupCodes.join("\n");
      navigator.clipboard.writeText(codesText);
    }
  }, [secret]);

  const handleDownloadBackupCodes = useCallback(() => {
    if (secret) {
      const codesText = `LeetGaming.PRO 2FA Backup Codes\n${"=".repeat(
        40
      )}\n\nSave these codes in a safe place.\nEach code can only be used once.\n\n${secret.backupCodes.join(
        "\n"
      )}\n\nGenerated: ${new Date().toISOString()}`;
      const blob = new Blob([codesText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leetgaming-backup-codes.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [secret]);

  const handleComplete = () => {
    setStep("success");
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 2000);
  };

  const getStepTitle = () => {
    switch (step) {
      case "select-method":
        return "Enable Two-Factor Authentication";
      case "scan-qr":
        return "Set Up Authenticator";
      case "verify":
        return "Verify Setup";
      case "backup-codes":
        return "Save Backup Codes";
      case "success":
        return "Setup Complete";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon
              icon="solar:shield-check-bold"
              className="w-5 h-5 text-primary"
            />
          </div>
          <span>{getStepTitle()}</span>
        </ModalHeader>

        <ModalBody>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading && step === "select-method" ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" label="Setting up 2FA..." />
                </div>
              ) : step === "select-method" ? (
                <MethodSelector
                  onSelect={handleMethodSelect}
                  enabledMethods={enabledMethods}
                  userPhone={userPhone}
                  userEmail={userEmail}
                />
              ) : step === "scan-qr" && secret ? (
                <QRCodeDisplay
                  secret={secret}
                  onCopySecret={handleCopySecret}
                />
              ) : step === "verify" ? (
                <VerificationInput
                  onVerify={handleVerify}
                  isLoading={isLoading}
                  error={error}
                />
              ) : step === "backup-codes" && secret ? (
                <BackupCodesDisplay
                  codes={secret.backupCodes}
                  onCopyCodes={handleCopyBackupCodes}
                  onDownloadCodes={handleDownloadBackupCodes}
                />
              ) : step === "success" ? (
                <SuccessDisplay method={selectedMethod} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </ModalBody>

        {step !== "success" && (
          <ModalFooter>
            {step === "select-method" ? (
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
            ) : step === "scan-qr" ? (
              <>
                <Button variant="flat" onPress={() => setStep("select-method")}>
                  Back
                </Button>
                <Button color="primary" onPress={() => setStep("verify")}>
                  Continue
                </Button>
              </>
            ) : step === "verify" ? (
              <Button
                variant="flat"
                onPress={() =>
                  setStep(
                    selectedMethod === "totp" ? "scan-qr" : "select-method"
                  )
                }
              >
                Back
              </Button>
            ) : step === "backup-codes" ? (
              <>
                <Button variant="flat" onPress={() => setStep("verify")}>
                  Back
                </Button>
                <Button color="primary" onPress={handleComplete}>
                  I&apos;ve Saved My Codes
                </Button>
              </>
            ) : null}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}

export default TwoFactorSetup;
