'use client';

import { Link } from '@nextui-org/react'
import { EsportsButton } from './ui/esports-button'

export const LoginButton = () => {
  return (
    <div className="flex items-center">
      <Link href="/signin">
        <EsportsButton variant="primary" size="nav">
          <span className="text-[#FF4654] dark:text-[#34445C] font-bold">&gt;_</span>
          <span>sign-in</span>
        </EsportsButton>
      </Link>
    </div>
  )
}