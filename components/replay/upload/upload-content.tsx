/* eslint-disable react/no-unescaped-entities */
// pages/submit-replay.tsx
'use client'
import React, { useState } from 'react';
import { Card, Input, Spacer, Snippet, Chip, Tabs, Tab, CardBody, CardHeader, Divider } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { CopyDocumentIcon, SteamIcon } from '@/components/icons';
import { UploadForm } from '@/components/replay/upload/upload';
import { logo, title } from '@/components/primitives';

const SubmitReplay: React.FC = () => {
  const [replayUrl, setReplayUrl] = useState('');

  return (
    <div className="flex w-full align-center justify-center">
      <Tabs 
        aria-label="Options" 
        isVertical={false} 
        className="w-full"
        classNames={{
          tabList: "bg-[#F5F0E1]/90 dark:bg-[#1a1a1a] p-1 rounded-none gap-1",
          tab: "text-sm font-semibold rounded-none text-[#34445C] dark:text-[#F5F0E1]/70 data-[selected=true]:bg-[#34445C] dark:data-[selected=true]:bg-[#DCFF37] data-[selected=true]:text-[#F5F0E1] dark:data-[selected=true]:text-[#1a1a1a]",
          cursor: "bg-[#34445C] dark:bg-[#DCFF37] rounded-none",
          panel: "pt-4",
        }}
      >
        <Tab key="url" title={
          <div className="flex items-center gap-2">
            <Icon icon="solar:link-bold" width={16} />
            <span>URL</span>
          </div>
        }>
          <Spacer y={1} />
          <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
          <Spacer y={4} />
          <Input
            type="text"
            placeholder="steam://rungame/730/76561202255233023/+csgo_download_match%20CSGO-..."
            labelPlacement="outside"
            description="Enter the URL of the match replay you want to submit."
            classNames={{
              inputWrapper: "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30 bg-[#F5F0E1] dark:bg-[#111111]",
            }}
            endContent={<CopyDocumentIcon className="text-[#34445C] dark:text-[#DCFF37]" />}
            startContent={<SteamIcon width={36} className="text-[#34445C] dark:text-[#F5F0E1]" />}
          />
          <Spacer y={2} />
        </Tab>

        <Tab key="upload" title={
          <div className="flex items-center gap-2">
            <Icon icon="solar:cloud-upload-bold" width={16} />
            <span>Upload</span>
          </div>
        }>
          <Spacer y={1} />
          <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
          <Spacer y={4} />
          <UploadForm />
        </Tab>

        <Tab key="cli" title={
          <div className="flex items-center gap-2">
            <Icon icon="solar:command-bold" width={16} />
            <span>CLI</span>
          </div>
        }>
          <Card className="w-full max-w-md p-6 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#F5F0E1]/50 dark:bg-[#0a0a0a]/50">
            <CardHeader className="flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <div className="leet-icon-box leet-icon-box-md">
                  <Icon icon="solar:command-bold" width={20} />
                </div>
                <div>
                  <h3 className={title({ color: "battleNavy", size: "sm" })}>CLI</h3>
                </div>
              </div>
              <p className="text-sm text-default-500">
                Using <Chip
                  variant="flat"
                  size="sm"
                  classNames={{
                    base: "bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 rounded-none",
                    content: "text-[#FF4654] dark:text-[#DCFF37] font-semibold",
                  }}
                >
                  <span className={logo({ color: "battleOrange" })}>Replay<strong>API</strong></span>
                </Chip> command line interface
              </p>
            </CardHeader>
            <CardBody>
              <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
              <Spacer y={4} />
              <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">NPM:</p>
              <Snippet 
                size="sm" 
                symbol="$"
                classNames={{
                  base: "rounded-none bg-[#1a1a1a] border border-[#34445C]/30 dark:border-[#DCFF37]/30 w-full",
                  pre: "text-[#DCFF37]",
                }}
              >
                npm install -g @replay-api/replay-api
              </Snippet>
              <Spacer y={4} />
              <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">Brew (macOS):</p>
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
            </CardBody>
          </Card>
        </Tab>

        <Tab key="docker" title={
          <div className="flex items-center gap-2">
            <Icon icon="simple-icons:docker" width={16} />
            <span>Docker</span>
          </div>
        }>
          <Card className="w-full max-w-md p-6 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#F5F0E1]/50 dark:bg-[#0a0a0a]/50">
            <CardHeader className="flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-[#2496ED] rounded-none"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                  <Icon icon="simple-icons:docker" className="text-white" width={24} />
                </div>
                <div>
                  <h3 className={title({ color: "battleNavy", size: "sm" })}>Docker</h3>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
              <Spacer y={4} />
              <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">Set Steam Directory:</p>
              <Snippet 
                size="sm" 
                symbol="$"
                classNames={{
                  base: "rounded-none bg-[#1a1a1a] border border-[#34445C]/30 dark:border-[#DCFF37]/30 w-full",
                  pre: "text-[#DCFF37]",
                }}
              >
                export STEAM_DIR="C:\..."
              </Snippet>
              <Spacer y={4} />
              <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">Run Container:</p>
              <Snippet 
                size="sm" 
                symbol="$"
                classNames={{
                  base: "rounded-none bg-[#1a1a1a] border border-[#34445C]/30 dark:border-[#DCFF37]/30 w-full",
                  pre: "text-[#DCFF37]",
                }}
              >
                docker run -v $STEAM_DIR:/dem_files
              </Snippet>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default SubmitReplay;
