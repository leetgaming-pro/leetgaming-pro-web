import Card from "@/components/atoms/card";
import Typography from "@/components/atoms/typography";
import Image from "next/image";
import {Link} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import React from "react";
import ApplyNowButton from "@/components/players/player-form/apply-now-button";

export interface IContentCard {
  img?: string;
}

export default function ContentCard({img}: IContentCard) {
  return (
    <Card>
      <Image src="/squad-avatar.png" alt="Squad" className="w-full" width={300} height={150} />
      <div className="flex flex-col p-4">
        <Typography type="h5">Headline</Typography>
        <Typography type="p" size="body">Subhead</Typography>
        <Typography variant="light" type="p" size="bodySmall">Explain more about the topic shown in the headline and subhead through supporting text.</Typography>

        <div className="flex justify-between mt-6 items-center">
          <div className="flex gap-4">
            <Link isExternal href="#">
              <Icon className="text-default-400" icon="bi:twitter" width={20} />
            </Link>
            <Link isExternal href="#">
              <Icon className="text-default-400" icon="bi:linkedin" width={20} />
            </Link>
            <Link isExternal href="#">
              <Icon className="text-default-400" icon="bi:github" width={20} />
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center">
              <Typography variant="light" size="caption">99+</Typography>
              <Icon className="text-default-400" icon="mdi:users" width={20} />
            </div>
            <ApplyNowButton />
          </div>
        </div>
      </div>
    </Card>
  );
}
