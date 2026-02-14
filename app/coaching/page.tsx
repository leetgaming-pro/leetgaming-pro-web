"use client";

/**
 * Coaching Marketplace Page
 * Main entry point for the coaching marketplace
 * Per PRD D.4.3 - Coaching Marketplace
 *
 * Note: The coaching API is not yet available.
 * This page shows a "Coming Soon" state with feature previews.
 */

import React from "react";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function CoachingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 xl:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 199, 0, 0.15) 0%, transparent 50%),
              linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)
            `,
          }}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 max-w-[1600px] relative z-10">
          <div className="max-w-3xl lg:max-w-4xl mx-auto text-center">
            <Chip
              color="warning"
              variant="flat"
              size="lg"
              className="mb-6"
              startContent={<Icon icon="mdi:clock-outline" className="text-lg" />}
            >
              Coming Soon
            </Chip>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 lg:mb-6">
              Level Up with Expert{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC700] to-[#DCFF37]">
                Coaching
              </span>
            </h1>
            <p className="text-lg lg:text-xl xl:text-2xl text-default-500 mb-8 lg:mb-10 leading-relaxed">
              Connect with verified professional coaches to improve your
              gameplay. From aim training to strategic thinking, find the
              perfect mentor for your journey.
            </p>
            <div className="flex gap-4 lg:gap-6 justify-center">
              <Link href="/match-making">
                <Button
                  color="primary"
                  size="lg"
                  startContent={<Icon icon="mdi:gamepad-variant" />}
                >
                  Play Now
                </Button>
              </Link>
              <Link href="/leaderboards">
                <Button
                  color="warning"
                  variant="flat"
                  size="lg"
                  startContent={<Icon icon="mdi:trophy" />}
                >
                  Leaderboards
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 max-w-[1600px] py-12 lg:py-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-4">
          What&apos;s Coming
        </h2>
        <p className="text-default-500 text-center mb-10 max-w-2xl mx-auto">
          The coaching marketplace is under active development. Here&apos;s what
          you&apos;ll be able to do when it launches.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: "mdi:account-search",
              title: "Browse Verified Coaches",
              description:
                "Find coaches verified by the platform with proven competitive backgrounds.",
            },
            {
              icon: "mdi:video",
              title: "1-on-1 & VOD Reviews",
              description:
                "Book live coaching sessions or submit VODs for expert analysis.",
            },
            {
              icon: "mdi:calendar-check",
              title: "Flexible Scheduling",
              description:
                "Schedule sessions around your availability with timezone-aware booking.",
            },
            {
              icon: "mdi:shield-check",
              title: "Escrow-Protected Payments",
              description:
                "Payments are held in escrow until sessions are completed successfully.",
            },
            {
              icon: "mdi:star",
              title: "Ratings & Reviews",
              description:
                "Read verified reviews from real students before booking.",
            },
            {
              icon: "mdi:chart-line",
              title: "Progress Tracking",
              description:
                "Track your improvement over time with coaching milestones and metrics.",
            },
          ].map((feature, i) => (
            <Card key={i} className="bg-default-50/50 border border-default-200/50">
              <CardBody className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon icon={feature.icon} className="text-2xl text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-default-500">{feature.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 max-w-[1600px] py-16 lg:py-24">
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-center mb-12 lg:mb-16">
          How It Will Work
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-12 max-w-6xl mx-auto">
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
              <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon
                  icon={step.icon}
                  className="text-3xl lg:text-4xl text-primary"
                />
              </div>
              <h3 className="font-semibold text-base lg:text-lg mb-2 lg:mb-3">
                {step.title}
              </h3>
              <p className="text-sm lg:text-base text-default-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
