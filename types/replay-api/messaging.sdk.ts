/**
 * Messaging API SDK
 * Clean, minimal API wrapper for match comments, DMs, and team messages.
 * Follows Clean Architecture + CQRS pattern from backend.
 *
 * Error handling:
 *  - Query operations return null on failure (non-critical)
 *  - Command operations THROW on 403/permission errors
 */

import { ReplayApiClient, type ApiError } from './replay-api.client';
import type {
  Comment,
  CommentListResult,
  CreateCommentRequest,
  EditCommentRequest,
  ReactToCommentRequest,
  ListCommentsParams,
  DirectMessage,
  DirectMessageListResult,
  Conversation,
  SendDirectMessageRequest,
  ListConversationsParams,
  GetConversationParams,
  TeamMessage,
  TeamMessageListResult,
  TeamChannelSummary,
  SendTeamMessageRequest,
  ListTeamMessagesParams,
} from './messaging.types';

function throwIfForbidden(error: ApiError | string | undefined, action: string): void {
  if (!error) return;
  const apiError = typeof error === 'string' ? { message: error } : error;
  const isForbidden =
    apiError.status === 403 ||
    (apiError as ApiError).isForbidden ||
    apiError.isAuthError ||
    apiError.message?.toLowerCase().includes('forbidden');

  if (isForbidden) {
    throw new Error(`Permission denied: You do not have permission to ${action}.`);
  }
}

function handleCommandResponse<T>(
  response: { data?: T; error?: ApiError | string },
  action: string,
  logPrefix: string,
): T | null {
  if (response.error) {
    throwIfForbidden(response.error, action);
    const msg =
      typeof response.error === 'string'
        ? response.error
        : response.error.message || 'Unknown error';
    console.error(`${logPrefix}:`, msg);
    throw new Error(msg);
  }
  return response.data || null;
}

export class MessagingAPI {
  constructor(private client: ReplayApiClient) {}

  // ── Match Comments (Query) ──────────────────────────────────────────────

  async listMatchComments(
    matchId: string,
    params: ListCommentsParams = {},
  ): Promise<CommentListResult | null> {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    if (params.sort) qs.set('sort', params.sort);

    const query = qs.toString();
    const url = `/matches/${matchId}/comments${query ? `?${query}` : ''}`;
    const response = await this.client.get<CommentListResult>(url);
    if (response.error) {
      console.error('[MessagingAPI] listMatchComments:', response.error);
      return null;
    }
    return response.data || null;
  }

  async getComment(matchId: string, commentId: string): Promise<Comment | null> {
    const response = await this.client.get<Comment>(
      `/matches/${matchId}/comments/${commentId}`,
    );
    if (response.error) {
      console.error('[MessagingAPI] getComment:', response.error);
      return null;
    }
    return response.data || null;
  }

  async getCommentReplies(
    matchId: string,
    commentId: string,
    limit = 20,
    offset = 0,
  ): Promise<CommentListResult | null> {
    const qs = new URLSearchParams();
    if (limit) qs.set('limit', String(limit));
    if (offset) qs.set('offset', String(offset));
    const query = qs.toString();
    const url = `/matches/${matchId}/comments/${commentId}/replies${query ? `?${query}` : ''}`;
    const response = await this.client.get<CommentListResult>(url);
    if (response.error) {
      console.error('[MessagingAPI] getCommentReplies:', response.error);
      return null;
    }
    return response.data || null;
  }

  // ── Match Comments (Command) ────────────────────────────────────────────

  async createComment(
    matchId: string,
    request: CreateCommentRequest,
  ): Promise<Comment | null> {
    const response = await this.client.post<Comment>(
      `/matches/${matchId}/comments`,
      request,
    );
    return handleCommandResponse(response, 'create comment', '[MessagingAPI] createComment');
  }

  async editComment(
    matchId: string,
    commentId: string,
    request: EditCommentRequest,
  ): Promise<Comment | null> {
    const response = await this.client.put<Comment>(
      `/matches/${matchId}/comments/${commentId}`,
      request,
    );
    return handleCommandResponse(response, 'edit comment', '[MessagingAPI] editComment');
  }

