"use client";

import {Button, Spacer} from "@nextui-org/react";
import LaunchYourSquadButton from "@/components/teams/team-form/launch-your-squad-button";
import ApplyNowButton from "@/components/players/player-form/apply-now-button";
import ContentWrapper from "@/components/atoms/content-wrapper";
import Typography from "@/components/atoms/typography";
import {twMerge} from "tailwind-merge";
import ContentCard from "@/components/molecules/content-card";
import SearchInput from "@/components/search/search-modal/search-modal";

export default function BrowseTeam() {
  return (
    <main className="relative flex flex-1 justify-center">
      <div className={twMerge('absolute w-screen h-full lg:bg-cs-bg bg-[length:50%_auto] [background-position-y:0px] [background-position-x:100%] bg-right-top bg-no-repeat')} />
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
      </ContentWrapper>
    </main>
  );
}
