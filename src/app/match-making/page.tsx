"use client"

import MatchMakingWizard from "@/components/match-making/App";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

const HomePage: React.FC = () => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
      <nav className="my-4 px-2 py-2">
        <Breadcrumbs>
          <BreadcrumbItem>News</BreadcrumbItem>
          <BreadcrumbItem>Start</BreadcrumbItem>
          <BreadcrumbItem>Match-Making</BreadcrumbItem>
        </Breadcrumbs>
      </nav>
        <MatchMakingWizard />
    </div>
  );
};

export default HomePage;