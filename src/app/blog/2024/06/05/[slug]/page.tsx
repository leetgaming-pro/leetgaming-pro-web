import React from 'react';
import { Spacer, Avatar, Card, Link, Image, CardBody } from '@nextui-org/react';
import { logo } from '@/components/primitives';

export default function BlogPostPage() {
  return (
    <div className="basis-1/5 sm:basis-full justify-center">
      <div className="gap-3 max-w-fit">
        <Card>
          <CardBody className="py-10">
            <h2 className="mb-5" style={{ textAlign: 'center'}}>Elevating Esports Performance</h2>

            {/* Founder's Avatar and Details */}
            <Spacer y={1} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Avatar isBordered radius="sm" src="https://avatars.githubusercontent.com/u/3760203" />
              <div>
              <strong className={logo({ color: "blue" })}>@sound</strong>
                <em className="font-medium">(Former Player, Founder of ReplayAPI and CTO at LeetGaming.Pro)</em>
              </div>
            </div>
            <Spacer y={2} />

            {/* Main Content */}
            <span className="font-medium">Leverage your game-sense and get to clutch in the international stage. Give your pragmatic player mind a more precise feedback.</span>
            <span className="font-medium">
              Assess your performance & impact on decisions, shift over different granularities of ingame contexts, such as a specific timeframe of a round, match, teams/players or even tournaments and past historic data.
            </span>

            {/* Image Break */}
            <Image
              src="/cs2/radar/de_inferno.webp" 
              alt="Esports Team"
              className='mt-5'
              style={{ borderRadius: '$lg' }}
            />
            <Spacer y={2} />

            <span className="font-medium">
              Range from a, ingame, single player&apos;s trajetory or decision, to rounds, matches, teams/players, with a setup of scope/dimension/query of your choice, having (but not limited to*) pre-configured and fine-tailored views and metrics catalog. *Not limited to it, you can create your own workspace or draft a strategy.
            </span>
            <span className="font-medium">
              Present yourself and your team with expert battle reports and discover the real impact on chained actions and outcomes of strategies you didn&apos;t notice, moves that are repeatedly punished, and exactly how and when your team&apos;s execution are being (and will be) hijacked with clear and replayable ingame events progression.
            </span>

            <span className="font-medium">
              Spread the professional e-sports culture and embrace the power of teamwork: Unleash the art of expressing your mind through the progression of building a talented, creative play. Both, you and I, know what it means to apply flash decision making within a critical timeframe, and how it is to own a clutch situation with unpredictable mastery.
            </span>
          </CardBody>
        </Card>
      </div>

      {/* (Optional) Related Content, Social Sharing, etc. */}
    </div>
  );
}
