"use client";

import React, { useState } from "react";
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
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";

export default function DocsPage() {
  const [selectedCategory, setSelectedCategory] = useState("getting-started");

  return (
    <div className="flex w-full flex-col items-center gap-8 px-4 py-8 lg:px-24">
      {/* Header */}
      <div className="flex w-full max-w-6xl flex-col items-center text-center gap-2">
        <h2 className="text-secondary font-medium">Knowledge Base</h2>
        <h1 className={title({ size: "lg" })}>Documentation</h1>
        <p className={subtitle({ class: "mt-2 max-w-2xl" })}>
          Everything you need to know about using LeetGaming PRO for competitive gaming and replay
          analysis.
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl">
        <Tabs
          selectedKey={selectedCategory}
          onSelectionChange={(key) => setSelectedCategory(key as string)}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full flex-wrap",
            cursor: "bg-primary",
            tab: "h-12",
            panel: "pt-6",
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
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader className="p-6">
                  <h2 className="text-2xl font-bold">Welcome to LeetGaming PRO</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 gap-4">
                  <p className="text-default-700">
                    LeetGaming PRO is a comprehensive platform for competitive gamers to analyze
                    replays, track performance, and improve their skills.
                  </p>

                  <h3 className="text-xl font-semibold mt-4">Quick Start Guide</h3>
                  <ol className="list-decimal list-inside space-y-2 text-default-700">
                    <li>Create an account or sign in with Steam/Google</li>
                    <li>Upload your first replay via the Upload page</li>
                    <li>Wait for processing (usually takes 2-5 minutes)</li>
                    <li>View detailed analysis including stats, heatmaps, and round breakdowns</li>
                    <li>Share replays with your team or keep them private</li>
                  </ol>

                  <div className="bg-primary-50 p-4 rounded-lg mt-4">
                    <div className="flex items-start gap-3">
                      <Icon icon="mdi:lightbulb" className="text-primary text-2xl flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-primary mb-1">Pro Tip</p>
                        <p className="text-sm text-default-700">
                          Enable automatic upload by installing our CLI tool. This way, all your
                          matches are automatically uploaded and analyzed.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="p-6">
                  <h3 className="text-xl font-bold">System Requirements</h3>
                </CardHeader>
                <Divider />
                <CardBody className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Supported Games</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <Icon icon="mdi:check" className="text-success" />
                          Counter-Strike 2
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon icon="mdi:check" className="text-success" />
                          CS:GO
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon icon="mdi:check" className="text-success" />
                          Valorant
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">File Formats</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <Icon icon="mdi:file" className="text-default-500" />
                          .dem (CS2, CS:GO)
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon icon="mdi:file" className="text-default-500" />
                          .rofl (Valorant)
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon icon="mdi:file" className="text-default-500" />
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
            <Card>
              <CardHeader className="p-6">
                <h2 className="text-2xl font-bold">Uploading Replays</h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-6">
                <Accordion variant="splitted">
                  <AccordionItem
                    key="1"
                    aria-label="Web Upload"
                    title="Web Upload"
                    startContent={<Icon icon="mdi:web" className="text-primary" />}
                  >
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Navigate to the Upload page</li>
                      <li>Drag and drop your replay file or click to browse</li>
                      <li>Add optional metadata (map, team names, etc.)</li>
                      <li>Click Upload and wait for processing</li>
                    </ol>
                    <p className="text-xs text-default-500 mt-2">
                      Max file size: 500MB. Supported formats: .dem, .rofl
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="2"
                    aria-label="Steam URL"
                    title="Steam Share URL"
                    startContent={<Icon icon="mdi:steam" className="text-primary" />}
                  >
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Copy the Steam share URL from your CS2/CS:GO match</li>
                      <li>Paste it into the URL tab on the Upload page</li>
                      <li>Click Import</li>
                      <li>We&apos;ll fetch and process the replay automatically</li>
                    </ol>
                    <div className="mt-3">
                      <Snippet symbol="" className="text-xs">
                        steam://rungame/730/76561202255233023/+csgo_download_match%20...
                      </Snippet>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    key="3"
                    aria-label="CLI Tool"
                    title="CLI Tool (Auto-Upload)"
                    startContent={<Icon icon="mdi:console" className="text-primary" />}
                  >
                    <p className="text-sm mb-3">
                      Install our CLI tool for automatic replay uploads:
                    </p>
                    <Snippet symbol="$" className="mb-3">
                      npm install -g @leetgaming/cli
                    </Snippet>
                    <Snippet symbol="$" className="mb-3">
                      leetgaming auth login
                    </Snippet>
                    <Snippet symbol="$">leetgaming watch --game cs2</Snippet>
                    <p className="text-xs text-default-500 mt-3">
                      The CLI will monitor your game directory and auto-upload new replays.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="4"
                    aria-label="Analysis Features"
                    title="What Gets Analyzed?"
                    startContent={<Icon icon="mdi:chart-box" className="text-success" />}
                  >
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5" />
                        <span>Player statistics (K/D/A, ADR, HS%, economy)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5" />
                        <span>Round-by-round breakdown with timelines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5" />
                        <span>Heatmaps for positioning and deaths</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5" />
                        <span>Economy management tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5" />
                        <span>Weapon performance analytics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon icon="mdi:check-circle" className="text-success mt-0.5" />
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
            <Card>
              <CardHeader className="p-6">
                <h2 className="text-2xl font-bold">API Documentation</h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-6 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                  <p className="text-sm text-default-600 mb-3">
                    All API requests require an API key. Generate one from your account settings.
                  </p>
                  <Snippet symbol="" className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </Snippet>
                </div>

                <Divider />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Common Endpoints</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-success pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip size="sm" color="success" variant="flat">
                          GET
                        </Chip>
                        <Code>/api/replays</Code>
                      </div>
                      <p className="text-sm text-default-600">List all replays</p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip size="sm" color="primary" variant="flat">
                          POST
                        </Chip>
                        <Code>/api/upload/replay</Code>
                      </div>
                      <p className="text-sm text-default-600">Upload a new replay</p>
                    </div>

                    <div className="border-l-4 border-success pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip size="sm" color="success" variant="flat">
                          GET
                        </Chip>
                        <Code>/api/replays/:id</Code>
                      </div>
                      <p className="text-sm text-default-600">Get replay details</p>
                    </div>

                    <div className="border-l-4 border-success pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip size="sm" color="success" variant="flat">
                          GET
                        </Chip>
                        <Code>/api/search/profiles</Code>
                      </div>
                      <p className="text-sm text-default-600">Search player profiles</p>
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Example: Upload Replay</h3>
                  <Snippet symbol="" hideSymbol className="text-xs overflow-x-auto">
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
            <Card>
              <CardHeader className="p-6">
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-6">
                <Accordion variant="splitted">
                  <AccordionItem
                    key="1"
                    title="How long does replay processing take?"
                    startContent={<Icon icon="mdi:clock" className="text-primary" />}
                  >
                    <p className="text-sm text-default-700">
                      Most replays are processed within 2-5 minutes. Larger files or high-traffic
                      periods may take up to 10 minutes. You&apos;ll receive a notification when
                      processing is complete.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="2"
                    title="Can I share replays with my team?"
                    startContent={<Icon icon="mdi:share-variant" className="text-primary" />}
                  >
                    <p className="text-sm text-default-700">
                      Yes! You can set replays to Private, Shared (team only), or Public. Team
                      members can view and analyze shared replays together.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="3"
                    title="What's the storage limit?"
                    startContent={<Icon icon="mdi:database" className="text-primary" />}
                  >
                    <p className="text-sm text-default-700">
                      Free tier: 50 replays / 5GB storage. Pro tier: Unlimited replays and
                      storage. Check the Pricing page for details.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="4"
                    title="How do I delete a replay?"
                    startContent={<Icon icon="mdi:delete" className="text-danger" />}
                  >
                    <p className="text-sm text-default-700">
                      Navigate to Cloud Dashboard, find the replay, click the options menu (...),
                      and select Delete. This action is permanent.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="5"
                    title="Can I download the original replay file?"
                    startContent={<Icon icon="mdi:download" className="text-primary" />}
                  >
                    <p className="text-sm text-default-700">
                      Yes, Pro users can download original replay files. Free users can only view
                      the analysis online.
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    key="6"
                    title="How accurate is the analysis?"
                    startContent={<Icon icon="mdi:chart-line" className="text-success" />}
                  >
                    <p className="text-sm text-default-700">
                      Our analysis is based on official game demo parsers and has been validated
                      against thousands of professional matches. Accuracy is typically 99%+ for
                      stats and events.
                    </p>
                  </AccordionItem>
                </Accordion>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>

      {/* Help Card */}
      <Card className="w-full max-w-6xl bg-gradient-to-r from-primary-50 to-secondary-50">
        <CardBody className="p-8 text-center">
          <Icon icon="mdi:help-circle" className="text-4xl mx-auto mb-3 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Need More Help?</h3>
          <p className="text-default-600 mb-4">
            Can&apos;t find what you&apos;re looking for? Join our Discord community or contact support.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Chip
              startContent={<Icon icon="mdi:discord" />}
              color="primary"
              variant="flat"
              className="cursor-pointer"
            >
              Join Discord
            </Chip>
            <Chip
              startContent={<Icon icon="mdi:email" />}
              color="secondary"
              variant="flat"
              className="cursor-pointer"
            >
              Contact Support
            </Chip>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
