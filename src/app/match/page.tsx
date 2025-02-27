"use client"
import React from "react";
import {Accordion, AccordionItem, Avatar} from "@nextui-org/react";
import Rounds from '@/components/replay/game-events/rounds';

export default function Match() {
  const defaultContent ="test"

  return (
   <div>
      <Rounds />
   </div>
  );
}
