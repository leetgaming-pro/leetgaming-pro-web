/**
 * Coach-Player Messaging Component
 * Real-time messaging interface per PRD D.4.3
 */

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Avatar,
  Badge,
  Chip,
  Divider,
  ScrollShadow,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  role: "coach" | "player";
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type:
    | "text"
    | "image"
    | "file"
    | "session-invite"
    | "replay-share"
    | "system";
  timestamp: Date;
  isRead: boolean;
  reactions?: { emoji: string; userId: string }[];
  replyTo?: Message;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
    imageUrl?: string;
    sessionId?: string;
    sessionDate?: Date;
    replayId?: string;
    replayTitle?: string;
  };
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  isArchived?: boolean;
  isPinned?: boolean;
  sessionId?: string; // If linked to a coaching session
}

export interface CoachMessagingProps {
  currentUser: User;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onSendMessage: (
    conversationId: string,
    content: string,
    type: Message["type"],
    metadata?: Message["metadata"]
  ) => Promise<void>;
  onLoadMessages: (conversationId: string) => Promise<Message[]>;
  onMarkAsRead: (conversationId: string, messageIds: string[]) => void;
  onArchiveConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onStartNewConversation?: (userId: string) => void;
  className?: string;
}

export interface MessageInputProps {
  onSend: (
    content: string,
    type: Message["type"],
    metadata?: Message["metadata"]
  ) => void;
  isLoading?: boolean;
  placeholder?: string;
  allowAttachments?: boolean;
  allowSessionInvite?: boolean;
  allowReplayShare?: boolean;
}

// ============================================================================
// Utils
// ============================================================================

function formatMessageTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffDays = Math.floor(
    (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return messageDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return messageDate.toLocaleDateString(undefined, { weekday: "short" });
  } else {
    return messageDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
}

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function groupMessagesByDate(messages: Message[]): Map<string, Message[]> {
  const groups = new Map<string, Message[]>();

  messages.forEach((message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    const existing = groups.get(date) || [];
    groups.set(date, [...existing, message]);
  });

  return groups;
}

// ============================================================================
// Components
// ============================================================================

/**
 * Main Coach Messaging Component
 */
export function CoachMessaging({
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onLoadMessages,
  onMarkAsRead,
  onArchiveConversation,
  onPinConversation,
  className = "",
}: CoachMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const otherParticipant = activeConversation?.participants.find(
    (p) => p.id !== currentUser.id
  );

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      setIsLoadingMessages(true);
      onLoadMessages(activeConversationId)
        .then(setMessages)
        .finally(() => setIsLoadingMessages(false));
    }
  }, [activeConversationId, onLoadMessages]);

  // Mark messages as read
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      const unreadIds = messages
        .filter((m) => !m.isRead && m.senderId !== currentUser.id)
        .map((m) => m.id);
      if (unreadIds.length > 0) {
        onMarkAsRead(activeConversationId, unreadIds);
      }
    }
  }, [activeConversationId, messages, currentUser.id, onMarkAsRead]);

  const handleSend = async (
    content: string,
    type: Message["type"],
    metadata?: Message["metadata"]
  ) => {
    if (!activeConversationId) return;

    setIsSending(true);
    try {
      await onSendMessage(activeConversationId, content, type, metadata);
      // Optimistically add message
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: currentUser.id,
        content,
        type,
        timestamp: new Date(),
        isRead: false,
        metadata,
      };
      setMessages((prev) => [...prev, newMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter((c) => {
      const other = c.participants.find((p) => p.id !== currentUser.id);
      return other?.username.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, currentUser.id]);

  // Sort: pinned first, then by last message
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.lastMessage?.timestamp
        ? new Date(a.lastMessage.timestamp).getTime()
        : 0;
      const bTime = b.lastMessage?.timestamp
        ? new Date(b.lastMessage.timestamp).getTime()
        : 0;
      return bTime - aTime;
    });
  }, [filteredConversations]);

  return (
    <Card className={`h-[600px] ${className}`}>
      <div className="flex h-full">
        {/* Conversation List */}
        <div className="w-80 border-r border-divider flex flex-col">
          <CardHeader className="px-4 py-3 border-b border-divider">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold">Messages</h3>
              <Badge
                content={conversations.reduce(
                  (sum, c) => sum + c.unreadCount,
                  0
                )}
                color="danger"
                isInvisible={
                  conversations.reduce((sum, c) => sum + c.unreadCount, 0) === 0
                }
              >
                <Icon icon="solar:inbox-bold" className="w-5 h-5" />
              </Badge>
            </div>
          </CardHeader>

          {/* Search */}
          <div className="p-3 border-b border-divider">
            <Input
              size="sm"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={
                <Icon icon="solar:magnifer-bold" className="text-default-400" />
              }
            />
          </div>

          {/* Conversation List */}
          <ScrollShadow className="flex-1">
            <div className="p-2 space-y-1">
              {sortedConversations.map((conversation) => {
                const other = conversation.participants.find(
                  (p) => p.id !== currentUser.id
                );
                const isActive = conversation.id === activeConversationId;

                return (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      fullWidth
                      variant={isActive ? "flat" : "light"}
                      color={isActive ? "primary" : "default"}
                      className="justify-start h-auto py-3 px-3"
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Badge
                          content=""
                          color="success"
                          placement="bottom-right"
                          isInvisible={!other?.isOnline}
                          shape="circle"
                        >
                          <Avatar
                            src={other?.avatar}
                            name={other?.username}
                            size="sm"
                          />
                        </Badge>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">
                              {other?.username}
                              {conversation.isPinned && (
                                <Icon
                                  icon="solar:pin-bold"
                                  className="w-3 h-3 ml-1 inline text-warning"
                                />
                              )}
                            </span>
                            {conversation.lastMessage && (
                              <span className="text-xs text-default-400">
                                {formatMessageTime(
                                  conversation.lastMessage.timestamp
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs text-default-500 truncate">
                              {conversation.lastMessage?.content ||
                                "No messages yet"}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <Chip
                                size="sm"
                                color="danger"
                                variant="solid"
                                className="h-5 min-w-5"
                              >
                                {conversation.unreadCount}
                              </Chip>
                            )}
                          </div>
                          <Chip size="sm" variant="flat" className="mt-1 h-5">
                            {other?.role === "coach" ? "🎓 Coach" : "🎮 Player"}
                          </Chip>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}

              {sortedConversations.length === 0 && (
                <div className="text-center py-8">
                  <Icon
                    icon="solar:chat-round-bold"
                    className="w-12 h-12 mx-auto text-default-300 mb-2"
                  />
                  <p className="text-default-500 text-sm">
                    {searchQuery ? "No conversations found" : "No messages yet"}
                  </p>
                </div>
              )}
            </div>
          </ScrollShadow>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    content=""
                    color="success"
                    placement="bottom-right"
                    isInvisible={!otherParticipant?.isOnline}
                    shape="circle"
                  >
                    <Avatar
                      src={otherParticipant?.avatar}
                      name={otherParticipant?.username}
                    />
                  </Badge>
                  <div>
                    <p className="font-semibold">
                      {otherParticipant?.username}
                    </p>
                    <p className="text-xs text-default-500">
                      {otherParticipant?.isOnline
                        ? "Online"
                        : otherParticipant?.lastSeen
                        ? `Last seen ${formatLastSeen(
                            otherParticipant.lastSeen
                          )}`
                        : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Schedule Session">
                    <Button size="sm" variant="flat" isIconOnly>
                      <Icon
                        icon="solar:calendar-add-bold"
                        className="w-4 h-4"
                      />
                    </Button>
                  </Tooltip>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button size="sm" variant="flat" isIconOnly>
                        <Icon icon="solar:menu-dots-bold" className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="pin"
                        startContent={
                          <Icon icon="solar:pin-bold" className="w-4 h-4" />
                        }
                        onClick={() =>
                          activeConversationId &&
                          onPinConversation?.(activeConversationId)
                        }
                      >
                        {activeConversation.isPinned ? "Unpin" : "Pin"}{" "}
                        Conversation
                      </DropdownItem>
                      <DropdownItem
                        key="archive"
                        startContent={
                          <Icon icon="solar:archive-bold" className="w-4 h-4" />
                        }
                        onClick={() =>
                          activeConversationId &&
                          onArchiveConversation?.(activeConversationId)
                        }
                      >
                        Archive
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>

              {/* Messages */}
              <MessageList
                messages={messages}
                currentUserId={currentUser.id}
                isLoading={isLoadingMessages}
              />

              {/* Input */}
              <div className="p-4 border-t border-divider">
                <MessageInput
                  onSend={handleSend}
                  isLoading={isSending}
                  allowAttachments
                  allowSessionInvite={currentUser.role === "coach"}
                  allowReplayShare
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Icon
                  icon="solar:chat-round-bold"
                  className="w-16 h-16 mx-auto text-default-200 mb-4"
                />
                <p className="text-default-500">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Message List Component
 */
function MessageList({
  messages,
  currentUserId,
  isLoading,
}: {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageGroups = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Icon
          icon="svg-spinners:pulse-rings-multiple"
          className="w-8 h-8 text-primary"
        />
      </div>
    );
  }

  return (
    <ScrollShadow ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-default-400">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {Array.from(messageGroups.entries()).map(([date, msgs]) => (
            <div key={date}>
              {/* Date Divider */}
              <div className="flex items-center gap-2 my-4">
                <Divider className="flex-1" />
                <Chip size="sm" variant="flat">
                  {date}
                </Chip>
                <Divider className="flex-1" />
              </div>

              {/* Messages */}
              {msgs.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === currentUserId}
                  showAvatar={
                    index === 0 || msgs[index - 1].senderId !== message.senderId
                  }
                />
              ))}
            </div>
          ))}
        </AnimatePresence>
      )}
    </ScrollShadow>
  );
}

