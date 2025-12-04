import React, { useState } from "react";
import TimelineWinnerCard, { getColor } from './winner-card';
import { RoundData } from './types';
import { electrolize } from "@/config/fonts";
import { MapViewModeType, CSFilters } from "@/types/replay-api/searchable";
import { fetchRoundData } from "@/app/api/search/rounds";
// import { ReplayPageProps } from "@/app/match/[matchid]/round/[roundnumber]/page";

interface MatchTimelineData {
  rounds: RoundData[]
}

export default async function MatchTimelineHorizontalFull(props: any) {
  const [viewModes, setViewModes] = useState<MapViewModeType[]>([MapViewModeType.MapHeatmapLayer]);
  // Removed mock timeline data; expects real roundData from API

  const roundData: any | undefined = await fetchRoundData(props.filter)

  const getConditionalCard = (round: RoundData, side: string) => {
    const borderPrefix = round.winner === "ct" ? "borderTop" : "borderBottom"
    const color = getColor(round)
    const borderWidth = "4px"

    if (round.winner === side) {
      return (<TimelineWinnerCard roundData={round} />)
    }

    return (<div className={"flex items-center justify-center w-full h-7"} style={{
      // borderColor: color,
      [`${borderPrefix}Color`]: color,
      [`${borderPrefix}Width`]: borderWidth,
      [`${borderPrefix}Style`]: "solid",
    }} ></div>)
  }

  return (
    <div className={`relative w-full overflow-x-auto ${electrolize.className}`} {...props}>
      <div className="flex w-full py-2">
        <div className="flex w-full">
          {[roundData!].map((round: RoundData, index: number) => (
            <React.Fragment key={index}> {/* Added Fragment to wrap multiple elements */}
              <div className={`flex flex-col w-6 mx-0.1rem pr-[0.1rem] ${electrolize.className}`}>
                {getConditionalCard(round, "ct")}
                {getConditionalCard(round, "t")}
              </div>
              <div className={`absolute pt-4 mx-0.1rem pr-[0.1rem] pl-${index+1 >= 10 ? "0" : "1"}`}>
                {(
                  <div className="[text-shadow:_0_1px_2px_rgb(0_0_0_/_75%)]">
                    <span className={electrolize.className} style={{
                      fontSize: "1.2rem",
                      color: getColor(round),
                      marginLeft: `${((index) * 24)}px`,
                    }}></span> {/* Display the round number */}
                  </div>
                )}

              </div>

            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}