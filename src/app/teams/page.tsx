"use client";

import type {Team, Squad} from "@/components/teams/team-card/App";

import {Button, Spacer} from "@nextui-org/react";

import TeamCard from "@/components/teams/team-card/App";
import { SearchIcon, UserIcon } from "@/components/icons";
import { Icon } from "@iconify/react";
import LaunchYourSquadButton from "@/components/teams/team-form/launch-your-squad-button";
import ApplyNowButton from "@/components/players/player-form/apply-now-button";
import ContentWrapper from "@/components/atoms/content-wrapper";
import Typography from "@/components/atoms/typography";
import {twMerge} from "tailwind-merge";
import Card from "@/components/atoms/card";
import ContentCard from "@/components/molecules/content-card";
import SearchInput from "@/components/search/search-modal/search-modal";

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
    <main className="relative flex flex-1 justify-center">
      <div className={twMerge('absolute max-w-screen-3xl w-full h-full lg:bg-cs-bg bg-[length:50%_auto] [background-position-y:0px] [background-position-x:100%] bg-right-top bg-no-repeat')} />
      <ContentWrapper className="p-10 z-10">
        <div className="flex flex-col items-center mb-10">
          <Typography type="h3" variant="primary">Featured Leet Teams</Typography>
          <Typography type="h1">Browse Teams</Typography>
          <Spacer y={4} />
          <Typography type="h3" className="w-1/4 text-center text-gray-600">Our philosophy is to help build exceptional teams and empower them to achieve greatness.</Typography>
        </div>
        <Spacer y={4} />
        <div className="flex w-full justify-center gap-2">
          <ApplyNowButton />
          <LaunchYourSquadButton />
        </div>
        <div className="mt-12 mb-6 self-center w-2/3">
          <SearchInput />
        </div>
        <div className="grid grid-cols-4 gap-8 mt-8">
          <ContentCard />
          <ContentCard />
          <ContentCard />
          <ContentCard />
          <ContentCard />
          <ContentCard />
          <ContentCard />
          <ContentCard />
        </div>
        {/*<div className="mt-12 grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">*/}
        {/*  {Teams.map((team: Team, index) => (*/}
        {/*    <TeamCard key={`${team.tag}-${index}`} {...team} />*/}
        {/*  ))}*/}
        {/*</div>*/}
      </ContentWrapper>
    </main>
  );
}
