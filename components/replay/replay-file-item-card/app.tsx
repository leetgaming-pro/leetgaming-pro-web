import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { ReplayFile } from "@/types/replay-api/replay-file";

export interface ReplayFileCardProps extends Partial<ReplayFile> {
  id?: string;
  name?: string;
  className?: string;
  removeWrapper?: boolean;
}

export default function ReplayFileCard(_params: ReplayFileCardProps) {
  return (
    <Card>
      <CardHeader>
        {/* <MapNameHeaderLabel />
        <MapScore />
        <MapNetworkBadge />
        <PlayerMiniAvatar />
        
        <FileQualityRating />
        <FileFavorite />
        <FileMapTypeDefuse />
        <FileToggleDetailsFlipCard /> */}
        de_dust
      </CardHeader>
      <CardBody>
        {/* <FileTopEventBadgesWCounter />

            <FileDurationLabel /> */}
        content
      </CardBody>
      <CardFooter>
        {/* <FileVisibilityDropdown />
        <FileDetails />
        <FileViewsCounter /> */}
        foot
      </CardFooter>
    </Card>
  );
}
