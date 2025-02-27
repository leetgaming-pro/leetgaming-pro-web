import React from "react";
import {Accordion, AccordionItem, Avatar} from "@nextui-org/react";
import Rounds from './rounds';

export default function App() {
  return (
    <div>
      <Accordion selectionMode="multiple">
        <AccordionItem>
          {/* Rounds, deve mostar apenas eventos "curados" // custom:: */}
        <Rounds />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
