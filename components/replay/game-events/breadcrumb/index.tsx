"use client";

import React from "react";
import {Breadcrumbs, BreadcrumbItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Skeleton} from "@nextui-org/react";
import { ChevronDownIcon } from '@/components/icons';

export interface MatchOption {
  id: string;
  label: string;
  href: string;
}

export interface BreadcrumbMatchData {
  replayHref?: string;
  categoryName?: string;
  categoryHref?: string;
  leagueName?: string;
  leagueHref?: string;
  currentMatch: {
    id: string;
    label: string;
  };
  matchOptions?: MatchOption[];
}

interface BreadcrumbMatchProps {
  data?: BreadcrumbMatchData;
  isLoading?: boolean;
  onMatchSelect?: (matchId: string) => void;
}

export default function BreadcrumbMatch({
  data,
  isLoading = false,
  onMatchSelect,
}: BreadcrumbMatchProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-lg" />
        <span className="text-default-400">/</span>
        <Skeleton className="h-5 w-24 rounded-lg" />
        <span className="text-default-400">/</span>
        <Skeleton className="h-5 w-20 rounded-lg" />
        <span className="text-default-400">/</span>
        <Skeleton className="h-5 w-32 rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <Breadcrumbs
        itemClasses={{
          item: "px-2",
          separator: "px-0",
        }}
      >
        <BreadcrumbItem href="/replays">Replay</BreadcrumbItem>
        <BreadcrumbItem>Match Details</BreadcrumbItem>
      </Breadcrumbs>
    );
  }

  return (
    <Breadcrumbs
      itemClasses={{
        item: "px-2",
        separator: "px-0",
      }}
    >
      <BreadcrumbItem href={data.replayHref || "/replays"}>Replay</BreadcrumbItem>
      {data.categoryName && (
        <BreadcrumbItem href={data.categoryHref}>{data.categoryName}</BreadcrumbItem>
      )}
      {data.leagueName && (
        <BreadcrumbItem href={data.leagueHref}>{data.leagueName}</BreadcrumbItem>
      )}
      <BreadcrumbItem>Match Details</BreadcrumbItem>
      <BreadcrumbItem
        classNames={{
          item: "px-0",
        }}
      >
        {data.matchOptions && data.matchOptions.length > 0 ? (
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="h-6 pr-2 text-small"
                endContent={<ChevronDownIcon className="text-default-500" />}
                radius="full"
                size="sm"
                variant="light"
              >
                {data.currentMatch.label}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Match options"
              onAction={(key) => onMatchSelect?.(key as string)}
            >
              {data.matchOptions.map((option) => (
                <DropdownItem key={option.id} href={option.href}>
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        ) : (
          <span className="text-small">{data.currentMatch.label}</span>
        )}
      </BreadcrumbItem>
    </Breadcrumbs>
  );
}
