/**
 * Event Icons for Game Event Filter
 * Icon mappings for different game event types
 */

import React from "react";
import { Icon } from "@iconify/react";

export interface EventIconProps {
  type: string;
  size?: number;
  className?: string;
}

const eventIconMap: Record<string, string> = {
  kill: "solar:target-bold",
  death: "solar:skull-bold",
  headshot: "solar:crosshair-bold",
  clutch: "solar:star-bold",
  ace: "solar:stars-bold",
  defuse: "solar:shield-check-bold",
  plant: "solar:bomb-bold",
  assist: "solar:users-group-rounded-bold",
  flashbang: "solar:sun-bold",
  smoke: "solar:cloud-bold",
  grenade: "solar:fire-bold",
  default: "solar:gamepad-bold",
};

export function EventIcon({ type, size = 20, className = "" }: EventIconProps) {
  const icon = eventIconMap[type.toLowerCase()] || eventIconMap.default;

  return <Icon icon={icon} width={size} height={size} className={className} />;
}

export function getEventIcon(type: string): string {
  return eventIconMap[type.toLowerCase()] || eventIconMap.default;
}

export default EventIcon;
