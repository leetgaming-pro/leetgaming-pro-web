import React from "react";
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Chip, Spacer, Badge,   BreadcrumbItem,
  Breadcrumbs, CheckboxIcon, Code, Switch, LinkIcon, Snippet } from "@nextui-org/react";
import { UserIcon } from "@/components/icons";
import { GameIconsLaurelCrown } from "@/components/logo/icons/laurel-crown";
import { useTheme } from "next-themes";
import LogTable from "./action-log-table";
import MatchHeader from "../matchcard/mini-match-summary-table";

import { PlayerRoundStats } from "./mockdata";

export const ViewPayerInfoCard = () => {
  const [isWatching, setIsWatching] = React.useState(false);
  const { theme } = useTheme()

  const [value, setValue] = React.useState(60); // State to track value

  const getColor = (v: any) => {
    if (v < 33) return "danger";
    if (v < 66) return "warning";
    return "success";
  };

  // TODO: colocar HP, utilities, wpn, kit/etc
  // TODO: overlay de "clutch" ou "eco" ou "fullbuy" etc
  // TODO: overlay de "1v3" ou "1v4" etc
  // TODO: overlay de dmg recebido / crimson transparent cover
  // TODO: colocar overlay de role (conforme contexto atual)**** (ie: lurking, entry, support, etc)
  // TODO: colocar overlay de redes, comunidades e opts (add, invite, etc)
  return (
    <Card shadow="none" className="max-w-[400px] border-none bg-transparent relative">
      <CardHeader className="justify-between" style={{
        backgroundImage: "url('/1337gg/arena.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: theme === 'dark' ? "#333" : "#F2F2F2",
        backgroundBlendMode: "overlay",
        overflow: "clip",
      }}>
        
        <div className={theme === "dark" ? "profileBackdropContentDark flex gap-3 pl-2" : "profileBackdropContent flex gap-3 pl-2"}>
          <Badge content={"LXG"} style={{ border: "1px solid #DCFF37", borderRadius: "5px", color: "#DCFF37", backgroundColor: "#34445C", fontSize: "10px", fontWeight: "bold" }} size="sm" placement="bottom-right">
            <Avatar isBordered radius="sm" src="https://avatars.githubusercontent.com/u/29843116?v=4" />
          </Badge>
          <div className="flex flex-col items-start justify-center w-32">
            <h4 className="text-medium font-semibold leading-none text-default-600">sound</h4>
            <h5 className="text-small tracking-tight text-default-500"></h5>
          </div>
        </div>
        <div className="grid pl-6">
          {/* <Button radius="sm" size="sm" variant="solid" className={theme === 'dark' ? "viewProfileHighlightsButtonDark" : "viewProfileHighlightsButton"}>Highlights<span className="text-small tracking-tight text-default-500" style={{ fontFamily: "Courier New", fontSize: "11px" }}>(1.5K)</span></Button>
          <Spacer x={1} /> */}
          <Button startContent={<GameIconsLaurelCrown className="sm" width={24} height={24} />} radius="sm" size="sm" variant="solid" className={theme === 'dark' ? "viewProfileHighlightsButtonDark" : "viewProfileHighlightsButton"}>View Highlight</Button>
          <Spacer x={1} />
          {/* <Button
            className={!isWatching ? "bg-transparent text-foreground border-default-200" : "bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 text-white"}
            startContent={!isWatching ? <AddStarIcon className="sm" width={18} height={18} /> : <StarredIcon className="sm" width={18} height={18} />}
            radius="sm"
            size="sm"
            color="danger"
            variant={!isWatching ? "ghost" : "faded"}
            onPress={() => setIsWatching(!isWatching)}
          >
            {!isWatching ? "Star" : "Starred"}<span style={{ fontFamily: "Courier New", fontSize: "11px" }}>(3)</span>
          </Button>
          <Spacer x={1} /> */}
          <Button style={{
            color: theme === 'dark' ? "#DCFF37" : "#34445C",
          }} radius="sm" size="sm" variant="faded" startContent={<UserIcon size={20} width={20} height={20}/>}>View Profile</Button>
          <Spacer x={1} /> 
          {/* <Button color="danger" radius="sm" size="sm" variant="light" startContent={<HeartIcon />}>Sponsor<span className="text-small tracking-tight text-default-500" style={{ fontFamily: "Courier New", fontSize: "11px" }}>(0)</span></Button>
          <Spacer x={1} /> */}
        </div>
      </CardHeader>
      
      <CardBody className="px-0 py-0 flex w-full">
      {/* <div className="flex gap-1">
          <p className="font-semibold text-default-600 text-small">2</p>
          <p className="text-default-500 text-small">Networks</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-default-600 text-small">512</p>
          <p className=" text-default-500 text-small">Demos</p>
        </div>
      <div className="flex gap-1">
          <p className="font-semibold text-default-600 text-small">119</p>
          <p className="text-default-500 text-small">Clutches</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-default-600 text-small">37</p>
          <p className="text-default-500 text-small">Aces</p>
        </div> */}
        <MatchHeader showScores={false} />
      </CardBody>
      <CardFooter className="gap-3">
      <Breadcrumbs className="pt-0">
            {/* <BreadcrumbItem>Match</BreadcrumbItem> */}
            <BreadcrumbItem><small>CT</small></BreadcrumbItem>
            <BreadcrumbItem><small>Round 5</small></BreadcrumbItem>
            {/* <BreadcrumbItem>@sound</BreadcrumbItem> */}
            <BreadcrumbItem>
            <Chip variant="faded"><small>Clutch Situation</small></Chip>
            </BreadcrumbItem>
            <BreadcrumbItem className="text-small sm"><Chip variant="dot" className="sm" color="danger"><small>1 vs 3</small></Chip></BreadcrumbItem>
            <BreadcrumbItem>
              <LogTable />
            </BreadcrumbItem>
          </Breadcrumbs>

         {/* Triangular Button */}
         <Button 
          className="absolute bottom-0 right-0 z-10 h-16 bg-white/20 text-white dark:bg-black/20 drop-shadow shadow-black"  // Position at bottom right
          radius="none"
          variant="ghost"
          
          style={{
            border: "0px solid #DCFF37",
            // backgroundColor: "#34445C",
            clipPath: "polygon(100% 0, 0 100%, 100% 100%)", // Triangle shape
            paddingRight: "7px",
            paddingBottom: "10px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            fontSize: "11px",
            color: theme === 'dark' ? "#DCFF37" : "#34445C",
          }}
        >
          <div className="flex"><LinkIcon/>View</div>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ViewPayerInfoCard