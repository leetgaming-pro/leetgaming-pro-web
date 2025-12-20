"use client";

import React from "react";
import { Card, CardBody, CardHeader, Divider, Avatar, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";

export default function AboutPage() {
  return (
    <div className="flex w-full flex-col items-center gap-16 md:gap-20 lg:gap-24 px-4 py-12 md:py-16 lg:py-20 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
      {/* Header - Full Width Hero */}
      <div className="flex w-full max-w-7xl flex-col items-center text-center gap-6">
        <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}>
          <Icon icon="solar:info-circle-bold" width={44} className="text-[#F5F0E1] dark:text-[#34445C] lg:w-14 lg:h-14" />
        </div>
        <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-lg lg:text-xl tracking-wide uppercase">Our Story</h2>
        <h1 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] text-4xl md:text-5xl lg:text-6xl xl:text-7xl" })}>About LeetGaming PRO</h1>
        <p className={subtitle({ class: "mt-2 max-w-3xl lg:max-w-4xl text-lg lg:text-xl xl:text-2xl leading-relaxed" })}>
          Empowering competitive gamers with professional-grade tools for replay analysis, team
          coordination, and skill improvement.
        </p>
      </div>

      {/* Mission Section - Side by Side on Desktop */}
      <Card className="w-full max-w-7xl bg-gradient-to-br from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardBody className="p-8 lg:p-12 xl:p-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-shrink-0 w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}>
              <Icon icon="mdi:target" className="text-[#F5F0E1] dark:text-[#34445C]" width={48} />
            </div>
            <div className="text-center lg:text-left flex-1">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 lg:mb-6 text-[#34445C] dark:text-[#F5F0E1]">Our Mission</h2>
              <p className="text-default-700 leading-relaxed text-base lg:text-lg xl:text-xl max-w-4xl">
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

      {/* Features Grid - Expanded for Desktop */}
      <div className="w-full max-w-7xl">
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-8 lg:mb-12 text-center text-[#34445C] dark:text-[#F5F0E1]">What We Offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 hover:-translate-y-1">
            <CardBody className="p-6 lg:p-8 xl:p-10 text-center">
              <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-4 lg:mb-6 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                <Icon icon="mdi:file-video" className="text-[#F5F0E1] dark:text-[#34445C]" width={28} />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">Replay Analysis</h3>
              <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                Upload and analyze your game replays with detailed statistics, heatmaps, and
                round-by-round breakdowns.
              </p>
            </CardBody>
          </Card>

          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 hover:-translate-y-1">
            <CardBody className="p-6 lg:p-8 xl:p-10 text-center">
              <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-4 lg:mb-6 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                <Icon icon="mdi:account-group" className="text-[#F5F0E1] dark:text-[#34445C]" width={28} />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">Team Management</h3>
              <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                Create teams, coordinate matches, and track performance metrics across all your
                squad members.
              </p>
            </CardBody>
          </Card>

          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 hover:-translate-y-1">
            <CardBody className="p-6 lg:p-8 xl:p-10 text-center">
              <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-4 lg:mb-6 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                <Icon icon="mdi:trophy" className="text-[#F5F0E1] dark:text-[#34445C]" width={28} />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">Competitive Ranked</h3>
              <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                Climb the ranks in our competitive ladder system and compete against players
                worldwide.
              </p>
            </CardBody>
          </Card>

          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 hover:-translate-y-1">
            <CardBody className="p-6 lg:p-8 xl:p-10 text-center">
              <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-4 lg:mb-6 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                <Icon icon="mdi:chart-line" className="text-[#F5F0E1] dark:text-[#34445C]" width={28} />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">Advanced Statistics</h3>
              <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                Track detailed performance metrics including K/D ratios, accuracy, economy
                management, and more.
              </p>
            </CardBody>
          </Card>

          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 hover:-translate-y-1">
            <CardBody className="p-6 lg:p-8 xl:p-10 text-center">
              <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-4 lg:mb-6 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                <Icon icon="mdi:cloud-upload" className="text-[#F5F0E1] dark:text-[#34445C]" width={28} />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">Cloud Storage</h3>
              <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                Store unlimited replays in the cloud with easy sharing and collaboration features.
              </p>
            </CardBody>
          </Card>

          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 hover:-translate-y-1">
            <CardBody className="p-6 lg:p-8 xl:p-10 text-center">
              <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-4 lg:mb-6 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                <Icon icon="mdi:school" className="text-[#F5F0E1] dark:text-[#34445C]" width={28} />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">Learning Resources</h3>
              <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                Access coaching services, guides, and community resources to improve your gameplay.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Stats Section - Full Width Breakout */}
      <div className="w-full bg-gradient-to-r from-[#34445C]/5 via-[#34445C]/10 to-[#34445C]/5 dark:from-[#DCFF37]/5 dark:via-[#DCFF37]/10 dark:to-[#DCFF37]/5 py-12 lg:py-16 xl:py-20 -mx-4 sm:-mx-6 lg:-mx-12 xl:-mx-24 2xl:-mx-32 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-10 lg:mb-14 text-center text-[#34445C] dark:text-[#F5F0E1]">Platform Statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 xl:gap-16">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#FF4654] dark:text-[#DCFF37] mb-3">10K+</div>
              <div className="text-sm lg:text-base xl:text-lg text-default-600 font-medium">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#FF4654] dark:text-[#DCFF37] mb-3">500K+</div>
              <div className="text-sm lg:text-base xl:text-lg text-default-600 font-medium">Replays Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#FF4654] dark:text-[#DCFF37] mb-3">1,200+</div>
              <div className="text-sm lg:text-base xl:text-lg text-default-600 font-medium">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#FF4654] dark:text-[#DCFF37] mb-3">50+</div>
              <div className="text-sm lg:text-base xl:text-lg text-default-600 font-medium">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section - Asymmetric Layout */}
      <div className="w-full max-w-7xl">
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-8 lg:mb-12 text-center text-[#34445C] dark:text-[#F5F0E1]">Our Values</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 lg:row-span-1">
            <CardHeader className="flex-col items-start p-6 lg:p-8 pb-0">
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10">
                <Icon icon="mdi:lightbulb-on" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />
              </div>
              <Chip color="primary" variant="flat" className="mb-3 text-sm lg:text-base">
                Innovation
              </Chip>
            </CardHeader>
            <CardBody className="p-6 lg:p-8 pt-3">
              <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                We continuously push the boundaries of what&apos;s possible in gaming analytics,
                bringing cutting-edge technology to competitive gamers.
              </p>
            </CardBody>
          </Card>

          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardHeader className="flex-col items-start p-6 lg:p-8 pb-0">
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10">
                <Icon icon="mdi:account-heart" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />
              </div>
              <Chip color="secondary" variant="flat" className="mb-3 text-sm lg:text-base">
                Community
              </Chip>
            </CardHeader>
            <CardBody className="p-6 lg:p-8 pt-3">
              <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                Our platform is built by gamers, for gamers. We listen to our community and
                evolve based on your feedback and needs.
              </p>
            </CardBody>
          </Card>

          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardHeader className="flex-col items-start p-6 lg:p-8 pb-0">
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10">
                <Icon icon="mdi:star-shooting" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />
              </div>
              <Chip color="success" variant="flat" className="mb-3 text-sm lg:text-base">
                Excellence
              </Chip>
            </CardHeader>
            <CardBody className="p-6 lg:p-8 pt-3">
              <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                We strive for excellence in every aspect of our platform, from accuracy of
                analytics to user experience and support.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Team Section - Expanded Grid */}
      <Card className="w-full max-w-7xl rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="p-6 lg:p-8 xl:p-10">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Our Team</h2>
        </CardHeader>
        <Divider />
        <CardBody className="p-6 lg:p-8 xl:p-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { name: "Team Lead Alpha", role: "CEO & Founder", avatar: "/avatars/team-1.svg" },
              { name: "Team Lead Bravo", role: "CTO", avatar: "/avatars/team-2.svg" },
              { name: "Team Lead Charlie", role: "Head of Product", avatar: "/avatars/team-3.svg" },
              { name: "Team Lead Delta", role: "Community Manager", avatar: "/avatars/team-4.svg" },
            ].map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="relative mb-4 lg:mb-6">
                  <Avatar 
                    src={member.avatar} 
                    className="w-20 h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 transition-transform duration-300 group-hover:scale-105" 
                    isBordered 
                    color="primary" 
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h4 className="font-semibold text-base lg:text-lg xl:text-xl text-[#34445C] dark:text-[#F5F0E1]">{member.name}</h4>
                <p className="text-sm lg:text-base text-default-500">{member.role}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Contact CTA - Full Width */}
      <Card className="w-full max-w-7xl bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#34445C] dark:to-[#1e2a38] rounded-none overflow-hidden">
        <CardBody className="p-8 lg:p-12 xl:p-16 text-center text-white relative">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 lg:mb-6">Get in Touch</h2>
            <p className="mb-6 lg:mb-8 opacity-90 text-base lg:text-lg xl:text-xl max-w-2xl mx-auto">
              Have questions or feedback? We&apos;d love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
              <Chip
                startContent={<Icon icon="mdi:email" width={18} />}
                variant="flat"
                className="bg-white/20 text-white px-4 py-2 text-sm lg:text-base hover:bg-white/30 transition-colors cursor-pointer"
              >
                support@leetgaming.pro
              </Chip>
              <Chip
                startContent={<Icon icon="mdi:twitter" width={18} />}
                variant="flat"
                className="bg-white/20 text-white px-4 py-2 text-sm lg:text-base hover:bg-white/30 transition-colors cursor-pointer"
              >
                @LeetGamingPRO
              </Chip>
              <Chip
                startContent={<Icon icon="mdi:discord" width={18} />}
                variant="flat"
                className="bg-white/20 text-white px-4 py-2 text-sm lg:text-base hover:bg-white/30 transition-colors cursor-pointer"
              >
                Join our Discord
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
