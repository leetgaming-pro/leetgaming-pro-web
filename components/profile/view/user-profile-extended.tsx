"use client";

import React from "react";
import {Card, CardHeader, CardBody, Button, Avatar, Tabs, Tab, Chip, Skeleton} from "@nextui-org/react";

import UserPost from "./user-post";

export interface UserPostData {
  id: string;
  avatar: string;
  name: string;
  username: string;
  text: string;
  date: string;
  likes: number;
  comments: number;
}

export interface UserProfileData {
  avatar: string;
  name: string;
  username: string;
  bio?: string;
  tags?: string[];
  following: number;
  followers: number;
  posts?: UserPostData[];
  likedPosts?: UserPostData[];
  media?: UserPostData[];
}

interface UserProfileExtendedProps {
  user?: UserProfileData;
  isLoading?: boolean;
  onEditProfile?: () => void;
}

export default function UserProfileExtended({ user, isLoading = false, onEditProfile }: UserProfileExtendedProps) {
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-start justify-center overflow-scroll">
        <Card className="my-10 w-[400px]">
          <CardHeader className="relative flex h-[100px] flex-col justify-end overflow-visible bg-gradient-to-br from-[#FFC700] via-[#FF4654] to-[#34445C]">
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
          />
          <Button
            className="absolute right-3 top-3 bg-white/20 text-white dark:bg-black/20"
            radius="full"
            size="sm"
            variant="light"
            onPress={onEditProfile}
          >
            Edit Profile
          </Button>
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
          <Tabs
            fullWidth
            classNames={{
              panel: "mt-2",
            }}
          >
            <Tab key="posts" title="Posts">
              {user.posts && user.posts.length > 0 ? (
                user.posts.map((post) => (
                  <UserPost
                    key={post.id}
                    avatar={post.avatar}
                    comments={post.comments}
                    date={post.date}
                    likes={post.likes}
                    name={post.name}
                    text={post.text}
                    username={post.username}
                  />
                ))
              ) : (
                <p className="py-4 text-center text-default-400">No posts yet</p>
              )}
            </Tab>
            <Tab key="likes" title="Likes">
              {user.likedPosts && user.likedPosts.length > 0 ? (
                user.likedPosts.map((post) => (
                  <UserPost
                    key={post.id}
                    avatar={post.avatar}
                    comments={post.comments}
                    date={post.date}
                    likes={post.likes}
                    name={post.name}
                    text={post.text}
                    username={post.username}
                  />
                ))
              ) : (
                <p className="py-4 text-center text-default-400">No liked posts</p>
              )}
            </Tab>
            <Tab key="media" title="Media">
              {user.media && user.media.length > 0 ? (
                user.media.map((post) => (
                  <UserPost
                    key={post.id}
                    avatar={post.avatar}
                    comments={post.comments}
                    date={post.date}
                    likes={post.likes}
                    name={post.name}
                    text={post.text}
                    username={post.username}
                  />
                ))
              ) : (
                <p className="py-4 text-center text-default-400">No media</p>
              )}
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
