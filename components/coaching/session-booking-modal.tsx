/**
 * Session Booking Modal
 * Complete booking flow for coaching sessions
 * Per PRD D.4.3 - Coaching Marketplace
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Chip,
  Progress,
  Textarea,
  RadioGroup,
  Radio,
  Card,
  CardBody,
  Divider,
  Input,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { BookingCalendar } from "./booking-calendar";
import type {
  Coach,
  SessionType,
  TimeSlot,
  CoachPricing,
  BookingConfirmation,
} from "@/types/coaching";
import {
  SESSION_TYPE_LABELS,
  formatCoachPrice,
  formatDuration,
  calculatePlatformFee,
} from "@/types/coaching";
import type { GameId } from "@/types/games";
import { GAME_CONFIGS } from "@/config/games";
import { SuccessCelebration } from "@/components/ui/success-confetti";
import { modalAnimations } from "@/lib/design/animations";

type BookingStep =
  | "session-type"
  | "schedule"
  | "details"
  | "payment"
  | "confirmation";

interface SessionBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: Coach;
  onSuccess?: (confirmation: BookingConfirmation) => void;
  preselectedGame?: GameId;
  preselectedType?: SessionType;
}

export function SessionBookingModal({
  isOpen,
  onClose,
  coach,
  onSuccess,
  preselectedGame,
  preselectedType,
}: SessionBookingModalProps) {
  const [step, setStep] = useState<BookingStep>("session-type");
  const [selectedGame, setSelectedGame] = useState<GameId | null>(
    preselectedGame || null
  );
  const [selectedType, setSelectedType] = useState<SessionType | null>(
    preselectedType || null
  );
  const [selectedPricing, setSelectedPricing] = useState<CoachPricing | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("session-type");
        setSelectedGame(preselectedGame || null);
        setSelectedType(preselectedType || null);
        setSelectedPricing(null);
        setSelectedSlot(null);
        setTopic("");
        setDescription("");
        setPromoCode("");
        setIsProcessing(false);
        setConfirmation(null);
        setError(null);
      }, 300);
    }
  }, [isOpen, preselectedGame, preselectedType]);

  // Progress indicator
  const progress = {
    "session-type": 20,
    schedule: 40,
    details: 60,
    payment: 80,
    confirmation: 100,
  }[step];

  // Get pricing options for selected type
  const pricingOptions = coach.pricing.filter(
    (p) => p.sessionType === selectedType
  );

  // Handle session type selection
  const handleSelectType = (type: SessionType) => {
    setSelectedType(type);
    // If only one pricing option, auto-select it
    const options = coach.pricing.filter((p) => p.sessionType === type);
    if (options.length === 1) {
      setSelectedPricing(options[0]);
    }
  };

  // Handle slot selection
  const handleSelectSlot = useCallback((slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep("details");
  }, []);

  // Calculate totals
  const subtotal = selectedPricing?.priceUsd || 0;
  const platformFee = calculatePlatformFee(subtotal);
  const total = subtotal + platformFee;

  // Submit booking
  const handleSubmit = async () => {
    if (!selectedType || !selectedSlot || !selectedPricing || !topic.trim()) {
      setError("Please complete all required fields");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // API call would go here
      const response = await fetch("/api/coaching/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          sessionType: selectedType,
          gameId: selectedGame,
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          durationMinutes: selectedPricing.durationMinutes,
          topic,
          description,
          promoCode: promoCode || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book session");
      }

      const bookingData = await response.json();

      const confirmationData: BookingConfirmation = {
        sessionId: bookingData.sessionId || "mock-session-id",
        coach: {
          id: coach.id,
          displayName: coach.displayName,
          avatar: coach.avatar,
        },
        scheduledAt: `${selectedSlot.date}T${selectedSlot.startTime}:00`,
        durationMinutes: selectedPricing.durationMinutes,
        type: selectedType,
        gameId: selectedGame || coach.expertise[0].gameId,
        topic,
        totalPaid: total,
        meetingLink: bookingData.meetingLink,
        calendarLink: bookingData.calendarLink || "#",
      };

      setConfirmation(confirmationData);
      setStep("confirmation");
      onSuccess?.(confirmationData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Booking failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigation
  const canProceed = () => {
    switch (step) {
      case "session-type":
        return selectedType && selectedPricing;
      case "schedule":
        return selectedSlot;
      case "details":
        return topic.trim().length > 0;
      case "payment":
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    const steps: BookingStep[] = [
      "session-type",
      "schedule",
      "details",
      "payment",
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    const steps: BookingStep[] = [
      "session-type",
      "schedule",
      "details",
      "payment",
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "bg-background",
        backdrop: "bg-black/80 backdrop-blur-sm",
      }}
      motionProps={{
        variants: modalAnimations.center,
      }}
      isDismissable={!isProcessing}
      hideCloseButton={isProcessing || step === "confirmation"}
    >
      <ModalContent>
        {step === "confirmation" && confirmation ? (
          <>
            <SuccessCelebration show={true} />
            <ModalHeader className="flex flex-col items-center pt-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-4"
              >
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-12 h-12 text-success-500"
                />
              </motion.div>
              <h2 className="text-2xl font-bold">Session Booked!</h2>
              <p className="text-default-500">
                Your coaching session has been confirmed
              </p>
            </ModalHeader>
            <ModalBody className="pb-6">
              <Card className="bg-default-50">
                <CardBody className="gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={confirmation.coach.avatar}
                      name={confirmation.coach.displayName}
                      size="lg"
                    />
                    <div>
                      <p className="font-semibold">
                        {confirmation.coach.displayName}
                      </p>
                      <p className="text-sm text-default-500">
                        {SESSION_TYPE_LABELS[confirmation.type].label}
                      </p>
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-default-500">Date & Time</p>
                      <p className="font-medium">
                        {new Date(confirmation.scheduledAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <p className="font-medium">
                        {new Date(confirmation.scheduledAt).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-default-500">Duration</p>
                      <p className="font-medium">
                        {formatDuration(confirmation.durationMinutes)}
                      </p>
                    </div>
                    <div>
                      <p className="text-default-500">Topic</p>
                      <p className="font-medium">{confirmation.topic}</p>
                    </div>
                    <div>
                      <p className="text-default-500">Total Paid</p>
                      <p className="font-medium text-primary">
                        {formatCoachPrice(confirmation.totalPaid)}
                      </p>
                    </div>
                  </div>

                  {confirmation.meetingLink && (
                    <>
                      <Divider />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:videocamera-record-bold"
                            className="w-5 h-5 text-primary"
                          />
                          <span className="text-sm">
                            Meeting link will be sent to your email
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-2">
              <Button
                as="a"
                href={confirmation.calendarLink}
                variant="flat"
                startContent={<Icon icon="solar:calendar-add-bold" />}
              >
                Add to Calendar
              </Button>
              <Button color="primary" onPress={onClose}>
                Done
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader className="flex flex-col gap-2 pb-2">
              <div className="flex items-center gap-3">
                <Avatar
                  src={coach.avatar}
                  name={coach.displayName}
                  className="w-12 h-12"
                />
                <div>
                  <h2 className="text-xl font-semibold">Book a Session</h2>
                  <p className="text-sm text-default-500">
                    with {coach.displayName}
                  </p>
                </div>
              </div>
              <Progress
                value={progress}
                color="primary"
                className="mt-2"
                classNames={{
                  indicator:
                    "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                }}
              />
              {/* Step Labels */}
              <div className="flex justify-between text-xs text-default-500 mt-1">
                <span
                  className={
                    step === "session-type" ? "text-primary font-medium" : ""
                  }
                >
                  Type
                </span>
                <span
                  className={
                    step === "schedule" ? "text-primary font-medium" : ""
                  }
                >
                  Schedule
                </span>
                <span
                  className={
                    step === "details" ? "text-primary font-medium" : ""
                  }
                >
                  Details
                </span>
                <span
                  className={
                    step === "payment" ? "text-primary font-medium" : ""
                  }
                >
                  Payment
                </span>
              </div>
            </ModalHeader>

            <ModalBody className="gap-4">
              {error && (
                <Card className="bg-danger-50 border border-danger-200">
                  <CardBody className="py-2">
                    <p className="text-danger text-sm">{error}</p>
                  </CardBody>
                </Card>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: Session Type */}
                {step === "session-type" && (
                  <motion.div
                    key="session-type"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Game Selection */}
                    {coach.expertise.length > 1 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">
                          Select Game
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {coach.expertise.map((exp) => {
                            const game = GAME_CONFIGS[exp.gameId];
                            const isSelected = selectedGame === exp.gameId;
                            return (
                              <Button
                                key={exp.gameId}
                                variant={isSelected ? "solid" : "bordered"}
                                color={isSelected ? "primary" : "default"}
                                onPress={() => setSelectedGame(exp.gameId)}
                                startContent={
                                  <Icon
                                    icon="solar:gamepad-bold"
                                    className="w-4 h-4"
                                  />
                                }
                              >
                                {game?.name}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Session Type Selection */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Session Type</p>
                      <RadioGroup
                        value={selectedType || ""}
                        onValueChange={(v) =>
                          handleSelectType(v as SessionType)
                        }
                      >
                        {(Object.keys(SESSION_TYPE_LABELS) as SessionType[])
                          .filter((type) =>
                            coach.pricing.some((p) => p.sessionType === type)
                          )
                          .map((type) => {
                            const info = SESSION_TYPE_LABELS[type];
                            const pricing = coach.pricing.filter(
                              (p) => p.sessionType === type
                            );
                            const minPrice = Math.min(
                              ...pricing.map((p) => p.priceUsd)
                            );

                            return (
                              <Radio
                                key={type}
                                value={type}
                                classNames={{
                                  base: "max-w-full p-3 border rounded-lg data-[selected=true]:border-primary",
                                }}
                              >
                                <div className="flex items-start gap-3 w-full">
                                  <Icon
                                    icon={info.icon}
                                    className="w-6 h-6 text-primary mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <span className="font-medium">
                                        {info.label}
                                      </span>
                                      <span className="text-primary font-semibold">
                                        from {formatCoachPrice(minPrice)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-default-500">
                                      {info.description}
                                    </p>
                                  </div>
                                </div>
                              </Radio>
                            );
                          })}
                      </RadioGroup>
                    </div>

                    {/* Duration Selection */}
                    {selectedType && pricingOptions.length > 1 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Duration</p>
                        <div className="flex flex-wrap gap-2">
                          {pricingOptions.map((pricing) => {
                            const isSelected =
                              selectedPricing?.durationMinutes ===
                              pricing.durationMinutes;
                            return (
                              <Button
                                key={pricing.durationMinutes}
                                variant={isSelected ? "solid" : "bordered"}
                                color={isSelected ? "primary" : "default"}
                                onPress={() => setSelectedPricing(pricing)}
                                className="flex-col h-auto py-2"
                              >
                                <span className="font-semibold">
                                  {formatDuration(pricing.durationMinutes)}
                                </span>
                                <span className="text-xs">
                                  {formatCoachPrice(pricing.priceUsd)}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Schedule */}
                {step === "schedule" && selectedPricing && (
                  <motion.div
                    key="schedule"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <BookingCalendar
                      coachId={coach.id}
                      coachName={coach.displayName}
                      availability={coach.availability}
                      timezone={coach.timezone}
                      basePrice={selectedPricing.priceUsd}
                      sessionDuration={selectedPricing.durationMinutes}
                      onSelectSlot={handleSelectSlot}
                      selectedSlot={selectedSlot}
                    />
                  </motion.div>
                )}

                {/* Step 3: Details */}
                {step === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <Input
                      label="Topic"
                      placeholder="What would you like to focus on?"
                      value={topic}
                      onValueChange={setTopic}
                      isRequired
                      description="Brief description of what you want to learn"
                      classNames={{
                        inputWrapper:
                          "rounded-none border-l-4 border-[#FF4654] dark:border-[#DCFF37]",
                      }}
                    />
                    <Textarea
                      label="Additional Details (Optional)"
                      placeholder="Any specific questions, your current rank, areas of weakness, etc."
                      value={description}
                      onValueChange={setDescription}
                      minRows={3}
                      classNames={{
                        inputWrapper: "rounded-none",
                      }}
                    />
                  </motion.div>
                )}

                {/* Step 4: Payment */}
                {step === "payment" && selectedPricing && selectedSlot && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Order Summary */}
                    <Card className="bg-default-50">
                      <CardBody className="gap-3">
                        <h3 className="font-semibold">Order Summary</h3>
                        <Divider />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-default-600">
                              {selectedType
                                ? SESSION_TYPE_LABELS[selectedType].label
                                : "Session"}{" "}
                              ({formatDuration(selectedPricing.durationMinutes)}
                              )
                            </span>
                            <span>{formatCoachPrice(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-default-500">
                            <span>Platform fee</span>
                            <span>{formatCoachPrice(platformFee)}</span>
                          </div>
                          <Divider />
                          <div className="flex justify-between font-semibold text-base">
                            <span>Total</span>
                            <span className="text-primary">
                              {formatCoachPrice(total)}
                            </span>
                          </div>
                        </div>

                        {/* Session Details */}
                        <Divider />
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="solar:calendar-bold"
                              className="w-4 h-4 text-default-500"
                            />
                            <span>
                              {new Date(selectedSlot.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="solar:clock-circle-bold"
                              className="w-4 h-4 text-default-500"
                            />
                            <span>
                              {selectedSlot.startTime} - {selectedSlot.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="solar:chat-round-line-bold"
                              className="w-4 h-4 text-default-500"
                            />
                            <span>{topic}</span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Promo Code */}
                    <Input
                      label="Promo Code (Optional)"
                      placeholder="Enter code"
                      value={promoCode}
                      onValueChange={setPromoCode}
                      classNames={{
                        inputWrapper: "rounded-none",
                      }}
                    />

                    {/* Payment Method */}
                    <Card className="bg-default-50">
                      <CardBody>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="solar:wallet-bold"
                              className="w-5 h-5 text-primary"
                            />
                            <span className="font-medium">
                              Pay with Wallet Balance
                            </span>
                          </div>
                          <Chip color="success" variant="flat" size="sm">
                            Available
                          </Chip>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Cancellation Policy */}
                    <p className="text-xs text-default-500">
                      <Icon
                        icon="solar:info-circle-bold"
                        className="w-3 h-3 inline mr-1"
                      />
                      Free cancellation up to 24 hours before the session. After
                      that, a 50% fee applies.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </ModalBody>

            <ModalFooter>
              <div className="flex justify-between w-full">
                {step !== "session-type" ? (
                  <Button
                    variant="flat"
                    onPress={goBack}
                    startContent={<Icon icon="solar:alt-arrow-left-bold" />}
                    isDisabled={isProcessing}
                  >
                    Back
                  </Button>
                ) : (
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                )}
                <Button
                  color="primary"
                  onPress={goNext}
                  endContent={
                    step !== "payment" ? (
                      <Icon icon="solar:alt-arrow-right-bold" />
                    ) : (
                      <Icon icon="solar:card-bold" />
                    )
                  }
                  isDisabled={!canProceed()}
                  isLoading={isProcessing}
                  className="rounded-none"
                >
                  {step === "payment"
                    ? `Pay ${formatCoachPrice(total)}`
                    : "Continue"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default SessionBookingModal;
