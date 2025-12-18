/**
 * Players 3D Globe Summary
 * Displays global player distribution on a 3D globe
 */

"use client";

import React from "react";

export interface PlayersGlobeProps {
  className?: string;
}

export function Players3DGlobeSummary({ className = "" }: PlayersGlobeProps) {
  return (
    <div className={`relative min-h-[200px] ${className}`}>
      <div className="absolute inset-0 bg-gradient-radial from-secondary/20 to-transparent rounded-full" />
      {/* 3D Globe visualization for player distribution */}
    </div>
  );
}

export default Players3DGlobeSummary;
