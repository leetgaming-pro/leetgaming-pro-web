"use client"
import React from "react";
import {Card, CardBody, Image, Button, Slider} from "@nextui-org/react";

import { useRouter } from 'next/navigation'
import { HeartIcon, NextIcon, PauseCircleIcon, PreviousIcon, RepeatOneIcon, ShuffleIcon } from '@/components/icons';

export default function ReplayDetails() {
  const [liked, setLiked] = React.useState(false);

  const router = useRouter()
  // return <p>Post: {router.query.slug}</p>

  return (
    <Card
      isBlurred
      className="border-none bg-background/60 dark:bg-default-100/50 max-w-[610px]"
      shadow="sm"
    >
      <CardBody>
        <div className=" items-center justify-center">
          <div className="relative">
            <Image
              alt="Radar map of de_inferno"
              className="object-cover"
              height={200}
              shadow="md"
              src="/cs2/radar/de_inferno.webp"
              width="100%"
            />
          </div>

          <div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0">
                <h3 className="font-semibold text-foreground/90">de_inferno</h3>
                <p className="text-small text-foreground/80">37:41</p>
                <h1 className="text-large font-medium mt-2">LGTM Team 13 x 9 FIY Team</h1>
              </div>
              <Button
                isIconOnly
                className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-2 translate-x-2"
                radius="full"
                variant="light"
                onPress={() => setLiked((v) => !v)}
              >
                <HeartIcon
                  className={liked ? "[&>path]:stroke-transparent" : ""}
                  fill={liked ? "currentColor" : "none"} width={undefined} height={undefined}                />
              </Button>
            </div>

            <div className="flex flex-col mt-3 gap-1">
              <Slider
                aria-label="Music progress"
                classNames={{
                  track: "bg-default-500/30",
                  thumb: "w-2 h-2 after:w-2 after:h-2 after:bg-foreground",
                }}
                color="foreground"
                defaultValue={33}
                size="sm"
              />
              <div className="flex justify-between">
                <p className="text-small">1:23</p>
                <p className="text-small text-foreground/50">4:32</p>
              </div>
            </div>

            <div className="flex w-full items-center justify-center">
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
              >
                <RepeatOneIcon className="text-foreground/80" width={undefined} height={undefined} />
              </Button>
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
              >
                <PreviousIcon width={undefined} height={undefined} />
              </Button>
              <Button
                isIconOnly
                className="w-auto h-auto data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
              >
                <PauseCircleIcon size={54} width={undefined} height={undefined} />
              </Button>
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
              >
                <NextIcon width={undefined} height={undefined} />
              </Button>
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
              >
                <ShuffleIcon className="text-foreground/80" width={undefined} height={undefined} />
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
