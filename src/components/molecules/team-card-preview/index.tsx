import Card from "@/components/atoms/card";
import Typography from "@/components/atoms/typography";
import Avatar from "@/components/atoms/avatar";
import {Icon} from "@iconify/react";

export default function TeamCardPreview() {
  return (
    <Card variant="outlined">
      <div className="flex p-6 justify-between">
        <div className="flex gap-6 items-center">
          <Avatar src="/vlrntlogo.png" />
          <div>
            <Typography type="h3">Furia</Typography>
            <Typography variant="light">Counter-Strike 2</Typography>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Typography>12</Typography>
          <Icon width={24} height={24} icon="mdi:users" className="text-default-400" />
        </div>
      </div>
    </Card>
  );
}
