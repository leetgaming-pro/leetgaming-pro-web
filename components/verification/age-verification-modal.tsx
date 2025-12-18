/**
 * Age Verification Modal
 * Age gate and verification flow for restricted features
 * Per PRD E.8.2 - Regulatory Compliance
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Progress,
  Card,
  CardBody,
  Checkbox,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateAge, REGION_AGE_REQUIREMENTS } from "@/types/verification";

type VerificationStep = "intro" | "dob" | "parental" | "result";

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (verified: boolean, dateOfBirth?: string) => void;
  featureName: string;
  minAge?: number;
  userRegion?: string;
}

export function AgeVerificationModal({
  isOpen,
  onClose,
  onVerified,
  featureName,
  minAge = 18,
  userRegion = "US",
}: AgeVerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>("intro");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    age: number;
    requiresParentalConsent: boolean;
  } | null>(null);

  const regionRequirement =
    REGION_AGE_REQUIREMENTS[userRegion] || REGION_AGE_REQUIREMENTS.US;

  const handleDobSubmit = useCallback(() => {
    setError("");

    // Validate inputs
    const month = parseInt(dobMonth, 10);
    const day = parseInt(dobDay, 10);
    const year = parseInt(dobYear, 10);

    if (!month || !day || !year) {
      setError("Please enter a valid date of birth");
      return;
    }

    if (month < 1 || month > 12) {
      setError("Please enter a valid month (1-12)");
      return;
    }

    if (day < 1 || day > 31) {
      setError("Please enter a valid day (1-31)");
      return;
    }

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      setError("Please enter a valid year");
      return;
    }

    const dateOfBirth = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const age = calculateAge(dateOfBirth);

    if (age < regionRequirement.minimumAge) {
      setError(
        `Sorry, you must be at least ${regionRequirement.minimumAge} years old to use this platform.`
      );
      setVerificationResult({
        success: false,
        age,
        requiresParentalConsent: false,
      });
      setStep("result");
      return;
    }

    // Check if parental consent is needed
    const needsParentalConsent =
      regionRequirement.requiresParentalConsent &&
      age < regionRequirement.requiresParentalConsent.underAge &&
      regionRequirement.requiresParentalConsent.consentRequired;

    if (age < minAge && !needsParentalConsent) {
      setError(
        `Sorry, you must be at least ${minAge} years old to access this feature.`
      );
      setVerificationResult({
        success: false,
        age,
        requiresParentalConsent: false,
      });
      setStep("result");
      return;
    }

    if (needsParentalConsent) {
      setVerificationResult({
        success: true,
        age,
        requiresParentalConsent: true,
      });
      setStep("parental");
    } else {
      setVerificationResult({
        success: true,
        age,
        requiresParentalConsent: false,
      });
      setStep("result");
    }
  }, [dobMonth, dobDay, dobYear, minAge, regionRequirement]);

  const handleVerify = useCallback(() => {
    if (!acceptedTerms) {
      setError("You must accept the terms to continue");
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      const dateOfBirth = `${dobYear}-${String(parseInt(dobMonth, 10)).padStart(
        2,
        "0"
      )}-${String(parseInt(dobDay, 10)).padStart(2, "0")}`;
      onVerified(true, dateOfBirth);
      setIsProcessing(false);
      onClose();
    }, 1500);
  }, [acceptedTerms, dobMonth, dobDay, dobYear, onVerified, onClose]);

  const handleClose = useCallback(() => {
    // Reset state
    setStep("intro");
    setDobMonth("");
    setDobDay("");
    setDobYear("");
    setAcceptedTerms(false);
    setError("");
    setVerificationResult(null);
    onClose();
  }, [onClose]);

  const renderStep = () => {
    switch (step) {
      case "intro":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center">
                <Icon
                  icon="solar:shield-warning-bold"
                  className="w-8 h-8 text-warning"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Age Verification Required
              </h3>
              <p className="text-default-500">
                To access{" "}
                <span className="text-primary font-medium">{featureName}</span>,
                we need to verify your age. This helps us comply with legal
                requirements and keep our platform safe.
              </p>
            </div>

            <Card className="bg-default-50">
              <CardBody className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:lock-bold"
                    className="w-4 h-4 text-success"
                  />
                  <span className="text-sm">
                    Your information is securely stored
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:shield-check-bold"
                    className="w-4 h-4 text-success"
                  />
                  <span className="text-sm">
                    We never share your data with third parties
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:user-check-bold"
                    className="w-4 h-4 text-success"
                  />
                  <span className="text-sm">One-time verification only</span>
                </div>
              </CardBody>
            </Card>

            <div className="text-sm text-default-500">
              <p>
                <strong>Region:</strong> {regionRequirement.region}
              </p>
              <p>
                <strong>Minimum age:</strong> {minAge} years
              </p>
            </div>
          </motion.div>
        );

      case "dob":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">
                Enter Your Date of Birth
              </h3>
              <p className="text-sm text-default-500">
                Please enter your actual date of birth
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Month"
                placeholder="MM"
                value={dobMonth}
                onValueChange={(val) =>
                  setDobMonth(val.replace(/\D/g, "").slice(0, 2))
                }
                type="text"
                inputMode="numeric"
                maxLength={2}
                classNames={{ inputWrapper: "rounded-none" }}
              />
              <Input
                label="Day"
                placeholder="DD"
                value={dobDay}
                onValueChange={(val) =>
                  setDobDay(val.replace(/\D/g, "").slice(0, 2))
                }
                type="text"
                inputMode="numeric"
                maxLength={2}
                classNames={{ inputWrapper: "rounded-none" }}
              />
              <Input
                label="Year"
                placeholder="YYYY"
                value={dobYear}
                onValueChange={(val) =>
                  setDobYear(val.replace(/\D/g, "").slice(0, 4))
                }
                type="text"
                inputMode="numeric"
                maxLength={4}
                classNames={{ inputWrapper: "rounded-none" }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 rounded-lg">
                <Icon
                  icon="solar:danger-triangle-bold"
                  className="w-5 h-5 text-danger"
                />
                <span className="text-sm text-danger">{error}</span>
              </div>
            )}

            <Card className="bg-warning/10 border-warning/20">
              <CardBody>
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:info-circle-bold"
                    className="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-warning-700 dark:text-warning-400">
                    You must provide your real date of birth. Providing false
                    information may result in account suspension.
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );

      case "parental":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon
                  icon="solar:users-group-two-rounded-bold"
                  className="w-8 h-8 text-primary"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Parental Consent Required
              </h3>
              <p className="text-default-500">
                Since you&apos;re {verificationResult?.age} years old,
                you&apos;ll need parental consent to access certain features in
                your region.
              </p>
            </div>

            <Card className="bg-default-50">
              <CardBody className="space-y-3">
                <p className="text-sm">
                  To complete verification, please have a parent or guardian:
                </p>
                <ol className="list-decimal list-inside text-sm space-y-2 text-default-600">
                  <li>Review our Terms of Service and Privacy Policy</li>
                  <li>Provide their email address for consent verification</li>
                  <li>Complete the parental consent form</li>
                </ol>
              </CardBody>
            </Card>

            <Checkbox
              isSelected={acceptedTerms}
              onValueChange={setAcceptedTerms}
              size="sm"
            >
              <span className="text-sm">
                I confirm that I will obtain parental consent and my
                parent/guardian agrees to the Terms of Service
              </span>
            </Checkbox>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 rounded-lg">
                <Icon
                  icon="solar:danger-triangle-bold"
                  className="w-5 h-5 text-danger"
                />
                <span className="text-sm text-danger">{error}</span>
              </div>
            )}
          </motion.div>
        );

      case "result":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-4"
          >
            {verificationResult?.success ? (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-10 h-10 text-success"
                  />
                </div>
                <h3 className="text-xl font-semibold">
                  Verification Successful!
                </h3>
                <p className="text-default-500">
                  Your age has been verified. You can now access {featureName}.
                </p>

                <Checkbox
                  isSelected={acceptedTerms}
                  onValueChange={setAcceptedTerms}
                  size="sm"
                  className="justify-center"
                >
                  <span className="text-sm">
                    I accept the{" "}
                    <a href="/legal/terms" className="text-primary">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/legal/privacy" className="text-primary">
                      Privacy Policy
                    </a>
                  </span>
                </Checkbox>

                {error && <p className="text-sm text-danger">{error}</p>}
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-danger/20 flex items-center justify-center">
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-10 h-10 text-danger"
                  />
                </div>
                <h3 className="text-xl font-semibold">Access Denied</h3>
                <p className="text-default-500">{error}</p>
                <Card className="bg-default-50">
                  <CardBody>
                    <p className="text-sm text-default-600">
                      If you believe this is an error, please contact our
                      support team at{" "}
                      <a
                        href="mailto:support@leetgaming.pro"
                        className="text-primary"
                      >
                        support@leetgaming.pro
                      </a>
                    </p>
                  </CardBody>
                </Card>
              </>
            )}
          </motion.div>
        );
    }
  };

  const getStepNumber = () => {
    const steps = [
      "intro",
      "dob",
      verificationResult?.requiresParentalConsent ? "parental" : null,
      "result",
    ].filter(Boolean);
    return steps.indexOf(step) + 1;
  };

  const getTotalSteps = () => {
    return verificationResult?.requiresParentalConsent ? 4 : 3;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isDismissable={step === "intro"}
      hideCloseButton={step !== "intro"}
      size="md"
    >
      <ModalContent>
        <ModalHeader className="flex-col gap-1">
          <span>Age Verification</span>
          {step !== "intro" && step !== "result" && (
            <Progress
              value={(getStepNumber() / getTotalSteps()) * 100}
              size="sm"
              color="primary"
              className="max-w-full"
            />
          )}
        </ModalHeader>

        <ModalBody>
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </ModalBody>

        <ModalFooter>
          {step === "intro" && (
            <>
              <Button variant="flat" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={() => setStep("dob")}
                className="rounded-none"
              >
                Continue
                <Icon icon="solar:arrow-right-bold" className="w-4 h-4" />
              </Button>
            </>
          )}

          {step === "dob" && (
            <>
              <Button variant="flat" onPress={() => setStep("intro")}>
                Back
              </Button>
              <Button
                color="primary"
                onPress={handleDobSubmit}
                className="rounded-none"
                isDisabled={!dobMonth || !dobDay || !dobYear}
              >
                Verify Age
              </Button>
            </>
          )}

          {step === "parental" && (
            <>
              <Button variant="flat" onPress={() => setStep("dob")}>
                Back
              </Button>
              <Button
                color="primary"
                onPress={() => setStep("result")}
                className="rounded-none"
                isDisabled={!acceptedTerms}
              >
                Continue
              </Button>
            </>
          )}

          {step === "result" && verificationResult?.success && (
            <Button
              color="primary"
              onPress={handleVerify}
              className="rounded-none w-full"
              isLoading={isProcessing}
              isDisabled={!acceptedTerms}
            >
              Complete Verification
            </Button>
          )}

          {step === "result" && !verificationResult?.success && (
            <Button variant="flat" onPress={handleClose} className="w-full">
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AgeVerificationModal;
