"use client";

import React from "react";
import {Card, CardHeader, CardBody, Button, Avatar, Tabs, Tab, Chip, Skeleton} from "@nextui-org/react";

export interface UserProfileDefaultData {
  avatar?: string;
  name: string;
  username: string;
  bio?: string;
  tags?: string[];
  following: number;
  followers: number;
}

interface UserProfileDefaultProps {
  user?: UserProfileDefaultData;
  isLoading?: boolean;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export default function UserProfileDefault({
  user,
  isLoading = false,
  isOwnProfile = false,
  onEditProfile,
}: UserProfileDefaultProps) {
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-start justify-center overflow-scroll">
        <Card className="my-10 w-[400px]">
          <CardHeader className="relative flex h-[100px] flex-col justify-end overflow-visible bg-gradient-to-br from-amber-300 via-purple-300 to-indigo-400">
            <Skeleton className="h-20 w-20 translate-y-12 rounded-full" />
          </CardHeader>
          <CardBody>
            <div className="pb-4 pt-6">
              <Skeleton className="h-6 w-32 rounded-lg mb-2" />
              <Skeleton className="h-4 w-24 rounded-lg mb-2" />
              <div className="flex gap-2 pb-1 pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg mt-2" />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full w-full items-start justify-center overflow-scroll">
        <Card className="my-10 w-[400px]">
          <CardBody className="flex items-center justify-center py-8">
            <p className="text-default-500">User profile not found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-start justify-center overflow-scroll">
      <Card className="my-10 w-[400px]">
        <CardHeader className="relative flex h-[100px] flex-col justify-end overflow-visible bg-gradient-to-br from-amber-300 via-purple-300 to-indigo-400">
          <Avatar
            className="h-20 w-20 translate-y-12"
            src={user.avatar}
            showFallback
          />
          {isOwnProfile && (
            <Button
              className="absolute right-3 top-3 bg-white/20 text-white dark:bg-black/20"
              radius="full"
              size="sm"
              variant="light"
              onPress={onEditProfile}
            >
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardBody>
          <div className="pb-4 pt-6">
            <p className="text-large font-medium">{user.name}</p>
            <p className="max-w-[90%] text-small text-default-400">@{user.username}</p>
            {user.tags && user.tags.length > 0 && (
              <div className="flex gap-2 pb-1 pt-2">
                {user.tags.map((tag) => (
                  <Chip key={tag} variant="flat">{tag}</Chip>
                ))}
              </div>
            )}
            {user.bio && (
              <p className="py-2 text-small text-foreground">{user.bio}</p>
            )}
            <div className="flex gap-2">
              <p>
                <span className="text-small font-medium text-default-500">{user.following}</span>&nbsp;
                <span className="text-small text-default-400">Following</span>
              </p>
              <p>
                <span className="text-small font-medium text-default-500">{user.followers}</span>&nbsp;
                <span className="text-small text-default-400">Followers</span>
              </p>
            </div>
          </div>
          <Tabs fullWidth>
            <Tab key="posts" title="Posts" />
            <Tab key="likes" title="Likes" />
            <Tab key="comments" title="Media" />
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
