"use client";

/**
 * Coaching Marketplace Page
 * Main entry point for the coaching marketplace
 * Per PRD D.4.3 - Coaching Marketplace
 */

import React, { useState } from "react";
import { CoachDirectory, FeaturedCoaches } from "@/components/coaching";
import { Button, Tabs, Tab } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import type { Coach } from "@/types/coaching";

// Helper to create sample coaches that match the type definition
function createSampleCoaches(): Coach[] {
  return [
    {
      id: "coach-1",
      userId: "user-1",
      displayName: "ProAnalyst",
      tagline: "Former pro player, 5+ years coaching experience",
      bio: "Specializing in aim training, positioning, and game sense development.",
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
          specialties: ["Aim Training", "Positioning"],
        },
      ],
      achievements: [
        {
          id: "ach-1",
          title: "ESL Pro League Season 14",
          description: "Top 8 finish",
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
      ],
      pricing: [
        { sessionType: "vod-review", durationMinutes: 60, priceUsd: 40 },
        { sessionType: "1on1", durationMinutes: 60, priceUsd: 50 },
      ],
      availability: [
        {
          dayOfWeek: 1,
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
          dayOfWeek: 5,
          startTime: "10:00",
          endTime: "18:00",
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
    },
    {
      id: "coach-2",
      userId: "user-2",
      displayName: "TacticalMind",
      tagline: "IGL specialist, team coordination expert",
      bio: "Helping teams reach competitive milestones through strategy development.",
      avatar: "/avatars/coach2.jpg",
      country: "US",
      languages: ["English", "Spanish"],
      timezone: "America/New_York",
      expertise: [
        {
          gameId: "valorant",
          roles: ["Controller", "IGL"],
          rankAchieved: "Radiant",
          yearsPlaying: 4,
          yearsCoaching: 3,
          specialties: ["Team Strategy", "Communication"],
        },
      ],
      achievements: [
        {
          id: "ach-3",
          title: "VCT Game Changers Champion",
          description: "First place finish",
          type: "tournament",
          date: "2023-06-01",
          verified: true,
        },
      ],
      pricing: [
        { sessionType: "vod-review", durationMinutes: 60, priceUsd: 55 },
        { sessionType: "1on1", durationMinutes: 60, priceUsd: 70 },
        { sessionType: "team-coaching", durationMinutes: 120, priceUsd: 200 },
      ],
      availability: [
        {
          dayOfWeek: 2,
          startTime: "14:00",
          endTime: "22:00",
          timezone: "America/New_York",
        },
        {
          dayOfWeek: 4,
          startTime: "14:00",
          endTime: "22:00",
          timezone: "America/New_York",
        },
      ],
      status: "available",
      acceptingStudents: true,
      stats: {
        totalSessions: 312,
        totalStudents: 89,
        avgRating: 4.95,
        totalReviews: 78,
        responseRate: 100,
        responseTime: 60,
        completionRate: 100,
        repeatStudentRate: 60,
        hoursCoached: 800,
        earnings: { totalUsd: 35000, thisMonthUsd: 3500, pendingUsd: 700 },
      },
      reviews: [],
      socialLinks: { youtube: "https://youtube.com/@tacticalmind" },
      verified: true,
      identityVerified: true,
      proVerified: true,
      stripeConnected: true,
      createdAt: "2023-03-20T00:00:00Z",
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    },
    {
      id: "coach-3",
      userId: "user-3",
      displayName: "AimGod",
      tagline: "Aim training specialist with sports psychology background",
      bio: "Custom training routines that improve accuracy by 30%+ on average.",
      avatar: "/avatars/coach3.jpg",
      country: "GB",
      languages: ["English"],
      timezone: "Europe/London",
      expertise: [
        {
          gameId: "cs2",
          roles: ["AWPer"],
          rankAchieved: "Faceit Level 10",
          yearsPlaying: 10,
          yearsCoaching: 4,
          specialties: ["Aim Training", "Muscle Memory"],
        },
        {
          gameId: "valorant",
          roles: ["Sentinel"],
          rankAchieved: "Immortal 2",
          yearsPlaying: 2,
          yearsCoaching: 1,
          specialties: ["Aim Training"],
        },
      ],
      achievements: [
        {
          id: "ach-4",
          title: "Kovaaks Top 100",
          description: "Global ranking",
          type: "individual",
          date: "2024-01-01",
          verified: true,
        },
      ],
      pricing: [
        { sessionType: "vod-review", durationMinutes: 60, priceUsd: 30 },
        { sessionType: "1on1", durationMinutes: 60, priceUsd: 40 },
      ],
      availability: [
        {
          dayOfWeek: 0,
          startTime: "10:00",
          endTime: "20:00",
          timezone: "Europe/London",
        },
        {
          dayOfWeek: 6,
          startTime: "10:00",
          endTime: "20:00",
          timezone: "Europe/London",
        },
      ],
      status: "busy",
      acceptingStudents: true,
      stats: {
        totalSessions: 892,
        totalStudents: 445,
        avgRating: 4.8,
        totalReviews: 367,
        responseRate: 95,
        responseTime: 180,
        completionRate: 96,
        repeatStudentRate: 35,
        hoursCoached: 2000,
        earnings: { totalUsd: 40000, thisMonthUsd: 3000, pendingUsd: 400 },
      },
      reviews: [],
      socialLinks: {},
      verified: true,
      identityVerified: true,
      proVerified: false,
      stripeConnected: true,
      createdAt: "2022-11-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    },
  ];
}

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState("browse");
  const sampleCoaches = createSampleCoaches();
  const featuredCoaches = sampleCoaches.filter(
    (c) => c.verified && c.stats.avgRating >= 4.5
  );

  const handleViewCoach = (coach: Coach) => {
    window.location.href = `/coaching/${coach.id}`;
  };

  const handleBookSession = (coach: Coach) => {
    window.location.href = `/coaching/${coach.id}?book=true`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 199, 0, 0.15) 0%, transparent 50%),
              linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)
            `,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Level Up with Expert{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC700] to-[#DCFF37]">
                Coaching
              </span>
            </h1>
            <p className="text-lg text-default-500 mb-8">
              Connect with verified professional coaches to improve your
              gameplay. From aim training to strategic thinking, find the
              perfect mentor for your journey.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/coaching/become-a-coach">
                <Button
                  color="warning"
                  variant="flat"
                  size="lg"
                  startContent={<Icon icon="mdi:teach" />}
                >
                  Become a Coach
                </Button>
              </Link>
              <Button
                color="primary"
                size="lg"
                startContent={<Icon icon="mdi:magnify" />}
                onPress={() => setActiveTab("browse")}
              >
                Find a Coach
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-2xl mx-auto">
            {[
              { value: "500+", label: "Verified Coaches" },
              { value: "50K+", label: "Sessions Completed" },
              { value: "4.8", label: "Average Rating" },
              { value: "24/7", label: "Global Availability" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-[#FFC700]">
                  {stat.value}
                </p>
                <p className="text-sm text-default-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            tabList: "mb-8",
          }}
        >
          <Tab
            key="featured"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:star" />
                <span>Featured Coaches</span>
              </div>
            }
          >
            <FeaturedCoaches
              coaches={featuredCoaches}
              onBook={handleBookSession}
              onMessage={handleViewCoach}
            />
          </Tab>

          <Tab
            key="browse"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:view-grid" />
                <span>Browse All</span>
              </div>
            }
          >
            <CoachDirectory
              coaches={sampleCoaches}
              onBook={handleBookSession}
              onMessage={handleViewCoach}
            />
          </Tab>

          <Tab
            key="my-sessions"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:calendar-clock" />
                <span>My Sessions</span>
              </div>
            }
          >
            <div className="text-center py-12">
              <Icon
                icon="mdi:calendar-blank"
                className="text-6xl text-default-300 mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">No Sessions Yet</h3>
              <p className="text-default-500 mb-4">
                Book your first coaching session to start improving your game.
              </p>
              <Button
                color="primary"
                onPress={() => setActiveTab("browse")}
                startContent={<Icon icon="mdi:magnify" />}
              >
                Find a Coach
              </Button>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: "mdi:magnify",
              title: "1. Find a Coach",
              description:
                "Browse our marketplace of verified professional coaches",
            },
            {
              icon: "mdi:calendar-check",
              title: "2. Book a Session",
              description:
                "Choose a time that works for you from their availability",
            },
            {
              icon: "mdi:video",
              title: "3. Connect & Learn",
              description: "Join your session via video call or VOD review",
            },
            {
              icon: "mdi:trending-up",
              title: "4. Level Up",
              description: "Apply what you learned and track your improvement",
            },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon={step.icon} className="text-3xl text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-default-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
