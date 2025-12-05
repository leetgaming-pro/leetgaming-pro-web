/**
 * Match-Making Page - Award-Winning Wizard Experience
 * Complete 5-step wizard for competitive matchmaking
 */

"use client";

import React from 'react';
import MatchmakingWizard from '@/components/match-making/App';
import { PageContainer } from '@/components/layout/page-container';

export default function MatchMakingPage() {
  return (
    <PageContainer maxWidth="full" padding="none" className="min-h-screen">
      <MatchmakingWizard />
    </PageContainer>
  );
}
