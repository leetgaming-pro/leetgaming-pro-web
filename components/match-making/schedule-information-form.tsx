"use client";

/**
 * Schedule Information Form - State-of-the-Art E-Sports Scheduling UX
 *
 * Features:
 * - Quick Play: Instant matchmaking for players ready now
 * - Session Scheduler: Book specific time slots with timezone intelligence
 * - Weekly Availability: Set recurring play windows for consistent scheduling
 * - Smart Insights: Shows peak hours, estimated queue times, and player activity
 * - E-Sports Aesthetics: Angular design, brand colors, competitive feel
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Tooltip,
} from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { title } from "../primitives";
import { useTheme } from "next-themes";
import { useWizard } from "./wizard-context";

type ScheduleMode = "instant" | "scheduled" | "recurring";

interface TimeSlot {
  hour: number;
  activity: "low" | "medium" | "high" | "peak";
  estimatedWait: number; // seconds
  playersOnline: number;
}

interface DayAvailability {
  day: string;
  shortDay: string;
  slots: number[];
  isWeekend: boolean;
}

// Generate activity data based on real pool stats or intelligent defaults
const generateActivityData = (
  basePlayersOnline: number = 100,
  avgWaitTime: number = 60
): TimeSlot[] => {
  return Array.from({ length: 24 }, (_, hour) => {
    let activity: TimeSlot["activity"] = "low";
    let multiplier = 0.3; // Base multiplier for player count

    // E-sports peak hours are typically evening hours in major regions
    // Peak: 18:00-23:00, High: 14:00-17:00, Medium: 10:00-13:00
    if (hour >= 18 && hour <= 22) {
      activity = "peak";
      multiplier = 1.0;
    } else if (hour >= 14 && hour <= 17) {
      activity = "high";
      multiplier = 0.7;
    } else if (hour >= 10 && hour <= 13) {
      activity = "medium";
      multiplier = 0.5;
    } else if (hour >= 23 || hour <= 2) {
      activity = "medium"; // Late night gamers
      multiplier = 0.4;
    }

    const playersOnline = Math.floor(basePlayersOnline * multiplier);
    const estimatedWait = Math.floor(avgWaitTime / multiplier);

    return { hour, activity, estimatedWait, playersOnline };
  });
};

const DAYS: DayAvailability[] = [
  { day: "Sunday", shortDay: "SUN", slots: [], isWeekend: true },
  { day: "Monday", shortDay: "MON", slots: [], isWeekend: false },
  { day: "Tuesday", shortDay: "TUE", slots: [], isWeekend: false },
  { day: "Wednesday", shortDay: "WED", slots: [], isWeekend: false },
  { day: "Thursday", shortDay: "THU", slots: [], isWeekend: false },
  { day: "Friday", shortDay: "FRI", slots: [], isWeekend: false },
  { day: "Saturday", shortDay: "SAT", slots: [], isWeekend: true },
];

// Time slot blocks for recurring availability (4-hour blocks)
const TIME_BLOCKS = [
  {
    id: "morning",
    label: "Morning",
    range: "06:00 - 12:00",
    hours: [6, 7, 8, 9, 10, 11],
    icon: "solar:sunrise-bold-duotone",
  },
  {
    id: "afternoon",
    label: "Afternoon",
    range: "12:00 - 18:00",
    hours: [12, 13, 14, 15, 16, 17],
    icon: "solar:sun-bold-duotone",
  },
  {
    id: "evening",
    label: "Evening",
    range: "18:00 - 00:00",
    hours: [18, 19, 20, 21, 22, 23],
    icon: "solar:moon-bold-duotone",
  },
  {
    id: "night",
    label: "Late Night",
    range: "00:00 - 06:00",
    hours: [0, 1, 2, 3, 4, 5],
    icon: "solar:moon-stars-bold-duotone",
  },
];

export type ScheduleInformationFormProps =
  React.HTMLAttributes<HTMLFormElement>;

const ScheduleInformationForm = React.forwardRef<
  HTMLFormElement,
  ScheduleInformationFormProps
>((_props, _ref) => {
  const { state, updateState, sdk } = useWizard();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("instant");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState<
    Record<string, string[]>
  >({});
  const [activityData, setActivityData] = useState<TimeSlot[]>(() =>
    generateActivityData()
  );
  const [_isLoadingStats, setIsLoadingStats] = useState(true);

  // Current time info
  const now = new Date();
  const currentHour = now.getHours();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch real pool stats from backend
  const fetchPoolStats = useCallback(async () => {
    try {
      const gameId = "cs2"; // Default game, could come from wizard state
      const stats = await sdk.getPoolStats(
        gameId,
        state.gameMode,
        state.region
      );

      if (stats) {
        // Update activity data based on real stats
        const realActivityData = generateActivityData(
          stats.total_players,
          stats.average_wait_time_seconds
        );
        setActivityData(realActivityData);
      }
    } catch (error) {
      console.error("Failed to fetch pool stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [sdk, state.gameMode, state.region]);

  // Fetch stats on mount and when preferences change
  useEffect(() => {
    fetchPoolStats();
    const interval = setInterval(fetchPoolStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPoolStats]);

  // Calculate optimal play times
  const optimalTimes = useMemo(() => {
    return activityData
      .filter((slot) => slot.activity === "peak" || slot.activity === "high")
      .sort((a, b) => a.estimatedWait - b.estimatedWait)
      .slice(0, 3);
  }, [activityData]);

  // Current activity
  const currentActivity = activityData[currentHour];

  // Handle mode changes
  useEffect(() => {
    if (scheduleMode === "instant") {
      updateState({ scheduleType: "now" });
    } else if (
      scheduleMode === "scheduled" &&
      selectedDate &&
      selectedHour !== null
    ) {
      const scheduledTime = new Date(selectedDate);
      scheduledTime.setHours(selectedHour, 0, 0, 0);
      updateState({
        scheduleType: "time-frames",
        scheduleStart: scheduledTime,
        scheduleEnd: new Date(scheduledTime.getTime() + 4 * 60 * 60 * 1000), // 4 hour window
      });
    } else if (scheduleMode === "recurring") {
      const availableDays = Object.entries(weeklyAvailability)
        .filter(([_, blocks]) => blocks.length > 0)
        .map(([day]) => day);
      updateState({
        scheduleType: "weekly-routine",
        weeklyRoutine: availableDays,
        schedule: {
          weeklyRoutine: availableDays,
        },
      });
    }
  }, [
    scheduleMode,
    selectedDate,
    selectedHour,
    weeklyAvailability,
    updateState,
  ]);

  const toggleDayBlock = (dayShort: string, blockId: string) => {
    setWeeklyAvailability((prev) => {
      const dayBlocks = prev[dayShort] || [];
      if (dayBlocks.includes(blockId)) {
        return { ...prev, [dayShort]: dayBlocks.filter((b) => b !== blockId) };
      }
      return { ...prev, [dayShort]: [...dayBlocks, blockId] };
    });
  };

  const getActivityColor = (activity: TimeSlot["activity"]) => {
    switch (activity) {
      case "peak":
        return "bg-[#DCFF37] dark:bg-[#DCFF37]";
      case "high":
        return "bg-[#FF4654] dark:bg-[#FF4654]";
      case "medium":
        return "bg-[#FFC700] dark:bg-[#FFC700]";
      case "low":
        return "bg-[#34445C]/30 dark:bg-[#34445C]/50";
    }
  };

  const getActivityLabel = (activity: TimeSlot["activity"]) => {
    switch (activity) {
      case "peak":
        return "Peak Hours";
      case "high":
        return "High Activity";
      case "medium":
        return "Moderate";
      case "low":
        return "Low Activity";
    }
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return `${h}${ampm}`;
  };

  // Generate next 7 days for date picker
  const nextDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date;
    });
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-3"
        >
          <div
            className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/30 rounded-none border border-[#FF4654]/30 dark:border-[#DCFF37]/30"
            style={{ clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)" }}
          >
            <Icon
              icon="solar:calendar-bold-duotone"
              className="text-[#FF4654] dark:text-[#DCFF37]"
              width={32}
            />
          </div>
        </motion.div>
        <h1 className={title({ color: isDark ? "battleLime" : "battleNavy" })}>
          Schedule Your Session
        </h1>
        <p className="text-default-500 mt-2 max-w-md">
          Choose when you want to compete. Peak hours offer faster matchmaking.
        </p>
      </div>

      {/* Live Activity Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="rounded-none bg-gradient-to-r from-[#34445C]/5 via-transparent to-[#34445C]/5 dark:from-[#DCFF37]/5 dark:to-[#DCFF37]/5 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      getActivityColor(currentActivity.activity)
                    )}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 w-3 h-3 rounded-full animate-ping",
                      getActivityColor(currentActivity.activity),
                      "opacity-50"
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                    {getActivityLabel(currentActivity.activity)}
                  </p>
                  <p className="text-xs text-default-500">
                    {currentActivity.playersOnline.toLocaleString()} players
                    online now
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-default-500">Est. Wait</p>
                  <p className="text-sm font-bold text-[#FF4654] dark:text-[#DCFF37]">
                    ~{Math.floor(currentActivity.estimatedWait / 60)}:
                    {String(currentActivity.estimatedWait % 60).padStart(
                      2,
                      "0"
                    )}
                  </p>
                </div>
                <Divider orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="text-xs text-default-500">Your Time</p>
                  <p className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                    {now.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            id: "instant" as ScheduleMode,
            icon: "solar:bolt-bold-duotone",
            label: "Play Now",
            desc: "Instant match",
          },
          {
            id: "scheduled" as ScheduleMode,
            icon: "solar:calendar-date-bold-duotone",
            label: "Schedule",
            desc: "Book a time",
          },
          {
            id: "recurring" as ScheduleMode,
            icon: "solar:calendar-minimalistic-bold-duotone",
            label: "Weekly",
            desc: "Set availability",
          },
        ].map((mode) => (
          <motion.button
            key={mode.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScheduleMode(mode.id)}
            className={cn(
              "p-4 rounded-none border-2 transition-all duration-200 text-center",
              scheduleMode === mode.id
                ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 shadow-lg"
                : "border-[#34445C]/20 dark:border-[#DCFF37]/20 hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50 bg-[#F5F0E1]/50 dark:bg-[#111111]/50"
            )}
          >
            <Icon
              icon={mode.icon}
              width={28}
              className={cn(
                "mx-auto mb-2",
                scheduleMode === mode.id
                  ? "text-[#FF4654] dark:text-[#DCFF37]"
                  : "text-[#34445C]/60 dark:text-[#F5F0E1]/60"
              )}
            />
            <p
              className={cn(
                "text-sm font-semibold",
                scheduleMode === mode.id
                  ? "text-[#FF4654] dark:text-[#DCFF37]"
                  : "text-[#34445C] dark:text-[#F5F0E1]"
              )}
            >
              {mode.label}
            </p>
            <p className="text-xs text-default-500">{mode.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Mode Content */}
      <AnimatePresence mode="wait">
        {/* INSTANT PLAY MODE */}
        {scheduleMode === "instant" && (
          <motion.div
            key="instant"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="rounded-none border-2 border-[#DCFF37]/50 bg-gradient-to-br from-[#DCFF37]/10 to-[#34445C]/10 dark:from-[#DCFF37]/10 dark:to-[#111111]">
              <CardBody className="p-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
                  style={{
                    clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)",
                  }}
                >
                  <Icon
                    icon="solar:bolt-bold"
                    className="text-white dark:text-[#1a1a1a]"
                    width={40}
                  />
                </motion.div>
                <h3 className="text-xl font-bold text-[#34445C] dark:text-[#DCFF37] mb-2">
                  Ready to Compete?
                </h3>
                <p className="text-default-500 mb-4">
                  Jump straight into matchmaking. Your match awaits!
                </p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:users-group-rounded-bold"
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <span className="text-default-600">
                      {currentActivity.playersOnline} online
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:clock-circle-bold"
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <span className="text-default-600">
                      ~{Math.ceil(currentActivity.estimatedWait / 60)} min wait
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Optimal Times Suggestion */}
            <Card className="rounded-none border border-[#34445C]/20 dark:border-[#DCFF37]/20 bg-[#F5F0E1]/50 dark:bg-[#111111]/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:star-bold-duotone"
                    className="text-[#FFC700]"
                    width={18}
                  />
                  <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                    Optimal Play Times Today
                  </span>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {optimalTimes.map((slot) => (
                    <Chip
                      key={slot.hour}
                      variant="flat"
                      className={cn(
                        "rounded-none",
                        slot.activity === "peak"
                          ? "bg-[#DCFF37]/20 text-[#34445C] dark:text-[#DCFF37] border border-[#DCFF37]/50"
                          : "bg-[#FF4654]/10 text-[#FF4654] border border-[#FF4654]/30"
                      )}
                    >
                      {formatHour(slot.hour)} -{" "}
                      {formatHour((slot.hour + 1) % 24)}
                      <span className="ml-1 opacity-70">
                        ({slot.playersOnline}+)
                      </span>
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* SCHEDULED MODE */}
        {scheduleMode === "scheduled" && (
          <motion.div
            key="scheduled"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Date Picker */}
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#F5F0E1]/50 dark:bg-[#111111]/50">
              <CardHeader className="pb-2">
                <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                  Select Date
                </span>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-7 gap-2">
                  {nextDays.map((date, idx) => {
                    const isSelected =
                      selectedDate?.toDateString() === date.toDateString();
                    const isToday = idx === 0;
                    const dayName = date.toLocaleDateString(undefined, {
                      weekday: "short",
                    });
                    const dayNum = date.getDate();

                    return (
                      <motion.button
                        key={date.toISOString()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "p-3 rounded-none border-2 transition-all text-center",
                          isSelected
                            ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
                            : "border-transparent hover:border-[#FF4654]/30 dark:hover:border-[#DCFF37]/30"
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs font-medium",
                            isSelected
                              ? "text-[#FF4654] dark:text-[#DCFF37]"
                              : "text-default-500"
                          )}
                        >
                          {dayName}
                        </p>
                        <p
                          className={cn(
                            "text-lg font-bold",
                            isSelected
                              ? "text-[#FF4654] dark:text-[#DCFF37]"
                              : "text-[#34445C] dark:text-[#F5F0E1]"
                          )}
                        >
                          {dayNum}
                        </p>
                        {isToday && (
                          <Chip
                            size="sm"
                            variant="flat"
                            className="rounded-none text-xs mt-1 bg-[#DCFF37]/20 text-[#34445C] dark:text-[#DCFF37]"
                          >
                            Today
                          </Chip>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Time Slot Picker with Activity Heatmap */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#F5F0E1]/50 dark:bg-[#111111]/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                        Select Time
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#DCFF37]" />
                          <span className="text-default-500">Peak</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#FF4654]" />
                          <span className="text-default-500">High</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#FFC700]" />
                          <span className="text-default-500">Med</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-6 gap-2">
                      {activityData.map((slot) => (
                        <Tooltip
                          key={slot.hour}
                          content={
                            <div className="p-2 text-center">
                              <p className="font-semibold">
                                {formatHour(slot.hour)} -{" "}
                                {formatHour((slot.hour + 1) % 24)}
                              </p>
                              <p className="text-xs">
                                {slot.playersOnline} players
                              </p>
                              <p className="text-xs">
                                ~{Math.ceil(slot.estimatedWait / 60)} min wait
                              </p>
                            </div>
                          }
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedHour(slot.hour)}
                            className={cn(
                              "p-2 rounded-none border transition-all relative",
                              selectedHour === slot.hour
                                ? "border-[#FF4654] dark:border-[#DCFF37] ring-2 ring-[#FF4654]/50 dark:ring-[#DCFF37]/50"
                                : "border-transparent hover:border-[#34445C]/30"
                            )}
                          >
                            <div
                              className={cn(
                                "w-full h-8 rounded-none flex items-center justify-center text-xs font-semibold",
                                getActivityColor(slot.activity),
                                slot.activity === "peak" ||
                                  slot.activity === "high"
                                  ? "text-white"
                                  : "text-[#34445C]"
                              )}
                            >
                              {formatHour(slot.hour)}
                            </div>
                          </motion.button>
                        </Tooltip>
                      ))}
                    </div>

                    {selectedHour !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-none bg-[#DCFF37]/10 dark:bg-[#DCFF37]/5 border-l-4 border-[#DCFF37]"
                      >
                        <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37]">
                          Session Scheduled:{" "}
                          {selectedDate.toLocaleDateString(undefined, {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {formatHour(selectedHour)}
                        </p>
                        <p className="text-xs text-default-500 mt-1">
                          Timezone: {userTimezone}
                        </p>
                      </motion.div>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* RECURRING MODE */}
        {scheduleMode === "recurring" && (
          <motion.div
            key="recurring"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#F5F0E1]/50 dark:bg-[#111111]/50 overflow-hidden">
              <CardHeader className="pb-2 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                    Weekly Availability
                  </span>
                  <span className="text-xs text-default-500">
                    Click to toggle time blocks
                  </span>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {/* Time Block Headers */}
                <div className="grid grid-cols-[80px_repeat(4,1fr)] border-b border-[#34445C]/10 dark:border-[#DCFF37]/10">
                  <div className="p-2" />
                  {TIME_BLOCKS.map((block) => (
                    <div
                      key={block.id}
                      className="p-2 text-center border-l border-[#34445C]/10 dark:border-[#DCFF37]/10"
                    >
                      <Icon
                        icon={block.icon}
                        className="text-[#FF4654] dark:text-[#DCFF37] mx-auto mb-1"
                        width={16}
                      />
                      <p className="text-xs font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                        {block.label}
                      </p>
                      <p className="text-[10px] text-default-400">
                        {block.range}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Day Rows */}
                {DAYS.map((day) => (
                  <div
                    key={day.shortDay}
                    className={cn(
                      "grid grid-cols-[80px_repeat(4,1fr)] border-b last:border-b-0 border-[#34445C]/10 dark:border-[#DCFF37]/10",
                      day.isWeekend && "bg-[#DCFF37]/5 dark:bg-[#DCFF37]/5"
                    )}
                  >
                    <div className="p-3 flex items-center">
                      <div>
                        <p className="text-sm font-bold text-[#34445C] dark:text-[#DCFF37]">
                          {day.shortDay}
                        </p>
                        {day.isWeekend && (
                          <Chip
                            size="sm"
                            variant="flat"
                            className="rounded-none text-[8px] mt-0.5 bg-[#DCFF37]/20 text-[#34445C] dark:text-[#DCFF37]"
                          >
                            Peak
                          </Chip>
                        )}
                      </div>
                    </div>
                    {TIME_BLOCKS.map((block) => {
                      const isActive = weeklyAvailability[
                        day.shortDay
                      ]?.includes(block.id);
                      return (
                        <motion.button
                          key={block.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleDayBlock(day.shortDay, block.id)}
                          className={cn(
                            "p-3 border-l border-[#34445C]/10 dark:border-[#DCFF37]/10 transition-all",
                            isActive
                              ? "bg-gradient-to-r from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20"
                              : "hover:bg-[#FF4654]/5 dark:hover:bg-[#DCFF37]/5"
                          )}
                        >
                          <div
                            className={cn(
                              "w-full h-8 rounded-none flex items-center justify-center transition-all",
                              isActive
                                ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#1a1a1a]"
                                : "bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
                            )}
                          >
                            {isActive ? (
                              <Icon icon="solar:check-circle-bold" width={20} />
                            ) : (
                              <Icon
                                icon="solar:add-circle-linear"
                                width={20}
                                className="text-default-400"
                              />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Summary */}
            {Object.values(weeklyAvailability).some(
              (blocks) => blocks.length > 0
            ) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="rounded-none border-l-4 border-l-[#DCFF37] border border-[#DCFF37]/20 bg-[#DCFF37]/5 dark:bg-[#DCFF37]/5">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        icon="solar:calendar-mark-bold-duotone"
                        className="text-[#DCFF37]"
                        width={24}
                      />
                      <div>
                        <p className="font-semibold text-[#34445C] dark:text-[#DCFF37] text-sm">
                          Your Weekly Schedule
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(weeklyAvailability)
                            .filter(([_, blocks]) => blocks.length > 0)
                            .map(([day, blocks]) => (
                              <Chip
                                key={day}
                                variant="flat"
                                className="rounded-none bg-[#34445C]/10 dark:bg-[#DCFF37]/10 text-[#34445C] dark:text-[#DCFF37]"
                              >
                                {day}:{" "}
                                {blocks
                                  .map(
                                    (b) =>
                                      TIME_BLOCKS.find((tb) => tb.id === b)
                                        ?.label
                                  )
                                  .join(", ")}
                              </Chip>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timezone Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-default-400 flex items-center justify-center gap-1">
          <Icon icon="solar:clock-circle-linear" width={14} />
          All times shown in your local timezone: {userTimezone}
        </p>
      </div>
    </>
  );
});

ScheduleInformationForm.displayName = "ScheduleInformationForm";

export default ScheduleInformationForm;
