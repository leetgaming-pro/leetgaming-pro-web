"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Link, Button, Tooltip, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";

export type Member = {
  nickname: string;
  avatar: string;
};

export type Squad = {
  title: string;
  description: string;
  members: Member[];
};

export type Team = {
  id?: string;
  name: string;
  avatar: string;
  tag: string;
  slug?: string;
  squad: Squad;
  bio?: string;
  social: {
    twitter: string;
    linkedin: string;
    github?: string;
  };
};

export type TeamCardProps = React.HTMLAttributes<HTMLDivElement> & Team;

const CARD_CLIP =
  "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)";
const BTN_CLIP =
  "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)";
const MEMBER_CLIP =
  "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)";

const TeamCard = React.forwardRef<HTMLDivElement, TeamCardProps>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props, ref): any => {
    const {
      children: _children,
      id,
      avatar,
      name,
      squad,
      bio,
      social,
      className,
      tag,
      slug,
      ...restProps
    } = props;
    const [flipped, setFlipped] = useState(false);
    const router = useRouter();

    const { members } = squad;

    const handleViewTeam = () => {
      const teamPath = id || slug;
      if (teamPath) {
        router.push(`/teams/${teamPath}`);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("group cursor-pointer", className)}
        style={{ perspective: 1200 }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onClick={handleViewTeam}
        {...restProps}
      >
        <div
          className="relative w-full h-[360px]"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ─── FRONT FACE ─── */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-between px-5 py-6 text-center",
              "bg-content1 border border-default-200 dark:border-[#DCFF37]/20",
              "shadow-small",
            )}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              clipPath: CARD_CLIP,
              borderRadius: 0,
            }}
          >
            {/* Top section */}
            <div className="flex flex-col items-center w-full">
              <div
                className="ring-2 ring-[#FF4654]/20 dark:ring-[#DCFF37]/20 p-0.5"
                style={{ clipPath: CARD_CLIP }}
              >
                <Avatar
                  className="h-20 w-20"
                  src={avatar}
                  imgProps={{ className: "object-cover" }}
                />
              </div>
              <h3 className="mt-3 font-bold text-lg text-[#34445C] dark:text-[#F5F0E1] tracking-tight">
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Chip
                  size="sm"
                  variant="flat"
                  className="rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37] font-bold text-xs"
                >
                  [{tag}]
                </Chip>
                <span className="text-xs text-default-500">{squad.title}</span>
              </div>
              <p className="mt-3 text-sm text-default-600 line-clamp-2 leading-relaxed">
                {bio}
              </p>
            </div>

            {/* Social links */}
            <div
              className="flex gap-4 justify-center mt-3"
              onClick={(e) => e.stopPropagation()}
            >
              {social?.twitter && (
                <Tooltip content="Twitter" placement="bottom">
                  <Link
                    isExternal
                    href={
                      social.twitter.startsWith("http")
                        ? social.twitter
                        : `https://twitter.com/${social.twitter.replace(
                            "@",
                            "",
                          )}`
                    }
                  >
                    <Icon
                      className="text-default-400 hover:text-[#1DA1F2] transition-colors"
                      icon="bi:twitter"
                      width={18}
                    />
                  </Link>
                </Tooltip>
              )}
              {social?.linkedin && (
                <Tooltip content="LinkedIn" placement="bottom">
                  <Link
                    isExternal
                    href={
                      social.linkedin.startsWith("http")
                        ? social.linkedin
                        : `https://linkedin.com/in/${social.linkedin}`
                    }
                  >
                    <Icon
                      className="text-default-400 hover:text-[#0A66C2] transition-colors"
                      icon="bi:linkedin"
                      width={18}
                    />
                  </Link>
                </Tooltip>
              )}
              {social?.github && (
                <Tooltip content="GitHub" placement="bottom">
                  <Link
                    isExternal
                    href={
                      social.github.startsWith("http")
                        ? social.github
                        : `https://github.com/${social.github.replace("@", "")}`
                    }
                  >
                    <Icon
                      className="text-default-400 hover:text-foreground transition-colors"
                      icon="bi:github"
                      width={18}
                    />
                  </Link>
                </Tooltip>
              )}
            </div>

            {/* View Team Button */}
            <Button
              className="mt-3 bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] rounded-none w-full font-semibold"
              style={{ clipPath: BTN_CLIP }}
              startContent={<Icon icon="solar:eye-bold" width={18} />}
              onPress={handleViewTeam}
            >
              View Team
            </Button>

            {/* Subtle flip hint */}
            {members.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-default-400 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                <Icon icon="solar:users-group-rounded-linear" width={12} />
                <span>Hover for roster</span>
              </div>
            )}
          </div>

          {/* ─── BACK FACE (Roster) ─── */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col px-5 py-5",
              "bg-content1 border border-[#FF4654]/30 dark:border-[#DCFF37]/30",
              "shadow-lg shadow-[#FF4654]/5 dark:shadow-[#DCFF37]/5",
            )}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              clipPath: CARD_CLIP,
              borderRadius: 0,
            }}
          >
            {/* Back header */}
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
              <Avatar className="h-9 w-9 flex-shrink-0" src={avatar} />
              <div className="text-left flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#34445C] dark:text-[#F5F0E1] truncate">
                  {name}
                </h4>
                <span className="text-xs font-semibold text-[#FF4654] dark:text-[#DCFF37]">
                  [{tag}]
                </span>
              </div>
              <Chip
                size="sm"
                variant="flat"
                className="rounded-none bg-[#34445C]/10 dark:bg-[#DCFF37]/10 text-[#34445C] dark:text-[#DCFF37] font-bold"
                startContent={
                  <Icon icon="solar:users-group-rounded-bold" width={12} />
                }
              >
                {members.length}
              </Chip>
            </div>

            {/* Members list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {members.map((member, index) => (
                <div
                  key={`member-${index}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5",
                    "bg-gradient-to-r from-[#34445C]/5 to-transparent dark:from-[#DCFF37]/5 dark:to-transparent",
                    "border border-default-200/50 dark:border-[#DCFF37]/10",
                    "transition-colors hover:from-[#34445C]/10 dark:hover:from-[#DCFF37]/10",
                  )}
                  style={{ clipPath: MEMBER_CLIP }}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar
                      size="sm"
                      src={member.avatar}
                      className="ring-1 ring-[#FF4654]/20 dark:ring-[#DCFF37]/20"
                    />
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-[#FFC700] rounded-sm">
                        <Icon
                          icon="solar:crown-bold"
                          width={10}
                          className="text-[#34445C]"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1] truncate">
                      {member.nickname}
                    </p>
                    <p className="text-[10px] text-default-400 uppercase tracking-wider">
                      {index === 0 ? "Captain" : "Member"}
                    </p>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Icon
                    icon="solar:users-group-rounded-linear"
                    width={32}
                    className="text-default-300 mb-2"
                  />
                  <p className="text-default-400 text-sm">No members yet</p>
                  <p className="text-default-300 text-xs mt-1">
                    Be the first to join!
                  </p>
                </div>
              )}
            </div>

            {/* Back footer button */}
            <Button
              className="mt-3 bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C] rounded-none w-full font-semibold"
              style={{ clipPath: BTN_CLIP }}
              startContent={<Icon icon="solar:arrow-right-bold" width={18} />}
              onPress={handleViewTeam}
            >
              View Team Profile
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

TeamCard.displayName = "TeamCard";

export default TeamCard;
