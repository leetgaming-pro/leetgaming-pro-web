export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  logoName: 'LeetGaming.PRO',
  name: 'LeetGaming PRO',
  description: 'Competitive gaming platform with matchmaking, tournaments, and analytics',
  navItems: [
    {
      label: 'HOME',
      href: '/',
      icon: 'solar:home-2-bold',
    },
    {
      label: 'PLAY',
      href: '/match-making',
      icon: 'solar:gamepad-bold',
      highlight: true, // Primary CTA
    },
    {
      label: 'TEAMS',
      href: '/teams',
      icon: 'solar:users-group-two-rounded-bold',
    },
    {
      label: 'PLAYERS',
      href: '/players',
      icon: 'solar:user-bold',
    },
    {
      label: 'TOURNAMENTS',
      href: '/tournaments',
      icon: 'solar:cup-star-bold',
    },
    {
      label: 'CLOUD',
      href: '/cloud',
      icon: 'solar:cloud-bold',
    },
  ],
  navMenuItems: [
    {
      label: 'Home',
      href: '/',
      icon: 'solar:home-2-bold',
    },
    {
      label: 'Play Now',
      href: '/match-making',
      icon: 'solar:gamepad-bold',
      highlight: true,
    },
    {
      label: 'Teams',
      href: '/teams',
      icon: 'solar:users-group-two-rounded-bold',
    },
    {
      label: 'Players',
      href: '/players',
      icon: 'solar:user-bold',
    },
    {
      label: 'Tournaments',
      href: '/tournaments',
      icon: 'solar:cup-star-bold',
    },
    {
      label: 'Leaderboards',
      href: '/leaderboards',
      icon: 'solar:ranking-bold',
    },
    {
      label: 'Cloud Storage',
      href: '/cloud',
      icon: 'solar:cloud-bold',
    },
    {
      label: 'My Replays',
      href: '/replays',
      icon: 'solar:videocamera-record-bold',
    },
    {
      label: 'Upload',
      href: '/upload',
      icon: 'solar:cloud-upload-bold',
    },
    {
      label: 'divider',
      href: '',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: 'solar:settings-bold',
    },
    {
      label: 'Subscription',
      href: '/checkout',
      icon: 'solar:crown-bold',
    },
    {
      label: 'Help & Feedback',
      href: '/help',
      icon: 'solar:question-circle-bold',
    },
  ],
  links: {
    github: 'https://github.com/leetgaming-pro',
    twitter: 'https://twitter.com/leetgamingpro',
    tech: 'https://dev.leetgaming.pro',
    discord: 'https://discord.gg/leetgaming',
    sponsor: 'https://patreon.com/leetgaming',
  },
};
