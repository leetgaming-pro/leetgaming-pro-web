'use client'; // Make sure to enable Client Components for next/link

import {
  Image,
  Button,
  Spacer,
  Divider,
  Card,
  Link,
} from "@nextui-org/react";
import DefaultLogo from '@/components/logo/logo-default';
import { title, subtitle, logo } from "@/components/primitives";
import BattleButton from "@/components/filters/ctas/battle-button/battle-button";

export default function Home() {
  return (
    <div className="flex w-full flex-col align-center justify-center gap-12">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          placeItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <div className="flex flex-col items-start justify-center">
          {/* <DefaultLogo /> */}
          <Spacer y={2} />
          <h1 className={title()}>

            
          <span className={title({ color: "green" })}>Stop Guessing.</span> <span className={title({ color: "cyan" })}>Start Winning.</span>
          </h1>
          <h3 className={subtitle()}>
          Don&apos;t just dream of victory, engineer it.
          </h3>
          <Spacer y={2} />
          <p style={{ lineHeight: "$md" }}>
            <span className={logo()}>LeetGaming.PRO</span> gives you the tools to <strong>outthink</strong> and <strong>outplay</strong> the competition.
          </p>
          <Spacer y={4} />
          <BattleButton
            // className="bg-gradient-to-tr from-blue-500 to-cyan-500 text-white shadow-lg"
            // as={Link}
            href="/sign-up"
          >
            Get Started
          </BattleButton>
        </div>

        <Card className="w-full max-w-md p-0">
          <Image
            src="/1337gg/dark_smoke_ct.png" //crowd_arena.png
            alt="Gameplay Screenshot"
            // objectFit="cover"
            className="rounded-lg h-full w-auto"
            style={{ overflow: "hidden", objectFit: "cover", maxHeight: "512px"}}
          />
        </Card>
      </div>
      <Divider />
      <div
        style={{
          display: "grid",
          placeItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        {/* ... additional sections ... */}

       

      </div>
    </div>
  );
}
