'use client';

import { logo } from './primitives'
import { Link } from '@nextui-org/react'
import BattleButton from './filters/ctas/material-button/battle-button'

export const LoginButton = () => {
  return (
    <div className="flex items-center">
      <Link href="/signin">
        <BattleButton className="h-9 px-4 text-sm font-semibold rounded-lg">
          <span className={logo({ color: "battleOrange" })}>
            <b>&gt;_</b>
          </span>
          <span className="ml-1">sign-in</span>
        </BattleButton>
      </Link>
    </div>
  )
}