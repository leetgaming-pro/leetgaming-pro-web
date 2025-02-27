import React from "react";
import { Icon } from "@iconify/react";
import { cl } from "../../cl";
import TimelineWinnerCard, { getColor } from './winner-card';
import { RoundData } from './types';
import { logo, subtitle } from "@/components/primitives";
import { electrolize, sairaCondensed, sixCaps } from "@/config/fonts";

interface MatchTimelineProps {
  rounds: RoundData[]
  style?: React.CSSProperties
  className?: string
}

export default function MatchTimelineHorizontalSmall(props: MatchTimelineProps) {
  const { rounds } = props

  const getConditionalCard = (round: RoundData, side: string) => {
    const borderLocation = round.winner === "ct" ? "borderTop" : "borderBottom"
    const color = getColor(round)
    const borderWidth = "4px"

    if (round.winner === side) {
      return (<TimelineWinnerCard roundData={round} />)
    }

    return (<div className={"flex items-center justify-center w-full h-7"} style={{
      // borderColor: color,
      [`${borderLocation}Color`]: color,
      [`${borderLocation}Width`]: borderWidth,
      [`${borderLocation}Style`]: "solid",
    }} ></div>)
  }

  return (
    <div className={`relative w-full overflow-x-auto ${electrolize.className}`} {...props}>
      <div className="flex w-full py-2">
        <div className="flex w-full">
          {rounds.map((round, index: number) => (
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
                    }}>{(index + 1) % 5 === 0 && index + 1}</span> {/* Display the round number */}
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