"use client";

import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tabs,
  Tab,
  ScrollShadow,
  CardFooter,
  Skeleton,
} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import NotificationItem from "./notification-item";

export type NotificationData = {
  id: string;
  isRead?: boolean;
  avatar: string;
  description: string;
  name: string;
  time: string;
  type?: "default" | "request" | "file";
};

enum NotificationTabs {
  All = "all",
  Unread = "unread",
  Archive = "archive",
}

interface NotificationsCardProps {
  className?: string;
  notifications?: {
    all: NotificationData[];
    unread: NotificationData[];
    archive: NotificationData[];
  };
  isLoading?: boolean;
  onMarkAllRead?: () => void;
  onArchiveAll?: () => void;
  onSettings?: () => void;
}

export default function NotificationsCard({
  className,
  notifications = { all: [], unread: [], archive: [] },
  isLoading = false,
  onMarkAllRead,
  onArchiveAll,
  onSettings,
}: NotificationsCardProps) {
  const [activeTab, setActiveTab] = React.useState<NotificationTabs>(NotificationTabs.All);

  const activeNotifications = notifications[activeTab];
  const totalCount = notifications.all.length;
  const unreadCount = notifications.unread.length;

  if (isLoading) {
    return (
      <Card className={`w-full max-w-[420px] ${className || ''}`}>
        <CardHeader className="flex flex-col px-0 pb-0">
          <div className="flex w-full items-center justify-between px-5 py-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </CardHeader>
        <CardBody className="w-full gap-0 p-0">
          <div className="space-y-4 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 rounded-lg" />
                  <Skeleton className="h-3 w-40 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-[420px] ${className || ''}`}>
      <CardHeader className="flex flex-col px-0 pb-0">
        <div className="flex w-full items-center justify-between px-5 py-2">
          <div className="inline-flex items-center gap-1">
            <h4 className="inline-block align-middle text-large font-medium">Notifications</h4>
            {totalCount > 0 && (
              <Chip size="sm" variant="flat">
                {totalCount}
              </Chip>
            )}
          </div>
          <Button
            className="h-8 px-3"
            color="primary"
            radius="full"
            variant="light"
            onPress={onMarkAllRead}
            isDisabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
        <Tabs
          aria-label="Notifications"
          classNames={{
            base: "w-full",
            tabList: "gap-6 px-6 py-0 w-full relative rounded-none border-b border-divider",
            cursor: "w-full",
            tab: "max-w-fit px-2 h-12",
          }}
          color="primary"
          selectedKey={activeTab}
          variant="underlined"
          onSelectionChange={(selected) => setActiveTab(selected as NotificationTabs)}
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center space-x-2">
                <span>All</span>
                {notifications.all.length > 0 && (
                  <Chip size="sm" variant="flat">
                    {notifications.all.length}
                  </Chip>
                )}
              </div>
            }
          />
          <Tab
            key="unread"
            title={
              <div className="flex items-center space-x-2">
                <span>Unread</span>
                {unreadCount > 0 && (
                  <Chip size="sm" variant="flat">
                    {unreadCount}
                  </Chip>
                )}
              </div>
            }
          />
          <Tab key="archive" title="Archive" />
        </Tabs>
      </CardHeader>
      <CardBody className="w-full gap-0 p-0">
        <ScrollShadow className="h-[500px] w-full">
          {activeNotifications?.length > 0 ? (
            activeNotifications.map((notification) => (
              <NotificationItem key={notification.id} {...notification} />
            ))
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <Icon className="text-default-400" icon="solar:bell-off-linear" width={40} />
              <p className="text-small text-default-400">No notifications yet.</p>
            </div>
          )}
        </ScrollShadow>
      </CardBody>
      <CardFooter className="justify-end gap-2 px-4">
        <Button
          variant={activeTab === NotificationTabs.Archive ? "flat" : "light"}
          onPress={onSettings}
        >
          Settings
        </Button>
        {activeTab !== NotificationTabs.Archive && (
          <Button variant="flat" onPress={onArchiveAll}>
            Archive All
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
