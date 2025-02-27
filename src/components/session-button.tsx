'use client';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@nextui-org/dropdown';
import { Button, Link, Spacer, User } from '@nextui-org/react';
import {
  DeleteDocumentIcon,
  LogOutIcon,
  Logo,
  PlusIcon,
  PowerButtonIcon,
  UserIcon,
} from './icons';
import { logo } from './primitives';
import { button as buttonStyles } from '@nextui-org/theme';
import { useSession, signIn, signOut } from 'next-auth/react';
import { VerticalDotsIcon } from '@/components/files/replays-table/VerticalDotsIcon';
import BattleButton from './filters/ctas/battle-button/battle-button';
import { useTheme } from 'next-themes';
import { Icon } from '@iconify/react';

export default function SessionButton() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  const proButton = process.env.FEATURE_PRO_BUTTON;

  return (
    <div className='flex relative'>
      <Link
        href='/home5'
        style={{
          borderRadius: '0',
          borderColor: 'none',
          borderStyle: 'solid',
          borderWidth: '0px',
          fontWeight: 'bold',
          color: theme === 'dark' ? '#f5f0e1' : '#34445C',
        }}
      >
         
          <BattleButton
            endContent={
              <VerticalDotsIcon width={undefined} height={undefined} />
            }
            style={{
              height: '64px',
              width: '128px',
              borderRadius: '0',
              borderColor: 'none',
              borderStyle: 'solid',
              borderWidth: '0px',
              fontWeight: 'bold',
              color: '#F5F5F5',
            }}
          >
            <strong
              style={{ fontSize: '18px', letterSpacing: '-3px' }}
              className={logo({ color: 'battleOrange' })}
            >
              <b>
                <u>
                  &gt;<strong>_</strong>
                </u>
              </b>
            </strong>
            <span style={{ color: theme === 'dark' ? '#f5f0e1' : '#34445C' }}>
              PRO
            </span>
          </BattleButton>
        
      </Link>

      {/* <Link href="/home5" style={{ borderRadius: "0", borderColor: "none", borderStyle: "solid", borderWidth: "0px", fontWeight: "bold" }}>
        <BattleButton variant="light" disableRipple endContent={<VerticalDotsIcon width={undefined} height={undefined} />}>PRO</BattleButton>
      </Link>
      <Spacer x={4} />
      <BattleButton variant="light" disableRipple endContent={<PowerButtonIcon />} onClick={() => signOut()}>Logout</BattleButton> */}

      {/* <Link style={{ borderRadius: "0", borderColor: "none", borderStyle: "solid", borderWidth: "0px", fontWeight: "bold", color: theme === "dark" ? "#f5f0e1" : "#34445C"}} href="/home5">[ console ]</Link>
      <Spacer x={4} /> */}

      <Spacer x={4} />
      <Link
        style={{
          cursor: 'pointer',
          borderRadius: '0',
          borderColor: 'none',
          borderStyle: 'solid',
          borderWidth: '0px',
          fontWeight: 'bold',
          color: theme === 'dark' ? '#f5f0e1' : '#34445C',
        }}
        onClick={() => signOut()}
      >
        / sign-out
      </Link>
    </div>
  );
}
