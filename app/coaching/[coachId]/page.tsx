"use client";

/**
 * Coach Profile Page
 * Individual coach profile with booking functionality
 * Per PRD D.4.3 - Coaching Marketplace
 */

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Divider,
  Progress,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { BookingCalendar } from "@/components/coaching/booking-calendar";
import { SessionBookingModal } from "@/components/coaching/session-booking-modal";
import {
  ReviewsList,
  RatingsSummaryCard,
} from "@/components/coaching/reviews-ratings";
import type {
  Review,
  RatingsSummary,
} from "@/components/coaching/reviews-ratings";
import { GAME_CONFIGS } from "@/config/games";
import type { Coach, TimeSlot } from "@/types/coaching";

// Sample coach data matching the Coach type exactly
const sampleCoach: Coach = {
  id: "coach-1",
  userId: "user-1",
  displayName: "ProAnalyst",
  tagline: "Former pro player with 5+ years coaching experience",
  bio: "Former professional CS2 player with 5+ years of coaching experience. Specializing in aim training, positioning, and game sense development. I've helped hundreds of players reach their competitive goals, from Silver to Global Elite. My approach combines technical skill development with mental game coaching.",
  avatar: "/avatars/coach1.jpg",
  country: "US",
  languages: ["English", "Mandarin"],
  timezone: "America/Los_Angeles",
  expertise: [
    {
      gameId: "cs2",
      roles: ["Rifler", "AWPer"],
      rankAchieved: "Global Elite",
      yearsPlaying: 8,
      yearsCoaching: 5,
      specialties: ["Aim Training", "Positioning", "Game Sense"],
    },
    {
      gameId: "valorant",
      roles: ["Duelist"],
      rankAchieved: "Immortal 3",
      yearsPlaying: 3,
      yearsCoaching: 2,
      specialties: ["Aim Training"],
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "ESL Pro League Season 14",
      description: "Top 8 finish with team",
      type: "tournament",
      date: "2021-06-01",
      verified: true,
    },
    {
      id: "ach-2",
      title: "500+ Students Coached",
      description: "Milestone achievement",
      type: "individual",
      date: "2023-01-01",
      verified: true,
    },
    {
      id: "ach-3",
      title: "ESEA MDL Champion",
      description: "First place finish",
      type: "tournament",
      date: "2020-03-01",
      verified: true,
    },
  ],
  pricing: [
    { sessionType: "vod-review", durationMinutes: 60, priceUsd: 40 },
    { sessionType: "1on1", durationMinutes: 60, priceUsd: 50 },
    { sessionType: "team-coaching", durationMinutes: 120, priceUsd: 150 },
  ],
  availability: [
    {
      dayOfWeek: 1,
      startTime: "10:00",
      endTime: "18:00",
      timezone: "America/Los_Angeles",
    },
    {
      dayOfWeek: 2,
      startTime: "10:00",
      endTime: "18:00",
      timezone: "America/Los_Angeles",
    },
    {
      dayOfWeek: 3,
      startTime: "10:00",
      endTime: "18:00",
      timezone: "America/Los_Angeles",
    },
    {
      dayOfWeek: 4,
      startTime: "10:00",
      endTime: "18:00",
      timezone: "America/Los_Angeles",
    },
    {
      dayOfWeek: 5,
      startTime: "10:00",
      endTime: "16:00",
      timezone: "America/Los_Angeles",
    },
  ],
  status: "available",
  acceptingStudents: true,
  stats: {
    totalSessions: 523,
    totalStudents: 187,
    avgRating: 4.9,
    totalReviews: 142,
    responseRate: 98,
    responseTime: 120,
    completionRate: 98,
    repeatStudentRate: 45,
    hoursCoached: 1200,
    earnings: { totalUsd: 25000, thisMonthUsd: 2500, pendingUsd: 500 },
  },
  reviews: [],
  socialLinks: {
    twitch: "https://twitch.tv/proanalyst",
    twitter: "https://twitter.com/proanalyst",
  },
  verified: true,
  identityVerified: true,
  proVerified: true,
  stripeConnected: true,
  createdAt: "2023-01-15T00:00:00Z",
  updatedAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
};

