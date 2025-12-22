"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Accordion,
  AccordionItem,
  Chip,
  Code,
  Snippet,
  Tabs,
  Tab,
  Input,
  Textarea,
  Button,
  Link,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";

// Valid tab keys for hash-based navigation
const VALID_TABS = [
  "getting-started",
  "upload",
  "api",
  "contributing",
  "faq",
  "support",
];

export default function DocsPage() {
  const [selectedCategory, setSelectedCategory] = useState("getting-started");

  // Handle hash-based navigation on mount and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && VALID_TABS.includes(hash)) {
        setSelectedCategory(hash);
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (key: string) => {
    setSelectedCategory(key);
    window.history.replaceState(null, "", `#${key}`);
  };

  return (
    <div className="flex w-full flex-col items-center gap-10 sm:gap-12 md:gap-16 lg:gap-20 xl:gap-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-32 py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20">
      {/* Header */}
      <div className="flex w-full max-w-7xl flex-col items-center text-center gap-4 sm:gap-5 md:gap-6">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)",
          }}
        >
          <Icon
            icon="solar:book-bold"
            className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-[#F5F0E1] dark:text-[#34445C]"
          />
        </div>
        <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-base sm:text-lg lg:text-xl tracking-wide uppercase">
          Knowledge Base
        </h2>
        <h1
          className={title({
            size: "lg",
            class:
              "text-[#34445C] dark:text-[#F5F0E1] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
          })}
        >
          Documentation
        </h1>
        <p
          className={subtitle({
            class:
              "mt-2 max-w-2xl sm:max-w-3xl lg:max-w-4xl text-base sm:text-lg lg:text-xl xl:text-2xl leading-relaxed",
          })}
        >
          Everything you need to know about using LeetGaming PRO for competitive
          gaming and replay analysis.
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl">
        <Tabs
          selectedKey={selectedCategory}
          onSelectionChange={(key) => handleTabChange(key as string)}
          variant="underlined"
          classNames={{
            base: "w-full",
            tabList:
              "gap-0 sm:gap-2 md:gap-4 lg:gap-6 xl:gap-8 w-full border-b border-[#FF4654]/20 dark:border-[#DCFF37]/20 flex-row flex-nowrap overflow-x-auto sm:overflow-x-visible sm:justify-center scrollbar-hide",
            cursor: "bg-[#FF4654] dark:bg-[#DCFF37]",
            tab: "min-w-max px-2 sm:px-3 md:px-4 h-10 sm:h-12 lg:h-14 text-xs sm:text-sm lg:text-base data-[selected=true]:text-[#FF4654] dark:data-[selected=true]:text-[#DCFF37]",
            panel: "pt-6 sm:pt-8 lg:pt-10",
          }}
        >
          {/* Getting Started */}
          <Tab
            key="getting-started"
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon
                  icon="mdi:rocket-launch"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span className="hidden xs:inline sm:inline">
                  Getting Started
                </span>
                <span className="xs:hidden sm:hidden">Start</span>
              </div>
            }
          >
            <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    Welcome to LeetGaming PRO
                  </h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10 gap-4 sm:gap-6">
                  <p className="text-default-700 text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed">
                    LeetGaming PRO is a comprehensive platform for competitive
                    gamers to analyze replays, track performance, and improve
                    their skills.
                  </p>

                  <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mt-2 sm:mt-4 text-[#34445C] dark:text-[#F5F0E1]">
                    Quick Start Guide
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-default-700 text-sm sm:text-base lg:text-lg xl:text-xl">
                    <li>Create an account or sign in with Steam/Google</li>
                    <li>Upload your first replay via the Upload page</li>
                    <li>Wait for processing (usually takes 2-5 minutes)</li>
                    <li>
                      View detailed analysis including stats, heatmaps, and
                      round breakdowns
                    </li>
                    <li>Share replays with your team or keep them private</li>
                  </ol>

                  <div className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 p-4 sm:p-6 lg:p-8 rounded-none mt-2 sm:mt-4 border-l-4 border-[#FF4654] dark:border-[#DCFF37]">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center bg-[#FF4654] dark:bg-[#DCFF37]">
                        <Icon
                          icon="mdi:lightbulb"
                          className="text-[#F5F0E1] dark:text-[#34445C] w-4 h-4 sm:w-5 sm:h-5"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#FF4654] dark:text-[#DCFF37] mb-1 sm:mb-2 text-base sm:text-lg lg:text-xl">
                          Pro Tip
                        </p>
                        <p className="text-default-700 text-sm sm:text-base lg:text-lg xl:text-xl">
                          Enable automatic upload by installing our CLI tool.
                          This way, all your matches are automatically uploaded
                          and analyzed.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    System Requirements
                  </h3>
                </CardHeader>
                <Divider />
                <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                    <div>
                      <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl xl:text-2xl text-[#34445C] dark:text-[#F5F0E1]">
                        Supported Games
                      </h4>
                      <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg xl:text-xl">
                        <li className="flex items-center gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check"
                            className="text-success w-5 h-5 sm:w-6 sm:h-6"
                          />
                          Counter-Strike 2
                        </li>
                        <li className="flex items-center gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check"
                            className="text-success w-5 h-5 sm:w-6 sm:h-6"
                          />
                          CS:GO
                        </li>
                        <li className="flex items-center gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check"
                            className="text-success w-5 h-5 sm:w-6 sm:h-6"
                          />
                          Valorant
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl xl:text-2xl text-[#34445C] dark:text-[#F5F0E1]">
                        File Formats
                      </h4>
                      <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg xl:text-xl">
                        <li className="flex items-center gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:file"
                            className="text-default-500 w-5 h-5 sm:w-6 sm:h-6"
                          />
                          .dem (CS2, CS:GO)
                        </li>
                        <li className="flex items-center gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:file"
                            className="text-default-500 w-5 h-5 sm:w-6 sm:h-6"
                          />
                          .rofl (Valorant)
                        </li>
                        <li className="flex items-center gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:file"
                            className="text-default-500 w-5 h-5 sm:w-6 sm:h-6"
                          />
                          Steam Share URLs
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Upload & Analysis */}
          <Tab
            key="upload"
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon
                  icon="mdi:cloud-upload"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span className="hidden sm:inline">Upload & Analysis</span>
                <span className="sm:hidden">Upload</span>
              </div>
            }
          >
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  Uploading Replays
                </h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10">
                <Accordion variant="splitted" className="gap-3 sm:gap-4">
                  <AccordionItem
                    key="1"
                    aria-label="Web Upload"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        Web Upload
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:web"
                        className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg xl:text-xl">
                      <li>Navigate to the Upload page</li>
                      <li>Drag and drop your replay file or click to browse</li>
                      <li>Add optional metadata (map, team names, etc.)</li>
                      <li>Click Upload and wait for processing</li>
                    </ol>
                    <p className="text-xs sm:text-sm lg:text-base text-default-500 mt-3 sm:mt-4">
                      Max file size: 500MB. Supported formats: .dem, .rofl
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="2"
                    aria-label="Steam URL"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        Steam Share URL
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:steam"
                        className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg xl:text-xl">
                      <li>
                        Copy the Steam share URL from your CS2/CS:GO match
                      </li>
                      <li>Paste it into the URL tab on the Upload page</li>
                      <li>Click Import</li>
                      <li>
                        We&apos;ll fetch and process the replay automatically
                      </li>
                    </ol>
                    <div className="mt-3 sm:mt-4 overflow-x-auto">
                      <Snippet
                        symbol=""
                        className="text-xs sm:text-sm lg:text-base"
                      >
                        steam://rungame/730/76561202255233023/+csgo_download_match%20...
                      </Snippet>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    key="3"
                    aria-label="CLI Tool"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        CLI Tool (Auto-Upload)
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:console"
                        className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl mb-3 sm:mb-4">
                      Install our CLI tool for automatic replay uploads:
                    </p>
                    <div className="space-y-2 sm:space-y-3 overflow-x-auto">
                      <Snippet
                        symbol="$"
                        className="text-xs sm:text-sm lg:text-base"
                      >
                        npm install -g @leetgaming/cli
                      </Snippet>
                      <Snippet
                        symbol="$"
                        className="text-xs sm:text-sm lg:text-base"
                      >
                        leetgaming auth login
                      </Snippet>
                      <Snippet
                        symbol="$"
                        className="text-xs sm:text-sm lg:text-base"
                      >
                        leetgaming watch --game cs2
                      </Snippet>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-default-500 mt-3 sm:mt-4">
                      The CLI will monitor your game directory and auto-upload
                      new replays.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="4"
                    aria-label="Analysis Features"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        What Gets Analyzed?
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:chart-box"
                        className="text-success w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg xl:text-xl">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <Icon
                          icon="mdi:check-circle"
                          className="text-success mt-0.5 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                        />
                        <span>
                          Player statistics (K/D/A, ADR, HS%, economy)
                        </span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <Icon
                          icon="mdi:check-circle"
                          className="text-success mt-0.5 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                        />
                        <span>Round-by-round breakdown with timelines</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <Icon
                          icon="mdi:check-circle"
                          className="text-success mt-0.5 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                        />
                        <span>Heatmaps for positioning and deaths</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <Icon
                          icon="mdi:check-circle"
                          className="text-success mt-0.5 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                        />
                        <span>Economy management tracking</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <Icon
                          icon="mdi:check-circle"
                          className="text-success mt-0.5 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                        />
                        <span>Weapon performance analytics</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <Icon
                          icon="mdi:check-circle"
                          className="text-success mt-0.5 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                        />
                        <span>Team coordination metrics</span>
                      </li>
                    </ul>
                  </AccordionItem>
                </Accordion>
              </CardBody>
            </Card>
          </Tab>

          {/* API & Integration */}
          <Tab
            key="api"
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon icon="mdi:api" className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>API</span>
              </div>
            }
          >
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  API Documentation
                </h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10 gap-6 sm:gap-8 lg:gap-10">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold mb-2 sm:mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Authentication
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-default-600 mb-3 sm:mb-4">
                    All API requests require an API key. Generate one from your
                    account settings.
                  </p>
                  <div className="overflow-x-auto">
                    <Snippet
                      symbol=""
                      className="text-xs sm:text-sm lg:text-base"
                    >
                      Authorization: Bearer YOUR_API_KEY
                    </Snippet>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold mb-3 sm:mb-4 lg:mb-6 text-[#34445C] dark:text-[#F5F0E1]">
                    Common Endpoints
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    <div className="border-l-4 border-success pl-3 sm:pl-4 lg:pl-6 py-2">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                        <Chip
                          size="sm"
                          color="success"
                          variant="flat"
                          className="text-xs sm:text-sm"
                        >
                          GET
                        </Chip>
                        <Code className="text-xs sm:text-sm lg:text-base">
                          /api/replays
                        </Code>
                      </div>
                      <p className="text-sm sm:text-base text-default-600">
                        List all replays
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-3 sm:pl-4 lg:pl-6 py-2">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                        <Chip
                          size="sm"
                          color="primary"
                          variant="flat"
                          className="text-xs sm:text-sm"
                        >
                          POST
                        </Chip>
                        <Code className="text-xs sm:text-sm lg:text-base">
                          /api/upload/replay
                        </Code>
                      </div>
                      <p className="text-sm sm:text-base text-default-600">
                        Upload a new replay
                      </p>
                    </div>

                    <div className="border-l-4 border-success pl-3 sm:pl-4 lg:pl-6 py-2">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                        <Chip
                          size="sm"
                          color="success"
                          variant="flat"
                          className="text-xs sm:text-sm"
                        >
                          GET
                        </Chip>
                        <Code className="text-xs sm:text-sm lg:text-base">
                          /api/replays/:id
                        </Code>
                      </div>
                      <p className="text-sm sm:text-base text-default-600">
                        Get replay details
                      </p>
                    </div>

                    <div className="border-l-4 border-success pl-3 sm:pl-4 lg:pl-6 py-2">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                        <Chip
                          size="sm"
                          color="success"
                          variant="flat"
                          className="text-xs sm:text-sm"
                        >
                          GET
                        </Chip>
                        <Code className="text-xs sm:text-sm lg:text-base">
                          /api/search/profiles
                        </Code>
                      </div>
                      <p className="text-sm sm:text-base text-default-600">
                        Search player profiles
                      </p>
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold mb-2 sm:mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Example: Upload Replay
                  </h3>
                  <div className="overflow-x-auto">
                    <Snippet
                      symbol=""
                      hideSymbol
                      className="text-xs sm:text-sm lg:text-base"
                    >
                      {`curl -X POST https://api.leetgaming.pro/upload/replay \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@replay.dem" \\
  -F "gameId=cs2" \\
  -F "visibility=public"`}
                    </Snippet>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>

          {/* Contributing - NEW TAB */}
          <Tab
            key="contributing"
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon icon="mdi:github" className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Contributing</span>
                <span className="sm:hidden">Contrib</span>
              </div>
            }
          >
            <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
              {/* Header Card with GitHub Link */}
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-gradient-to-br from-[#FF4654]/5 to-[#FFC700]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/5">
                <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                        }}
                      >
                        <Icon
                          icon="mdi:code-braces"
                          className="text-[#F5F0E1] dark:text-[#34445C] w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                          Contributing to LeetGaming PRO
                        </h2>
                        <p className="text-default-600 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg xl:text-xl">
                          We welcome contributions from the community!
                        </p>
                      </div>
                    </div>
                    <Link
                      href="https://github.com/leetgaming-pro/esap/blob/main/CONTRIBUTING.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                      }}
                    >
                      <Icon
                        icon="mdi:github"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                      View Full Guide on GitHub
                    </Link>
                  </div>
                </CardBody>
              </Card>

              {/* Code Standards */}
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:code-tags"
                      className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                    />
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      Code Standards
                    </h3>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* TypeScript Standards */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Chip color="primary" variant="flat" size="sm">
                          TypeScript
                        </Chip>
                        <span className="font-semibold text-sm sm:text-base lg:text-lg text-[#34445C] dark:text-[#F5F0E1]">
                          Frontend
                        </span>
                      </div>

                      <div className="space-y-3 text-sm sm:text-base lg:text-lg">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:close-circle"
                            className="text-danger mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span>
                            Never use{" "}
                            <Code className="text-xs sm:text-sm">any</Code> type
                            - always use proper interfaces
                          </span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check-circle"
                            className="text-success mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span>
                            Strict mode enabled with{" "}
                            <Code className="text-xs sm:text-sm">
                              noImplicitAny
                            </Code>
                          </span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check-circle"
                            className="text-success mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span>
                            Use SDK hooks for API calls (never raw fetch)
                          </span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check-circle"
                            className="text-success mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span>
                            Follow D.R.Y. principle - extract shared logic
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Go Standards */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Chip color="secondary" variant="flat" size="sm">
                          Go
                        </Chip>
                        <span className="font-semibold text-sm sm:text-base lg:text-lg text-[#34445C] dark:text-[#F5F0E1]">
                          Backend
                        </span>
                      </div>

                      <div className="space-y-3 text-sm sm:text-base lg:text-lg">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check-circle"
                            className="text-success mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span>Follow Clean Architecture patterns</span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check-circle"
                            className="text-success mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span>
                            Business logic in{" "}
                            <Code className="text-xs sm:text-sm">
                              pkg/domain/
                            </Code>
                          </span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check-circle"
                            className="text-success mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span>
                            All commands must have{" "}
                            <Code className="text-xs sm:text-sm">
                              Validate()
                            </Code>{" "}
                            methods
                          </span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Icon
                            icon="mdi:check-circle"
                            className="text-success mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span>Controllers only handle HTTP concerns</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Testing & CI/CD */}
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:test-tube"
                      className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                    />
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      Testing & CI/CD
                    </h3>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6">
                  {/* Quality Gates */}
                  <div>
                    <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl text-[#34445C] dark:text-[#F5F0E1]">
                      All PRs Must Pass:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                      {[
                        { name: "Lint", icon: "mdi:format-paint" },
                        { name: "Type Check", icon: "mdi:code-braces-box" },
                        { name: "Unit Tests", icon: "mdi:test-tube" },
                        { name: "Build", icon: "mdi:package-variant-closed" },
                        { name: "E2E Tests", icon: "mdi:monitor-cellphone" },
                      ].map((gate) => (
                        <div
                          key={gate.name}
                          className="flex items-center gap-2 p-2 sm:p-3 bg-success/10 border border-success/20"
                        >
                          <Icon
                            icon={gate.icon}
                            className="text-success w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span className="text-xs sm:text-sm lg:text-base font-medium">
                            {gate.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Running Tests */}
                  <div>
                    <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl text-[#34445C] dark:text-[#F5F0E1]">
                      Running Tests Locally
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm sm:text-base font-medium text-default-600">
                          Frontend
                        </p>
                        <div className="space-y-1.5 overflow-x-auto">
                          <Snippet symbol="$" className="text-xs sm:text-sm">
                            npm run lint
                          </Snippet>
                          <Snippet symbol="$" className="text-xs sm:text-sm">
                            npm run test
                          </Snippet>
                          <Snippet symbol="$" className="text-xs sm:text-sm">
                            npm run test:e2e
                          </Snippet>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm sm:text-base font-medium text-default-600">
                          Backend
                        </p>
                        <div className="space-y-1.5 overflow-x-auto">
                          <Snippet symbol="$" className="text-xs sm:text-sm">
                            make lint
                          </Snippet>
                          <Snippet symbol="$" className="text-xs sm:text-sm">
                            make test
                          </Snippet>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Project Structure & PR Guidelines */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Project Structure */}
                <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                  <CardHeader className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3">
                      <Icon
                        icon="mdi:folder-open"
                        className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                      />
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        Project Structure
                      </h3>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody className="p-4 sm:p-6 lg:p-8">
                    <div className="font-mono text-xs sm:text-sm lg:text-base space-y-1 text-default-700">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="mdi:folder"
                          className="text-warning w-4 h-4"
                        />{" "}
                        <span className="font-semibold">
                          leetgaming-pro-web/
                        </span>{" "}
                        <span className="text-default-500">
                          Frontend (Next.js)
                        </span>
                      </div>
                      <div className="ml-4 sm:ml-6">
                        ├── app/{" "}
                        <span className="text-default-500">
                          App router pages
                        </span>
                      </div>
                      <div className="ml-4 sm:ml-6">
                        ├── components/{" "}
                        <span className="text-default-500">
                          React components
                        </span>
                      </div>
                      <div className="ml-4 sm:ml-6">
                        ├── hooks/{" "}
                        <span className="text-default-500">Custom hooks</span>
                      </div>
                      <div className="ml-4 sm:ml-6">
                        └── lib/{" "}
                        <span className="text-default-500">Utilities</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Icon
                          icon="mdi:folder"
                          className="text-primary w-4 h-4"
                        />{" "}
                        <span className="font-semibold">replay-api/</span>{" "}
                        <span className="text-default-500">Backend (Go)</span>
                      </div>
                      <div className="ml-4 sm:ml-6">
                        ├── cmd/{" "}
                        <span className="text-default-500">Entry points</span>
                      </div>
                      <div className="ml-4 sm:ml-6">
                        └── pkg/{" "}
                        <span className="text-default-500">Domain logic</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Icon
                          icon="mdi:folder"
                          className="text-success w-4 h-4"
                        />{" "}
                        <span className="font-semibold">k8s/</span>{" "}
                        <span className="text-default-500">
                          Kubernetes configs
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="mdi:folder"
                          className="text-secondary w-4 h-4"
                        />{" "}
                        <span className="font-semibold">docs/</span>{" "}
                        <span className="text-default-500">Documentation</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* PR Guidelines */}
                <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                  <CardHeader className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3">
                      <Icon
                        icon="mdi:source-pull"
                        className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                      />
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        Pull Request Guidelines
                      </h3>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody className="p-4 sm:p-6 lg:p-8">
                    <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg">
                      <li>
                        <span className="font-semibold">Branch naming:</span>{" "}
                        <Code className="text-xs sm:text-sm">feature/</Code>,{" "}
                        <Code className="text-xs sm:text-sm">fix/</Code>,{" "}
                        <Code className="text-xs sm:text-sm">refactor/</Code>
                      </li>
                      <li>
                        <span className="font-semibold">Commit messages:</span>{" "}
                        Clear, concise, imperative mood
                      </li>
                      <li>
                        <span className="font-semibold">PR description:</span>{" "}
                        Include summary and test plan
                      </li>
                      <li>
                        <span className="font-semibold">Code review:</span> At
                        least one approval required
                      </li>
                      <li>
                        <span className="font-semibold">E2E tests:</span> Must
                        pass before merge
                      </li>
                    </ol>
                  </CardBody>
                </Card>
              </div>

              {/* Available Hooks */}
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:hook"
                      className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                    />
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      Available SDK Hooks
                    </h3>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { name: "useTournament", desc: "Tournament operations" },
                      { name: "useLobby", desc: "Matchmaking operations" },
                      { name: "useWallet", desc: "Wallet & transactions" },
                      { name: "usePayments", desc: "Payment operations" },
                    ].map((hook) => (
                      <div
                        key={hook.name}
                        className="p-3 sm:p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20"
                      >
                        <Code className="text-xs sm:text-sm lg:text-base block mb-2">
                          {hook.name}
                        </Code>
                        <p className="text-xs sm:text-sm text-default-500">
                          {hook.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Questions CTA */}
              <Card className="rounded-none bg-gradient-to-br from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardBody className="p-6 sm:p-8 lg:p-10 xl:p-12 text-center">
                  <Icon
                    icon="mdi:help-circle-outline"
                    className="text-[#FF4654] dark:text-[#DCFF37] mx-auto mb-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
                  />
                  <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mb-2 sm:mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Questions?
                  </h3>
                  <p className="text-default-600 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto">
                    If you have questions about these guidelines, please open an
                    issue or ask in the PR discussion.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    <Link
                      href="https://github.com/leetgaming-pro/esap/issues/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] px-4 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm lg:text-base hover:opacity-90 transition-opacity"
                    >
                      <Icon icon="mdi:bug" className="w-4 h-4 sm:w-5 sm:h-5" />
                      Open Issue
                    </Link>
                    <Link
                      href="https://discord.gg/leetgaming"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 border-2 border-[#34445C] dark:border-[#DCFF37] text-[#34445C] dark:text-[#DCFF37] px-4 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm lg:text-base hover:bg-[#34445C]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                    >
                      <Icon
                        icon="mdi:discord"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                      Ask on Discord
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* FAQ */}
          <Tab
            key="faq"
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon
                  icon="mdi:help-circle"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span>FAQ</span>
              </div>
            }
          >
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  Frequently Asked Questions
                </h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10">
                <Accordion variant="splitted" className="gap-3 sm:gap-4">
                  <AccordionItem
                    key="1"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        How long does replay processing take?
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:clock"
                        className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-default-700 leading-relaxed">
                      Most replays are processed within 2-5 minutes. Larger
                      files or high-traffic periods may take up to 10 minutes.
                      You&apos;ll receive a notification when processing is
                      complete.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="2"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        Can I share replays with my team?
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:share-variant"
                        className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-default-700 leading-relaxed">
                      Yes! You can set replays to Private, Shared (team only),
                      or Public. Team members can view and analyze shared
                      replays together.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="3"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        What&apos;s the storage limit?
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:database"
                        className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-default-700 leading-relaxed">
                      Free tier: 50 replays / 5GB storage. Pro tier: Unlimited
                      replays and storage. Check the Pricing page for details.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="4"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        How do I delete a replay?
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:delete"
                        className="text-danger w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-default-700 leading-relaxed">
                      Navigate to Cloud Dashboard, find the replay, click the
                      options menu (...), and select Delete. This action is
                      permanent.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="5"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        Can I download the original replay file?
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:download"
                        className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-default-700 leading-relaxed">
                      Yes, Pro users can download original replay files. Free
                      users can only view the analysis online.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="6"
                    title={
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                        How accurate is the analysis?
                      </span>
                    }
                    startContent={
                      <Icon
                        icon="mdi:chart-line"
                        className="text-success w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    classNames={{ content: "py-3 sm:py-4 lg:py-6" }}
                  >
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-default-700 leading-relaxed">
                      Our analysis is based on official game demo parsers and
                      has been validated against thousands of professional
                      matches. Accuracy is typically 99%+ for stats and events.
                    </p>
                  </AccordionItem>
                </Accordion>
              </CardBody>
            </Card>
          </Tab>

          {/* Support */}
          <Tab
            key="support"
            title={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon icon="mdi:headset" className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Support</span>
              </div>
            }
          >
            <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    Contact Support
                  </h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10 gap-6 sm:gap-8">
                  <p className="text-default-700 text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed">
                    Need help with your account, a technical issue, or have a
                    question? Our support team is here to help.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                    {/* Contact Options */}
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                        Get in Touch
                      </h3>

                      <div className="space-y-3 sm:space-y-4">
                        <a
                          href="https://discord.gg/leetgaming"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#5865F2]">
                            <Icon
                              icon="mdi:discord"
                              className="text-white w-5 h-5 sm:w-6 sm:h-6"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm sm:text-base lg:text-lg text-[#34445C] dark:text-[#F5F0E1]">
                              Discord Community
                            </p>
                            <p className="text-xs sm:text-sm text-default-500">
                              Fastest response - join our server
                            </p>
                          </div>
                        </a>

                        <a
                          href="mailto:support@leetgaming.pro"
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#FF4654] dark:bg-[#DCFF37]">
                            <Icon
                              icon="mdi:email"
                              className="text-white dark:text-[#34445C] w-5 h-5 sm:w-6 sm:h-6"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm sm:text-base lg:text-lg text-[#34445C] dark:text-[#F5F0E1]">
                              Email Support
                            </p>
                            <p className="text-xs sm:text-sm text-default-500">
                              support@leetgaming.pro
                            </p>
                          </div>
                        </a>

                        <a
                          href="https://twitter.com/leetgamingpro"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black dark:bg-white">
                            <Icon
                              icon="mdi:twitter"
                              className="text-white dark:text-black w-5 h-5 sm:w-6 sm:h-6"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm sm:text-base lg:text-lg text-[#34445C] dark:text-[#F5F0E1]">
                              Twitter / X
                            </p>
                            <p className="text-xs sm:text-sm text-default-500">
                              @leetgamingpro
                            </p>
                          </div>
                        </a>
                      </div>

                      <div className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 p-4 sm:p-6 border-l-4 border-[#FF4654] dark:border-[#DCFF37]">
                        <h4 className="font-semibold text-[#FF4654] dark:text-[#DCFF37] mb-2 text-sm sm:text-base lg:text-lg">
                          Response Times
                        </h4>
                        <ul className="text-xs sm:text-sm lg:text-base text-default-700 space-y-1">
                          <li>• Discord: Usually within 1-2 hours</li>
                          <li>• Email: Within 24-48 hours</li>
                          <li>• Pro subscribers get priority support</li>
                        </ul>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                        Quick Links
                      </h3>

                      <div className="space-y-2 sm:space-y-3">
                        <button
                          onClick={() => handleTabChange("faq")}
                          className="w-full flex items-center gap-3 p-3 sm:p-4 text-left border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <Icon
                            icon="mdi:help-circle"
                            className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base lg:text-lg text-[#34445C] dark:text-[#F5F0E1]">
                              FAQ
                            </p>
                            <p className="text-xs sm:text-sm text-default-500">
                              Find answers to common questions
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={() => handleTabChange("getting-started")}
                          className="w-full flex items-center gap-3 p-3 sm:p-4 text-left border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <Icon
                            icon="mdi:rocket-launch"
                            className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6"
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base lg:text-lg text-[#34445C] dark:text-[#F5F0E1]">
                              Getting Started
                            </p>
                            <p className="text-xs sm:text-sm text-default-500">
                              Learn the basics of LeetGaming
                            </p>
                          </div>
                        </button>

                        <a
                          href="/service-status"
                          className="flex items-center gap-3 p-3 sm:p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <Icon
                            icon="mdi:server"
                            className="text-success w-5 h-5 sm:w-6 sm:h-6"
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base lg:text-lg text-[#34445C] dark:text-[#F5F0E1]">
                              Service Status
                            </p>
                            <p className="text-xs sm:text-sm text-default-500">
                              Check if services are operational
                            </p>
                          </div>
                        </a>

                        <a
                          href="/settings"
                          className="flex items-center gap-3 p-3 sm:p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <Icon
                            icon="mdi:cog"
                            className="text-default-500 w-5 h-5 sm:w-6 sm:h-6"
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base lg:text-lg text-[#34445C] dark:text-[#F5F0E1]">
                              Account Settings
                            </p>
                            <p className="text-xs sm:text-sm text-default-500">
                              Manage your account preferences
                            </p>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Report Issue */}
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10">
                  <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    Report an Issue
                  </h3>
                </CardHeader>
                <Divider />
                <CardBody className="p-4 sm:p-6 lg:p-8 xl:p-10 gap-3 sm:gap-4">
                  <p className="text-default-600 mb-2 sm:mb-4 text-sm sm:text-base lg:text-lg">
                    Found a bug or experiencing a technical problem? Let us know
                    and we&apos;ll look into it.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Input
                      label="Subject"
                      placeholder="Brief description of the issue"
                      variant="bordered"
                      size="lg"
                      classNames={{
                        inputWrapper: "rounded-none",
                        label: "text-xs sm:text-sm lg:text-base",
                        input: "text-sm sm:text-base",
                      }}
                    />
                    <Input
                      label="Email"
                      placeholder="your@email.com"
                      type="email"
                      variant="bordered"
                      size="lg"
                      classNames={{
                        inputWrapper: "rounded-none",
                        label: "text-xs sm:text-sm lg:text-base",
                        input: "text-sm sm:text-base",
                      }}
                    />
                  </div>
                  <Textarea
                    label="Description"
                    placeholder="Please describe the issue in detail. Include steps to reproduce if possible."
                    variant="bordered"
                    minRows={4}
                    classNames={{
                      inputWrapper: "rounded-none",
                      label: "text-xs sm:text-sm lg:text-base",
                      input: "text-sm sm:text-base",
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-white font-semibold rounded-none text-sm sm:text-base"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    >
                      Submit Report
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Help Card */}
      <Card className="w-full max-w-7xl bg-gradient-to-br from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardBody className="p-6 sm:p-8 lg:p-12 xl:p-16 text-center">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon="mdi:help-circle"
              className="text-[#F5F0E1] dark:text-[#34445C] w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12"
            />
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mb-3 sm:mb-4 text-[#34445C] dark:text-[#F5F0E1]">
            Need More Help?
          </h3>
          <p className="text-default-600 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Join our Discord
            community or contact support.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
            <Chip
              startContent={
                <Icon icon="mdi:discord" className="w-4 h-4 sm:w-5 sm:h-5" />
              }
              className="cursor-pointer rounded-none bg-[#34445C] text-[#F5F0E1] dark:bg-[#DCFF37] dark:text-[#34445C] px-3 sm:px-4 py-2 text-xs sm:text-sm lg:text-base hover:scale-105 transition-transform"
            >
              Join Discord
            </Chip>
            <Chip
              startContent={
                <Icon icon="mdi:email" className="w-4 h-4 sm:w-5 sm:h-5" />
              }
              className="cursor-pointer rounded-none border border-[#FF4654]/30 dark:border-[#DCFF37]/30 px-3 sm:px-4 py-2 text-xs sm:text-sm lg:text-base hover:scale-105 transition-transform"
              variant="bordered"
            >
              Contact Support
            </Chip>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