/**
 * Individual Message Bubble
 */
function MessageBubble({
  message,
  isOwn,
  showAvatar,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`flex items-end gap-2 max-w-[70%] ${
          isOwn ? "flex-row-reverse" : ""
        }`}
      >
        {showAvatar && !isOwn && <Avatar size="sm" className="mb-1" />}
        {!showAvatar && !isOwn && <div className="w-8" />}

        <div>
          {message.type === "text" && (
            <div
              className={`
                px-4 py-2 rounded-2xl
                ${
                  isOwn
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-default-100 rounded-bl-sm"
                }
              `}
            >
              {message.replyTo && (
                <div className="text-xs opacity-70 mb-1 pb-1 border-b border-current/20">
                  Reply to: {message.replyTo.content.slice(0, 50)}...
                </div>
              )}
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          )}

          {message.type === "image" && (
            <div
              className={`rounded-2xl overflow-hidden ${
                isOwn ? "rounded-br-sm" : "rounded-bl-sm"
              }`}
            >
              <div
                className="w-64 h-48 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${message.metadata?.imageUrl})`,
                }}
                role="img"
                aria-label="Shared image"
              />
            </div>
          )}

          {message.type === "file" && (
            <div
              className={`px-4 py-3 rounded-2xl ${
                isOwn
                  ? "bg-primary/20 rounded-br-sm"
                  : "bg-default-100 rounded-bl-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon icon="solar:file-bold" className="w-8 h-8" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {message.metadata?.fileName}
                  </p>
                  <p className="text-xs text-default-500">
                    {((message.metadata?.fileSize || 0) / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button size="sm" variant="flat" isIconOnly>
                  <Icon icon="solar:download-bold" className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {message.type === "session-invite" && (
            <Card className={`w-64 ${isOwn ? "ml-auto" : ""}`}>
              <CardBody className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    icon="solar:calendar-bold"
                    className="w-5 h-5 text-primary"
                  />
                  <span className="font-medium">Session Invite</span>
                </div>
                <p className="text-sm">{message.content}</p>
                {message.metadata?.sessionDate && (
                  <Chip size="sm" variant="flat" className="mt-2">
                    {new Date(
                      message.metadata.sessionDate
                    ).toLocaleDateString()}
                  </Chip>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" color="primary" className="flex-1">
                    Accept
                  </Button>
                  <Button size="sm" variant="flat" className="flex-1">
                    Decline
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {message.type === "replay-share" && (
            <Card className={`w-64 ${isOwn ? "ml-auto" : ""}`}>
              <CardBody className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    icon="solar:play-bold"
                    className="w-5 h-5 text-success"
                  />
                  <span className="font-medium">Replay Shared</span>
                </div>
                <p className="text-sm truncate">
                  {message.metadata?.replayTitle}
                </p>
                <Button size="sm" variant="flat" className="mt-2 w-full">
                  <Icon icon="solar:play-bold" className="w-4 h-4 mr-1" />
                  View Replay
                </Button>
              </CardBody>
            </Card>
          )}

          {message.type === "system" && (
            <div className="text-center">
              <Chip size="sm" variant="flat">
                {message.content}
              </Chip>
            </div>
          )}

          {/* Timestamp */}
          <p
            className={`text-[10px] text-default-400 mt-1 ${
              isOwn ? "text-right" : "text-left"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isOwn && message.isRead && (
              <Icon
                icon="solar:check-read-bold"
                className="w-3 h-3 ml-1 inline text-primary"
              />
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Message Input Component
 */
function MessageInput({
  onSend,
  isLoading,
  placeholder = "Type a message...",
  allowAttachments = true,
  allowSessionInvite = true,
  allowReplayShare = true,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim(), "text");
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      {/* Attachment Menu */}
      {(allowAttachments || allowSessionInvite || allowReplayShare) && (
        <Dropdown isOpen={showActions} onOpenChange={setShowActions}>
          <DropdownTrigger>
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              className="rounded-full"
            >
              <Icon
                icon={
                  showActions
                    ? "solar:close-circle-bold"
                    : "solar:add-circle-bold"
                }
                className="w-5 h-5"
              />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            items={[
              {
                key: "image",
                label: "Send Image",
                icon: "solar:gallery-bold",
                show: allowAttachments,
              },
              {
                key: "file",
                label: "Send File",
                icon: "solar:file-bold",
                show: allowAttachments,
              },
              {
                key: "session",
                label: "Invite to Session",
                icon: "solar:calendar-add-bold",
                show: allowSessionInvite,
              },
              {
                key: "replay",
                label: "Share Replay",
                icon: "solar:play-bold",
                show: allowReplayShare,
              },
            ].filter((item) => item.show)}
          >
            {(item) => (
              <DropdownItem
                key={item.key}
                startContent={<Icon icon={item.icon} className="w-4 h-4" />}
              >
                {item.label}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      )}

      {/* Message Input */}
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1"
        endContent={
          <Button
            size="sm"
            color="primary"
            isIconOnly
            className="rounded-full"
            onClick={handleSend}
            isLoading={isLoading}
            isDisabled={!message.trim()}
          >
            <Icon icon="solar:plain-2-bold" className="w-4 h-4" />
          </Button>
        }
      />
    </div>
  );
}

/**
 * Compact Message Preview (for notifications, etc.)
 */
export function MessagePreview({
  message,
  sender,
  onClick,
  className = "",
}: {
  message: Message;
  sender: User;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Card
      isPressable={!!onClick}
      isHoverable={!!onClick}
      onClick={onClick}
      className={className}
    >
      <CardBody className="p-3">
        <div className="flex items-start gap-3">
          <Badge
            content=""
            color="success"
            placement="bottom-right"
            isInvisible={!sender.isOnline}
            shape="circle"
          >
            <Avatar src={sender.avatar} name={sender.username} size="sm" />
          </Badge>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium">{sender.username}</span>
              <span className="text-xs text-default-400">
                {formatMessageTime(message.timestamp)}
              </span>
            </div>
            <p className="text-sm text-default-500 truncate">
              {message.content}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Default export
const CoachMessagingComponents = {
  CoachMessaging,
  MessagePreview,
};

export default CoachMessagingComponents;
