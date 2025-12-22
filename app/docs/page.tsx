"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";

// Valid tab keys for hash-based navigation
const VALID_TABS = ["getting-started", "upload", "api", "faq", "support"];

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
    <div className="flex w-full flex-col items-center gap-12 md:gap-16 lg:gap-20 px-4 py-12 md:py-16 lg:py-20 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
      {/* Header */}
      <div className="flex w-full max-w-7xl flex-col items-center text-center gap-6">
        <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)' }}>
          <Icon icon="solar:book-bold" width={32} className="text-[#F5F0E1] dark:text-[#34445C] lg:w-10 lg:h-10" />
        </div>
        <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-lg lg:text-xl tracking-wide uppercase">Knowledge Base</h2>
        <h1 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] text-4xl md:text-5xl lg:text-6xl" })}>Documentation</h1>
        <p className={subtitle({ class: "mt-2 max-w-3xl lg:max-w-4xl text-lg lg:text-xl leading-relaxed" })}>
          Everything you need to know about using LeetGaming PRO for competitive gaming and replay
          analysis.
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl">
        <Tabs
          selectedKey={selectedCategory}
          onSelectionChange={(key) => handleTabChange(key as string)}
          variant="underlined"
          classNames={{
            tabList: "gap-4 lg:gap-8 w-full flex-wrap border-b border-[#FF4654]/20 dark:border-[#DCFF37]/20",
            cursor: "bg-[#FF4654] dark:bg-[#DCFF37]",
            tab: "h-12 lg:h-14 text-sm lg:text-base data-[selected=true]:text-[#FF4654] dark:data-[selected=true]:text-[#DCFF37]",
            panel: "pt-8 lg:pt-10",
          }}
        >
          {/* Getting Started */}
          <Tab
            key="getting-started"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:rocket-launch" width={20} />
                <span>Getting Started</span>
              </div>
            }
          >
            <div className="flex flex-col gap-8 lg:gap-10">
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-6 lg:p-8 xl:p-10">
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Welcome to LeetGaming PRO</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 lg:p-8 xl:p-10 gap-6">
                  <p className="text-default-700 text-base lg:text-lg leading-relaxed">
                    LeetGaming PRO is a comprehensive platform for competitive gamers to analyze
                    replays, track performance, and improve their skills.
                  </p>

                  <h3 className="text-xl lg:text-2xl font-semibold mt-4 text-[#34445C] dark:text-[#F5F0E1]">Quick Start Guide</h3>
                  <ol className="list-decimal list-inside space-y-3 text-default-700 text-base lg:text-lg">
                    <li>Create an account or sign in with Steam/Google</li>
                    <li>Upload your first replay via the Upload page</li>
                    <li>Wait for processing (usually takes 2-5 minutes)</li>
                    <li>View detailed analysis including stats, heatmaps, and round breakdowns</li>
                    <li>Share replays with your team or keep them private</li>
                  </ol>

                  <div className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 p-6 lg:p-8 rounded-none mt-4 border-l-4 border-[#FF4654] dark:border-[#DCFF37]">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#FF4654] dark:bg-[#DCFF37]">
                        <Icon icon="mdi:lightbulb" className="text-[#F5F0E1] dark:text-[#34445C]" width={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-[#FF4654] dark:text-[#DCFF37] mb-2 text-lg">Pro Tip</p>
                        <p className="text-default-700 text-base lg:text-lg">
                          Enable automatic upload by installing our CLI tool. This way, all your
                          matches are automatically uploaded and analyzed.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-6 lg:p-8 xl:p-10">
                  <h3 className="text-xl lg:text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">System Requirements</h3>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 lg:p-8 xl:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div>
                      <h4 className="font-semibold mb-4 text-lg lg:text-xl text-[#34445C] dark:text-[#F5F0E1]">Supported Games</h4>
                      <ul className="space-y-3 text-base lg:text-lg">
                        <li className="flex items-center gap-3">
                          <Icon icon="mdi:check" className="text-success" width={22} />
                          Counter-Strike 2
                        </li>
                        <li className="flex items-center gap-3">
                          <Icon icon="mdi:check" className="text-success" width={22} />
                          CS:GO
                        </li>
                        <li className="flex items-center gap-3">
                          <Icon icon="mdi:check" className="text-success" width={22} />
                          Valorant
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4 text-lg lg:text-xl text-[#34445C] dark:text-[#F5F0E1]">File Formats</h4>
                      <ul className="space-y-3 text-base lg:text-lg">
                        <li className="flex items-center gap-3">
                          <Icon icon="mdi:file" className="text-default-500" width={22} />
                          .dem (CS2, CS:GO)
                        </li>
                        <li className="flex items-center gap-3">
                          <Icon icon="mdi:file" className="text-default-500" width={22} />
                          .rofl (Valorant)
                        </li>
                        <li className="flex items-center gap-3">
                          <Icon icon="mdi:file" className="text-default-500" width={22} />
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
              <div className="flex items-center gap-2">
                <Icon icon="mdi:cloud-upload" width={20} />
                <span>Upload & Analysis</span>
              </div>
            }
          >
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="p-6 lg:p-8 xl:p-10">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Uploading Replays</h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-6 lg:p-8 xl:p-10">
                <Accordion variant="splitted" className="gap-4">
                  <AccordionItem
                    key="1"
                    aria-label="Web Upload"
                    title={<span className="text-base lg:text-lg">Web Upload</span>}
                    startContent={<Icon icon="mdi:web" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <ol className="list-decimal list-inside space-y-3 text-base lg:text-lg">
                      <li>Navigate to the Upload page</li>
                      <li>Drag and drop your replay file or click to browse</li>
                      <li>Add optional metadata (map, team names, etc.)</li>
                      <li>Click Upload and wait for processing</li>
                    </ol>
                    <p className="text-sm lg:text-base text-default-500 mt-4">
                      Max file size: 500MB. Supported formats: .dem, .rofl
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="2"
                    aria-label="Steam URL"
                    title={<span className="text-base lg:text-lg">Steam Share URL</span>}
                    startContent={<Icon icon="mdi:steam" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <ol className="list-decimal list-inside space-y-3 text-base lg:text-lg">
                      <li>Copy the Steam share URL from your CS2/CS:GO match</li>
                      <li>Paste it into the URL tab on the Upload page</li>
                      <li>Click Import</li>
                      <li>We&apos;ll fetch and process the replay automatically</li>
                    </ol>
                    <div className="mt-4">
                      <Snippet symbol="" className="text-sm lg:text-base">
                        steam://rungame/730/76561202255233023/+csgo_download_match%20...
                      </Snippet>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    key="3"
                    aria-label="CLI Tool"
                    title={<span className="text-base lg:text-lg">CLI Tool (Auto-Upload)</span>}
                    startContent={<Icon icon="mdi:console" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <p className="text-base lg:text-lg mb-4">
                      Install our CLI tool for automatic replay uploads:
                    </p>
                    <div className="space-y-3">
                      <Snippet symbol="$" className="text-sm lg:text-base">
                        npm install -g @leetgaming/cli
                      </Snippet>
                      <Snippet symbol="$" className="text-sm lg:text-base">
                        leetgaming auth login
                      </Snippet>
                      <Snippet symbol="$" className="text-sm lg:text-base">
                        leetgaming watch --game cs2
                      </Snippet>
                    </div>
                    <p className="text-sm lg:text-base text-default-500 mt-4">
                      The CLI will monitor your game directory and auto-upload new replays.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="4"
                    aria-label="Analysis Features"
                    title={<span className="text-base lg:text-lg">What Gets Analyzed?</span>}
                    startContent={<Icon icon="mdi:chart-box" className="text-success" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <ul className="space-y-3 text-base lg:text-lg">
                      <li className="flex items-start gap-3">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5 flex-shrink-0" width={22} />
                        <span>Player statistics (K/D/A, ADR, HS%, economy)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5 flex-shrink-0" width={22} />
                        <span>Round-by-round breakdown with timelines</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5 flex-shrink-0" width={22} />
                        <span>Heatmaps for positioning and deaths</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5 flex-shrink-0" width={22} />
                        <span>Economy management tracking</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5 flex-shrink-0" width={22} />
                        <span>Weapon performance analytics</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5 flex-shrink-0" width={22} />
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
              <div className="flex items-center gap-2">
                <Icon icon="mdi:api" width={20} />
                <span>API</span>
              </div>
            }
          >
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="p-6 lg:p-8 xl:p-10">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">API Documentation</h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-6 lg:p-8 xl:p-10 gap-8 lg:gap-10">
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">Authentication</h3>
                  <p className="text-base lg:text-lg text-default-600 mb-4">
                    All API requests require an API key. Generate one from your account settings.
                  </p>
                  <Snippet symbol="" className="text-sm lg:text-base">
                    Authorization: Bearer YOUR_API_KEY
                  </Snippet>
                </div>

                <Divider />

                <div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 text-[#34445C] dark:text-[#F5F0E1]">Common Endpoints</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="border-l-4 border-success pl-4 lg:pl-6 py-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Chip size="sm" color="success" variant="flat" className="text-sm">
                          GET
                        </Chip>
                        <Code className="text-sm lg:text-base">/api/replays</Code>
                      </div>
                      <p className="text-base text-default-600">List all replays</p>
                    </div>

                    <div className="border-l-4 border-primary pl-4 lg:pl-6 py-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Chip size="sm" color="primary" variant="flat" className="text-sm">
                          POST
                        </Chip>
                        <Code className="text-sm lg:text-base">/api/upload/replay</Code>
                      </div>
                      <p className="text-base text-default-600">Upload a new replay</p>
                    </div>

                    <div className="border-l-4 border-success pl-4 lg:pl-6 py-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Chip size="sm" color="success" variant="flat" className="text-sm">
                          GET
                        </Chip>
                        <Code className="text-sm lg:text-base">/api/replays/:id</Code>
                      </div>
                      <p className="text-base text-default-600">Get replay details</p>
                    </div>

                    <div className="border-l-4 border-success pl-4 lg:pl-6 py-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Chip size="sm" color="success" variant="flat" className="text-sm">
                          GET
                        </Chip>
                        <Code className="text-sm lg:text-base">/api/search/profiles</Code>
                      </div>
                      <p className="text-base text-default-600">Search player profiles</p>
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">Example: Upload Replay</h3>
                  <Snippet symbol="" hideSymbol className="text-xs lg:text-sm overflow-x-auto">
                    {`curl -X POST https://api.leetgaming.pro/upload/replay \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@replay.dem" \\
  -F "gameId=cs2" \\
  -F "visibility=public"`}
                  </Snippet>
                </div>
              </CardBody>
            </Card>
          </Tab>

          {/* FAQ */}
          <Tab
            key="faq"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:help-circle" width={20} />
                <span>FAQ</span>
              </div>
            }
          >
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="p-6 lg:p-8 xl:p-10">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Frequently Asked Questions</h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-6 lg:p-8 xl:p-10">
                <Accordion variant="splitted" className="gap-4">
                  <AccordionItem
                    key="1"
                    title={<span className="text-base lg:text-lg">How long does replay processing take?</span>}
                    startContent={<Icon icon="mdi:clock" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <p className="text-base lg:text-lg text-default-700 leading-relaxed">
                      Most replays are processed within 2-5 minutes. Larger files or high-traffic
                      periods may take up to 10 minutes. You&apos;ll receive a notification when
                      processing is complete.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="2"
                    title={<span className="text-base lg:text-lg">Can I share replays with my team?</span>}
                    startContent={<Icon icon="mdi:share-variant" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <p className="text-base lg:text-lg text-default-700 leading-relaxed">
                      Yes! You can set replays to Private, Shared (team only), or Public. Team
                      members can view and analyze shared replays together.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="3"
                    title={<span className="text-base lg:text-lg">What&apos;s the storage limit?</span>}
                    startContent={<Icon icon="mdi:database" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <p className="text-base lg:text-lg text-default-700 leading-relaxed">
                      Free tier: 50 replays / 5GB storage. Pro tier: Unlimited replays and
                      storage. Check the Pricing page for details.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="4"
                    title={<span className="text-base lg:text-lg">How do I delete a replay?</span>}
                    startContent={<Icon icon="mdi:delete" className="text-danger" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <p className="text-base lg:text-lg text-default-700 leading-relaxed">
                      Navigate to Cloud Dashboard, find the replay, click the options menu (...),
                      and select Delete. This action is permanent.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="5"
                    title={<span className="text-base lg:text-lg">Can I download the original replay file?</span>}
                    startContent={<Icon icon="mdi:download" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <p className="text-base lg:text-lg text-default-700 leading-relaxed">
                      Yes, Pro users can download original replay files. Free users can only view
                      the analysis online.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="6"
                    title={<span className="text-base lg:text-lg">How accurate is the analysis?</span>}
                    startContent={<Icon icon="mdi:chart-line" className="text-success" width={24} />}
                    classNames={{ content: "py-4 lg:py-6" }}
                  >
                    <p className="text-base lg:text-lg text-default-700 leading-relaxed">
                      Our analysis is based on official game demo parsers and has been validated
                      against thousands of professional matches. Accuracy is typically 99%+ for
                      stats and events.
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
              <div className="flex items-center gap-2">
                <Icon icon="mdi:headset" width={20} />
                <span>Support</span>
              </div>
            }
          >
            <div className="flex flex-col gap-8 lg:gap-10">
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-6 lg:p-8 xl:p-10">
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Contact Support</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 lg:p-8 xl:p-10 gap-8">
                  <p className="text-default-700 text-base lg:text-lg leading-relaxed">
                    Need help with your account, a technical issue, or have a question? Our support team is here to help.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Contact Options */}
                    <div className="space-y-6">
                      <h3 className="text-xl lg:text-2xl font-semibold text-[#34445C] dark:text-[#F5F0E1]">Get in Touch</h3>
                      
                      <div className="space-y-4">
                        <a 
                          href="https://discord.gg/leetgaming" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <div className="w-12 h-12 flex items-center justify-center bg-[#5865F2]">
                            <Icon icon="mdi:discord" className="text-white" width={24} />
                          </div>
                          <div>
                            <p className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">Discord Community</p>
                            <p className="text-sm text-default-500">Fastest response - join our server</p>
                          </div>
                        </a>
                        
                        <a 
                          href="mailto:support@leetgaming.pro"
                          className="flex items-center gap-4 p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <div className="w-12 h-12 flex items-center justify-center bg-[#FF4654] dark:bg-[#DCFF37]">
                            <Icon icon="mdi:email" className="text-white dark:text-[#34445C]" width={24} />
                          </div>
                          <div>
                            <p className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">Email Support</p>
                            <p className="text-sm text-default-500">support@leetgaming.pro</p>
                          </div>
                        </a>
                        
                        <a 
                          href="https://twitter.com/leetgamingpro" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <div className="w-12 h-12 flex items-center justify-center bg-black dark:bg-white">
                            <Icon icon="mdi:twitter" className="text-white dark:text-black" width={24} />
                          </div>
                          <div>
                            <p className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">Twitter / X</p>
                            <p className="text-sm text-default-500">@leetgamingpro</p>
                          </div>
                        </a>
                      </div>

                      <div className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 p-6 border-l-4 border-[#FF4654] dark:border-[#DCFF37]">
                        <h4 className="font-semibold text-[#FF4654] dark:text-[#DCFF37] mb-2">Response Times</h4>
                        <ul className="text-sm text-default-700 space-y-1">
                          <li>• Discord: Usually within 1-2 hours</li>
                          <li>• Email: Within 24-48 hours</li>
                          <li>• Pro subscribers get priority support</li>
                        </ul>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                      <h3 className="text-xl lg:text-2xl font-semibold text-[#34445C] dark:text-[#F5F0E1]">Quick Links</h3>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => handleTabChange("faq")}
                          className="w-full flex items-center gap-3 p-4 text-left border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <Icon icon="mdi:help-circle" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />
                          <div>
                            <p className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">FAQ</p>
                            <p className="text-sm text-default-500">Find answers to common questions</p>
                          </div>
                        </button>
                        
                        <button 
                          onClick={() => handleTabChange("getting-started")}
                          className="w-full flex items-center gap-3 p-4 text-left border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <Icon icon="mdi:rocket-launch" className="text-[#FF4654] dark:text-[#DCFF37]" width={24} />
                          <div>
                            <p className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">Getting Started</p>
                            <p className="text-sm text-default-500">Learn the basics of LeetGaming</p>
                          </div>
                        </button>
                        
                        <a 
                          href="/service-status"
                          className="flex items-center gap-3 p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <Icon icon="mdi:server" className="text-success" width={24} />
                          <div>
                            <p className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">Service Status</p>
                            <p className="text-sm text-default-500">Check if services are operational</p>
                          </div>
                        </a>
                        
                        <a 
                          href="/settings"
                          className="flex items-center gap-3 p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <Icon icon="mdi:cog" className="text-default-500" width={24} />
                          <div>
                            <p className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">Account Settings</p>
                            <p className="text-sm text-default-500">Manage your account preferences</p>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Report Issue */}
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="p-6 lg:p-8 xl:p-10">
                  <h3 className="text-xl lg:text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Report an Issue</h3>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 lg:p-8 xl:p-10 gap-4">
                  <p className="text-default-600 mb-4">
                    Found a bug or experiencing a technical problem? Let us know and we&apos;ll look into it.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Subject"
                      placeholder="Brief description of the issue"
                      variant="bordered"
                      classNames={{
                        inputWrapper: "rounded-none",
                      }}
                    />
                    <Input
                      label="Email"
                      placeholder="your@email.com"
                      type="email"
                      variant="bordered"
                      classNames={{
                        inputWrapper: "rounded-none",
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
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-white font-semibold rounded-none"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
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
        <CardBody className="p-8 lg:p-12 xl:p-16 text-center">
          <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
            <Icon icon="mdi:help-circle" className="text-[#F5F0E1] dark:text-[#34445C]" width={32} />
          </div>
          <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold mb-4 text-[#34445C] dark:text-[#F5F0E1]">Need More Help?</h3>
          <p className="text-default-600 mb-6 text-base lg:text-lg max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Join our Discord community or contact support.
          </p>
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
            <Chip
              startContent={<Icon icon="mdi:discord" width={18} />}
              className="cursor-pointer rounded-none bg-[#34445C] text-[#F5F0E1] dark:bg-[#DCFF37] dark:text-[#34445C] px-4 py-2 text-sm lg:text-base hover:scale-105 transition-transform"
            >
              Join Discord
            </Chip>
            <Chip
              startContent={<Icon icon="mdi:email" width={18} />}
              className="cursor-pointer rounded-none border border-[#FF4654]/30 dark:border-[#DCFF37]/30 px-4 py-2 text-sm lg:text-base hover:scale-105 transition-transform"
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
