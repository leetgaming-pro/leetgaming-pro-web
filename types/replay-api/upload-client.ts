/**
 * Specialized client for replay file uploads with progress tracking
 * Handles multipart uploads, status polling, and retry logic
 */

import { ReplayApiSettings, GameIDKey } from './settings';
import { ReplayFile, ReplayFileStatus, ResourceOwner } from './replay-file';
import { getRIDTokenManager } from './auth';
import { Loggable } from '@/lib/logger';

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: UploadProgress) => void;

/**
 * Upload progress information
 */
export interface UploadProgress {
  phase: 'uploading' | 'processing' | 'completed' | 'failed';
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
  replayFileId?: string;
  status?: ReplayFileStatus;
  error?: string;
}

/**
 * Upload options
 */
export interface UploadOptions {
  gameId: GameIDKey;
  networkId?: string;
  metadata?: Record<string, any>;
  onProgress?: UploadProgressCallback;
  pollInterval?: number; // milliseconds
  maxPollAttempts?: number;
  signal?: AbortSignal;
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  replayFile?: ReplayFile;
  error?: string;
  statusCode?: number;
}

/**
 * Upload response from API
 */
interface UploadResponse {
  id: string;
  status: ReplayFileStatus;
  game_id: string;
  network_id: string;
  size: number;
  internal_uri: string;
  resource_owner: {
    tenant_id: string;
    client_id: string;
    group_id: string | null;
    user_id: string | null;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Status check response from API
 */
interface StatusResponse {
  id: string;
  status: ReplayFileStatus;
  error?: string;
}

/**
 * Specialized client for replay file uploads
 */
export class UploadClient {
  private defaultPollInterval = 2000; // 2 seconds
  private defaultMaxPollAttempts = 60; // 2 minutes max
  private activeUploads = new Map<string, AbortController>();

  constructor(
    private settings: ReplayApiSettings,
    private logger: Loggable
  ) {}

  /**
   * Upload a replay file with progress tracking
   */
  async uploadReplay(
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> {
    const controller = new AbortController();
    const uploadId = this.generateUploadId();
    this.activeUploads.set(uploadId, controller);

    try {
      // Phase 1: Upload file
      const uploadResponse = await this.uploadFile(file, options, controller.signal);
      
      if (!uploadResponse) {
        return {
          success: false,
          error: 'Upload failed - no response from server',
        };
      }

      // Notify upload complete
      if (options.onProgress) {
        options.onProgress({
          phase: 'processing',
          bytesUploaded: file.size,
          totalBytes: file.size,
          percentage: 100,
          replayFileId: uploadResponse.id,
          status: uploadResponse.status,
        });
      }

      // Phase 2: Poll for processing status
      if (uploadResponse.status === 'Pending' || uploadResponse.status === 'Processing') {
        const finalStatus = await this.pollStatus(
          uploadResponse.id,
          options.gameId,
          options.onProgress,
          options.pollInterval || this.defaultPollInterval,
          options.maxPollAttempts || this.defaultMaxPollAttempts,
          controller.signal
        );

        if (finalStatus) {
          uploadResponse.status = finalStatus.status;
          if (finalStatus.error) {
            return {
              success: false,
              error: finalStatus.error,
              replayFile: this.mapToReplayFile(uploadResponse),
            };
          }
        }
      }

      // Success
      return {
        success: true,
        replayFile: this.mapToReplayFile(uploadResponse),
      };
    } catch (error: any) {
      this.logger.error('[UploadClient] Upload failed', error);
      
      if (options.onProgress) {
        options.onProgress({
          phase: 'failed',
          bytesUploaded: 0,
          totalBytes: file.size,
          percentage: 0,
          error: error.message,
        });
      }

      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    } finally {
      this.activeUploads.delete(uploadId);
    }
  }

  /**
   * Upload batch of replay files
   */
  async uploadBatch(
    files: File[],
    options: Omit<UploadOptions, 'onProgress'>,
    onBatchProgress?: (completed: number, total: number, results: UploadResult[]) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const result = await this.uploadReplay(file, {
        ...options,
        onProgress: (progress) => {
          this.logger.info(`[UploadClient] Batch upload progress for ${file.name}`, progress);
        },
      });

      results.push(result);

      if (onBatchProgress) {
        onBatchProgress(i + 1, files.length, results);
      }
    }

    return results;
  }

  /**
   * Cancel an ongoing upload
   */
  cancelUpload(uploadId: string): void {
    const controller = this.activeUploads.get(uploadId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(uploadId);
    }
  }

  /**
   * Cancel all ongoing uploads
   */
  cancelAll(): void {
    this.activeUploads.forEach((controller) => {
      controller.abort();
    });
    this.activeUploads.clear();
  }

  /**
   * Upload file to server
   */
  private async uploadFile(
    file: File,
    options: UploadOptions,
    signal: AbortSignal
  ): Promise<UploadResponse | null> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.networkId) {
      formData.append('network_id', options.networkId);
    }
    
    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    const authHeaders = await getRIDTokenManager().getAuthHeaders();
    const url = `${this.settings.baseUrl}/games/${options.gameId}/replays`;

    this.logger.info(`[UploadClient] Uploading ${file.name} to ${url}`);

    try {
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            options.onProgress!({
              phase: 'uploading',
              bytesUploaded: event.loaded,
              totalBytes: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            });
          }
        });
      }

      // Handle abort signal
      if (signal) {
        signal.addEventListener('abort', () => xhr.abort());
      }

      // Execute upload
      const response = await new Promise<UploadResponse | null>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (error) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.onabort = () => reject(new Error('Upload cancelled'));

        xhr.open('POST', url);
        
        // Set auth headers
        Object.entries(authHeaders).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.send(formData);
      });

      return response;
    } catch (error: any) {
      this.logger.error('[UploadClient] Upload failed', error);
      throw error;
    }
  }

  /**
   * Poll replay file processing status
   */
  private async pollStatus(
    replayFileId: string,
    gameId: GameIDKey,
    onProgress: UploadProgressCallback | undefined,
    pollInterval: number,
    maxAttempts: number,
    signal: AbortSignal
  ): Promise<StatusResponse | null> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      if (signal.aborted) {
        throw new Error('Status polling cancelled');
      }

      attempts++;

      try {
        const status = await this.checkStatus(replayFileId, gameId);

        if (onProgress) {
          onProgress({
            phase: 'processing',
            bytesUploaded: 0,
            totalBytes: 0,
            percentage: 100,
            replayFileId,
            status: status.status,
          });
        }

        // Check if processing is complete
        if (status.status === 'Completed' || status.status === 'Ready') {
          if (onProgress) {
            onProgress({
              phase: 'completed',
              bytesUploaded: 0,
              totalBytes: 0,
              percentage: 100,
              replayFileId,
              status: status.status,
            });
          }
          return status;
        }

        if (status.status === 'Failed') {
          if (onProgress) {
            onProgress({
              phase: 'failed',
              bytesUploaded: 0,
              totalBytes: 0,
              percentage: 100,
              replayFileId,
              status: status.status,
              error: status.error,
            });
          }
          return status;
        }

        // Still processing, wait and retry
        await this.delay(pollInterval);
      } catch (error: any) {
        this.logger.warn(`[UploadClient] Status check failed (attempt ${attempts}/${maxAttempts})`, error);
        
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        await this.delay(pollInterval);
      }
    }

    this.logger.warn(`[UploadClient] Max polling attempts reached for ${replayFileId}`);
    return null;
  }

  /**
   * Check replay file status
   */
  private async checkStatus(replayFileId: string, gameId: GameIDKey): Promise<StatusResponse> {
    const authHeaders = await getRIDTokenManager().getAuthHeaders();
    const url = `${this.settings.baseUrl}/games/${gameId}/replays/${replayFileId}/status`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (!response.ok) {
      throw new Error(`Status check failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Map API response to ReplayFile entity
   */
  private mapToReplayFile(response: UploadResponse): ReplayFile {
    const resourceOwner = ResourceOwner.fromJSON(response.resource_owner);
    
    return new ReplayFile(
      response.game_id,
      response.network_id,
      response.size,
      response.internal_uri,
      response.status,
      resourceOwner,
      new Date(response.created_at),
      new Date(response.updated_at),
      response.id
    );
  }

  /**
   * Generate unique upload ID
   */
  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
