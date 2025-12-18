/**
 * KYC Verification Component
 * Identity and document verification flow
 * Per PRD E.8.2 - Regulatory Compliance
 */

"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Progress,
  Chip,
  Divider,
  Checkbox,
  Image,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  KYCLevel,
  DocumentType,
  UserVerification,
} from "@/types/verification";
import { getKYCLevelLabel } from "@/types/verification";

type KYCStep =
  | "overview"
  | "personal-info"
  | "document-type"
  | "document-upload"
  | "selfie"
  | "address"
  | "review"
  | "processing"
  | "complete";

interface KYCVerificationProps {
  currentLevel: KYCLevel;
  targetLevel: KYCLevel;
  verification: UserVerification | null;
  onComplete: (result: { success: boolean; newLevel: KYCLevel }) => void;
  onCancel: () => void;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: string }[] = [
  { value: "passport", label: "Passport", icon: "solar:passport-bold" },
  {
    value: "drivers-license",
    label: "Driver's License",
    icon: "solar:card-bold",
  },
  { value: "national-id", label: "National ID", icon: "solar:user-id-bold" },
  {
    value: "residence-permit",
    label: "Residence Permit",
    icon: "solar:document-bold",
  },
];

const KYC_LEVEL_REQUIREMENTS: Record<
  KYCLevel,
  { steps: KYCStep[]; description: string }
> = {
  none: { steps: [], description: "No verification required" },
  basic: {
    steps: ["personal-info"],
    description: "Verify your email and phone number",
  },
  intermediate: {
    steps: ["personal-info", "document-type", "document-upload", "selfie"],
    description: "Verify your identity with a government-issued ID",
  },
  full: {
    steps: [
      "personal-info",
      "document-type",
      "document-upload",
      "selfie",
      "address",
    ],
    description: "Complete identity and address verification",
  },
};

