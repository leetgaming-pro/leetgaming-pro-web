"use client";

/**
 * Upload Page - Professional Replay Upload with Esports Branding
 * Upload replays with award-winning UX matching LobbiesShowcase style
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Chip,
  Input,
  Snippet,
  Tabs,
  Tab,
  CardBody,
  Divider,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { LazyMotion, domAnimation, m, useMotionValue, useTransform, animate } from "framer-motion";
import clsx from "clsx";
import { Orbitron } from "next/font/google";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { EsportsButton } from "@/components/ui/esports-button";
import { CopyDocumentIcon, SteamIcon } from "@/components/icons";
import { EnhancedUploadForm } from "@/components/replay/upload/enhanced-upload";

const orbitron = Orbitron({ weight: ["400", "700", "900"], subsets: ["latin"] });

// Animated counter component
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value, count, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => setDisplayValue(latest));
    return unsubscribe;
  }, [rounded]);

  return <span>{displayValue}</span>;
}

// Upload indicator with animation
function UploadPulse({ className }: { className?: string }) {
  return (
    <span className={clsx("relative flex h-2 w-2", className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DCFF37] opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DCFF37]" />
    </span>
  );
}

export default function UploadPage() {
  const [replayUrl, setReplayUrl] = useState("");
  const { theme } = useTheme();
  const router = useRouter();
  const [stats] = useState({ totalUploads: 12847, processingRate: 99.2, avgTime: 45 });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleBrowseAll = () => {
    router.push("/matches");
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className={clsx(
        "relative w-full min-h-screen overflow-hidden",
        "bg-gradient-to-b from-background via-background/95 to-background"
      )}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                               linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Glowing orbs */}
          <m.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            className="absolute top-20 left-1/4 w-96 h-96 bg-[#DCFF37]/10 rounded-full blur-[120px]"
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <m.div
            animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
            className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#FF4654]/10 rounded-full blur-[100px]"
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative container mx-auto px-6 py-12 lg:py-20">
          {/* Section Header */}
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            {/* Upload indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <UploadPulse />
              <span className={clsx(
                "text-xs font-bold uppercase tracking-[0.3em]",
                theme === "dark" ? "text-[#DCFF37]" : "text-[#FF4654]",
                orbitron.className
              )}>
                Replay Upload
              </span>
            </div>

            {/* Main title */}
            <h1 className={clsx(
              "text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4",
              orbitron.className
            )}>
              <span className="text-foreground">Upload Your </span>
              <span className={clsx(
                "bg-clip-text text-transparent",
                theme === "dark"
                  ? "bg-gradient-to-r from-[#DCFF37] via-[#FFC700] to-[#FF4654]"
                  : "bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37]"
              )}>
                Replay
              </span>
            </h1>

            <p className="text-lg text-default-500 max-w-2xl mx-auto mb-6">
              Submit your match replays for instant analysis, highlights, and detailed statistics.
              Multiple upload methods available.
            </p>

            {/* Feature chips */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <Chip
                size="sm"
                variant="flat"
                className={clsx(
                  theme === "dark"
                    ? "bg-[#DCFF37]/10 text-[#DCFF37]"
                    : "bg-[#FF4654]/10 text-[#FF4654]"
                )}
              >
                <Icon icon="solar:shield-check-bold" width={14} className="mr-1" />
                Free for all
              </Chip>
              <Chip
                size="sm"
                variant="flat"
                className="bg-[#FFC700]/10 text-[#FFC700]"
              >
                <Icon icon="solar:bolt-bold" width={14} className="mr-1" />
                No login required
              </Chip>
              <Chip
                size="sm"
                variant="flat"
                className={clsx(
                  theme === "dark"
                    ? "bg-[#DCFF37]/10 text-[#DCFF37]"
                    : "bg-[#34445C]/10 text-[#34445C]"
                )}
              >
                <Icon icon="solar:clock-circle-bold" width={14} className="mr-1" />
                Instant processing
              </Chip>
            </div>

            {/* Stats Bar */}
            <m.div
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-8 px-8 py-4 rounded-none border border-default-200/30 bg-default-100/30 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="text-center">
                <div className={clsx(
                  "text-2xl font-black",
                  theme === "dark" ? "text-[#DCFF37]" : "text-[#FF4654]",
                  orbitron.className
                )}>
                  <AnimatedCounter value={stats.totalUploads} />+
                </div>
                <div className="text-xs text-default-400 uppercase tracking-wider">Total Uploads</div>
              </div>
              <div className="w-px h-10 bg-default-200/50" />
              <div className="text-center">
                <div className={clsx("text-2xl font-black text-[#FFC700]", orbitron.className)}>
                  <AnimatedCounter value={stats.processingRate} />%
                </div>
                <div className="text-xs text-default-400 uppercase tracking-wider">Success Rate</div>
              </div>
              <div className="w-px h-10 bg-default-200/50" />
              <div className="text-center">
                <div className={clsx(
                  "text-2xl font-black",
                  theme === "dark" ? "text-[#DCFF37]" : "text-[#FF4654]",
                  orbitron.className
                )}>
                  ~<AnimatedCounter value={stats.avgTime} />s
                </div>
                <div className="text-xs text-default-400 uppercase tracking-wider">Avg Process Time</div>
              </div>
            </m.div>
          </m.div>

          {/* Upload Tabs */}
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Tabs
              aria-label="Upload Options"
              variant="solid"
              classNames={{
                tabList: clsx(
                  "p-1 gap-1 shadow-sm w-full justify-center rounded-none",
                  theme === "dark" 
                    ? "bg-[#1a1a1a] border border-[#DCFF37]/20" 
                    : "bg-white/90 border border-[#FF4654]/20"
                ),
                tab: clsx(
                  "text-sm font-semibold rounded-none px-6",
                  theme === "dark"
                    ? "text-white/70 data-[selected=true]:bg-[#DCFF37] data-[selected=true]:text-[#1a1a1a]"
                    : "text-[#34445C] data-[selected=true]:bg-[#FF4654] data-[selected=true]:text-white"
                ),
                cursor: clsx(
                  "rounded-none",
                  theme === "dark" ? "bg-[#DCFF37]" : "bg-[#FF4654]"
                ),
                panel: "pt-6",
              }}
            >
              <Tab
                key="upload"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:cloud-upload-bold" width={18} />
                    <span>Upload File</span>
                  </div>
                }
              >
                <Card className={clsx(
                  "rounded-none border backdrop-blur-sm",
                  theme === "dark"
                    ? "border-[#DCFF37]/20 bg-[#0a0a0a]/50"
                    : "border-[#FF4654]/20 bg-white/50"
                )}>
                  <CardBody className="p-6 md:p-8">
                    <EnhancedUploadForm />
                  </CardBody>
                </Card>
              </Tab>

              <Tab
                key="url"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:link-bold" width={18} />
                    <span>Steam URL</span>
                  </div>
                }
              >
                <Card className={clsx(
                  "rounded-none border backdrop-blur-sm",
                  theme === "dark"
                    ? "border-[#DCFF37]/20 bg-[#0a0a0a]/50"
                    : "border-[#FF4654]/20 bg-white/50"
                )}>
                  <CardBody className="p-6 md:p-8">
                    <div className="max-w-lg mx-auto">
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className="w-12 h-12 flex items-center justify-center bg-[#171a21] rounded-none"
                          style={{
                            clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                          }}
                        >
                          <SteamIcon width={28} className="text-white" />
                        </div>
                        <div>
                          <h3 className={clsx(
                            "font-semibold",
                            theme === "dark" ? "text-white" : "text-[#34445C]"
                          )}>
                            Steam Match Share Code
                          </h3>
                          <p className="text-sm text-default-500">
                            Paste the share URL from CS2
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <Input
                          type="text"
                          placeholder="steam://rungame/730/76561202255233023/+csgo_download_match%20CSGO-..."
                          value={replayUrl}
                          onChange={(e) => setReplayUrl(e.target.value)}
                          classNames={{
                            inputWrapper: clsx(
                              "rounded-none bg-default-100",
                              theme === "dark"
                                ? "border-[#DCFF37]/30 dark:bg-[#111111]"
                                : "border-[#34445C]/30"
                            ),
                          }}
                          startContent={
                            <Icon
                              icon="solar:link-bold"
                              className="text-default-400"
                              width={20}
                            />
                          }
                          endContent={
                            <button
                              type="button"
                              className={clsx(
                                "transition-colors",
                                theme === "dark" ? "hover:text-[#DCFF37]" : "hover:text-[#FF4654]"
                              )}
                            >
                              <CopyDocumentIcon />
                            </button>
                          }
                        />
                        <div className="mt-4">
                          <EsportsButton
                            variant="primary"
                            size="lg"
                            className="w-full"
                            type="submit"
                          >
                            <Icon icon="solar:link-bold" width={20} />
                            Link Match
                          </EsportsButton>
                        </div>
                      </form>

                      <div className={clsx(
                        "mt-6 p-4 rounded-none border-l-2",
                        theme === "dark"
                          ? "bg-[#DCFF37]/5 border-[#DCFF37]"
                          : "bg-[#34445C]/5 border-[#FF4654]"
                      )}>
                        <p className={clsx(
                          "text-sm font-semibold mb-2",
                          theme === "dark" ? "text-[#DCFF37]" : "text-[#34445C]"
                        )}>
                          How to get the Share URL
                        </p>
                        <ol className="text-xs text-default-500 space-y-1 list-decimal list-inside">
                          <li>Open CS2 and go to your Match History</li>
                          <li>Click on the match you want to share</li>
                          <li>Click &ldquo;Copy Share Link&rdquo;</li>
                          <li>Paste the link above</li>
                        </ol>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Tab>

              <Tab
                key="cli"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:command-bold" width={18} />
                    <span>CLI</span>
                  </div>
                }
              >
                <Card className={clsx(
                  "rounded-none border backdrop-blur-sm",
                  theme === "dark"
                    ? "border-[#DCFF37]/20 bg-[#0a0a0a]/50"
                    : "border-[#FF4654]/20 bg-white/50"
                )}>
                  <CardBody className="p-6 md:p-8">
                    <div className="max-w-lg mx-auto">
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={clsx(
                            "w-12 h-12 flex items-center justify-center rounded-none",
                            theme === "dark"
                              ? "bg-gradient-to-br from-[#DCFF37] to-[#34445C]"
                              : "bg-gradient-to-br from-[#FF4654] to-[#FFC700]"
                          )}
                          style={{
                            clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                          }}
                        >
                          <Icon
                            icon="solar:command-bold"
                            className={theme === "dark" ? "text-[#1a1a1a]" : "text-white"}
                            width={24}
                          />
                        </div>
                        <div>
                          <h3 className={clsx(
                            "font-semibold",
                            theme === "dark" ? "text-white" : "text-[#34445C]"
                          )}>
                            ReplayAPI CLI
                          </h3>
                          <p className="text-sm text-default-500">
                            Upload directly from your terminal
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className={clsx(
                            "text-sm font-semibold mb-2",
                            theme === "dark" ? "text-[#DCFF37]" : "text-[#34445C]"
                          )}>
                            Install via NPM
                          </p>
                          <Snippet
                            size="sm"
                            symbol="$"
                            classNames={{
                              base: clsx(
                                "rounded-none bg-[#1a1a1a] w-full",
                                theme === "dark"
                                  ? "border border-[#DCFF37]/30"
                                  : "border border-[#34445C]/30"
                              ),
                              pre: "text-[#DCFF37]",
                            }}
                          >
                            npm install -g @replay-api/cli
                          </Snippet>
                        </div>

                        <div>
                          <p className={clsx(
                            "text-sm font-semibold mb-2",
                            theme === "dark" ? "text-[#DCFF37]" : "text-[#34445C]"
                          )}>
                            Install via Homebrew (macOS)
                          </p>
                          <Snippet
                            size="sm"
                            symbol="$"
                            classNames={{
                              base: clsx(
                                "rounded-none bg-[#1a1a1a] w-full",
                                theme === "dark"
                                  ? "border border-[#DCFF37]/30"
                                  : "border border-[#34445C]/30"
                              ),
                              pre: "text-[#DCFF37]",
                            }}
                          >
                            brew install replay-api/tap/replayapi
                          </Snippet>
                        </div>

                        <Divider className="my-4" />

                        <div>
                          <p className={clsx(
                            "text-sm font-semibold mb-2",
                            theme === "dark" ? "text-[#DCFF37]" : "text-[#34445C]"
                          )}>
                            Upload Command
                          </p>
                          <Snippet
                            size="sm"
                            symbol="$"
                            classNames={{
                              base: clsx(
                                "rounded-none bg-[#1a1a1a] w-full",
                                theme === "dark"
                                  ? "border border-[#DCFF37]/30"
                                  : "border border-[#34445C]/30"
                              ),
                              pre: "text-[#DCFF37]",
                            }}
                          >
                            replayapi upload ./match.dem
                          </Snippet>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Tab>

              <Tab
                key="docker"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="simple-icons:docker" width={18} />
                    <span>Docker</span>
                  </div>
                }
              >
                <Card className={clsx(
                  "rounded-none border backdrop-blur-sm",
                  theme === "dark"
                    ? "border-[#DCFF37]/20 bg-[#0a0a0a]/50"
                    : "border-[#FF4654]/20 bg-white/50"
                )}>
                  <CardBody className="p-6 md:p-8">
                    <div className="max-w-lg mx-auto">
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className="w-12 h-12 flex items-center justify-center bg-[#2496ED] rounded-none"
                          style={{
                            clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                          }}
                        >
                          <Icon
                            icon="simple-icons:docker"
                            className="text-white"
                            width={24}
                          />
                        </div>
                        <div>
                          <h3 className={clsx(
                            "font-semibold",
                            theme === "dark" ? "text-white" : "text-[#34445C]"
                          )}>
                            Docker Container
                          </h3>
                          <p className="text-sm text-default-500">
                            Auto-upload from your demos folder
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className={clsx(
                            "text-sm font-semibold mb-2",
                            theme === "dark" ? "text-[#DCFF37]" : "text-[#34445C]"
                          )}>
                            Set your Steam directory
                          </p>
                          <Snippet
                            size="sm"
                            symbol="$"
                            classNames={{
                              base: clsx(
                                "rounded-none bg-[#1a1a1a] w-full",
                                theme === "dark"
                                  ? "border border-[#DCFF37]/30"
                                  : "border border-[#34445C]/30"
                              ),
                              pre: "text-[#DCFF37] whitespace-pre-wrap",
                            }}
                          >
                            {`export STEAM_DIR="/path/to/steamapps/common/Counter-Strike Global Offensive/game/csgo"`}
                          </Snippet>
                        </div>

                        <div>
                          <p className={clsx(
                            "text-sm font-semibold mb-2",
                            theme === "dark" ? "text-[#DCFF37]" : "text-[#34445C]"
                          )}>
                            Run the watcher container
                          </p>
                          <Snippet
                            size="sm"
                            symbol="$"
                            classNames={{
                              base: clsx(
                                "rounded-none bg-[#1a1a1a] w-full",
                                theme === "dark"
                                  ? "border border-[#DCFF37]/30"
                                  : "border border-[#34445C]/30"
                              ),
                              pre: "text-[#DCFF37] whitespace-pre-wrap",
                            }}
                          >
                            {`docker run -d -v "$STEAM_DIR:/demos" replayapi/watcher`}
                          </Snippet>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-[#2496ED]/10 rounded-none border-l-2 border-[#2496ED]">
                        <p className="text-sm text-default-600">
                          <Icon
                            icon="solar:info-circle-bold"
                            className="inline mr-1"
                            width={16}
                          />
                          The watcher will automatically detect and upload new demo files as they appear.
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </m.div>

          {/* Action Buttons */}
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              className={clsx(
                "h-14 px-10 text-base font-black uppercase tracking-wider",
                orbitron.className
              )}
              color="primary"
              endContent={<Icon icon="solar:list-check-bold" width={22} />}
              radius="none"
              size="lg"
              style={{
                backgroundColor: theme === "dark" ? "#DCFF37" : "#FF4654",
                color: theme === "dark" ? "#0a0a0a" : "#ffffff",
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
              }}
              onPress={handleBrowseAll}
            >
              Browse All Matches
            </Button>
            <Button
              className={clsx(
                "h-14 px-10 text-base font-bold uppercase tracking-wider border-2",
                orbitron.className
              )}
              endContent={<Icon icon="solar:home-2-bold" width={22} />}
              radius="none"
              size="lg"
              variant="bordered"
              onPress={() => router.push("/")}
            >
              Back to Home
            </Button>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
