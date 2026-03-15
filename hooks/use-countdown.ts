import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownOptions {
  /** Total countdown duration in seconds */
  totalSeconds: number;
  /** Called when countdown reaches zero */
  onComplete?: () => void;
  /** Called every tick with remaining seconds */
  onTick?: (remaining: number) => void;
  /** Whether to start automatically (default: true) */
  autoStart?: boolean;
}

interface UseCountdownReturn {
  /** Remaining seconds */
  remaining: number;
  /** Progress from 0 to 1 (1 = full, 0 = expired) */
  progress: number;
  /** Whether the countdown is actively running */
  isRunning: boolean;
  /** Whether the countdown has reached zero */
  isExpired: boolean;
  /** Start the countdown */
  start: () => void;
  /** Pause the countdown */
  pause: () => void;
  /** Reset the countdown to initial state */
  reset: () => void;
  /** Formatted time string (e.g., "0:30") */
  formattedTime: string;
}

/**
 * useCountdown provides a countdown timer with controls and progress tracking.
 * Used primarily for the ready check overlay timer.
 *
 * @example
 * ```tsx
 * const { remaining, progress, formattedTime, isExpired } = useCountdown({
 *   totalSeconds: 30,
 *   onComplete: () => handleTimeout(),
 * });
 * ```
 */
export function useCountdown({
  totalSeconds,
  onComplete,
  onTick,
  autoStart = true,
}: UseCountdownOptions): UseCountdownReturn {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  // Keep callback refs in sync without re-triggering effects
  onCompleteRef.current = onComplete;
  onTickRef.current = onTick;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    clearTimer();
    setRemaining(totalSeconds);
    setIsRunning(false);
  }, [totalSeconds, clearTimer]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        onTickRef.current?.(next);
        if (next <= 0) {
          clearTimer();
          setIsRunning(false);
          // Fire onComplete on next tick to avoid state update during render
          setTimeout(() => onCompleteRef.current?.(), 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, remaining <= 0, clearTimer]);

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const isExpired = remaining <= 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    remaining,
    progress,
    isRunning,
    isExpired,
    start,
    pause,
    reset,
    formattedTime,
  };
}
