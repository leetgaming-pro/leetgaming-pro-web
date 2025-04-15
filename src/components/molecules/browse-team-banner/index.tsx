import Card from "@/components/atoms/card";
import Typography from "@/components/atoms/typography";
import Button from "@/components/atoms/button";
import Image from "next/image";
import TeamBannerImage from "@/components/atoms/team-banner-image";

export default function BrowseTeamBanner() {
  return (
    <Card className="shadow-lg">
      <div className="flex">
        <div className="flex flex-1 flex-col p-8 items-start gap-5">
          <Image src="/logo-fox-mini.png" alt="logo" width={200} height={85} />
          <div className="flex flex-col">
            <Typography className="mb-3" type="h2">Lorem ipsum is simply <br/> dummy text.</Typography>
            <Typography>Lorem Ipsum is simply dummy text of the printing and </Typography>
          </div>
          <Button label="Lorem ipsum" />
        </div>
        <div className="flex-1 flex">
          <TeamBannerImage bg="#262E70" source="/cs-banner-img.png" />
          <TeamBannerImage bg="#FFFFFF" source="/valorant-banner-img.png" />
          <TeamBannerImage bg="#FFCA19" source="/mr-banner-img.png" />
        </div>
      </div>
    </Card>
  );
}
