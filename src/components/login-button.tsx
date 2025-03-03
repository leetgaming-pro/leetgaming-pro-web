

import { Button } from '@nextui-org/button'
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@nextui-org/dropdown'
import { MailIcon, SteamIcon } from './icons'
import { logo } from './primitives'
import { signIn } from 'next-auth/react'
import { GoogleIcon } from './signup/social'
import { Link, Spacer } from '@nextui-org/react'
import { DefaultLogoOnlyIcon } from './logo/logo-default-only-icon'
import BattleButton from './filters/ctas/material-button/battle-button';
import { useTheme } from 'next-themes'

export const LoginButton = () => {
  const { theme } = useTheme()
  return (
    <div className="flex relative">
      {/* <Link style={{ borderRadius: "0", borderColor: "none", borderStyle: "solid", borderWidth: "0px", fontWeight: "bold", color: theme === "dark" ? "#f5f0e1" : "#34445C"}} href="/signup">[ + sign-up ]</Link>
      <Spacer x={4} /> */}

      <Link href="/signin" style={{ borderRadius: "0", borderColor: "none", borderStyle: "solid", borderWidth: "0px", fontWeight: "bold", color: theme === "dark" ? "#f5f0e1" : "#34445C"}}>
      <BattleButton style={{ height: "64px", width: "110px", borderRadius: "0", borderColor: "none", borderStyle: "solid", borderWidth: "0px", fontWeight: "bold", color: "#F5F5F5", marginRight: "-25px"}}>
             <strong style={{ fontSize: "18px", letterSpacing: "-3px"}} className={logo({ color: "battleOrange" })}><b><u>&gt;<strong>_</strong></u></b></strong>sign-in
      </BattleButton>
      </Link>
    </div>
  )
}