import React from "react";
import { Avatar, Card, CardHeader, Badge } from "@nextui-org/react";
import { useTheme } from "next-themes";

export const ViewMiniPayerInfoCard = ({ nickname, avatar, clantag }: { nickname: string, avatar: string, clantag: string } & { showHighlightsButton: boolean}) => {
  const { theme } = useTheme()

  return (
    <Card shadow="none" className="border-none bg-transparent relative h-[72px] w-[240px]">
      <CardHeader className="justify-between py-0 px-0" style={{
        // backgroundImage: "url('/1337gg/arena.png')", // TODO: parametrizar com BG do player ou do team (PRO feature)
        // backgroundSize: "cover",
        // backgroundPosition: "center",
        // backgroundRepeat: "no-repeat",
        // backgroundColor: theme === 'dark' ? "#333" : "#F2F2F2",
        // backgroundBlendMode: "overlay",
        // overflow: "clip",
      }}>
        <div className={theme === "dark" ? "profileBackdropContentDark flex gap-3 pl-2" : "profileBackdropContent flex gap-3 pl-2"}>
          <Badge content={clantag} style={{ border: "1px solid #DCFF37", borderRadius: "5px", color: "#DCFF37", backgroundColor: "#34445C", fontSize: "10px", fontWeight: "bold" }} size="sm" placement="bottom-right">
            <Avatar isBordered radius="sm" src={avatar} />
          </Badge>
          <div className="flex flex-col items-start justify-center">
            <h4 className="text-medium font-semibold leading-none text-default-600">{nickname}</h4>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ViewMiniPayerInfoCard