// Sample reviews for the coach - matching Review interface exactly
const sampleReviews: Review[] = [
  {
    id: "review-1",
    reviewerId: "user-100",
    reviewerName: "GamerX",
    reviewerAvatar: "/avatars/user1.jpg",
    targetId: "coach-1",
    targetType: "coach",
    rating: 5,
    title: "Incredible coach!",
    content:
      "Alex helped me improve my aim and game sense significantly. Went from Gold Nova to DMG in just 2 months of coaching. Highly recommend!",
    categories: { knowledge: 5, communication: 5, helpfulness: 5 },
    isVerified: true,
    helpfulCount: 24,
    reportCount: 0,
    createdAt: new Date("2024-11-15T00:00:00Z"),
    updatedAt: new Date("2024-11-15T00:00:00Z"),
  },
  {
    id: "review-2",
    reviewerId: "user-101",
    reviewerName: "TacticMaster",
    targetId: "coach-1",
    targetType: "coach",
    rating: 5,
    title: "Perfect for improving positioning",
    content:
      "The VOD reviews are super detailed. Alex points out things I never noticed about my positioning and rotations.",
    categories: { knowledge: 5, communication: 5, helpfulness: 4 },
    isVerified: true,
    helpfulCount: 18,
    reportCount: 0,
    createdAt: new Date("2024-10-20T00:00:00Z"),
    updatedAt: new Date("2024-10-20T00:00:00Z"),
  },
  {
    id: "review-3",
    reviewerId: "user-102",
    reviewerName: "RookieNoMore",
    targetId: "coach-1",
    targetType: "coach",
    rating: 4,
    title: "Good sessions, flexible schedule",
    content:
      "Very knowledgeable and patient. Appreciated the flexible scheduling. Would have liked more follow-up materials.",
    categories: { knowledge: 5, communication: 4, helpfulness: 4 },
    isVerified: true,
    helpfulCount: 8,
    reportCount: 0,
    createdAt: new Date("2024-09-10T00:00:00Z"),
    updatedAt: new Date("2024-09-10T00:00:00Z"),
  },
];

// Sample ratings summary - matching RatingsSummary interface exactly
const ratingSummary: RatingsSummary = {
  averageRating: 4.9,
  totalReviews: 142,
  distribution: { 5: 120, 4: 15, 3: 5, 2: 2, 1: 0 },
  categoryAverages: {
    communication: 4.8,
    knowledge: 4.9,
    helpfulness: 4.9,
    patience: 4.7,
    valueForMoney: 4.6,
  },
};

