'use client'
import React, { useState } from 'react';
import { Card, Input, Spacer, Snippet, Chip, Tabs, Tab, CardBody, CardHeader, Divider } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { EsportsButton } from '@/components/ui/esports-button';
import { CopyDocumentIcon, SteamIcon } from '@/components/icons';
import { UploadForm } from '@/components/replay/upload/upload';
import { title } from '@/components/primitives';
import { useTheme } from 'next-themes';

const SubmitReplay: React.FC = () => {
  const [replayUrl, setReplayUrl] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
            <Icon icon="solar:cloud-upload-bold" className="text-white dark:text-[#1a1a1a]" width={28} />
          </div>
        </div>
        <h1 className={title({ color: isDark ? "battleLime" : "battleNavy" })}>Upload Replay</h1>
        <p className="text-default-500 mt-2 max-w-md mx-auto">
          Submit your match replays for analysis, highlights, and statistics
        </p>
      </div>

      {/* Tabs */}
      <Tabs 
        aria-label="Upload Options" 
        variant="solid"
        classNames={{
          tabList: "bg-white/90 dark:bg-[#1a1a1a] p-1 rounded-none gap-1 shadow-sm w-full justify-center",
          tab: "text-sm font-semibold rounded-none text-[#34445C] dark:text-white/70 data-[selected=true]:bg-[#34445C] dark:data-[selected=true]:bg-[#DCFF37] data-[selected=true]:text-white dark:data-[selected=true]:text-[#1a1a1a] px-6",
          cursor: "bg-[#34445C] dark:bg-[#DCFF37] rounded-none",
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
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm">
            <CardBody className="p-6 md:p-8">
              <UploadForm />
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
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm">
            <CardBody className="p-6 md:p-8">
              <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#171a21] rounded-none"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                    <SteamIcon width={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#34445C] dark:text-white">Steam Match Share Code</h3>
                    <p className="text-sm text-default-500">Paste the share URL from CS2</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <Input
                    type="text"
                    placeholder="steam://rungame/730/76561202255233023/+csgo_download_match%20CSGO-..."
                    value={replayUrl}
                    onChange={(e) => setReplayUrl(e.target.value)}
                    classNames={{
                      inputWrapper: "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30 bg-default-100 dark:bg-[#111111]",
                    }}
                    startContent={<Icon icon="solar:link-bold" className="text-default-400" width={20} />}
                    endContent={
                      <button type="button" className="hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors">
                        <CopyDocumentIcon />
                      </button>
                    }
                  />
                  <Spacer y={4} />
                  <EsportsButton variant="primary" size="lg" className="w-full" type="submit">
                    <Icon icon="solar:link-bold" width={20} />
                    Link Match
                  </EsportsButton>
                </form>

                <div className="mt-6 p-4 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 rounded-none border-l-2 border-[#FF4654] dark:border-[#DCFF37]">
                  <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">
                    How to get the Share URL
                  </p>
                  <ol className="text-xs text-default-500 space-y-1 list-decimal list-inside">
                    <li>Open CS2 and go to your Match History</li>
                    <li>Click on the match you want to share</li>
                    <li>Click "Copy Share Link"</li>
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
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm">
            <CardBody className="p-6 md:p-8">
              <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                    <Icon icon="solar:command-bold" className="text-white dark:text-[#1a1a1a]" width={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#34445C] dark:text-white">ReplayAPI CLI</h3>
                    <p className="text-sm text-default-500">Upload directly from your terminal</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">Install via NPM</p>
                    <Snippet 
                      size="sm" 
                      symbol="$"
                      classNames={{
                        base: "rounded-none bg-[#1a1a1a] border border-[#34445C]/30 dark:border-[#DCFF37]/30 w-full",
                        pre: "text-[#DCFF37]",
                      }}
                    >
                      npm install -g @replay-api/cli
                    </Snippet>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">Install via Homebrew (macOS)</p>
                    <Snippet 
                      size="sm" 
                      symbol="$"
                      classNames={{
                        base: "rounded-none bg-[#1a1a1a] border border-[#34445C]/30 dark:border-[#DCFF37]/30 w-full",
                        pre: "text-[#DCFF37]",
                      }}
                    >
                      brew install replay-api/tap/replayapi
                    </Snippet>
                  </div>

                  <Divider className="my-4" />

                  <div>
                    <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">Upload Command</p>
                    <Snippet 
                      size="sm" 
                      symbol="$"
                      classNames={{
                        base: "rounded-none bg-[#1a1a1a] border border-[#34445C]/30 dark:border-[#DCFF37]/30 w-full",
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
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm">
            <CardBody className="p-6 md:p-8">
              <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#2496ED] rounded-none"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                    <Icon icon="simple-icons:docker" className="text-white" width={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#34445C] dark:text-white">Docker Container</h3>
                    <p className="text-sm text-default-500">Auto-upload from your demos folder</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">Set your Steam directory</p>
                    <Snippet 
                      size="sm" 
                      symbol="$"
                      classNames={{
                        base: "rounded-none bg-[#1a1a1a] border border-[#34445C]/30 dark:border-[#DCFF37]/30 w-full",
                        pre: "text-[#DCFF37] whitespace-pre-wrap",
                      }}
                    >
                      {`export STEAM_DIR="/path/to/steamapps/common/Counter-Strike Global Offensive/game/csgo"`}
                    </Snippet>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">Run the watcher container</p>
                    <Snippet 
                      size="sm" 
                      symbol="$"
                      classNames={{
                        base: "rounded-none bg-[#1a1a1a] border border-[#34445C]/30 dark:border-[#DCFF37]/30 w-full",
                        pre: "text-[#DCFF37] whitespace-pre-wrap",
                      }}
                    >
                      {`docker run -d -v "$STEAM_DIR:/demos" replayapi/watcher`}
                    </Snippet>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#2496ED]/10 rounded-none border-l-2 border-[#2496ED]">
                  <p className="text-sm text-default-600">
                    <Icon icon="solar:info-circle-bold" className="inline mr-1" width={16} />
                    The watcher will automatically detect and upload new demo files as they appear.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default SubmitReplay;
