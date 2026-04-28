import { messages, type Lang } from '../i18n';

export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Mode = 'fast' | 'quality' | null;
export type AppTheme = 'light' | 'dark' | 'pastel';

export interface HistoryItem {
  id: string;
  url: string;
  timestamp: number;
  mode: Mode;
  outputPath: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface PagePreview {
  page: number;
  imageUrl: string;
}

export interface LogEntry {
  message: string;
  receivedAt: number;
}

export interface CaptureResultResponse {
  error_pages?: unknown;
  file_size_bytes?: unknown;
  total_pages?: unknown;
  page_previews?: unknown;
  page_preview_error_code?: unknown;
  page_preview_error_message?: unknown;
}

export interface StreamEvent {
  type?: 'log' | 'progress' | 'status';
  message?: string;
  status?: 'running' | 'completed' | 'cancelled' | 'failed';
  completed_pages?: number;
  total_pages?: number;
  progress?: number;
  remaining_seconds?: number;
}

export interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
}

export type FileSystemWritableFileStreamLike = {
  write: (data: Blob) => Promise<void>;
  close: () => Promise<void>;
};

export type FileSystemFileHandle = {
  name?: string;
  createWritable: () => Promise<FileSystemWritableFileStreamLike>;
};

export type WindowWithSavePicker = Window & {
  showSaveFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle>;
};

const ENV = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

export const API_URL = ENV.VITE_API_URL ?? 'http://localhost:8000';
export const REPO_URL = 'https://github.com/hpark3/viewer-saver';

export const readErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return typeof data?.detail === 'string' ? data.detail : null;
  } catch {
    return null;
  }
};

export const getHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url || 'unknown';
  }
};

export const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return null;
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(digits)}${units[unitIndex]}`;
};

export const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const parseStreamEvent = (raw: string): StreamEvent => {
  try {
    const parsed = JSON.parse(raw) as StreamEvent;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall back to the legacy plain-text stream payload.
  }

  return { type: 'log', message: raw };
};

export const formatRemainingTime = (
  seconds: number | null | undefined,
  stageCopy: typeof messages.ko.stage1,
) => {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return stageCopy.etaCalculating;
  }

  if (seconds <= 0) {
    return stageCopy.wait;
  }

  return stageCopy.etaMinutes.replace('{min}', String(Math.ceil(seconds / 60)));
};
