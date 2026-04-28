import { AnimatePresence, motion } from 'motion/react';
import { messages } from './i18n';
import AppHeader from './components/AppHeader';
import BackgroundAtmosphere from './components/BackgroundAtmosphere';
import CursorTrail from './components/CursorTrail';
import CustomModal from './components/CustomModal';
import GridViewModal from './components/GridViewModal';
import PastelBackground from './components/PastelBackground';
import ToastNotification from './components/ToastNotification';
import { useAppShellState } from './hooks/useAppShellState';
import { useCaptureHandlers } from './hooks/useCaptureHandlers';
import { useCaptureState } from './hooks/useCaptureState';
import { useHistory } from './hooks/useHistory';
import RenderStage0 from './stages/renderStage0';
import RenderStage1 from './stages/renderStage1';
import RenderStage2 from './stages/renderStage2';
import RenderStage3 from './stages/renderStage3';
import RenderStage4 from './stages/renderStage4';
import RenderStage5 from './stages/renderStage5';
import RenderStage6 from './stages/renderStage6';
import RenderStage7 from './stages/renderStage7';
import RenderStage8 from './stages/renderStage8';
import RenderStage9 from './stages/renderStage9';

export default function App() {
  const shellState = useAppShellState();
  const captureState = useCaptureState();
  const historyState = useHistory();
  const handlers = useCaptureHandlers({
    captureState,
    shellState,
    historyState,
  });

  const {
    stage,
    direction,
    transitionTo,
    isSaved,
    setIsGridViewOpen,
    isGridViewOpen,
    modalConfig,
    setModalConfig,
    theme,
    setTheme,
    lang,
    setLang,
    addToast,
    removeToast,
    toasts,
    isDraggingGlobal,
    setIsDraggingGlobal,
  } = shellState;
  const {
    url,
    setUrl,
    mode,
    setMode,
    progress,
    completedPages,
    totalPages,
    logs,
    errorPages,
    setErrorPages,
    pagePreviews,
    stage2PreviewError,
    outputPath,
    isStarting,
    isManualMergeSaving,
    retryable,
    capturedImages,
    setCapturedImages,
    newPageNumber,
    setNewPageNumber,
    recaptureIndex,
    previewBlobUrl,
    isPreviewLoading,
    previewError,
    fileSizeBytes,
    isDownloadingPdf,
    highlightedPage,
    showBackToTop,
    dragCounter,
    logEndRef,
    logContainerRef,
    previewPanelRef,
  } = captureState;
  const { history, setHistory, isHistoryOpen, setIsHistoryOpen, viewHistoryItem } = historyState;
  const copy = messages[lang];
  const isLogoHomeDisabled = stage === 1 || stage === 6;

  const handleLogoHome = () => {
    if (isLogoHomeDisabled) {
      return;
    }

    const goHome = () => {
      handlers.resetCaptureSession();
    };

    if (stage >= 2) {
      setModalConfig({
        isOpen: true,
        title: lang === 'ko' ? '\uBA54\uC778\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30' : 'Return to Home',
        message: lang === 'ko'
          ? '\uC791\uC5C5 \uC911\uC778 \uB0B4\uC6A9\uC774 \uCD08\uAE30\uD654\uB429\uB2C8\uB2E4. \uC815\uB9D0 \uBA54\uC778\uC73C\uB85C \uB3CC\uC544\uAC00\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?'
          : 'Your current progress will be reset. Are you sure you want to return to the home screen?',
        confirmText: lang === 'ko' ? '\uBA54\uC778\uC73C\uB85C \uC774\uB3D9' : 'Return Home',
        cancelText: lang === 'ko' ? '\uCDE8\uC18C' : 'Cancel',
        onConfirm: goHome,
      });
      return;
    }

    goHome();
  };

  const handleViewHistoryItem = (item: (typeof history)[number]) => {
    viewHistoryItem({
      item,
      setUrl,
      setMode,
      setOutputPath: captureState.setOutputPath,
      setIsSaved: shellState.setIsSaved,
      transitionTo,
    });
  };

  return (
    <div className={`min-h-screen w-full bg-bg-color flex flex-col items-center justify-center px-4 pt-24 pb-20 md:p-8 overflow-x-hidden overflow-y-auto relative ${theme}`} data-theme={theme}>
      {theme !== 'pastel' && <BackgroundAtmosphere />}
      {theme === 'pastel' && <PastelBackground />}
      {theme === 'pastel' && <CursorTrail />}

      <AppHeader
        theme={theme}
        lang={lang}
        copy={copy}
        history={history}
        isHistoryOpen={isHistoryOpen}
        setIsHistoryOpen={setIsHistoryOpen}
        setLang={setLang}
        setTheme={setTheme}
        onLogoHome={handleLogoHome}
        isLogoHomeDisabled={isLogoHomeDisabled}
        onViewHistory={handleViewHistoryItem}
        onDeleteHistory={(id) => setHistory((prev) => prev.filter((item) => item.id !== id))}
        onClearHistory={() => {
          setModalConfig({
            isOpen: true,
            title: lang === 'ko' ? '\uC804\uCCB4 \uAE30\uB85D \uC0AD\uC81C' : 'Clear All History',
            message: lang === 'ko' ? '\uCD5C\uADFC \uAE30\uB85D\uC744 \uBAA8\uB450 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?' : 'Are you sure you want to clear all recent history?',
            confirmText: lang === 'ko' ? '\uC0AD\uC81C' : 'Clear',
            cancelText: lang === 'ko' ? '\uCDE8\uC18C' : 'Cancel',
            onConfirm: () => setHistory([]),
          });
        }}
        onRecaptureHistory={handlers.recaptureHistoryItem}
      />

      <main className={`w-full relative z-10 transition-all duration-500 ${stage === 2 ? 'max-w-[1200px] px-4' : stage === 8 ? 'max-w-none px-4 lg:w-[72vw] lg:min-w-[72vw] lg:max-w-[1400px]' : 'max-w-[580px]'}`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stage}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -40, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={`spatial-card animate-float-card transition-all duration-500 flex flex-col justify-center ${stage === 2 || stage === 6 ? 'p-8 md:p-10 h-auto min-h-0 sm:min-h-0 lg:h-[80vh] lg:min-h-[700px] !justify-start overflow-hidden' : 'p-8 md:p-10 min-h-[520px]'} ${theme === 'pastel' ? '!bg-white/70 !backdrop-blur-[40px] border-white/40' : ''}`}
          >
            {stage === 0 && (
              <RenderStage0
                copy={copy}
                url={url}
                setUrl={setUrl}
                mode={mode}
                setMode={setMode}
                theme={theme}
                isStarting={isStarting}
                startCapture={handlers.startCapture}
              />
            )}
            {stage === 1 && (
              <RenderStage1
                copy={copy}
                mode={mode}
                completedPages={completedPages}
                totalPages={totalPages}
                progress={progress}
                estimatedTime={captureState.estimatedTime}
                theme={theme}
                retryable={retryable}
                retryStream={handlers.retryStream}
                handleCancelCapture={handlers.handleCancelCapture}
                lang={lang}
                logContainerRef={logContainerRef}
                logs={logs}
                logEndRef={logEndRef}
              />
            )}
            {stage === 2 && (
              <RenderStage2
                totalPages={totalPages}
                pagePreviews={pagePreviews}
                lang={lang}
                copy={copy}
                errorPages={errorPages}
                stage2PreviewError={stage2PreviewError}
                setModalConfig={setModalConfig}
                transitionTo={transitionTo}
                setErrorPages={setErrorPages}
                highlightedPage={highlightedPage}
                addToast={addToast}
                showBackToTop={showBackToTop}
                backToTop={handlers.backToTop}
                previewPanelRef={previewPanelRef}
                handlePreviewScroll={handlers.handlePreviewScroll}
                theme={theme}
                scrollToPage={handlers.scrollToPage}
                newPageNumber={newPageNumber}
                setNewPageNumber={setNewPageNumber}
                handleAddPage={handlers.handleAddPage}
                handleRecapture={handlers.handleRecapture}
                handleSkipToSave={handlers.handleSkipToSave}
              />
            )}
            {stage === 3 && <RenderStage3 copy={copy} handleAutoRecapture={handlers.handleAutoRecapture} handleManualUpload={handlers.handleManualUpload} />}
            {stage === 4 && (
              <RenderStage4
                copy={copy}
                theme={theme}
                isDraggingGlobal={isDraggingGlobal}
                setIsDraggingGlobal={setIsDraggingGlobal}
                dragCounter={dragCounter}
                handleBulkFiles={handlers.handleBulkFiles}
                errorPages={errorPages}
                capturedImages={capturedImages}
                handleFile={handlers.handleFile}
                setCapturedImages={setCapturedImages}
                isManualMergeSaving={isManualMergeSaving}
                handleSave={handlers.handleSave}
                transitionTo={transitionTo}
                lang={lang}
              />
            )}
            {stage === 5 && (
              <RenderStage5
                copy={copy}
                theme={theme}
                getStage5FileInfo={handlers.getStage5FileInfo}
                handleOpenPreview={handlers.handleOpenPreview}
                outputPath={outputPath}
                handleDownloadPdf={handlers.handleDownloadPdf}
                isDownloadingPdf={isDownloadingPdf}
                handleFinalSave={handlers.handleFinalSave}
                transitionTo={transitionTo}
              />
            )}
            {stage === 6 && (
              <RenderStage6
                copy={copy}
                errorPages={errorPages}
                recaptureIndex={recaptureIndex}
                progress={progress}
                estimatedTime={captureState.estimatedTime}
                logs={logs}
                logContainerRef={logContainerRef}
                handleManualUpload={handlers.handleManualUpload}
                theme={theme}
              />
            )}
            {stage === 7 && (
              <RenderStage7
                copy={copy}
                totalPages={totalPages}
                errorPages={errorPages}
                theme={theme}
                lang={lang}
                handleOpenPreview={handlers.handleOpenPreview}
                handleFinalSave={handlers.handleFinalSave}
                transitionTo={transitionTo}
              />
            )}
            {stage === 8 && (
              <RenderStage8
                previewBlobUrl={previewBlobUrl}
                totalPages={totalPages}
                isPreviewLoading={isPreviewLoading}
                previewError={previewError}
                copy={copy}
                errorPages={errorPages}
                theme={theme}
                lang={lang}
                isSaved={isSaved}
                getPreviewLoadFailedMessage={handlers.getPreviewLoadFailedMessage}
                transitionTo={transitionTo}
                handleFinalSave={handlers.handleFinalSave}
                setIsGridViewOpen={setIsGridViewOpen}
              />
            )}
            {stage === 9 && <RenderStage9 copy={copy} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <GridViewModal
        isOpen={isGridViewOpen && totalPages !== null}
        onClose={() => setIsGridViewOpen(false)}
        totalPages={totalPages ?? 0}
        pagePreviews={pagePreviews}
        recapturedPages={errorPages}
        copy={copy}
        theme={theme}
      />
      <ToastNotification toasts={toasts} removeToast={removeToast} copy={copy} />
      <CustomModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        theme={theme}
      />
    </div>
  );
}
