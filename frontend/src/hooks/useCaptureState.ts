import { useRef, useState } from 'react';
import { messages } from '../i18n';
import type {
  FileSystemFileHandle,
  LogEntry,
  Mode,
  PagePreview,
  Stage,
} from './appShared';

export const useCaptureState = () => {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<Mode>(null);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(messages.ko.stage1.etaCalculating);
  const [completedPages, setCompletedPages] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorPages, setErrorPages] = useState<number[]>([]);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [stage2PreviewError, setStage2PreviewError] = useState<string | null>(null);
  const [outputPath, setOutputPath] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isManualMergeSaving, setIsManualMergeSaving] = useState(false);
  const [retryable, setRetryable] = useState(false);
  const [streamAttempt, setStreamAttempt] = useState(0);
  const [capturedImages, setCapturedImages] = useState<Record<number, { url: string; name: string }>>({});
  const [newPageNumber, setNewPageNumber] = useState('');
  const [recaptureIndex, setRecaptureIndex] = useState(0);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [savedFileHandle, setSavedFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [highlightedPage, setHighlightedPage] = useState<number | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const dragCounter = useRef(0);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<EventSource | null>(null);
  const previewRequestRef = useRef(0);

  return {
    url,
    setUrl,
    mode,
    setMode,
    progress,
    setProgress,
    estimatedTime,
    setEstimatedTime,
    completedPages,
    setCompletedPages,
    totalPages,
    setTotalPages,
    logs,
    setLogs,
    errorPages,
    setErrorPages,
    pagePreviews,
    setPagePreviews,
    stage2PreviewError,
    setStage2PreviewError,
    outputPath,
    setOutputPath,
    isStarting,
    setIsStarting,
    isManualMergeSaving,
    setIsManualMergeSaving,
    retryable,
    setRetryable,
    streamAttempt,
    setStreamAttempt,
    capturedImages,
    setCapturedImages,
    newPageNumber,
    setNewPageNumber,
    recaptureIndex,
    setRecaptureIndex,
    previewBlobUrl,
    setPreviewBlobUrl,
    isPreviewLoading,
    setIsPreviewLoading,
    previewError,
    setPreviewError,
    fileSizeBytes,
    setFileSizeBytes,
    isDownloadingPdf,
    setIsDownloadingPdf,
    savedFileHandle,
    setSavedFileHandle,
    highlightedPage,
    setHighlightedPage,
    showBackToTop,
    setShowBackToTop,
    dragCounter,
    captureIntervalRef,
    logEndRef,
    logContainerRef,
    previewPanelRef,
    streamRef,
    previewRequestRef,
  };
};
