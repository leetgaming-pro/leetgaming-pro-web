/**
 * Filmmaker Featured Hero Component
 * Displays featured community-created films and content
 * TODO: Integrate with API to fetch latest rated/verified films
 */

"use client";

import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";

export interface FilmmakerFeaturedProps {
  className?: string;
}

export function FilmmakerFeatured({ className = "" }: FilmmakerFeaturedProps) {
  return (
    <Card
      className={`bg-gradient-to-br from-purple-900/20 to-pink-900/20 ${className}`}
    >
      <CardBody className="text-center py-8">
        <Icon
          icon="solar:clapperboard-open-play-bold"
          width={48}
          className="mx-auto mb-4 text-purple-400"
        />
        <h3 className="text-lg font-semibold mb-2">Community Films</h3>
        <p className="text-sm text-default-500 mb-4">
          Featured content from our creator community
        </p>
        <Chip
          variant="flat"
          color="secondary"
          startContent={<Icon icon="solar:clock-circle-bold" width={14} />}
        >
          Coming Soon
        </Chip>
      </CardBody>
    </Card>
  );
}

export default FilmmakerFeatured;
