"use client";

import React from "react";
import { Card, CardBody, CardHeader, Divider, Avatar, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";

export default function AboutPage() {
  return (
    <div className="flex w-full flex-col items-center gap-12 px-4 py-8 lg:px-24">
      {/* Header */}
      <div className="flex w-full max-w-5xl flex-col items-center text-center gap-2">
        <h2 className="text-secondary font-medium">Our Story</h2>
        <h1 className={title({ size: "lg" })}>About LeetGaming PRO</h1>
        <p className={subtitle({ class: "mt-2 max-w-2xl" })}>
          Empowering competitive gamers with professional-grade tools for replay analysis, team
          coordination, and skill improvement.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="w-full max-w-5xl bg-gradient-to-br from-primary-50 to-secondary-50">
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <Icon icon="mdi:target" className="text-6xl text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
              <p className="text-default-700 leading-relaxed">
                At LeetGaming PRO, we believe that every competitive gamer deserves access to
                professional-level tools and analysis. Our platform bridges the gap between casual
                play and professional esports by providing comprehensive replay analysis, advanced
                statistics, and team coordination features that were once only available to top-tier
                teams.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Features Grid */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-6 text-center">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardBody className="p-6 text-center">
              <Icon icon="mdi:file-video" className="text-4xl text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Replay Analysis</h3>
              <p className="text-sm text-default-600">
                Upload and analyze your game replays with detailed statistics, heatmaps, and
                round-by-round breakdowns.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 text-center">
              <Icon icon="mdi:account-group" className="text-4xl text-secondary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Team Management</h3>
              <p className="text-sm text-default-600">
                Create teams, coordinate matches, and track performance metrics across all your
                squad members.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 text-center">
              <Icon icon="mdi:trophy" className="text-4xl text-warning mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Competitive Ranked</h3>
              <p className="text-sm text-default-600">
                Climb the ranks in our competitive ladder system and compete against players
                worldwide.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 text-center">
              <Icon icon="mdi:chart-line" className="text-4xl text-success mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Advanced Statistics</h3>
              <p className="text-sm text-default-600">
                Track detailed performance metrics including K/D ratios, accuracy, economy
                management, and more.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 text-center">
              <Icon icon="mdi:cloud-upload" className="text-4xl text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Cloud Storage</h3>
              <p className="text-sm text-default-600">
                Store unlimited replays in the cloud with easy sharing and collaboration features.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 text-center">
              <Icon icon="mdi:school" className="text-4xl text-secondary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Learning Resources</h3>
              <p className="text-sm text-default-600">
                Access coaching services, guides, and community resources to improve your gameplay.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <Card className="w-full max-w-5xl">
        <CardBody className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-default-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">500K+</div>
              <div className="text-sm text-default-500">Replays Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">1,200+</div>
              <div className="text-sm text-default-500">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-warning mb-2">50+</div>
              <div className="text-sm text-default-500">Countries</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Values Section */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex-col items-start p-6 pb-0">
              <Chip color="primary" variant="flat" className="mb-2">
                Innovation
              </Chip>
            </CardHeader>
            <CardBody className="p-6 pt-3">
              <p className="text-sm text-default-600">
                We continuously push the boundaries of what&apos;s possible in gaming analytics,
                bringing cutting-edge technology to competitive gamers.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex-col items-start p-6 pb-0">
              <Chip color="secondary" variant="flat" className="mb-2">
                Community
              </Chip>
            </CardHeader>
            <CardBody className="p-6 pt-3">
              <p className="text-sm text-default-600">
                Our platform is built by gamers, for gamers. We listen to our community and
                evolve based on your feedback and needs.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex-col items-start p-6 pb-0">
              <Chip color="success" variant="flat" className="mb-2">
                Excellence
              </Chip>
            </CardHeader>
            <CardBody className="p-6 pt-3">
              <p className="text-sm text-default-600">
                We strive for excellence in every aspect of our platform, from accuracy of
                analytics to user experience and support.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <Card className="w-full max-w-5xl">
        <CardHeader className="p-6">
          <h2 className="text-2xl font-bold">Our Team</h2>
        </CardHeader>
        <Divider />
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Team Lead Alpha", role: "CEO & Founder", avatar: "/avatars/team-1.svg" },
              { name: "Team Lead Bravo", role: "CTO", avatar: "/avatars/team-2.svg" },
              { name: "Team Lead Charlie", role: "Head of Product", avatar: "/avatars/team-3.svg" },
              { name: "Team Lead Delta", role: "Community Manager", avatar: "/avatars/team-4.svg" },
            ].map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <Avatar src={member.avatar} className="w-24 h-24 mb-3" isBordered color="primary" />
                <h4 className="font-semibold">{member.name}</h4>
                <p className="text-sm text-default-500">{member.role}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Contact CTA */}
      <Card className="w-full max-w-5xl bg-gradient-to-r from-primary to-secondary">
        <CardBody className="p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Get in Touch</h2>
          <p className="mb-4 opacity-90">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Chip
              startContent={<Icon icon="mdi:email" />}
              variant="flat"
              className="bg-white/20 text-white"
            >
              support@leetgaming.pro
            </Chip>
            <Chip
              startContent={<Icon icon="mdi:twitter" />}
              variant="flat"
              className="bg-white/20 text-white"
            >
              @LeetGamingPRO
            </Chip>
            <Chip
              startContent={<Icon icon="mdi:discord" />}
              variant="flat"
              className="bg-white/20 text-white"
            >
              Join our Discord
            </Chip>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
