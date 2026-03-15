/**
 * Messaging Domain Types
 * Match comments, direct messages, and team messages
 * Based on replay-api/pkg/domain/messaging/entities/
 */

// ── Comment Types ───────────────────────────────────────────────────────────

export type CommentStatus = 'active' | 'edited' | 'deleted';

export interface Mention {
  player_id: string;
  display_name: string;
  offset: number;
  length: number;
}

export interface AuthorSummary {
  id: string;
  display_name: string;
  avatar_url?: string;
  slug?: string;
}

export interface Comment {
  id: string;
  match_id: string;
  author: AuthorSummary;
  content: string;
  mentions?: Mention[];
  parent_id?: string;
  reactions?: Record<string, string[]>; // emoji -> list of user IDs
  status: CommentStatus;
  edited_at?: string;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentListResult {
  comments: Comment[];
  total_count: number;
  limit: number;
  offset: number;
}

// ── Comment Commands ────────────────────────────────────────────────────────

export interface CreateCommentRequest {
  match_id: string;
  content: string;
  mentions?: Mention[];
  parent_id?: string;
}

export interface EditCommentRequest {
  content: string;
  mentions?: Mention[];
}

export interface ReactToCommentRequest {
  emoji: string;
  remove?: boolean;
}

// ── Comment Query Params ────────────────────────────────────────────────────

export interface ListCommentsParams {
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'oldest' | 'most_reactions';
}

// ── Direct Message Types ────────────────────────────────────────────────────

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  conversation_id: string;
  content: string;
  mentions?: Mention[];
  read_at?: string;
  deleted_by_sender?: boolean;
  deleted_by_recipient?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  conversation_id: string;
  participant: AuthorSummary;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface DirectMessageListResult {
  messages: DirectMessage[];
  total_count: number;
  limit: number;
  offset: number;
}

// ── Direct Message Commands ─────────────────────────────────────────────────

export interface SendDirectMessageRequest {
  recipient_id: string;
  content: string;
  mentions?: Mention[];
}

export interface MarkConversationReadRequest {
  other_user_id: string;
}

// ── Direct Message Query Params ─────────────────────────────────────────────

export interface ListConversationsParams {
  limit?: number;
  offset?: number;
}

export interface GetConversationParams {
  limit?: number;
  offset?: number;
}

// ── Team Message Types ──────────────────────────────────────────────────────

export type ChannelType = 'general' | 'strategy' | 'comms';

export interface TeamMessage {
  id: string;
  sender_id: string;
  team_id: string;
  channel: ChannelType;
  content: string;
  mentions?: Mention[];
  sender: AuthorSummary;
  created_at: string;
  updated_at: string;
}

export interface TeamChannelSummary {
  team_id: string;
  team_name: string;
  channel: ChannelType;
  last_message: string;
  last_at: string;
  unread_count: number;
}

export interface TeamMessageListResult {
  messages: TeamMessage[];
  total_count: number;
  limit: number;
  offset: number;
}

// ── Team Message Commands ───────────────────────────────────────────────────

export interface SendTeamMessageRequest {
  team_id: string;
  channel: ChannelType;
  content: string;
  mentions?: Mention[];
}

// ── Team Message Query Params ───────────────────────────────────────────────

export interface ListTeamMessagesParams {
  channel?: ChannelType;
  limit?: number;
  offset?: number;
}

// ── WebSocket Message Types ─────────────────────────────────────────────────

export const MessagingMessageTypes = {
  /** Server → Client: new comment on a match */
  NEW_COMMENT: 'new_comment',
  /** Server → Client: comment was edited */
  COMMENT_EDITED: 'comment_edited',
  /** Server → Client: comment was deleted */
  COMMENT_DELETED: 'comment_deleted',
  /** Server → Client: reaction added/removed */
  COMMENT_REACTION: 'comment_reaction',
  /** Server → Client: new direct message */
  NEW_DIRECT_MESSAGE: 'new_direct_message',
  /** Server → Client: new team message */
  NEW_TEAM_MESSAGE: 'new_team_message',
  /** Client ↔ Server: typing indicator */
  TYPING: 'typing',
} as const;

export type MessagingMessageType =
  (typeof MessagingMessageTypes)[keyof typeof MessagingMessageTypes];

export interface MessagingWebSocketMessage {
  type: MessagingMessageType;
  lobby_id?: string;
  pool_id?: string;
  user_id?: string;
  payload: unknown;
  timestamp: number;
}