export default function CoachProfilePage() {
  const searchParams = useSearchParams();
  const shouldOpenBooking = searchParams.get("book") === "true";

  const [activeTab, setActiveTab] = useState("about");
  const [isBookingModalOpen, setIsBookingModalOpen] =
    useState(shouldOpenBooking);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const coach = sampleCoach;

  // Get the lowest price for display
  const lowestPrice = Math.min(...coach.pricing.map((p) => p.priceUsd));

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative">
        {/* Banner */}
        <div
          className="h-48 md:h-64"
          style={{
            background: `
              linear-gradient(135deg, rgba(255, 199, 0, 0.2) 0%, rgba(220, 255, 55, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%),
              #0a0a0a
            `,
          }}
        />

        {/* Profile Card Overlay */}
        <div className="container mx-auto px-4">
          <Card className="-mt-24 md:-mt-32 relative z-10">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar
                    src={coach.avatar}
                    name={coach.displayName}
                    className="w-32 h-32 md:w-40 md:h-40 text-large"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl md:text-3xl font-bold">
                          {coach.displayName}
                        </h1>
                        {coach.verified && (
                          <Icon
                            icon="mdi:check-decagram"
                            className="text-primary text-xl"
                          />
                        )}
                        {coach.proVerified && (
                          <Chip size="sm" color="warning" variant="flat">
                            Pro Player
                          </Chip>
                        )}
                      </div>
                      <p className="text-default-500">{coach.tagline}</p>

                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Icon icon="mdi:star" className="text-warning" />
                          <span className="font-semibold">
                            {coach.stats.avgRating.toFixed(1)}
                          </span>
                          <span className="text-default-500">
                            ({coach.stats.totalReviews} reviews)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-default-500">
                          <Icon icon="mdi:account-group" />
                          <span>{coach.stats.totalStudents} students</span>
                        </div>
                        <div className="flex items-center gap-1 text-default-500">
                          <Icon icon="mdi:calendar-check" />
                          <span>{coach.stats.totalSessions} sessions</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm text-default-500">Starting at</p>
                        <p className="text-2xl font-bold text-primary">
                          ${lowestPrice}/session
                        </p>
                      </div>
                      <Button
                        color="primary"
                        size="lg"
                        onPress={() => setIsBookingModalOpen(true)}
                        startContent={<Icon icon="mdi:calendar-plus" />}
                      >
                        Book Session
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {coach.expertise.map((exp, i) => (
                      <Chip key={i} variant="flat" size="sm">
                        {GAME_CONFIGS[exp.gameId]?.name || exp.gameId} •{" "}
                        {exp.roles.join(", ")} • {exp.rankAchieved}
                      </Chip>
                    ))}
                    {coach.languages.map((lang, i) => (
                      <Chip
                        key={`lang-${i}`}
                        variant="flat"
                        size="sm"
                        color="secondary"
                      >
                        {lang}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
            >
              <Tab key="about" title="About">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 mt-4"
                >
                  {/* Bio */}
                  <Card>
                    <CardBody>
                      <h3 className="font-semibold mb-3">About Me</h3>
                      <p className="text-default-600 whitespace-pre-line">
                        {coach.bio}
                      </p>
                    </CardBody>
                  </Card>

                  {/* Achievements */}
                  <Card>
                    <CardBody>
                      <h3 className="font-semibold mb-3">Achievements</h3>
                      <div className="space-y-3">
                        {coach.achievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex items-center gap-3 p-3 bg-content2 rounded-lg"
                          >
                            <Icon
                              icon="mdi:trophy"
                              className="text-2xl text-warning"
                            />
                            <div>
                              <p className="font-medium">{achievement.title}</p>
                              <p className="text-sm text-default-500">
                                {achievement.description} •{" "}
                                {new Date(achievement.date).getFullYear()}
                              </p>
                            </div>
                            {achievement.verified && (
                              <Icon
                                icon="mdi:check-circle"
                                className="text-success ml-auto"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Session Types */}
                  <Card>
                    <CardBody>
                      <h3 className="font-semibold mb-3">Session Types</h3>
                      <div className="space-y-3">
                        {coach.pricing.map((session, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-4 bg-content2 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                icon={
                                  session.sessionType === "vod-review"
                                    ? "mdi:video"
                                    : session.sessionType === "1on1"
                                    ? "mdi:monitor-account"
                                    : "mdi:account-group"
                                }
                                className="text-2xl text-primary"
                              />
                              <div>
                                <p className="font-medium capitalize">
                                  {session.sessionType.replace("-", " ")}
                                </p>
                                <p className="text-sm text-default-500">
                                  {session.durationMinutes} minutes
                                </p>
                              </div>
                            </div>
                            <p className="text-lg font-bold">
                              ${session.priceUsd}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </Tab>

              <Tab
                key="reviews"
                title={`Reviews (${coach.stats.totalReviews})`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 mt-4"
                >
                  <RatingsSummaryCard summary={ratingSummary} />

                  <ReviewsList
                    reviews={sampleReviews}
                    summary={ratingSummary}
                    canWriteReview={true}
                    onSubmitReview={async () => {
                      // Demo - would submit review
                    }}
                    onHelpful={(reviewId) => {
                      console.log("Mark helpful:", reviewId);
                    }}
                    onReport={(reviewId, reason) => {
                      console.log("Report:", reviewId, reason);
                    }}
                  />
                </motion.div>
              </Tab>

              <Tab key="schedule" title="Schedule">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <BookingCalendar
                    coachId={coach.id}
                    coachName={coach.displayName}
                    availability={coach.availability}
                    timezone={coach.timezone}
                    basePrice={lowestPrice}
                    sessionDuration={60}
                    onSelectSlot={handleSelectSlot}
                    selectedSlot={selectedSlot}
                  />
                </motion.div>
              </Tab>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardBody>
                <h3 className="font-semibold mb-4">Coach Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Response Time</span>
                      <span className="font-medium">
                        {Math.round(coach.stats.responseTime / 60)}h avg
                      </span>
                    </div>
                    <Progress
                      value={Math.max(
                        0,
                        100 - (coach.stats.responseTime / 60 / 24) * 100
                      )}
                      color="success"
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion Rate</span>
                      <span className="font-medium">
                        {coach.stats.completionRate}%
                      </span>
                    </div>
                    <Progress
                      value={coach.stats.completionRate}
                      color="primary"
                      size="sm"
                    />
                  </div>
                  <Divider />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Hours Coached</span>
                    <span>{coach.stats.hoursCoached}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Timezone</span>
                    <span>{coach.timezone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Status</span>
                    <Chip
                      size="sm"
                      color={
                        coach.status === "available" ? "success" : "default"
                      }
                      variant="dot"
                    >
                      {coach.status}
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Book CTA */}
            <Card className="bg-gradient-to-br from-primary/20 to-warning/20">
              <CardBody className="text-center">
                <Icon
                  icon="mdi:rocket-launch"
                  className="text-4xl text-warning mx-auto mb-2"
                />
                <h3 className="font-bold mb-2">Ready to Level Up?</h3>
                <p className="text-sm text-default-500 mb-4">
                  Book your first session and start improving today.
                </p>
                <Button
                  color="warning"
                  fullWidth
                  onPress={() => setIsBookingModalOpen(true)}
                >
                  Book Now
                </Button>
              </CardBody>
            </Card>

            {/* Social Links */}
            {(coach.socialLinks.twitch ||
              coach.socialLinks.twitter ||
              coach.socialLinks.youtube) && (
              <Card>
                <CardBody>
                  <h3 className="font-semibold mb-3">Follow</h3>
                  <div className="flex gap-2">
                    {coach.socialLinks.twitch && (
                      <Button
                        as="a"
                        href={coach.socialLinks.twitch}
                        target="_blank"
                        isIconOnly
                        variant="flat"
                        size="sm"
                      >
                        <Icon icon="mdi:twitch" className="text-lg" />
                      </Button>
                    )}
                    {coach.socialLinks.twitter && (
                      <Button
                        as="a"
                        href={coach.socialLinks.twitter}
                        target="_blank"
                        isIconOnly
                        variant="flat"
                        size="sm"
                      >
                        <Icon icon="mdi:twitter" className="text-lg" />
                      </Button>
                    )}
                    {coach.socialLinks.youtube && (
                      <Button
                        as="a"
                        href={coach.socialLinks.youtube}
                        target="_blank"
                        isIconOnly
                        variant="flat"
                        size="sm"
                      >
                        <Icon icon="mdi:youtube" className="text-lg" />
                      </Button>
                    )}
                    {coach.socialLinks.discord && (
                      <Button
                        as="a"
                        href={coach.socialLinks.discord}
                        target="_blank"
                        isIconOnly
                        variant="flat"
                        size="sm"
                      >
                        <Icon icon="mdi:discord" className="text-lg" />
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <SessionBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedSlot(null);
        }}
        coach={coach}
        onSuccess={(confirmation) => {
          console.log("Booking confirmed:", confirmation);
          setIsBookingModalOpen(false);
          setSelectedSlot(null);
        }}
      />
    </div>
  );
}
