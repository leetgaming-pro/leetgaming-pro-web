/**
 * Booking Calendar Component
 * Interactive calendar for scheduling coaching sessions
 * Per PRD D.4.3 - Coaching Marketplace
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  ScrollShadow,
  Skeleton,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import type { TimeSlot, CoachAvailability } from "@/types/coaching";
import { formatCoachPrice } from "@/types/coaching";

interface BookingCalendarProps {
  coachId: string;
  coachName: string;
  availability: CoachAvailability[];
  timezone: string;
  basePrice: number;
  sessionDuration: number; // minutes
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
  isLoading?: boolean;
  bookedSlots?: string[]; // Array of ISO date strings that are already booked
}

// Days of week labels
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function BookingCalendar({
  coachId: _coachId,
  coachName,
  availability,
  timezone,
  basePrice,
  sessionDuration,
  onSelectSlot,
  selectedSlot,
  isLoading = false,
  bookedSlots = [],
}: BookingCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    return start;
  });

  // Generate week days
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeekStart]);

  // Check if a day has any available slots
  const getDayAvailability = useCallback(
    (dayOfWeek: number) => {
      return availability.filter((a) => a.dayOfWeek === dayOfWeek);
    },
    [availability]
  );

  // Generate time slots for a specific day
  const generateTimeSlotsForDay = useCallback(
    (date: Date): TimeSlot[] => {
      const dayOfWeek = date.getDay();
      const dayAvailability = getDayAvailability(dayOfWeek);
      const slots: TimeSlot[] = [];
      const dateStr = date.toISOString().split("T")[0];

      dayAvailability.forEach((avail) => {
        const [startHour, startMin] = avail.startTime.split(":").map(Number);
        const [endHour, endMin] = avail.endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        for (
          let time = startMinutes;
          time + sessionDuration <= endMinutes;
          time += sessionDuration
        ) {
          const hour = Math.floor(time / 60);
          const min = time % 60;
          const slotStartTime = `${hour.toString().padStart(2, "0")}:${min
            .toString()
            .padStart(2, "0")}`;
          const endTime = time + sessionDuration;
          const endHr = Math.floor(endTime / 60);
          const endMn = endTime % 60;
          const slotEndTime = `${endHr.toString().padStart(2, "0")}:${endMn
            .toString()
            .padStart(2, "0")}`;

          const slotDateTime = new Date(date);
          slotDateTime.setHours(hour, min, 0, 0);
          const isInPast = slotDateTime < new Date();
          const isBooked = bookedSlots.includes(slotDateTime.toISOString());

          slots.push({
            id: `${dateStr}-${slotStartTime}`,
            date: dateStr,
            startTime: slotStartTime,
            endTime: slotEndTime,
            available: !isInPast && !isBooked,
            price: basePrice,
          });
        }
      });

      return slots;
    },
    [getDayAvailability, sessionDuration, bookedSlots, basePrice]
  );

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    // Don't go before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newStart >= today || weekDays[0] > today) {
      setCurrentWeekStart(newStart);
    }
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    // Limit to 4 weeks ahead
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 28);
    if (newStart <= maxDate) {
      setCurrentWeekStart(newStart);
    }
  };

  // Check if previous week button should be disabled
  const isPreviousDisabled = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return currentWeekStart <= today;
  }, [currentWeekStart]);

  // Format date for header
  const formatDateRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${start.toLocaleDateString(
      "en-US",
      options
    )} - ${end.toLocaleDateString("en-US", options)}, ${end.getFullYear()}`;
  };

  // Selected day for mobile view
  const [selectedDay, setSelectedDay] = useState<Date>(
    weekDays.find((d) => d.getDay() === new Date().getDay()) || weekDays[0]
  );

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex justify-between items-center">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Book a Session</h3>
          <p className="text-sm text-default-500">
            with {coachName} • {timezone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={goToPreviousWeek}
            isDisabled={isPreviousDisabled}
          >
            <Icon icon="solar:alt-arrow-left-bold" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {formatDateRange()}
          </span>
          <Button isIconOnly variant="flat" size="sm" onPress={goToNextWeek}>
            <Icon icon="solar:alt-arrow-right-bold" />
          </Button>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="gap-4">
        {/* Desktop: Full Week View */}
        <div className="hidden md:block">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const slots = generateTimeSlotsForDay(day);
              const availableSlots = slots.filter((s) => s.available);

              return (
                <div key={idx} className="flex flex-col">
                  {/* Day Header */}
                  <div
                    className={`text-center py-2 rounded-t-lg ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "bg-default-100"
                    }`}
                  >
                    <p className="text-xs font-medium">{DAYS[day.getDay()]}</p>
                    <p
                      className={`text-lg font-bold ${
                        isToday ? "" : "text-foreground"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                  </div>

                  {/* Time Slots */}
                  <ScrollShadow className="h-64 rounded-b-lg border border-t-0 border-default-200">
                    <div className="flex flex-col gap-1 p-2">
                      {slots.length === 0 ? (
                        <p className="text-xs text-default-400 text-center py-4">
                          No availability
                        </p>
                      ) : (
                        slots.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id;
                          return (
                            <motion.button
                              key={slot.id}
                              whileHover={slot.available ? { scale: 1.02 } : {}}
                              whileTap={slot.available ? { scale: 0.98 } : {}}
                              onClick={() =>
                                slot.available && onSelectSlot(slot)
                              }
                              disabled={!slot.available}
                              className={`
                                px-2 py-1.5 rounded text-xs font-medium transition-colors
                                ${
                                  slot.available
                                    ? isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-success-100 text-success-700 hover:bg-success-200 dark:bg-success-900/30 dark:text-success-400"
                                    : "bg-default-100 text-default-400 cursor-not-allowed line-through"
                                }
                              `}
                            >
                              {slot.startTime}
                            </motion.button>
                          );
                        })
                      )}
                    </div>
                  </ScrollShadow>

                  {/* Available count */}
                  <p className="text-xs text-center text-default-500 mt-1">
                    {availableSlots.length} available
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Day Selector + Time List */}
        <div className="md:hidden">
          {/* Day Tabs */}
          <ScrollShadow orientation="horizontal" className="mb-4">
            <div className="flex gap-2">
              {weekDays.map((day, idx) => {
                const isSelected =
                  selectedDay.toDateString() === day.toDateString();
                const isToday =
                  day.toDateString() === new Date().toDateString();
                const slots = generateTimeSlotsForDay(day);
                const availableSlots = slots.filter((s) => s.available);

                return (
                  <Button
                    key={idx}
                    variant={isSelected ? "solid" : "flat"}
                    color={isSelected ? "primary" : "default"}
                    onPress={() => setSelectedDay(day)}
                    className="flex-col h-auto py-2 min-w-[60px]"
                  >
                    <span className="text-xs">{DAYS[day.getDay()]}</span>
                    <span className="text-lg font-bold">{day.getDate()}</span>
                    {isToday && (
                      <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        className="h-4 text-[10px]"
                      >
                        Today
                      </Chip>
                    )}
                    <span className="text-[10px] text-default-500">
                      {availableSlots.length} slots
                    </span>
                  </Button>
                );
              })}
            </div>
          </ScrollShadow>

          {/* Time Slots for Selected Day */}
          <div>
            <p className="text-sm font-medium mb-2">
              Available times for {FULL_DAYS[selectedDay.getDay()]},{" "}
              {selectedDay.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <AnimatePresence mode="popLayout">
                {generateTimeSlotsForDay(selectedDay).map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Button
                        fullWidth
                        variant={
                          isSelected
                            ? "solid"
                            : slot.available
                            ? "bordered"
                            : "flat"
                        }
                        color={
                          isSelected
                            ? "primary"
                            : slot.available
                            ? "success"
                            : "default"
                        }
                        isDisabled={!slot.available}
                        onPress={() => slot.available && onSelectSlot(slot)}
                        className={`h-auto py-3 ${
                          !slot.available ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-semibold">
                            {slot.startTime}
                          </span>
                          <span className="text-xs">to {slot.endTime}</span>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {generateTimeSlotsForDay(selectedDay).length === 0 && (
                <div className="col-span-3 text-center py-8 text-default-500">
                  <Icon
                    icon="solar:calendar-minimalistic-bold-duotone"
                    className="w-12 h-12 mx-auto mb-2 opacity-50"
                  />
                  <p>No availability on this day</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Slot Summary */}
        <AnimatePresence>
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Divider className="my-2" />
              <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <Icon
                      icon="solar:calendar-mark-bold"
                      className="w-5 h-5 text-primary-foreground"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {new Date(selectedSlot.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-default-600">
                      {selectedSlot.startTime} - {selectedSlot.endTime} (
                      {sessionDuration} min)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {formatCoachPrice(basePrice)}
                  </p>
                  <p className="text-xs text-default-500">Session price</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

// Compact mini calendar for preview
export function MiniCalendar({
  availability,
  daysAhead = 7,
}: {
  availability: CoachAvailability[];
  daysAhead?: number;
}) {
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const hasAvailability = availability.some(
        (a) => a.dayOfWeek === date.getDay()
      );
      result.push({ date, hasAvailability });
    }
    return result;
  }, [availability, daysAhead]);

  return (
    <div className="flex gap-1">
      {days.map((day, idx) => (
        <div
          key={idx}
          className={`
            w-8 h-10 flex flex-col items-center justify-center rounded text-xs
            ${
              day.hasAvailability
                ? "bg-success-100 dark:bg-success-900/30"
                : "bg-default-100"
            }
          `}
        >
          <span className="text-[10px] text-default-500">
            {DAYS[day.date.getDay()]}
          </span>
          <span
            className={`font-medium ${
              day.hasAvailability ? "text-success-600" : "text-default-400"
            }`}
          >
            {day.date.getDate()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default BookingCalendar;
