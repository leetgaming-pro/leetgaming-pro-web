"use client";

import React from "react";
import {
  BreadcrumbItem,
  Breadcrumbs,
  CheckboxGroup,
  Chip,
  RadioGroup,
  Select,
  SelectItem,
} from "@nextui-org/react";

// import LengthSlider from "./length-slider";
import GameRadioItem from "@/components/filters/game-filter/game-radio-item";
import PopoverFilterWrapper from "@/components/filters/popover-filter-wrapper"
import TagGroupItem from "@/components/filters/tag-filter/tag-group-item";
import RatingRadioGroup from "@/components/filters/rating-filter/rating-radio-group";
import ReplayFilesGrid from "@/components/replay/replay-file-grid/app";

export default function Component() {
  return (
    <div className="h-full left-0 right-0 px-2 lg:px-24">
      <nav className="my-4 px-2 py-2">
        <Breadcrumbs>
          <BreadcrumbItem>News</BreadcrumbItem>
          <BreadcrumbItem>Replays</BreadcrumbItem>
        </Breadcrumbs>
      </nav>
      <div className="flex gap-x-6">
        <div className="w-full flex-1 flex-col">
          <header className="relative z-10 flex flex-col gap-2 rounded-medium bg-default-50 px-4 pb-3 pt-2 md:pt-3">
            <div className="flex items-center gap-1 md:hidden md:gap-2">
              <h2 className="text-large font-medium">Replays (Mob)</h2>
              <span className="text-small text-default-400">(9)</span>
            </div>
            <div className="flex items-center justify-between gap-2 ">
              <div className="flex flex-row gap-2">
                <div className="hidden items-center gap-1 md:flex">
                  <h2 className="text-medium font-medium">Replays (Desk)</h2>
                  <span className="text-small text-default-400">(9)</span>
                </div>
              </div>
              <div className="-ml-2 flex w-full flex-wrap items-center justify-start gap-2 md:ml-0 md:justify-end">
                {/* <PopoverFilterWrapper title="Length Range">
                  <LengthSlider
                    aria-label="Length Filter"
                    range={{
                      min: 0,
                      defaultValue: [100, 500],
                      max: 2000,
                      step: 1,
                    }}
                  />
                </PopoverFilterWrapper> */}
                <PopoverFilterWrapper title="Game">
                  <RadioGroup
                    aria-label="Game"
                    classNames={{
                      wrapper: "gap-2",
                    }}
                    orientation="horizontal"
                  >
                    <GameRadioItem color="#006FEE" tooltip="CS:2" value="cs2" />
                    <GameRadioItem color="#F5A524" tooltip="CS:GO" value="csgo" />
                    <GameRadioItem color="#F31260" tooltip="Valorant" value="valorant" />
                  </RadioGroup>
                </PopoverFilterWrapper>
                <PopoverFilterWrapper title="Teams">
                  <CheckboxGroup
                    aria-label="Select team"
                    className="gap-1"
                    orientation="horizontal"
                  >
                    <TagGroupItem value="eth3rn1ty">eth3rn1ty</TagGroupItem>
                    <TagGroupItem value="clan1">clan1</TagGroupItem>
                    <TagGroupItem value="teamBR">teamBR</TagGroupItem>
                  </CheckboxGroup>
                </PopoverFilterWrapper>
                <PopoverFilterWrapper title="Rating">
                  <RatingRadioGroup className="w-72" />
                </PopoverFilterWrapper>
                <PopoverFilterWrapper title="Category">
                  <CheckboxGroup
                    aria-label="Select category"
                    className="gap-1"
                    orientation="horizontal"
                  >
                    <TagGroupItem value="global">Global</TagGroupItem>
                    <TagGroupItem value="gold">Gold</TagGroupItem>
                    <TagGroupItem value="silver">Silver</TagGroupItem>
                  </CheckboxGroup>
                </PopoverFilterWrapper>
                <Select
                  aria-label="Sort by"
                  classNames={{
                    base: "items-center justify-end max-w-fit",
                    value: "w-[112px]",
                  }}
                  defaultSelectedKeys={["most_popular"]}
                  labelPlacement="outside-left"
                  placeholder="Select an option"
                  variant="bordered"
                >
                  <SelectItem key="newest" value="newest">
                    Newest
                  </SelectItem>
                  <SelectItem key="top_rated" value="top_rated">
                    Top Rated
                  </SelectItem>
                  <SelectItem key="most_popular" value="most_popular">
                    Most Popular
                  </SelectItem>
                </Select>
              </div>
            </div>
          </header>
          <main className="mt-4 h-full w-full overflow-visible px-1">
            {/* List of applied filters */}
            <div className="mb-4 mt-2 flex flex-wrap items-center gap-2">
              {Array.from({length: 6}).map((_, index) => (
                <Chip
                  key={index}
                  classNames={{
                    content: "text-default-700",
                    closeButton: "text-default-500",
                  }}
                  variant="flat"
                  onClose={() => {}}
                >
                  Filter {index + 1}
                </Chip>
              ))}
            </div>
            <div className="block rounded-medium border-medium border-dashed border-divider">
              {/* Put your content here */}
              <ReplayFilesGrid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
