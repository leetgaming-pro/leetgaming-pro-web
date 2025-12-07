"use client";

import type {Selection} from "@nextui-org/react";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  CardFooter,
  Spacer,
  Divider,
  AvatarGroup,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import UserCell from "./user-cell";

export interface TeamMemberData {
  id: string;
  avatar: string;
  name: string;
  permission: "Owner" | "Can edit" | "Can view";
  isCurrentUser?: boolean;
}

interface InviteMemberCardProps {
  className?: string;
  members?: TeamMemberData[];
  isLoading?: boolean;
  onInvite?: (emails: string[], permission: string) => void;
  onCopyLink?: () => void;
  onGetEmbedCode?: () => void;
}

export default function InviteMemberCard({
  className,
  members = [],
  isLoading = false,
  onInvite,
  onCopyLink,
  onGetEmbedCode,
}: InviteMemberCardProps) {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set(["can-view"]));

  const permissionLabels: Record<string, string> = {
    "can-view": "Can View",
    "can-edit": "Can Edit",
  };

  const userList = React.useMemo(() => {
    if (isLoading) {
      return (
        <div className="mt-2 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-3 py-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-24 rounded-lg" />
                  <Skeleton className="h-3 w-16 rounded-lg" />
                </div>
              </div>
              {i < 2 && <Divider />}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (members.length === 0) {
      return (
        <div className="mt-2 py-4 text-center text-default-400">
          No members yet
        </div>
      );
    }

    return (
      <div className="mt-2 flex flex-col gap-2">
        {members.map((member, index) => (
          <React.Fragment key={member.id}>
            <UserCell
              avatar={member.avatar}
              name={member.isCurrentUser ? `${member.name} (you)` : member.name}
              permission={member.permission}
            />
            {index < members.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>
    );
  }, [members, isLoading]);

  return (
    <Card className={`w-full max-w-[400px] ${className || ''}`}>
      <CardHeader className="justify-center px-6 pb-0 pt-6">
        <div className="flex flex-col items-center">
          {members.length > 0 ? (
            <AvatarGroup isBordered size="sm" max={3}>
              {members.map((member) => (
                <Avatar key={member.id} src={member.avatar} />
              ))}
            </AvatarGroup>
          ) : (
            <div className="h-8" />
          )}
          <Spacer y={2} />
          <h4 className="text-large">Invite Member</h4>
          <p className="text-center text-small text-default-500">
            Invite a new member to your organization.
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex items-end gap-2">
          <Input
            endContent={
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="text-default-500"
                    endContent={
                      <span className="hidden sm:flex">
                        <Icon icon="solar:alt-arrow-down-linear" />
                      </span>
                    }
                    size="sm"
                    variant="light"
                  >
                    {Array.from(selectedKeys)
                      .map((key) => permissionLabels[key])
                      .join(", ")}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={selectedKeys}
                  selectionMode="single"
                  onSelectionChange={setSelectedKeys}
                >
                  <DropdownItem key="can-view">Can view</DropdownItem>
                  <DropdownItem key="can-edit">Can edit</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            }
            label="Email Address"
            labelPlacement="outside"
            placeholder="Email comma separated"
          />
          <Button color="primary" size="md">
            Invite
          </Button>
        </div>
        <Spacer y={4} />
        {userList}
      </CardBody>
      <CardFooter className="justify-end gap-2">
        <Button size="sm" variant="flat" onPress={onCopyLink}>
          Copy Link
        </Button>
        <Button size="sm" variant="flat" onPress={onGetEmbedCode}>
          Get Embed Code
        </Button>
      </CardFooter>
    </Card>
  );
}
