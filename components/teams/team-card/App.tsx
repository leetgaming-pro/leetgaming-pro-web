"use client";

import React, { useState } from "react";
import { Avatar, Link } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";
import { motion } from "framer-motion";
import MiniPlayerCard from "@/components/players/mini-player-card/App";

export type Member = {
  nickname: string;
  avatar: string;
}

export type Squad = {
  title: string;
  description: string;
  members: Member[]
}

export type Team = {
  name: string;
  avatar: string;
  tag: string;
  squad: Squad;
  bio?: string;
  social: {
    twitter: string;
    linkedin: string;
    github?: string;
  };
};

export type TeamCardProps = React.HTMLAttributes<HTMLDivElement> & Team;

const TeamCard = React.forwardRef<HTMLDivElement, TeamCardProps>(
  (props, ref): any => {
    const { children, avatar, name, squad, bio, social, className, tag } = props
    const [hovered, setHovered] = useState(false);

    const { members } = squad

    return (
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{ perspective: 1000 }}
      >
        <div
          ref={ref}
          className={cn(
            "flex flex-col items-center bg-content1 px-4 py-6 text-center shadow-small transition-all duration-200",
            "border border-default-200 dark:border-[#DCFF37]/20",
            "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
            "hover:shadow-lg hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10",
            className,
          )}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)',
            borderRadius: 0,
          }}
          {...props}
        >
          {!hovered ? (
            <div className="items-center text-center">
              <Avatar className="h-20 w-20 justify-center" src={avatar} />
              <h3 className="mt-2 font-medium">{name}</h3>
              <span className="text-small text-default-500">{squad.title}</span>
              <p className="mb-4 mt-2 text-default-600">{bio}</p>

              <div className="flex gap-4">
                {social?.twitter && (
                  <Link isExternal href={social.twitter.startsWith('http') ? social.twitter : `https://twitter.com/${social.twitter.replace('@', '')}`}>
                    <Icon className="text-default-400" icon="bi:twitter" width={20} />
                  </Link>
                )}
                {social?.linkedin && (
                  <Link isExternal href={social.linkedin.startsWith('http') ? social.linkedin : `https://linkedin.com/in/${social.linkedin}`}>
                    <Icon className="text-default-400" icon="bi:linkedin" width={20} />
                  </Link>
                )}
                {social?.github && (
                  <Link isExternal href={social.github.startsWith('http') ? social.github : `https://github.com/${social.github.replace('@', '')}`}>
                    <Icon className="text-default-400" icon="bi:github" width={20} />
                  </Link>
                )}
              </div>

            </div>
          ) :
            (
              <div>
                {
                  members.map((member, index) => (
                    <MiniPlayerCard key={`player-${index}`} nickname={member.nickname} avatar={member.avatar} clantag={tag} showHighlightsButton={false} />
                  ))
                }
              </div>
            )
          }
        </div>
      </motion.div>
    );
  }
);

TeamCard.displayName = "TeamCard";

export default TeamCard;
