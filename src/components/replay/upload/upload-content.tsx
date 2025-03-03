/* eslint-disable react/no-unescaped-entities */
// pages/submit-replay.tsx
'use client'
import React, { useState } from 'react';
import { Card, Input, Button, Spacer, Snippet, Chip, Tabs, Tab, CardBody, CardHeader, LinkIcon, Divider } from '@nextui-org/react';
import { CopyDocumentIcon, SteamIcon } from '@/components/icons';
import { UploadForm } from '@/components/replay/upload/upload';
import { logo, subtitle, title } from '@/components/primitives';
import axios, { AxiosRequestConfig } from 'axios';

const SubmitReplay: React.FC = () => {
  const [replayUrl, setReplayUrl] = useState('');

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   // Handle form submission (e.g., send the URL to the server)
  //   console.log('Submitted URL:', replayUrl);
  // };

  return (
    <div className="flex w-full align-center justify-center">
      <Tabs aria-label="Options" isVertical={false} className="w-full">

        <Tab key="url" title="URL">
          <Spacer y={1} />
          <Divider />
          <Spacer y={4} />
          <Input
            type="text"
            // label="Enter match replay URL"
            placeholder="steam://rungame/730/76561202255233023/+csgo_download_match%20CSGO-..."
            labelPlacement="outside"
            description="Enter the URL of the match replay you want to submit."
            endContent={<CopyDocumentIcon />}
            startContent={<SteamIcon width={36} />}
          />
          <Spacer y={2} />

        </Tab>

        <Tab key="upload" title="Upload">
          <Spacer y={1} />
          <Divider />
          <Spacer y={4} />
          <UploadForm />
        </Tab>

        <Tab key="cli" title="CLI">
          <Card className="w-full max-w-md p-12">
            <CardHeader>
              <p><h1><span className={title({ color: "blue" })}>CLI</span></h1></p>
              <Spacer y={2} />
              <br />
              <p>
                <h1><span className={subtitle()}>Using  <Chip
                  // startContent={<SteamIcon size={18} />}
                  variant="dot"
                  color="danger"
                  endContent={<LinkIcon />}

                >
                  <span className={logo({ color: "pink" })}>Replay<strong>API</strong></span>
                </Chip> command line interface
                  {/*<Chip
              variant="shadow"
              classNames={{
                base: "bg-gradient-to-br from-red-500 to-violet-500 border-small border-white/50 shadow-red-500/30",
                content: "drop-shadow shadow-black text-white",
              }}

              style={{ fontSize: "0.6rem", margin: "0.0rem 0.2rem", height: "0.9rem", maxWidth: "0.2rem"}}
            >
             <strong>Official ReplayAPI SDK <span className={logo({color: "pink"})}> beta</span></strong>
              
            </Chip>
            */}
                </span>       </h1>
              </p>
            </CardHeader>
            <CardBody>
              <div>
                <Divider />
                <Spacer y={4} />
                NPM:
                <Snippet size="sm" color="primary">npm install -g @replay-api/replay-api</Snippet>
                <Spacer y={6} />
                Brew (Mac/OS):
                <Snippet size="sm" color="primary">npm install -g @replay-api/replay-api</Snippet>
              </div>
            </CardBody>
          </Card>

        </Tab>
        <Tab key="docker" title="Docker">
          <Card className="w-full max-w-md p-12">
            <CardHeader>
              <p><h1><span className={title({ color: "blue" })}>Docker</span></h1></p>
              <Spacer y={2} />
              <br />
              <p>
                <h1><span className={subtitle()}>
                </span>       </h1>
              </p>
            </CardHeader>
            <CardBody>
              <Divider />
              <Spacer y={4} />
              <Spacer y={2} />
              <Snippet size="sm" color="primary" variant="bordered">export STEAM_DIR="C:\..."</Snippet>
              <Spacer y={10} />
              <Snippet size="sm" color="primary" variant="solid">docker run -v $STEAM_DIR:/dem_files</Snippet>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>

  );
};

export default SubmitReplay;