export function KYCVerification({
  currentLevel,
  targetLevel,
  verification,
  onComplete,
  onCancel,
}: KYCVerificationProps) {
  const [currentStep, setCurrentStep] = useState<KYCStep>("overview");
  const [selectedDocType, setSelectedDocType] =
    useState<DocumentType>("passport");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [_isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<"front" | "back" | "selfie">(
    "front"
  );

  const requirements = KYC_LEVEL_REQUIREMENTS[targetLevel];
  const totalSteps = requirements.steps.length;
  const currentStepIndex = requirements.steps.indexOf(
    currentStep as Exclude<
      KYCStep,
      "overview" | "review" | "processing" | "complete"
    >
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      // Check file type
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Please upload a JPEG, PNG, or WebP image");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        switch (uploadTarget) {
          case "front":
            setFrontImage(dataUrl);
            break;
          case "back":
            setBackImage(dataUrl);
            break;
          case "selfie":
            setSelfieImage(dataUrl);
            break;
        }
        setError("");
      };
      reader.readAsDataURL(file);
    },
    [uploadTarget]
  );

  const triggerFileUpload = useCallback(
    (target: "front" | "back" | "selfie") => {
      setUploadTarget(target);
      fileInputRef.current?.click();
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    setIsProcessing(true);
    setCurrentStep("processing");

    // Simulate verification processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setProgress(i);
    }

    // Simulate API response
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep("complete");
      onComplete({ success: true, newLevel: targetLevel });
    }, 1000);
  }, [targetLevel, onComplete]);

  const goToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < totalSteps) {
      setCurrentStep(requirements.steps[nextIndex]);
    } else {
      setCurrentStep("review");
    }
  }, [currentStepIndex, totalSteps, requirements.steps]);

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(requirements.steps[currentStepIndex - 1]);
    } else {
      setCurrentStep("overview");
    }
  }, [currentStepIndex, requirements.steps]);

  const renderStep = () => {
    switch (currentStep) {
      case "overview":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Current Level */}
            <Card className="bg-default-50">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-500">
                      Current Verification Level
                    </p>
                    <p className="font-semibold">
                      {getKYCLevelLabel(currentLevel)}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    color={currentLevel === "full" ? "success" : "default"}
                    variant="flat"
                  >
                    {currentLevel === "none"
                      ? "0%"
                      : currentLevel === "basic"
                      ? "33%"
                      : currentLevel === "intermediate"
                      ? "66%"
                      : "100%"}
                  </Chip>
                </div>
              </CardBody>
            </Card>

            {/* Target Level */}
            <Card className="border-2 border-primary bg-primary/5">
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon
                      icon="solar:shield-check-bold"
                      className="w-6 h-6 text-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {getKYCLevelLabel(targetLevel)}
                    </p>
                    <p className="text-sm text-default-500">
                      {requirements.description}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Requirements */}
            <div className="space-y-3">
              <h4 className="font-semibold">What you&apos;ll need:</h4>
              <div className="space-y-2">
                {targetLevel !== "none" && (
                  <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                    <Icon
                      icon="solar:user-bold"
                      className="w-5 h-5 text-default-500"
                    />
                    <span className="text-sm">Basic personal information</span>
                    <Chip
                      size="sm"
                      color="success"
                      variant="flat"
                      className="ml-auto"
                    >
                      {verification?.kycLevel !== "none" ? "Done" : "Required"}
                    </Chip>
                  </div>
                )}
                {(targetLevel === "intermediate" || targetLevel === "full") && (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                      <Icon
                        icon="solar:card-bold"
                        className="w-5 h-5 text-default-500"
                      />
                      <span className="text-sm">Government-issued ID</span>
                      <Chip
                        size="sm"
                        color={
                          verification?.identityVerified ? "success" : "warning"
                        }
                        variant="flat"
                        className="ml-auto"
                      >
                        {verification?.identityVerified ? "Done" : "Required"}
                      </Chip>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                      <Icon
                        icon="solar:camera-bold"
                        className="w-5 h-5 text-default-500"
                      />
                      <span className="text-sm">
                        Selfie for face verification
                      </span>
                      <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        className="ml-auto"
                      >
                        Required
                      </Chip>
                    </div>
                  </>
                )}
                {targetLevel === "full" && (
                  <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                    <Icon
                      icon="solar:home-bold"
                      className="w-5 h-5 text-default-500"
                    />
                    <span className="text-sm">Proof of address</span>
                    <Chip
                      size="sm"
                      color={
                        verification?.addressVerified ? "success" : "warning"
                      }
                      variant="flat"
                      className="ml-auto"
                    >
                      {verification?.addressVerified ? "Done" : "Required"}
                    </Chip>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <Card className="bg-warning/10 border-warning/20">
              <CardBody>
                <div className="flex items-start gap-3">
                  <Icon
                    icon="solar:lock-bold"
                    className="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-warning-700 dark:text-warning-400 mb-1">
                      Your privacy is protected
                    </p>
                    <p className="text-default-600">
                      Your documents are encrypted and securely stored. We use
                      industry-standard verification providers and never share
                      your personal information.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );

      case "personal-info":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <p className="text-sm text-default-500">
              Please provide your legal name as it appears on your ID document
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Enter your first name"
                value={formData.firstName}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, firstName: val }))
                }
                classNames={{ inputWrapper: "rounded-none" }}
              />
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                value={formData.lastName}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, lastName: val }))
                }
                classNames={{ inputWrapper: "rounded-none" }}
              />
            </div>

            <Input
              label="Email"
              placeholder="your@email.com"
              type="email"
              value={formData.email}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, email: val }))
              }
              classNames={{ inputWrapper: "rounded-none" }}
            />

            <Input
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              type="tel"
              value={formData.phone}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, phone: val }))
              }
              classNames={{ inputWrapper: "rounded-none" }}
            />

            <Select
              label="Country of Residence"
              placeholder="Select your country"
              selectedKeys={formData.country ? [formData.country] : []}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
              classNames={{ trigger: "rounded-none" }}
            >
              <SelectItem key="US" textValue="United States">
                United States
              </SelectItem>
              <SelectItem key="BR" textValue="Brazil">
                Brazil
              </SelectItem>
              <SelectItem key="UK" textValue="United Kingdom">
                United Kingdom
              </SelectItem>
              <SelectItem key="DE" textValue="Germany">
                Germany
              </SelectItem>
              <SelectItem key="FR" textValue="France">
                France
              </SelectItem>
              <SelectItem key="KR" textValue="South Korea">
                South Korea
              </SelectItem>
              <SelectItem key="JP" textValue="Japan">
                Japan
              </SelectItem>
              <SelectItem key="CN" textValue="China">
                China
              </SelectItem>
            </Select>
          </motion.div>
        );

      case "document-type":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Select Document Type</h3>
            <p className="text-sm text-default-500">
              Choose the type of ID document you&apos;ll use for verification
            </p>

            <div className="grid grid-cols-2 gap-4">
              {DOCUMENT_TYPES.map((doc) => (
                <Card
                  key={doc.value}
                  isPressable
                  className={`cursor-pointer transition-all ${
                    selectedDocType === doc.value
                      ? "border-2 border-primary bg-primary/5"
                      : "border-2 border-transparent"
                  }`}
                  onPress={() => setSelectedDocType(doc.value)}
                >
                  <CardBody className="flex flex-col items-center gap-2 p-4">
                    <Icon icon={doc.icon} className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium">{doc.label}</span>
                    {selectedDocType === doc.value && (
                      <Icon
                        icon="solar:check-circle-bold"
                        className="w-5 h-5 text-success absolute top-2 right-2"
                      />
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>

            <Card className="bg-default-50">
              <CardBody>
                <h4 className="font-medium mb-2">Document requirements:</h4>
                <ul className="text-sm text-default-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="w-4 h-4 text-success"
                    />
                    Document must be valid and not expired
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="w-4 h-4 text-success"
                    />
                    All text must be clearly visible
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="w-4 h-4 text-success"
                    />
                    Photo must not be blurry or cropped
                  </li>
                </ul>
              </CardBody>
            </Card>
          </motion.div>
        );

      case "document-upload":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Upload Your Document</h3>
            <p className="text-sm text-default-500">
              Take clear photos of the front and back of your{" "}
              {DOCUMENT_TYPES.find((d) => d.value === selectedDocType)?.label}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Front */}
              <Card
                isPressable={!frontImage}
                className="aspect-[3/2]"
                onPress={() => triggerFileUpload("front")}
              >
                <CardBody className="flex items-center justify-center p-4">
                  {frontImage ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={frontImage}
                        alt="Front of document"
                        className="object-cover rounded-lg"
                        removeWrapper
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="solid"
                        className="absolute top-2 right-2"
                        onPress={() => setFrontImage(null)}
                      >
                        <Icon
                          icon="solar:trash-bin-trash-bold"
                          className="w-4 h-4"
                        />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icon
                        icon="solar:camera-add-bold"
                        className="w-12 h-12 text-default-300 mx-auto mb-2"
                      />
                      <p className="text-sm font-medium">Front of ID</p>
                      <p className="text-xs text-default-500">
                        Click to upload
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Back */}
              <Card
                isPressable={!backImage}
                className="aspect-[3/2]"
                onPress={() => triggerFileUpload("back")}
              >
                <CardBody className="flex items-center justify-center p-4">
                  {backImage ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={backImage}
                        alt="Back of document"
                        className="object-cover rounded-lg"
                        removeWrapper
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="solid"
                        className="absolute top-2 right-2"
                        onPress={() => setBackImage(null)}
                      >
                        <Icon
                          icon="solar:trash-bin-trash-bold"
                          className="w-4 h-4"
                        />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icon
                        icon="solar:camera-add-bold"
                        className="w-12 h-12 text-default-300 mx-auto mb-2"
                      />
                      <p className="text-sm font-medium">Back of ID</p>
                      <p className="text-xs text-default-500">
                        Click to upload
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
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
          </motion.div>
        );

      case "selfie":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Take a Selfie</h3>
            <p className="text-sm text-default-500">
              We&apos;ll compare this with your ID photo to verify your identity
            </p>

            <Card
              isPressable={!selfieImage}
              className="aspect-square max-w-xs mx-auto"
              onPress={() => triggerFileUpload("selfie")}
            >
              <CardBody className="flex items-center justify-center p-4">
                {selfieImage ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={selfieImage}
                      alt="Selfie"
                      className="object-cover rounded-lg"
                      removeWrapper
                    />
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="solid"
                      className="absolute top-2 right-2"
                      onPress={() => setSelfieImage(null)}
                    >
                      <Icon
                        icon="solar:trash-bin-trash-bold"
                        className="w-4 h-4"
                      />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="solar:user-bold"
                        className="w-12 h-12 text-default-300"
                      />
                    </div>
                    <p className="text-sm font-medium">Take Selfie</p>
                    <p className="text-xs text-default-500">
                      Make sure your face is clearly visible
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="bg-default-50">
              <CardBody>
                <h4 className="font-medium mb-2">Tips for a good selfie:</h4>
                <ul className="text-sm text-default-600 space-y-1">
                  <li>• Good lighting on your face</li>
                  <li>• No sunglasses or hats</li>
                  <li>• Neutral expression</li>
                  <li>• Look directly at the camera</li>
                </ul>
              </CardBody>
            </Card>
          </motion.div>
        );

      case "address":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Address Verification</h3>
            <p className="text-sm text-default-500">
              Enter your residential address for verification
            </p>

            <Input
              label="Address Line 1"
              placeholder="Street address"
              value={formData.addressLine1}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, addressLine1: val }))
              }
              classNames={{ inputWrapper: "rounded-none" }}
            />

            <Input
              label="Address Line 2 (Optional)"
              placeholder="Apartment, suite, etc."
              value={formData.addressLine2}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, addressLine2: val }))
              }
              classNames={{ inputWrapper: "rounded-none" }}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="City"
                value={formData.city}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, city: val }))
                }
                classNames={{ inputWrapper: "rounded-none" }}
              />
              <Input
                label="Postal Code"
                placeholder="12345"
                value={formData.postalCode}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, postalCode: val }))
                }
                classNames={{ inputWrapper: "rounded-none" }}
              />
            </div>

            <Card className="bg-default-50">
              <CardBody>
                <p className="text-sm text-default-600">
                  <strong>Note:</strong> You may be asked to provide proof of
                  address (utility bill, bank statement) dated within the last 3
                  months.
                </p>
              </CardBody>
            </Card>
          </motion.div>
        );

      case "review":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Review Your Information</h3>
            <p className="text-sm text-default-500">
              Please review your information before submitting
            </p>

            <Card className="bg-default-50">
              <CardBody className="space-y-3">
                <div>
                  <p className="text-xs text-default-500">Full Name</p>
                  <p className="font-medium">
                    {formData.firstName} {formData.lastName}
                  </p>
                </div>
                <Divider />
                <div>
                  <p className="text-xs text-default-500">Document Type</p>
                  <p className="font-medium">
                    {
                      DOCUMENT_TYPES.find((d) => d.value === selectedDocType)
                        ?.label
                    }
                  </p>
                </div>
                <Divider />
                <div>
                  <p className="text-xs text-default-500">Documents Uploaded</p>
                  <div className="flex gap-2 mt-1">
                    <Chip
                      size="sm"
                      color={frontImage ? "success" : "danger"}
                      variant="flat"
                    >
                      Front: {frontImage ? "✓" : "✗"}
                    </Chip>
                    <Chip
                      size="sm"
                      color={backImage ? "success" : "danger"}
                      variant="flat"
                    >
                      Back: {backImage ? "✓" : "✗"}
                    </Chip>
                    <Chip
                      size="sm"
                      color={selfieImage ? "success" : "danger"}
                      variant="flat"
                    >
                      Selfie: {selfieImage ? "✓" : "✗"}
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Checkbox
              isSelected={acceptedTerms}
              onValueChange={setAcceptedTerms}
            >
              <span className="text-sm">
                I confirm that all information provided is accurate and I agree
                to the{" "}
                <a href="/legal/terms" className="text-primary">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/legal/privacy" className="text-primary">
                  Privacy Policy
                </a>
              </span>
            </Checkbox>
          </motion.div>
        );

      case "processing":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon
                icon="solar:shield-check-bold"
                className="w-10 h-10 text-primary animate-pulse"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Verifying Your Identity
            </h3>
            <p className="text-default-500 mb-6">
              This may take a few moments...
            </p>
            <Progress
              value={progress}
              color="primary"
              className="max-w-xs mx-auto"
              size="md"
            />
            <p className="text-sm text-default-500 mt-2">{progress}%</p>
          </motion.div>
        );

      case "complete":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <Icon
                icon="solar:check-circle-bold"
                className="w-10 h-10 text-success"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Verification Complete!
            </h3>
            <p className="text-default-500 mb-4">
              Your verification level has been upgraded to{" "}
              <span className="text-primary font-medium">
                {getKYCLevelLabel(targetLevel)}
              </span>
            </p>
            <Card className="bg-success/10 max-w-sm mx-auto">
              <CardBody>
                <p className="text-sm text-success-700 dark:text-success-400">
                  You now have access to additional features and higher
                  transaction limits.
                </p>
              </CardBody>
            </Card>
          </motion.div>
        );
    }
  };

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case "personal-info":
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.country
        );
      case "document-type":
        return selectedDocType;
      case "document-upload":
        return frontImage && backImage;
      case "selfie":
        return selfieImage;
      case "address":
        return formData.addressLine1 && formData.city && formData.postalCode;
      case "review":
        return acceptedTerms;
      default:
        return true;
    }
  }, [
    currentStep,
    formData,
    selectedDocType,
    frontImage,
    backImage,
    selfieImage,
    acceptedTerms,
  ]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex-col items-start gap-2">
        <h2 className="text-xl font-bold">Identity Verification</h2>
        {currentStep !== "overview" &&
          currentStep !== "processing" &&
          currentStep !== "complete" && (
            <Progress
              value={((currentStepIndex + 1) / totalSteps) * 100}
              size="sm"
              color="primary"
              className="max-w-full"
            />
          )}
      </CardHeader>

      <CardBody>
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </CardBody>

      <CardFooter className="flex justify-between">
        {currentStep === "overview" && (
          <>
            <Button variant="flat" onPress={onCancel}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={() => setCurrentStep(requirements.steps[0])}
              className="rounded-none"
            >
              Start Verification
              <Icon icon="solar:arrow-right-bold" className="w-4 h-4" />
            </Button>
          </>
        )}

        {currentStep !== "overview" &&
          currentStep !== "processing" &&
          currentStep !== "complete" && (
            <>
              <Button variant="flat" onPress={goToPrevStep}>
                <Icon icon="solar:arrow-left-bold" className="w-4 h-4" />
                Back
              </Button>
              {currentStep === "review" ? (
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  className="rounded-none"
                  isDisabled={!canProceed()}
                >
                  Submit Verification
                </Button>
              ) : (
                <Button
                  color="primary"
                  onPress={goToNextStep}
                  className="rounded-none"
                  isDisabled={!canProceed()}
                >
                  Continue
                  <Icon icon="solar:arrow-right-bold" className="w-4 h-4" />
                </Button>
              )}
            </>
          )}

        {currentStep === "complete" && (
          <Button
            color="primary"
            onPress={onCancel}
            className="rounded-none w-full"
          >
            Done
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default KYCVerification;
