import { TimelineWinnerCardProps } from './types'
import  { DefaultLogoOnlyIconForecolor } from '@/components/logo/logo-default-only-icon';
import { logo } from '@/components/primitives';
import { cl } from '../../cl';
 

export const getColor = (round: any) => {
  if (round.winner === "ct") {
    return "rgba(155, 210, 255, 1)"
  }

  return "rgba(255, 210, 155, 1)"
}

export default function TimelineWinnerCard({ roundData }: TimelineWinnerCardProps) {
  const radiusTarget = roundData.winner === "ct" ? "Top" : "Bottom" // TODO: handle shifting sides + separators
  const gradientString = roundData.winner === "ct" ? "linear-gradient(to top, rgba(155, 210, 255, 0.33), transparent)" : "linear-gradient(to bottom, rgba(255, 210, 155, 0.33), transparent)"

  const contentColor = getColor(roundData)

  // from-[#00b7fa] to-[#01cfea]
  const iconColor = roundData.winner === "ct" ? "rgba(165, 220, 255, 1)" : "hsl(var(--nextui-warning-600))" 

  // TODO: round-icons must match win reason (defuse, timeout, etc)
  const RoundIcon = () => {
    if (roundData.keyEvents.some(e => e.includes('Clutch'))) {
      // todo: retrieve events from replay-api
      // return <></>
      return (<DefaultLogoOnlyIconForecolor fill={iconColor} />)
    }

    return (<div style={{color: contentColor, width: "24px" }}></div>)
  }

  return (
    <div 
    className={cl(
      "flex items-center justify-center",
    )}

      style={{
        // [`border${radiusTarget}RightRadius`]: "12px",
        // [`border${radiusTarget}LeftRadius`]: "12px",
        [`border${radiusTarget}Style`]: "solid",
        [`border${radiusTarget}Width`]: "0px",
        [`border${radiusTarget}Color`]: "#ccc",
        background: gradientString,
      }}
  >
     <span className="h-6 text-small">

     <RoundIcon />

     </span>
  </div>
  )
}