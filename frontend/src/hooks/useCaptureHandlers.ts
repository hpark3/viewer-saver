import { useCallback, useEffect, useRef, type UIEvent } from 'react';
import { messages, type Lang } from '../i18n';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  API_URL,
  formatFileSize,
  formatRemainingTime,
  parseStreamEvent,
  readErrorMessage,
  sleep,
  type CaptureResultResponse,
  type FileSystemFileHandle,
  type HistoryItem,
  type Mode,
  type PagePreview,
  type Stage,
  type Toast,
  type WindowWithSavePicker,
} from './appShared';

type SetState<T> = Dispatch<SetStateAction<T>>;

type CaptureState = {
  url: string;
  setUrl: SetState<string>;
  mode: Mode;
  setMode: SetState<Mode>;
  progress: number;
  setProgress: SetState<number>;
  estimatedTime: string;
  setEstimatedTime: SetState<string>;
  completedPages: number;
  setCompletedPages: SetState<number>;
  totalPages: number | null;
  setTotalPages: SetState<number | null>;
  logs: { message: string; receivedAt: number }[];
  setLogs: SetState<{ message: string; receivedAt: number }[]>;
  errorPages: number[];
  setErrorPages: SetState<number[]>;
  pagePreviews: PagePreview[];
  setPagePreviews: SetState<PagePreview[]>;
  stage2PreviewError: string | null;
  setStage2PreviewError: SetState<string | null>;
  outputPath: string;
  setOutputPath: SetState<string>;
  isStarting: boolean;
  setIsStarting: SetState<boolean>;
  isManualMergeSaving: boolean;
  setIsManualMergeSaving: SetState<boolean>;
  retryable: boolean;
  setRetryable: SetState<boolean>;
  streamAttempt: number;
  setStreamAttempt: SetState<number>;
  capturedImages: Record<number, { url: string; name: string }>;
  setCapturedImages: SetState<Record<number, { url: string; name: string }>>;
  newPageNumber: string;
  setNewPageNumber: SetState<string>;
  recaptureIndex: number;
  setRecaptureIndex: SetState<number>;
  previewBlobUrl: string | null;
  setPreviewBlobUrl: SetState<string | null>;
  isPreviewLoading: boolean;
  setIsPreviewLoading: SetState<boolean>;
  previewError: string | null;
  setPreviewError: SetState<string | null>;
  fileSizeBytes: number | null;
  setFileSizeBytes: SetState<number | null>;
  isDownloadingPdf: boolean;
  setIsDownloadingPdf: SetState<boolean>;
  savedFileHandle: FileSystemFileHandle | null;
  setSavedFileHandle: SetState<FileSystemFileHandle | null>;
  highlightedPage: number | null;
  setHighlightedPage: SetState<number | null>;
  showBackToTop: boolean;
  setShowBackToTop: SetState<boolean>;
  captureIntervalRef: MutableRefObject<NodeJS.Timeout | null>;
  logContainerRef: MutableRefObject<HTMLDivElement | null>;
  previewPanelRef: MutableRefObject<HTMLDivElement | null>;
  streamRef: MutableRefObject<EventSource | null>;
  previewRequestRef: MutableRefObject<number>;
};

type ShellState = {
  stage: Stage;
  lang: Lang;
  langRef: MutableRefObject<Lang>;
  setIsSaved: SetState<boolean>;
  setIsGridViewOpen: SetState<boolean>;
  transitionTo: (stage: Stage) => void;
  addToast: (type: Toast['type'], message: string) => void;
  setModalConfig: SetState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>;
};

type HistoryState = {
  history: HistoryItem[];
  setHistory: SetState<HistoryItem[]>;
  setIsHistoryOpen: SetState<boolean>;
};

type CaptureHandlerArgs = {
  captureState: CaptureState;
  shellState: ShellState;
  historyState: HistoryState;
};

