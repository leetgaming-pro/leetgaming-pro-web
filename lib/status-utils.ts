/**
 * Status utilities for consistent status handling across replay and match pages
 * Handles normalization of API status values to frontend display status
 */

/**
 * Valid frontend status values
 */
export type FrontendStatus = "pending" | "processing" | "ready" | "failed";

/**
 * Status configuration for display
 */
export interface StatusConfig {
  color: "warning" | "primary" | "success" | "danger" | "default";
  icon: string;
  label: string;
}

/**
 * Status configuration map
 */
export const STATUS_CONFIG: Record<FrontendStatus | "completed", StatusConfig> = {
  pending: {
    color: "warning" as const,
    icon: "solar:clock-circle-bold",
    label: "Pending",
  },
  processing: {
    color: "primary" as const,
    icon: "solar:refresh-bold",
    label: "Processing",
  },
  ready: {
    color: "success" as const,
    icon: "solar:check-circle-bold",
    label: "Ready",
  },
  completed: {
    color: "success" as const,
    icon: "solar:check-circle-bold",
    label: "Ready",
  },
  failed: {
    color: "danger" as const,
    icon: "solar:danger-circle-bold",
    label: "Failed",
  },
};

/**
 * Normalize API status to frontend status
 * 
 * API may return various status values with different casing:
 * - "Completed", "completed", "COMPLETED" -> "ready"
 * - "Ready", "ready", "READY" -> "ready"
 * - "Processing", "processing", "in_progress", "InProgress" -> "processing"
 * - "Failed", "failed", "error", "Error" -> "failed"
 * - Others default to "pending"
 * 
 * @param status - Raw status string from API
 * @returns Normalized frontend status
 */
export function normalizeStatus(status: string | undefined | null): FrontendStatus {
  // Handle null/undefined/empty
  if (!status || typeof status !== "string") {
    return "pending";
  }

  // Convert to lowercase for case-insensitive comparison
  const s = status.toLowerCase().trim();

  // Map to frontend status
  if (s === "completed" || s === "ready" || s === "done") {
    return "ready";
  }
  
  if (s === "processing" || s === "in_progress" || s === "inprogress" || s === "running") {
    return "processing";
  }
  
  if (s === "failed" || s === "error" || s === "failure") {
    return "failed";
  }
  
  if (s === "pending" || s === "queued" || s === "waiting") {
    return "pending";
  }

  // Default to pending for unknown status
  return "pending";
}

/**
 * Get status configuration for display
 * 
 * @param status - Frontend status
 * @returns Status configuration for rendering
 */
export function getStatusConfig(status: FrontendStatus): StatusConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}

/**
 * Check if status indicates a completed/ready state
 */
export function isStatusReady(status: string | undefined | null): boolean {
  const normalized = normalizeStatus(status);
  return normalized === "ready";
}

/**
 * Check if status indicates processing/in-progress state
 */
export function isStatusProcessing(status: string | undefined | null): boolean {
  const normalized = normalizeStatus(status);
  return normalized === "processing";
}

/**
 * Check if status indicates failed state
 */
export function isStatusFailed(status: string | undefined | null): boolean {
  const normalized = normalizeStatus(status);
  return normalized === "failed";
}

/**
 * Check if status indicates pending state
 */
export function isStatusPending(status: string | undefined | null): boolean {
  const normalized = normalizeStatus(status);
  return normalized === "pending";
}
