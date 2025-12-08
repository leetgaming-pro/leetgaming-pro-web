'use client';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@nextui-org/dropdown';
import { Avatar, Badge, Link, Chip } from '@nextui-org/react';
import { EsportsButton } from './ui/esports-button';
import { useSession, signOut } from 'next-auth/react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';

export default function SessionButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const userImage = session?.user?.image || undefined;
  const userName = session?.user?.name || 'Player';
  const userEmail = session?.user?.email || '';

  // Get initials for avatar fallback
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 h-full">
      {/* Quick Actions - Full height buttons */}
      <Link href="/match-making" className="hidden md:flex items-center h-full">
        <EsportsButton
          variant="matchmaking"
          size="nav"
          className="h-full"
        >
          <Icon icon="solar:gamepad-bold" width={18} />
          Play
        </EsportsButton>
      </Link>

      {/* User Dropdown - Edgy borders (no rounded) */}
      <Dropdown placement="bottom-end" backdrop="blur" classNames={{ content: "rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20" }}>
        <DropdownTrigger>
          <button className="flex items-center gap-2 outline-none transition-transform hover:scale-105 focus:ring-2 focus:ring-primary/50">
            <Badge
              content=""
              color="success"
              shape="rectangle"
              placement="bottom-right"
              size="sm"
              isInvisible={false}
              classNames={{ badge: "rounded-none" }}
            >
              {/* Edgy avatar container - diagonal cut instead of circle */}
              <div 
                className="relative w-9 h-9 overflow-hidden border-2 border-[#FF4654] dark:border-[#DCFF37] transition-all hover:border-[#FFC700] dark:hover:border-[#DCFF37]"
                style={{ 
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
                }}
              >
                <Avatar
                  as="span"
                  className="transition-transform w-full h-full rounded-none"
                  name={initials}
                  size="sm"
                  src={userImage}
                  radius="none"
                />
              </div>
            </Badge>
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="User menu"
          variant="faded"
          classNames={{
            base: "rounded-none",
            list: "gap-1",
          }}
          itemClasses={{
            base: [
              "rounded-none",
              "data-[hover=true]:bg-gradient-to-r data-[hover=true]:from-[#FF4654]/10 data-[hover=true]:to-[#FFC700]/5",
              "dark:data-[hover=true]:from-[#DCFF37]/10 dark:data-[hover=true]:to-transparent",
              "data-[hover=true]:border-l-2 data-[hover=true]:border-[#FF4654] dark:data-[hover=true]:border-[#DCFF37]",
              "transition-all duration-200",
            ].join(" "),
          }}
          onAction={(key) => {
            if (key === 'logout') {
              signOut();
            } else if (key !== 'profile-header') {
              router.push(key as string);
            }
          }}
        >
          <DropdownSection showDivider>
            <DropdownItem
              key="profile-header"
              className="h-14 gap-2 opacity-100"
              isReadOnly
              textValue={userName}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  name={initials}
                  size="sm"
                  src={userImage}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-default-500">{userEmail}</p>
                </div>
              </div>
            </DropdownItem>
          </DropdownSection>

          <DropdownSection title="Quick Actions" showDivider>
            <DropdownItem
              key="/match-making"
              startContent={<Icon icon="solar:gamepad-bold" className="text-success" width={20} />}
              endContent={<Chip size="sm" color="success" variant="flat">Live</Chip>}
              description="Find a match now"
            >
              Play Now
            </DropdownItem>
            <DropdownItem
              key="/upload"
              startContent={<Icon icon="solar:cloud-upload-bold" className="text-primary" width={20} />}
              description="Upload replay files"
            >
              Upload Replay
            </DropdownItem>
            <DropdownItem
              key="/cloud"
              startContent={<Icon icon="solar:cloud-bold" className="text-secondary" width={20} />}
              description="Access your cloud storage"
            >
              Cloud Dashboard
            </DropdownItem>
          </DropdownSection>

          <DropdownSection title="Profile" showDivider>
            <DropdownItem
              key="/players/me"
              startContent={<Icon icon="solar:user-bold" width={20} />}
              description="View your player profile"
            >
              My Profile
            </DropdownItem>
            <DropdownItem
              key="/replays"
              startContent={<Icon icon="solar:videocamera-record-bold" width={20} />}
              description="View your saved replays"
            >
              My Replays
            </DropdownItem>
            <DropdownItem
              key="/analytics"
              startContent={<Icon icon="solar:chart-2-bold" width={20} />}
              description="Performance analytics"
            >
              Analytics
            </DropdownItem>
            <DropdownItem
              key="/teams"
              startContent={<Icon icon="solar:users-group-two-rounded-bold" width={20} />}
              description="Manage your teams"
            >
              My Teams
            </DropdownItem>
          </DropdownSection>

          <DropdownSection title="Account" showDivider>
            <DropdownItem
              key="/checkout"
              startContent={<Icon icon="solar:crown-bold" className="text-warning" width={20} />}
              endContent={<Chip size="sm" color="warning" variant="flat">Pro</Chip>}
              description="Upgrade your subscription"
            >
              Subscription
            </DropdownItem>
            <DropdownItem
              key="/wallet"
              startContent={<Icon icon="solar:wallet-bold" width={20} />}
              description="Manage your wallet"
            >
              Wallet
            </DropdownItem>
            <DropdownItem
              key="/settings?tab=billing"
              startContent={<Icon icon="solar:card-bold" width={20} />}
              description="Payment methods & history"
            >
              Billing
            </DropdownItem>
          </DropdownSection>

          <DropdownSection title="Settings">
            <DropdownItem
              key="/settings"
              startContent={<Icon icon="solar:settings-bold" width={20} />}
              description="App preferences"
            >
              Settings
            </DropdownItem>
            <DropdownItem
              key="/settings?tab=privacy"
              startContent={<Icon icon="solar:shield-check-bold" width={20} />}
              description="Privacy & data controls"
            >
              Privacy & Data
            </DropdownItem>
            <DropdownItem
              key="/settings?tab=security"
              startContent={<Icon icon="solar:lock-bold" width={20} />}
              description="Security & MFA"
            >
              Security
            </DropdownItem>
            <DropdownItem
              key="logout"
              className="text-danger"
              color="danger"
              startContent={<Icon icon="solar:logout-2-bold" width={20} />}
              description="Sign out of your account"
            >
              Log Out
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