export const useCaptureHandlers = ({
  captureState,
  shellState,
  historyState,
}: CaptureHandlerArgs) => {
  const MAX_DISPLAY_LOGS = 200;
  const LOG_FLUSH_INTERVAL_MS = 100;
  const {
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
    captureIntervalRef,
    logContainerRef,
    previewPanelRef,
    streamRef,
    previewRequestRef,
  } = captureState;

  const { stage, lang, langRef, setIsSaved, setIsGridViewOpen, transitionTo, addToast, setModalConfig } = shellState;
  const { history, setHistory, setIsHistoryOpen } = historyState;
  const copy = messages[lang];
  const pendingLogsRef = useRef<{ message: string; receivedAt: number }[]>([]);
  const logFlushTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearPendingLogFlush = useCallback(() => {
    pendingLogsRef.current = [];
    if (logFlushTimerRef.current) {
      clearTimeout(logFlushTimerRef.current);
      logFlushTimerRef.current = null;
    }
  }, []);

  const flushPendingLogs = useCallback(() => {
    if (logFlushTimerRef.current) {
      clearTimeout(logFlushTimerRef.current);
      logFlushTimerRef.current = null;
    }

    if (pendingLogsRef.current.length === 0) {
      return;
    }

    const nextLogs = pendingLogsRef.current;
    pendingLogsRef.current = [];
    setLogs((prev) => [...prev, ...nextLogs].slice(-MAX_DISPLAY_LOGS));
  }, [setLogs]);

  const queueLog = useCallback((message: string) => {
    pendingLogsRef.current.push({ message, receivedAt: Date.now() });
    if (logFlushTimerRef.current) {
      return;
    }

    logFlushTimerRef.current = setTimeout(() => {
      flushPendingLogs();
    }, LOG_FLUSH_INTERVAL_MS);
  }, [flushPendingLogs]);

  const replaceLogs = useCallback((nextLogs: { message: string; receivedAt: number }[]) => {
    clearPendingLogFlush();
    setLogs(nextLogs.slice(-MAX_DISPLAY_LOGS));
  }, [clearPendingLogFlush, setLogs]);

  useEffect(() => {
    if (stage === 1) {
      setEstimatedTime(copy.stage1.etaCalculating);
    }
  }, [copy.stage1.etaCalculating, setEstimatedTime]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ([1, 2, 3, 4, 6, 9].includes(stage)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stage]);

  useEffect(() => {
    return () => {
      clearPendingLogFlush();
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  useEffect(() => {
    if (stage === 8) {
      return;
    }

    previewRequestRef.current += 1;
    setIsGridViewOpen(false);
    setIsPreviewLoading(false);
    setPreviewError(null);
    setPreviewBlobUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }, [setIsGridViewOpen, setIsPreviewLoading, setPreviewBlobUrl, setPreviewError, stage]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logContainerRef, logs]);

  const stopCapture = async (cancelJob = false) => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    streamRef.current?.close();
    streamRef.current = null;

    if (!cancelJob) {
      return;
    }

    try {
      await fetch(`${API_URL}/cancel`, { method: 'POST' });
    } catch {
      addToast('error', langRef.current === 'ko' ? '\uCEA1\uCC98 \uC791\uC5C5 \uCDE8\uC18C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' : 'Failed to cancel the capture job.');
      throw new Error('cancel failed');
    }
  };

  const resetCaptureSession = () => {
    previewRequestRef.current += 1;
    setPreviewBlobUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setFileSizeBytes(null);
    setIsDownloadingPdf(false);
    setIsPreviewLoading(false);
    setPreviewError(null);
    setIsSaved(false);
    setIsStarting(false);
    setRetryable(false);
    setProgress(0);
    setCompletedPages(0);
    setTotalPages(null);
    setEstimatedTime(messages[langRef.current].stage1.etaCalculating);
    replaceLogs([]);
    setErrorPages([]);
    setPagePreviews([]);
    setStage2PreviewError(null);
    setCapturedImages({});
    setRecaptureIndex(0);
    setUrl('');
    setMode(null);
    setNewPageNumber('');
    setOutputPath('');
    setSavedFileHandle(null);
    setHighlightedPage(null);
    setShowBackToTop(false);
    setIsGridViewOpen(false);
    transitionTo(0);
  };

  const handleCancelCapture = async () => {
    try {
      await stopCapture(true);
      resetCaptureSession();
    } catch {
      // Keep the user on the current screen when backend cancellation fails.
    }
  };

  useEffect(() => {
    return () => {
      clearPendingLogFlush();
      void stopCapture();
    };
  }, []);

  const loadCaptureResults = useCallback(async (): Promise<number[]> => {
    try {
      const response = await fetch(`${API_URL}/result`);
      if (!response.ok) {
        throw new Error((await readErrorMessage(response)) ?? messages[langRef.current].app.loadCaptureResultsFailed);
      }

      const data = await response.json() as CaptureResultResponse;
      const nextErrorPages = Array.isArray(data?.error_pages)
        ? data.error_pages
            .map((value: unknown) => Number.parseInt(String(value), 10))
            .filter((value: number) => Number.isInteger(value) && value > 0)
        : [];
      const nextFileSizeBytes = typeof data?.file_size_bytes === 'number' && Number.isFinite(data.file_size_bytes) && data.file_size_bytes > 0
        ? data.file_size_bytes
        : null;
      const nextTotalPages = typeof data?.total_pages === 'number' && Number.isFinite(data.total_pages) && data.total_pages > 0
        ? Math.trunc(data.total_pages)
        : null;
      const nextPagePreviews = Array.isArray(data?.page_previews)
        ? data.page_previews
            .map((value: unknown): PagePreview | null => {
              if (!value || typeof value !== 'object' || Array.isArray(value)) {
                return null;
              }

              const item = value as Record<string, unknown>;
              const page = Number.parseInt(String(item.page), 10);
              const rawImageUrl = typeof item.image_url === 'string' ? item.image_url.trim() : '';
              if (!Number.isInteger(page) || page < 1 || rawImageUrl.length === 0) {
                return null;
              }

              const imageUrl = /^https?:\/\//i.test(rawImageUrl)
                ? rawImageUrl
                : `${API_URL}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;

              return { page, imageUrl };
            })
            .filter((value: PagePreview | null): value is PagePreview => value !== null)
            .sort((a, b) => a.page - b.page)
        : [];
      const nextPagePreviewErrorCode = typeof data?.page_preview_error_code === 'string'
        ? data.page_preview_error_code.trim()
        : '';
      const nextPagePreviewErrorMessage = typeof data?.page_preview_error_message === 'string'
        ? data.page_preview_error_message.trim()
        : '';
      let nextStage2PreviewError: string | null = null;
      if (nextPagePreviewErrorCode === 'missing_poppler') {
        nextStage2PreviewError = langRef.current === 'ko'
          ? 'Stage 2 미리보기를 만들려면 Poppler for Windows가 필요합니다. Poppler를 설치한 뒤 PATH에 추가하거나 POPPLER_BIN_PATH를 설정해 주세요.'
          : 'Stage 2 previews require Poppler for Windows. Install Poppler, then add its bin folder to PATH or set POPPLER_BIN_PATH.';
      } else if (nextPagePreviewErrorMessage.length > 0) {
        nextStage2PreviewError = nextPagePreviewErrorMessage;
      }

      setFileSizeBytes(nextFileSizeBytes);
      setPagePreviews(nextPagePreviews);
      setStage2PreviewError(nextStage2PreviewError);
      if (nextTotalPages !== null) {
        setTotalPages(nextTotalPages);
      } else if (nextPagePreviews.length > 0) {
        setTotalPages(nextPagePreviews.length);
      }

      setErrorPages(nextErrorPages);
      return nextErrorPages;
    } catch (error) {
      setErrorPages([]);
      setPagePreviews([]);
      setStage2PreviewError(null);
      setFileSizeBytes(null);
      addToast('error', error instanceof Error ? error.message : messages[langRef.current].app.loadCaptureResultsFailed);
      return [];
    }
  }, [
    addToast,
    langRef,
    setErrorPages,
    setFileSizeBytes,
    setPagePreviews,
    setStage2PreviewError,
    setTotalPages,
  ]);

  useEffect(() => {
    if (stage !== 1 && stage !== 6) {
      streamRef.current?.close();
      streamRef.current = null;
      return;
    }

    const eventSource = new EventSource(`${API_URL}/stream`);
    streamRef.current = eventSource;

    const closeStream = () => {
      eventSource.close();
      if (streamRef.current === eventSource) {
        streamRef.current = null;
      }
    };

    eventSource.onmessage = ({ data }) => {
      const event = parseStreamEvent(String(data));

      if (event.type === 'log' && typeof event.message === 'string') {
        queueLog(event.message);
      }

      if (event.type === 'progress') {
        const nextCompletedPages = typeof event.completed_pages === 'number' && Number.isFinite(event.completed_pages)
          ? Math.max(0, Math.trunc(event.completed_pages))
          : null;
        const nextTotalPages = typeof event.total_pages === 'number' && Number.isFinite(event.total_pages)
          ? Math.max(0, Math.trunc(event.total_pages))
          : null;

        if (nextCompletedPages !== null) {
          setCompletedPages(nextCompletedPages);
        }

        if (nextTotalPages !== null) {
          setTotalPages(nextTotalPages);
        }

        if (typeof event.progress === 'number' && Number.isFinite(event.progress)) {
          setProgress(Math.max(0, Math.min(100, Math.round(event.progress))));
        } else if (nextCompletedPages !== null && nextTotalPages !== null && nextTotalPages > 0) {
          setProgress(Math.max(0, Math.min(100, Math.round((nextCompletedPages / nextTotalPages) * 100))));
        }

        setEstimatedTime(formatRemainingTime(event.remaining_seconds, messages[langRef.current].stage1));
      }

      if (event.type !== 'status') {
        return;
      }

      if (event.status === 'running') {
        return;
      }

      closeStream();

      if (event.status === 'completed') {
        flushPendingLogs();
        setRetryable(false);
        setEstimatedTime(messages[langRef.current].stage1.wait);
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
          captureIntervalRef.current = null;
        }

        if (stage === 6) {
          setProgress(100);
          void (async () => {
            await loadCaptureResults();
            addToast('success', messages[langRef.current].app.autoRecaptureComplete);
            transitionTo(7);
          })();
          return;
        }

        void (async () => {
          await loadCaptureResults();
          addToast('success', messages[langRef.current].app.captureComplete);
          transitionTo(2);
        })();
        return;
      }

      if (event.status === 'failed') {
        flushPendingLogs();
        setRetryable(stage === 1);
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
          captureIntervalRef.current = null;
        }
        addToast('error', event.message ?? messages[langRef.current].app.startCaptureFailed);
        if (stage === 6) {
          transitionTo(2);
        }
        return;
      }

      setRetryable(false);
    };

    eventSource.onerror = () => {
      closeStream();
      flushPendingLogs();
      setRetryable(true);
      addToast('error', messages[langRef.current].app.sseDisconnected);
    };

    return () => {
      flushPendingLogs();
      closeStream();
    };
  }, [
    addToast,
    captureIntervalRef,
    flushPendingLogs,
    loadCaptureResults,
    queueLog,
    setCompletedPages,
    setEstimatedTime,
    setProgress,
    setRetryable,
    setTotalPages,
    stage,
    streamAttempt,
    streamRef,
    transitionTo,
  ]);

  const retryStream = () => {
    void stopCapture();
    setRetryable(false);
    setStreamAttempt((prev) => prev + 1);
  };

  const getPreviewLoadFailedMessage = () =>
    langRef.current === 'ko' ? '\u0050\u0044\u0046 \ubbf8\ub9ac\ubcf4\uae30\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.' : 'Failed to load the PDF preview.';

  const getDownloadFailedMessage = () =>
    langRef.current === 'ko' ? '\u0050\u0044\u0046 \uB2E4\uC6B4\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' : 'Failed to download the PDF.';

  const fetchLatestPdfBlob = async (fallbackMessage: string) => {
    const response = await fetch(`${API_URL}/preview-pdf`);
    if (!response.ok) {
      throw new Error((await readErrorMessage(response)) ?? fallbackMessage);
    }

    return response.blob();
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const writeBlobToHandle = async (handle: FileSystemFileHandle, blob: Blob) => {
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  };

  const notifyClientSave = async (filename: string) => {
    try {
      const response = await fetch(`${API_URL}/notify-client-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        console.warn((await readErrorMessage(response)) ?? 'Failed to notify client save.');
      }
    } catch (error) {
      console.warn('Failed to notify client save.', error);
    }
  };

  const handleOpenPreview = async () => {
    const requestId = previewRequestRef.current + 1;
    previewRequestRef.current = requestId;

    setPreviewBlobUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setPreviewError(null);
    setIsPreviewLoading(true);
    transitionTo(8);

    try {
      const blob = await fetchLatestPdfBlob(getPreviewLoadFailedMessage());
      const nextBlobUrl = URL.createObjectURL(blob);

      if (previewRequestRef.current !== requestId) {
        URL.revokeObjectURL(nextBlobUrl);
        return;
      }

      setPreviewBlobUrl(nextBlobUrl);
    } catch (error) {
      if (previewRequestRef.current !== requestId) {
        return;
      }

      setPreviewError(error instanceof Error ? error.message : getPreviewLoadFailedMessage());
    } finally {
      if (previewRequestRef.current === requestId) {
        setIsPreviewLoading(false);
      }
    }
  };

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) {
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const blob = await fetchLatestPdfBlob(getDownloadFailedMessage());

      if (savedFileHandle) {
        await writeBlobToHandle(savedFileHandle, blob);
        setOutputPath(savedFileHandle.name ?? 'viewer_export.pdf');
      } else {
        triggerBlobDownload(blob, 'viewer_export.pdf');
      }
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : getDownloadFailedMessage());
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getStage5FileInfo = () => {
    const parts: string[] = [];
    const formattedFileSize = fileSizeBytes === null ? null : formatFileSize(fileSizeBytes);

    if (formattedFileSize) {
      parts.push(formattedFileSize);
    }

    if (totalPages !== null) {
      parts.push(lang === 'ko' ? `${totalPages} pages` : `${totalPages} pages`);
    }

    return parts.length > 0 ? parts.join(' / ') : null;
  };

  const startCapture = async (nextUrl: string = url, nextMode: Mode = mode) => {
    if (!nextUrl || !nextMode || isStarting) {
      return;
    }

    await stopCapture();
    previewRequestRef.current += 1;
    setPreviewBlobUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setFileSizeBytes(null);
    setIsDownloadingPdf(false);
    setIsPreviewLoading(false);
    setPreviewError(null);
    setIsSaved(false);
    setSavedFileHandle(null);
    setIsStarting(true);
    setRetryable(false);
    setStreamAttempt(0);
    const startedAt = Date.now();
    replaceLogs([
      { message: messages[langRef.current].app.logInitializing, receivedAt: startedAt },
      { message: messages[langRef.current].app.logConnecting, receivedAt: startedAt },
    ]);
    setErrorPages([]);
    setPagePreviews([]);
    setProgress(0);
    setCompletedPages(0);
    setTotalPages(null);
    setEstimatedTime(messages[langRef.current].stage1.etaCalculating);
    setCapturedImages({});
    setRecaptureIndex(0);
    setOutputPath('');
    setNewPageNumber('');
    setHighlightedPage(null);
    setShowBackToTop(false);
    setUrl(nextUrl);
    setMode(nextMode);

    try {
      const response = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: nextUrl, mode: nextMode }),
      });

      if (!response.ok) {
        throw new Error((await readErrorMessage(response)) ?? messages[langRef.current].app.startCaptureFailed);
      }

      transitionTo(1);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : messages[langRef.current].app.startCaptureFailed);
    } finally {
      setIsStarting(false);
    }
  };

  const recaptureHistoryItem = (historyUrl: string, historyMode: Mode) => {
    setIsHistoryOpen(false);
    void startCapture(historyUrl, historyMode);
  };

  useEffect(() => {
    let ignore = false;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/status`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (ignore || !data?.running) {
          return;
        }

        setModalConfig({
          isOpen: true,
          title: langRef.current === 'ko' ? '\uC9C4\uD589 \uC911\uC778 \uCEA1\uCC98 \uC791\uC5C5' : 'Capture In Progress',
          message:
            langRef.current === 'ko'
              ? '\uC9C4\uD589 \uC911\uC778 \uCEA1\uCC98 \uC791\uC5C5\uC774 \uC788\uC2B5\uB2C8\uB2E4. \uCDE8\uC18C\uD558\uACE0 \uC0C8\uB85C \uC2DC\uC791\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?'
              : 'A capture job is already in progress. Do you want to cancel it and start fresh?',
          confirmText: langRef.current === 'ko' ? '\uCDE8\uC18C\uD558\uACE0 \uC0C8\uB85C \uC2DC\uC791' : 'Cancel and Restart',
          cancelText: langRef.current === 'ko' ? '\uB2EB\uAE30' : 'Dismiss',
          onConfirm: () => {
            void handleCancelCapture();
          },
        });
      } catch {
        // Ignore status-check failures on load and let the user proceed normally.
      }
    };

    void checkStatus();

    return () => {
      ignore = true;
    };
  }, [setModalConfig]);

  const handleRecapture = () => {
    void stopCapture();
    transitionTo(3);
  };

  const handleManualUpload = () => {
    void stopCapture();
    transitionTo(4);
  };

  const handleAutoRecapture = async () => {
    await stopCapture();
    replaceLogs([]);
    setProgress(0);
    setRecaptureIndex(0);

    const total = errorPages.length;
    let currentIdx = 0;

    try {
      const response = await fetch(`${API_URL}/recapture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: errorPages, mode, url }),
      });

      if (!response.ok) {
        throw new Error((await readErrorMessage(response)) ?? messages[langRef.current].app.startCaptureFailed);
      }

      transitionTo(6);

      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }

      captureIntervalRef.current = setInterval(() => {
        if (total <= 0) {
          setProgress(95);
          return;
        }

        setRecaptureIndex(Math.min(currentIdx, total - 1));
        setProgress(Math.min(95, ((currentIdx + 1) / total) * 95));

        if (currentIdx < total - 1) {
          currentIdx += 1;
        }
      }, 1500);
    } catch (error) {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      addToast('error', error instanceof Error ? error.message : messages[langRef.current].app.startCaptureFailed);
      transitionTo(2);
    }
  };

  const handleSkipToSave = () => {
    transitionTo(7);
  };

  const handleSave = async () => {
    if (isManualMergeSaving) {
      return;
    }

    setIsManualMergeSaving(true);

    try {
      const uploads = Object.entries(capturedImages as Record<string, { url: string; name: string }>)
        .map(([page, image]) => ({ page: Number.parseInt(page, 10), image }))
        .filter(
          (entry): entry is { page: number; image: { url: string; name: string } } =>
            Number.isInteger(entry.page) && entry.page > 0 && typeof entry.image?.url === 'string',
        )
        .sort((a, b) => a.page - b.page);

      for (const { page, image } of uploads) {
        const blobResponse = await fetch(image.url);
        if (!blobResponse.ok) {
          throw new Error(`Failed to read the uploaded image for page ${page}.`);
        }

        const blob = await blobResponse.blob();
        const file = new File([blob], image.name || `page-${page}.png`, {
          type: blob.type || 'image/png',
        });
        const formData = new FormData();
        formData.append('page', String(page));
        formData.append('file', file);

        const uploadResponse = await fetch(`${API_URL}/upload-page`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error((await readErrorMessage(uploadResponse)) ?? `Failed to upload page ${page}.`);
        }
      }

      const mergeResponse = await fetch(`${API_URL}/merge`, {
        method: 'POST',
      });

      if (!mergeResponse.ok) {
        throw new Error((await readErrorMessage(mergeResponse)) ?? messages[langRef.current].app.saveFailed);
      }

      transitionTo(7);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : messages[langRef.current].app.saveFailed);
    } finally {
      setIsManualMergeSaving(false);
    }
  };

  const handleFinalSave = async (isReselectingLocation = false) => {
    try {
      const pickerWindow = window as WindowWithSavePicker;
      if (!pickerWindow.showSaveFilePicker) {
        const blob = await fetchLatestPdfBlob(getDownloadFailedMessage());
        const displayName = 'viewer_export.pdf';
        triggerBlobDownload(blob, displayName);
        await notifyClientSave(displayName);
        setSavedFileHandle(null);
        setOutputPath(displayName);
        setIsSaved(true);
        addToast('success', isReselectingLocation ? copy.stage4.chooseSaveLocationAgainToast : messages[langRef.current].app.pdfSaveComplete);
        transitionTo(5);
        return;
      }

      const handle = await pickerWindow.showSaveFilePicker({
        suggestedName: 'viewer_export.pdf',
        types: [
          {
            description: 'PDF Document',
            accept: { 'application/pdf': ['.pdf'] },
          },
        ],
      });

      transitionTo(9);

      const blob = await fetchLatestPdfBlob(messages[langRef.current].app.saveFailed);
      await writeBlobToHandle(handle, blob);

      const displayName = handle.name ?? 'viewer_export.pdf';
      await notifyClientSave(displayName);
      setSavedFileHandle(handle);
      setOutputPath(displayName);
      setIsSaved(true);
      setHistory((prev) => [
        {
          id: Math.random().toString(36).substr(2, 9),
          url,
          timestamp: Date.now(),
          mode,
          outputPath: displayName,
        },
        ...prev,
      ].slice(0, 10));
      addToast('success', isReselectingLocation ? copy.stage4.chooseSaveLocationAgainToast : messages[langRef.current].app.pdfSaveComplete);
      transitionTo(5);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        transitionTo(isReselectingLocation ? 5 : 7);
        return;
      }

      addToast('error', error instanceof Error ? (isReselectingLocation ? `${copy.stage4.chooseSaveLocationAgainErrorPrefix}${error.message}` : error.message) : (isReselectingLocation ? copy.stage4.chooseSaveLocationAgainErrorFallback : messages[langRef.current].app.saveFailed));
      transitionTo(isReselectingLocation ? 5 : 7);
    }
  };

  const handleAddPage = () => {
    const num = parseInt(newPageNumber, 10);
    if (Number.isNaN(num)) {
      addToast('error', messages[langRef.current].app.addErrorPageInvalid);
      return;
    }
    if (errorPages.includes(num)) {
      addToast('error', messages[langRef.current].app.addErrorPageInvalid);
      return;
    }
    setErrorPages((prev) => [...prev, num].sort((a, b) => a - b));
    setNewPageNumber('');
    addToast('success', messages[langRef.current].app.pageAdded.replace('{num}', String(num)));
  };

  const handleFile = (file: File, page: number) => {
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file && file.type && file.type.startsWith('image/')) {
      if (file.size > MAX_SIZE) {
        addToast('error', copy.stage3.constraints);
        return;
      }
      const fileUrl = URL.createObjectURL(file);
      setCapturedImages((prev) => ({ ...prev, [page]: { url: fileUrl, name: file.name } }));
      addToast('success', messages[langRef.current].app.uploadComplete.replace('{page}', String(page)));
    } else {
      addToast('error', messages[langRef.current].app.imageOnly);
    }
  };

  const handleBulkFiles = (files: FileList) => {
    const MAX_FILES = 20;
    const MAX_SIZE = 50 * 1024 * 1024;

    let matchedCount = 0;
    let hasNoMatch = false;
    const newImages = { ...capturedImages };

    const filesToProcess = Array.from(files).slice(0, MAX_FILES);

    if (files.length > MAX_FILES) {
      addToast('warning', copy.stage3.bulkConstraints);
    }

    filesToProcess.forEach((file) => {
      if (!file.type || !file.type.startsWith('image/')) {
        return;
      }
      if (file.size > MAX_SIZE) {
        hasNoMatch = true;
        return;
      }

      const match = file.name.match(/\d+/);
      if (match) {
        const pageNum = parseInt(match[0], 10);
        if (errorPages.includes(pageNum)) {
          const fileUrl = URL.createObjectURL(file);
          newImages[pageNum] = { url: fileUrl, name: file.name };
          matchedCount += 1;
        } else {
          hasNoMatch = true;
        }
      } else {
        hasNoMatch = true;
      }
    });

    if (matchedCount > 0) {
      setCapturedImages(newImages);
      addToast('success', copy.stage3.bulkUploadSuccess.replace('{count}', String(matchedCount)));
    }

    if (hasNoMatch) {
      addToast('warning', copy.stage3.bulkUploadNoMatch);
    }
  };

  const scrollToPage = (page: number) => {
    setHighlightedPage(page);
    const element = document.getElementById(`preview-page-${page}`);
    if (element && previewPanelRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePreviewScroll = (e: UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowBackToTop(scrollTop > 400);
  };

  const backToTop = () => {
    if (previewPanelRef.current) {
      previewPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    progress,
    estimatedTime,
    completedPages,
    totalPages,
    logs,
    errorPages,
    pagePreviews,
    outputPath,
    retryable,
    capturedImages,
    newPageNumber,
    recaptureIndex,
    previewBlobUrl,
    isPreviewLoading,
    previewError,
    fileSizeBytes,
    isDownloadingPdf,
    savedFileHandle,
    highlightedPage,
    showBackToTop,
    history,
    isStarting,
    isManualMergeSaving,
    url,
    mode,
    lang,
    stopCapture,
    resetCaptureSession,
    handleCancelCapture,
    retryStream,
    getPreviewLoadFailedMessage,
    getDownloadFailedMessage,
    handleOpenPreview,
    handleDownloadPdf,
    getStage5FileInfo,
    startCapture,
    recaptureHistoryItem,
    handleRecapture,
    handleManualUpload,
    handleAutoRecapture,
    handleSkipToSave,
    handleSave,
    handleFinalSave,
    handleAddPage,
    handleFile,
    handleBulkFiles,
    scrollToPage,
    handlePreviewScroll,
    backToTop,
  };
};