  async deleteComment(matchId: string, commentId: string): Promise<boolean> {
    const response = await this.client.delete(
      `/matches/${matchId}/comments/${commentId}`,
    );
    if (response.error) {
      throwIfForbidden(response.error, 'delete comment');
      console.error('[MessagingAPI] deleteComment:', response.error);
      return false;
    }
    return true;
  }

  async reactToComment(
    matchId: string,
    commentId: string,
    request: ReactToCommentRequest,
  ): Promise<boolean> {
    const response = await this.client.post(
      `/matches/${matchId}/comments/${commentId}/reactions`,
      request,
    );
    if (response.error) {
      console.error('[MessagingAPI] reactToComment:', response.error);
      return false;
    }
    return true;
  }

  // ── Direct Messages (Query) ─────────────────────────────────────────────

  async listConversations(
    params: ListConversationsParams = {},
  ): Promise<Conversation[] | null> {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    const query = qs.toString();
    const url = `/messages/conversations${query ? `?${query}` : ''}`;
    const response = await this.client.get<Conversation[]>(url);
    if (response.error) {
      console.error('[MessagingAPI] listConversations:', response.error);
      return null;
    }
    return response.data || null;
  }

  async getConversation(
    userId: string,
    params: GetConversationParams = {},
  ): Promise<DirectMessageListResult | null> {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    const query = qs.toString();
    const url = `/messages/conversations/${userId}${query ? `?${query}` : ''}`;
    const response = await this.client.get<DirectMessageListResult>(url);
    if (response.error) {
      console.error('[MessagingAPI] getConversation:', response.error);
      return null;
    }
    return response.data || null;
  }

  // ── Direct Messages (Command) ───────────────────────────────────────────

  async sendDirectMessage(
    userId: string,
    request: SendDirectMessageRequest,
  ): Promise<DirectMessage | null> {
    const response = await this.client.post<DirectMessage>(
      `/messages/${userId}`,
      request,
    );
    return handleCommandResponse(
      response,
      'send direct message',
      '[MessagingAPI] sendDirectMessage',
    );
  }

  async markConversationRead(userId: string): Promise<boolean> {
    const response = await this.client.post(
      `/messages/conversations/${userId}/read`,
      {},
    );
    if (response.error) {
      console.error('[MessagingAPI] markConversationRead:', response.error);
      return false;
    }
    return true;
  }

  async deleteDirectMessage(messageId: string): Promise<boolean> {
    const response = await this.client.delete(
      `/messages/${messageId}/delete`,
    );
    if (response.error) {
      throwIfForbidden(response.error, 'delete message');
      console.error('[MessagingAPI] deleteDirectMessage:', response.error);
      return false;
    }
    return true;
  }

  // ── Team Messages (Query) ───────────────────────────────────────────────

  async listTeamMessages(
    teamId: string,
    params: ListTeamMessagesParams = {},
  ): Promise<TeamMessageListResult | null> {
    const qs = new URLSearchParams();
    if (params.channel) qs.set('channel', params.channel);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    const query = qs.toString();
    const url = `/teams/${teamId}/messages${query ? `?${query}` : ''}`;
    const response = await this.client.get<TeamMessageListResult>(url);
    if (response.error) {
      console.error('[MessagingAPI] listTeamMessages:', response.error);
      return null;
    }
    return response.data || null;
  }

  async listTeamChannels(
    teamId: string,
  ): Promise<TeamChannelSummary[] | null> {
    const response = await this.client.get<TeamChannelSummary[]>(
      `/teams/${teamId}/channels`,
    );
    if (response.error) {
      console.error('[MessagingAPI] listTeamChannels:', response.error);
      return null;
    }
    return response.data || null;
  }

  // ── Team Messages (Command) ─────────────────────────────────────────────

  async sendTeamMessage(
    teamId: string,
    request: SendTeamMessageRequest,
  ): Promise<TeamMessage | null> {
    const response = await this.client.post<TeamMessage>(
      `/teams/${teamId}/messages`,
      request,
    );
    return handleCommandResponse(
      response,
      'send team message',
      '[MessagingAPI] sendTeamMessage',
    );
  }
}
