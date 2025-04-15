"use client";

import type {Team, Squad} from "@/components/teams/team-card/App";
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
import Button from "@/components/atoms/button";
import BrowseTeamBanner from "@/components/molecules/browse-team-banner";
import TeamCardPreview from "@/components/molecules/team-card-preview";
import PageBackground from "@/components/atoms/page-background";

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
  const bgImage = 'url(https://cdnb.artstation.com/p/assets/images/images/006/916/727/large/jayson-miller-station-ms-supplemental-03.jpg?1502230582)';

  return (
    <>
      <PageBackground url={bgImage} />
      <ContentWrapper className="p-10 z-10 gap-10">
        <BrowseTeamBanner />
        <div className="flex shadow-lg flex-col p-10 gap-4 bg-surface rounded-lg border border-border">
          <div className="flex self-stretch justify-between">
            <Typography type="h1">My teams</Typography>
            <Button label="Create a team" />
          </div>
          <div className="grid gap-6 grid-cols-2">
            <TeamCardPreview />
            <TeamCardPreview />
            <TeamCardPreview />
            <TeamCardPreview />
            <TeamCardPreview />
          </div>
        </div>
      </ContentWrapper>
    </>
  );
}
