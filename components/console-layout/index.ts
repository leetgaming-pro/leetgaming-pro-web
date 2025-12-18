/**
 * Console Layout Components Index
 */

// Main layouts
export { default as ConsoleLayout } from "./console";
export { default as SessionConsoleLayout } from "./session-console-layout";

// Sidebar components
export { default as Sidebar } from "./sidebar";
export {
  items,
  sectionItems,
  sectionItemsWithTeams,
  brandItems,
  sectionLongList,
  sectionNestedItems,
} from "./sidebar-items";

// UI components
export { default as NotificationItem } from "./notification-item";
export { default as NotificationsCard } from "./notifications-card";
export { default as TeamAvatar } from "./team-avatar";
export { AcmeLogo } from "./acme";

// Types
export type { IconSvgProps } from "./types";
