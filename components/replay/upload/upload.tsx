'use client'

import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { useState, useMemo } from 'react'

import { Chip, Progress, Spacer } from '@nextui-org/react';
import { SearchIcon } from '../../icons';
import { UploadClient, UploadProgress } from '@/types/replay-api/upload-client';
import { ReplayApiSettingsMock, GameIDKey } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import { isAuthenticatedSync } from '@/types/replay-api/auth';

export function UploadForm() {

  const [file, setFile] = useState<File>()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string>('idle')
  const [error, setError] = useState<string | null>(null)

  const uploadClient = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';
    return new UploadClient({ ...ReplayApiSettingsMock, baseUrl }, logger);
  }, []);

  const onUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    // Check authentication
    if (!isAuthenticatedSync()) {
      setError('Please sign in to upload replays');
      return;
    }

    setError(null);
    setStatus('uploading');
    setProgress(0);

    try {
      const result = await uploadClient.uploadReplay(file, {
        gameId: GameIDKey.CounterStrike2, // Uses CS2 by default; enhance later with auto-detection
        networkId: 'valve',
        onProgress: (uploadProgress: UploadProgress) => {
          setProgress(uploadProgress.percentage);
          setStatus(uploadProgress.phase);
          
          if (uploadProgress.error) {
            setError(uploadProgress.error);
          }
        },
      });

      if (result.success) {
        setStatus('completed');
        setProgress(100);
        console.log('Upload successful:', result.replayFile);
      } else {
        setStatus('failed');
        setError(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setStatus('failed');
      setError(error.message || 'Upload failed');
    }
  };

  return (

    <form onSubmit={onUploadFile}>
      <div className="flex w-min-500 flex-col">
        <Input
          startContent={<SearchIcon />}
          placeholder="Select a file..."
          labelPlacement="outside"
          description="Select the match replay file you want to submit."
          type="file"
          name="file"
          variant="faded"
          className='align-baseline'
          isInvalid={!!error}
          color={error ? "danger" : "success"}
          errorMessage={error}
          onChange={(e) => setFile(e.target.files?.[0])}
          isDisabled={status === 'uploading' || status === 'processing'}
        />
        <Spacer y={2} />
        {status !== 'idle' && (
          <>
            <Chip 
              color={
                status === 'completed' ? 'success' : 
                status === 'failed' ? 'danger' : 
                'primary'
              }
              variant="flat"
            >
              {status === 'uploading' && 'Uploading...'}
              {status === 'processing' && 'Processing replay...'}
              {status === 'completed' && 'Upload complete!'}
              {status === 'failed' && 'Upload failed'}
            </Chip>
            <Spacer y={2} />
          </>
        )}
        <Progress 
          value={progress} 
          classNames={{
            base: "max-w-md",
            track: "drop-shadow-md border border-default",
            indicator: "bg-gradient-to-r from-amber-500 to-yellow-500",
            label: "tracking-wider font-medium text-default-600",
            value: "text-foreground/60",
          }}
          showValueLabel={true}
          label={status !== 'idle' ? status : undefined}
        />
        <Spacer y={6} />
      </div>
      <Input 
        type="submit" 
        radius="full" 
        className="bg-gradient-to-tr from-amber-500 to-red-500 text-white shadow-lg" 
        value="Upload Replay"
        isDisabled={!file || status === 'uploading' || status === 'processing'}
      />
    </form>

  )
}