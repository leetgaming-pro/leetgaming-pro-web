"use client";

/**
 * Become a Coach Page
 * Coach onboarding and application flow
 * Per PRD D.4.3 - Coaching Marketplace
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { CoachProfileCreation } from "@/components/coaching/coach-profile-creation";

export default function BecomeACoachPage() {
  const router = useRouter();
  const [showApplication, setShowApplication] = useState(false);

  const handleComplete = () => {
    // In production, this would redirect to coach dashboard
    router.push("/coaching?applied=true");
  };

  if (showApplication) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <CoachProfileCreation
            onComplete={handleComplete}
            onCancel={() => setShowApplication(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 199, 0, 0.2) 0%, transparent 50%),
              linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)
            `,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Chip color="warning" variant="flat" className="mb-4">
              <Icon icon="mdi:star" className="mr-1" /> Join 500+ Coaches
            </Chip>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Share Your Expertise,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC700] to-[#DCFF37]">
                Earn Money
              </span>
            </h1>
            <p className="text-lg text-default-500 mb-8">
              Turn your gaming skills into income. Help players improve while
              building your coaching career on the leading esports platform.
            </p>
            <Button
              color="primary"
              size="lg"
              onPress={() => setShowApplication(true)}
              startContent={<Icon icon="mdi:rocket-launch" />}
              className="px-8"
            >
              Start Your Application
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">
          Why Coach on LeetGaming?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: "mdi:cash-multiple",
              title: "Competitive Earnings",
              description:
                "Keep 80-85% of your session fees. Top coaches earn $5,000+/month with flexible hours.",
              highlight: "80-85% Revenue Share",
            },
            {
              icon: "mdi:account-group",
              title: "Built-in Audience",
              description:
                "Access our community of 100K+ competitive players actively seeking coaching.",
              highlight: "100K+ Active Players",
            },
            {
              icon: "mdi:tools",
              title: "Pro Tools Included",
              description:
                "VOD review integration, scheduling, payments, and messaging - all in one place.",
              highlight: "All-in-One Platform",
            },
            {
              icon: "mdi:shield-check",
              title: "Secure Payments",
              description:
                "Get paid within 48 hours of completed sessions. We handle all payment processing.",
              highlight: "48hr Payout",
            },
            {
              icon: "mdi:chart-line",
              title: "Grow Your Brand",
              description:
                "Build your reputation with verified reviews and featured coach promotions.",
              highlight: "Verified Reviews",
            },
            {
              icon: "mdi:clock-fast",
              title: "Flexible Schedule",
              description:
                "Set your own hours and availability. Coach from anywhere in the world.",
              highlight: "Work Anywhere",
            },
          ].map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardBody className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon
                      icon={benefit.icon}
                      className="text-2xl text-primary"
                    />
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="warning"
                    className="mb-2"
                  >
                    {benefit.highlight}
                  </Chip>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-default-500 text-sm">
                    {benefit.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-content2/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            How to Get Started
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: "Apply & Get Verified",
                  description:
                    "Submit your application with your gaming credentials, experience, and expertise. Our team reviews applications within 48 hours.",
                  icon: "mdi:clipboard-check",
                },
                {
                  step: 2,
                  title: "Set Up Your Profile",
                  description:
                    "Create your coach profile with pricing, availability, session types, and showcase your achievements.",
                  icon: "mdi:account-edit",
                },
                {
                  step: 3,
                  title: "Start Coaching",
                  description:
                    "Students book sessions through your calendar. Coach via live sessions or VOD reviews using our integrated tools.",
                  icon: "mdi:video",
                },
                {
                  step: 4,
                  title: "Get Paid",
                  description:
                    "Receive payments directly to your account within 48 hours of completed sessions. Track earnings in your dashboard.",
                  icon: "mdi:wallet",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon icon={item.icon} className="text-xl text-primary" />
                      <h3 className="font-bold text-lg">{item.title}</h3>
                    </div>
                    <p className="text-default-500">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 to-warning/10">
            <CardBody className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Potential Earnings</h2>
              <p className="text-default-500 mb-6">
                See what you could earn as a LeetGaming coach
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-default-500 mb-1">Part-time</p>
                  <p className="text-sm text-default-400">10 sessions/week</p>
                  <p className="text-2xl font-bold text-warning">$1,600</p>
                  <p className="text-xs text-default-500">/month</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border-2 border-primary">
                  <p className="text-sm text-default-500 mb-1">Regular</p>
                  <p className="text-sm text-default-400">20 sessions/week</p>
                  <p className="text-2xl font-bold text-primary">$3,200</p>
                  <p className="text-xs text-default-500">/month</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-default-500 mb-1">Full-time</p>
                  <p className="text-sm text-default-400">40 sessions/week</p>
                  <p className="text-2xl font-bold text-success">$6,400</p>
                  <p className="text-xs text-default-500">/month</p>
                </div>
              </div>

              <p className="text-xs text-default-400 mb-6">
                *Based on $40/session average with 85% coach share. Actual
                earnings vary.
              </p>

              <Button
                color="primary"
                size="lg"
                onPress={() => setShowApplication(true)}
              >
                Apply Now
              </Button>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Requirements */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Requirements</h2>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardBody className="p-6">
              <div className="space-y-4">
                {[
                  {
                    text: "High rank in at least one supported game (Global Elite, Immortal+, etc.)",
                    required: true,
                  },
                  {
                    text: "Previous coaching or teaching experience (preferred but not required)",
                    required: false,
                  },
                  {
                    text: "Strong communication skills in at least one supported language",
                    required: true,
                  },
                  {
                    text: "Reliable internet connection for live sessions",
                    required: true,
                  },
                  {
                    text: "Commitment to providing quality coaching experiences",
                    required: true,
                  },
                  {
                    text: "Valid payment method for receiving earnings",
                    required: true,
                  },
                ].map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon
                      icon={
                        req.required ? "mdi:check-circle" : "mdi:plus-circle"
                      }
                      className={`text-lg mt-0.5 ${
                        req.required ? "text-success" : "text-default-400"
                      }`}
                    />
                    <div>
                      <span className={req.required ? "" : "text-default-500"}>
                        {req.text}
                      </span>
                      {!req.required && (
                        <Chip size="sm" variant="flat" className="ml-2">
                          Preferred
                        </Chip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-content2/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              {
                q: "How much does it cost to become a coach?",
                a: "It's completely free to apply and become a coach. We only take a 15-20% commission on completed sessions.",
              },
              {
                q: "How long does the application review take?",
                a: "Most applications are reviewed within 48 hours. You'll receive an email with the decision and next steps.",
              },
              {
                q: "Can I set my own prices?",
                a: "Yes! You have full control over your session pricing. We recommend starting competitively and adjusting as you build reviews.",
              },
              {
                q: "What games can I coach?",
                a: "Currently we support CS2 and Valorant, with more games coming soon. You can coach multiple games if qualified.",
              },
              {
                q: "How do I receive payments?",
                a: "Payments are processed via Stripe Connect. You can withdraw to your bank account or debit card.",
              },
            ].map((faq, i) => (
              <Card key={i}>
                <CardBody className="p-4">
                  <h4 className="font-semibold mb-2">{faq.q}</h4>
                  <p className="text-default-500 text-sm">{faq.a}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Coaching?</h2>
          <p className="text-default-500 mb-8 max-w-xl mx-auto">
            Join our community of professional coaches and start earning money
            doing what you love - helping players improve their game.
          </p>
          <Button
            color="primary"
            size="lg"
            onPress={() => setShowApplication(true)}
            startContent={<Icon icon="mdi:rocket-launch" />}
            className="px-8"
          >
            Start Your Application
          </Button>
        </div>
      </section>
    </div>
  );
}
