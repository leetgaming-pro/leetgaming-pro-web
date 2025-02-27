"use client";

import type {Team, Squad} from "@/components/teams/team-card/App";

import {Button, Spacer} from "@nextui-org/react";

import TeamCard from "@/components/teams/team-card/App";
import { SearchIcon, UserIcon } from "@/components/icons";
import { Icon } from "@iconify/react";
import LaunchYourSquadButton from "@/components/teams/team-form/launch-your-squad-button";
import ApplyNowButton from "@/components/players/player-form/apply-now-button";
import ContentWrapper from "@/components/atoms/content-wrapper";

const Teams: Team[] = [
  {
    name: "Et3rn1ty*",
    avatar: "https://avatars.githubusercontent.com/u/168373383",
    tag: "ETNY",
    squad: {
        title: "CS 1.5",
        description: "Legacy counter-strike players from the early 2000s.",
        members: [
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
        ],
    },
    bio: "Legacy counter-strike players from the early 2000s.",
    social: {
      twitter: "@et3rn1ty-clan",
      linkedin: "@et3rn1ty-clan",
      github: "@et3rn1ty-clan",
    },
  },
  {
    name: "1337gg",
    avatar: "https://avatars.githubusercontent.com/u/168373383",
    tag: "1337",
    squad: {
        title: "CS:2",
        description: "Counter-Strike 2",
        members: [
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
        ],
    },
    bio: "Our Featured Elite Counter-Strike players. The dream team sponsored by LeetGamingPRO.",
    social: {
      twitter: "@1337gamingpro",
      linkedin: "@1337gamingpro",
      github: "@1337gamingpro",
    },
  },
  {
    name: "M14UZ*",
    avatar: "https://avatars.githubusercontent.com/u/168373383",
    tag: "M14U",
    squad: {
        title: "VLRNT",
        description: "Valorant",
        members: [
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
        ],
    },
    bio: "Lets have some fun and play some Valorant.",
    social: {
      twitter: "@m14uz1nh0s",
      linkedin: "m14uz1nh0s",
      github: "@m14uz1nh0s",
    },
  },
  {
    name: "HOLYvESSELS",
    avatar: "https://avatars.githubusercontent.com/u/168373383",
    tag: "HVVS",
    squad: {
        title: "Warframe",
        description: "Warframe",
        members: [
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
          {
            nickname: "et3rn1ty",
            avatar: "https://avatars.githubusercontent.com/u/168373383",
          },
        ],
    },
    bio: "...",
    social: {
      twitter: "@x",
      linkedin: "x",
      github: "@x",
    },
  },
];

export default function Component() {
  return (
    <section>
      <ContentWrapper>
        <div className="flex max-w-xl flex-col text-center">
          <h2 className="font-medium text-secondary">Featured Leet Teams</h2>
          <h1 className="text-4xl font-medium tracking-tight">Browse Teams</h1>
          <Spacer y={4} />
          <h2 className="text-xl text-gray-600">
            Our philosophy is to help build exceptional teams and empower them to achieve greatness.
          </h2>
          <Spacer y={4} />
          <div className="flex w-full justify-center gap-2">
            <Button startContent={<SearchIcon size={16} />} variant="ghost">Search</Button>
            <ApplyNowButton />
            {/* <Button startContent={<Icon icon="solar:users-group-two-rounded-outline" width={18} />} color="primary" variant="ghost">Launch Your Squad</Button> */}
            <LaunchYourSquadButton />
          </div>
        </div>
        <div className="mt-12 grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Teams.map((team: Team, index) => (
            <TeamCard key={`${team.tag}-${index}`} {...team} />
          ))}
        </div>
      </ContentWrapper>
    </section>
  );
}
