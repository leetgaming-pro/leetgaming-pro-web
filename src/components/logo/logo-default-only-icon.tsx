import { GameIconsCrownedSkull, GameIconsCrownedSkullForecolor, GameIconsCrownedSkullSmall } from './icons/crowned-skull';
import { SVGProps } from 'react';

export function DefaultLogoOnlyIcon(props: SVGProps<SVGSVGElement>) {
  return (
  <div style={{ display: "inline-block", verticalAlign: "middle" }}><GameIconsCrownedSkull {...props}/> </div>
  )
}

export function DefaultLogoOnlyIconSmall(props: SVGProps<SVGSVGElement>) {
  return (
  <div style={{ display: "inline-block", verticalAlign: "middle" }}><GameIconsCrownedSkullSmall {...props}/> </div>
  )
}

export function DefaultLogoOnlyIconForecolor(props: SVGProps<SVGSVGElement>) {
  return (
  <div style={{ display: "inline-block", verticalAlign: "middle" }}><GameIconsCrownedSkullForecolor {...props}/> </div>
  )
}