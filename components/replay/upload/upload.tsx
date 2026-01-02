'use client'

import { Button } from '@nextui-org/button'
import { useState, useMemo, useCallback, useRef } from 'react'
import { Chip, Progress, Spacer, Card, CardBody } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { UploadClient, UploadProgress } from '@/types/replay-api/upload-client';
import { ReplayApiSettingsMock, GameIDKey } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import { useAuth } from '@/hooks/use-auth';
import { EsportsButton } from '@/components/ui/esports-button';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

interface FileInfo {
  file: File;
  name: string;
  size: string;
  type: string;
}

export function UploadForm() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadClient = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';
    return new UploadClient({ ...ReplayApiSettingsMock, baseUrl }, logger);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.dem', '.dem.gz', '.bz2', '.zip'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      setError('Invalid file type. Supported formats: .dem, .dem.gz, .bz2, .zip');
      return false;
    }

    // Max 500MB
    if (file.size > 500 * 1024 * 1024) {
      setError('File too large. Maximum size is 500MB');
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    if (!validateFile(file)) {
      return;
    }

    setFileInfo({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
    });
    setStatus('idle');
    setProgress(0);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!fileInfo?.file) {
      setError('Please select a file');
      return;
    }

    if (isAuthLoading) {
      setError('🔄 Please wait, checking authentication...');
      return;
    }

    if (!isAuthenticated) {
      setError('🔐 Please sign in to upload replays');
      return;
    }

    setError(null);
    setStatus('uploading');
    setProgress(0);

    try {
      const result = await uploadClient.uploadReplay(fileInfo.file, {
        gameId: GameIDKey.CounterStrike2,
        networkId: 'valve',
        onProgress: (uploadProgress: UploadProgress) => {
          setProgress(uploadProgress.percentage);
          setStatus(uploadProgress.phase as UploadStatus);
          
          if (uploadProgress.error) {
            setError(uploadProgress.error);
          }
        },
      });

      if (result.success) {
        setStatus('completed');
        setProgress(100);
        logger.info('Upload successful', { replayFile: result.replayFile });
      } else {
        setStatus('failed');
        setError(result.error || 'Upload failed');
      }
    } catch (error: any) {
      logger.error('Error uploading file', error);
      setStatus('failed');
      setError(error.message || 'Upload failed');
    }
  };

  const handleReset = () => {
    setFileInfo(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploading = status === 'uploading' || status === 'processing';

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".dem,.dem.gz,.bz2,.zip"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer transition-all duration-300
          border-2 border-dashed rounded-none p-8
          flex flex-col items-center justify-center gap-4
          min-h-[200px]
          ${isDragOver 
            ? 'border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/10 dark:bg-[#DCFF37]/10' 
            : 'border-[#34445C]/30 dark:border-[#DCFF37]/30 hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50'
          }
          ${isUploading ? 'cursor-not-allowed opacity-60' : ''}
        `}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
        }}
      >
        {/* Animated corner accent */}
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-[#FF4654] dark:from-[#DCFF37] to-transparent" 
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} 
        />

        {!fileInfo ? (
          <>
            <div className={`
              w-20 h-20 flex items-center justify-center rounded-none
              bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20
              ${isDragOver ? 'scale-110' : ''}
              transition-transform duration-200
            `}>
              <Icon 
                icon="solar:cloud-upload-bold-duotone" 
                className="text-[#FF4654] dark:text-[#DCFF37]" 
                width={48} 
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[#34445C] dark:text-white">
                {isDragOver ? 'Drop your replay here!' : 'Drag & Drop your replay'}
              </p>
              <p className="text-sm text-default-500 mt-1">
                or <span className="text-[#FF4654] dark:text-[#DCFF37] underline">browse files</span>
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Chip size="sm" variant="flat" className="bg-[#34445C]/10 dark:bg-[#DCFF37]/10">.dem</Chip>
              <Chip size="sm" variant="flat" className="bg-[#34445C]/10 dark:bg-[#DCFF37]/10">.dem.gz</Chip>
              <Chip size="sm" variant="flat" className="bg-[#34445C]/10 dark:bg-[#DCFF37]/10">.zip</Chip>
            </div>
            <p className="text-xs text-default-400 mt-2">Maximum file size: 500MB</p>
          </>
        ) : (
          <div className="w-full">
            {/* File Info Card */}
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-default-50 dark:bg-[#111111]">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                    <Icon icon="solar:file-bold" className="text-white dark:text-[#1a1a1a]" width={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#34445C] dark:text-white truncate">
                      {fileInfo.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip size="sm" variant="flat" className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37]">
                        {fileInfo.type}
                      </Chip>
                      <span className="text-sm text-default-500">{fileInfo.size}</span>
                    </div>
                  </div>
                  {status === 'idle' && (
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    >
                      <Icon icon="solar:close-circle-bold" width={20} className="text-default-400" />
                    </Button>
                  )}
                  {status === 'completed' && (
                    <Icon icon="solar:check-circle-bold" width={32} className="text-success" />
                  )}
                </div>

                {/* Progress Bar */}
                {status !== 'idle' && status !== 'completed' && (
                  <div className="mt-4">
                    <Progress
                      value={progress}
                      size="sm"
                      classNames={{
                        track: "bg-default-200 dark:bg-[#1a1a1a] rounded-none",
                        indicator: "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none",
                      }}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-default-500 capitalize">{status}...</span>
                      <span className="text-sm font-semibold text-[#FF4654] dark:text-[#DCFF37]">{progress}%</span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Auth Required Message */}
      {!isAuthenticated && !isAuthLoading && (
        <div className="mt-4 p-4 bg-warning/10 border-l-2 border-warning rounded-none">
          <div className="flex items-center justify-between">
            <p className="text-sm text-warning flex items-center gap-2">
              <Icon icon="solar:lock-bold" width={18} />
              Sign in required to upload replays
            </p>
            <EsportsButton
              variant="primary"
              size="sm"
              onClick={() => window.location.href = '/signin'}
            >
              <Icon icon="solar:login-bold" width={16} />
              Sign In
            </EsportsButton>
          </div>
        </div>
      )}

      {/* Error Message (only show if authenticated or non-auth related error) */}
      {error && !error.includes('sign in') && (
        <div className="mt-4 p-3 bg-danger/10 border-l-2 border-danger rounded-none">
          <p className="text-sm text-danger flex items-center gap-2">
            <Icon icon="solar:danger-triangle-bold" width={18} />
            {error}
          </p>
        </div>
      )}

      {/* Success Message */}
      {status === 'completed' && (
        <div className="mt-4 p-3 bg-success/10 border-l-2 border-success rounded-none">
          <p className="text-sm text-success flex items-center gap-2">
            <Icon icon="solar:check-circle-bold" width={18} />
            Replay uploaded successfully! It will be processed shortly.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        {status === 'completed' ? (
          <>
            <EsportsButton
              variant="ghost"
              size="md"
              className="flex-1"
              onClick={handleReset}
            >
              <Icon icon="solar:upload-bold" width={18} />
              Upload Another
            </EsportsButton>
            <EsportsButton
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => window.location.href = '/replays'}
            >
              <Icon icon="solar:eye-bold" width={18} />
              View Replays
            </EsportsButton>
          </>
        ) : (
          <EsportsButton
            variant="action"
            size="lg"
            className="w-full"
            onClick={handleUpload}
            disabled={!fileInfo || isUploading || !isAuthenticated || isAuthLoading}
          >
            {isUploading ? (
              <>
                <Icon icon="solar:refresh-bold" className="animate-spin" width={20} />
                {status === 'uploading' ? 'Uploading...' : 'Processing...'}
              </>
            ) : isAuthLoading ? (
              <>
                <Icon icon="solar:refresh-bold" className="animate-spin" width={20} />
                Checking auth...
              </>
            ) : !isAuthenticated ? (
              <>
                <Icon icon="solar:lock-bold" width={20} />
                Sign In to Upload
              </>
            ) : (
              <>
                <Icon icon="solar:cloud-upload-bold" width={20} />
                Upload Replay
              </>
            )}
          </EsportsButton>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 rounded-none border-l-2 border-[#FF4654] dark:border-[#DCFF37]">
        <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">
          💡 Pro Tips
        </p>
        <ul className="text-xs text-default-500 space-y-1">
          <li>• CS2 demo files are usually found in <code className="bg-default-200 dark:bg-[#1a1a1a] px-1 rounded">Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/</code></li>
          <li>• Compressed files (.gz, .zip) upload faster</li>
          <li>• Analysis starts automatically after upload</li>
        </ul>
      </div>
    </div>
  );
}
