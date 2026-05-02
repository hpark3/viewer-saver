import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, FileText, LayoutGrid, Loader2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import Tooltip from '../components/Tooltip';

const MOBILE_PREVIEW_BREAKPOINT = '(max-width: 767px)';

const checkIsMobilePreview = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const mediaMatches = typeof window.matchMedia === 'function'
    ? window.matchMedia(MOBILE_PREVIEW_BREAKPOINT).matches
    : window.innerWidth < 768;

  if (mediaMatches) {
    return true;
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
};

const useIsMobilePreview = () => {
  const [isMobilePreview, setIsMobilePreview] = useState(checkIsMobilePreview);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateIsMobilePreview = () => {
      setIsMobilePreview(checkIsMobilePreview());
    };

    updateIsMobilePreview();

    const mediaQueryList = typeof window.matchMedia === 'function'
      ? window.matchMedia(MOBILE_PREVIEW_BREAKPOINT)
      : null;

    mediaQueryList?.addEventListener?.('change', updateIsMobilePreview);
    window.addEventListener('resize', updateIsMobilePreview);

    return () => {
      mediaQueryList?.removeEventListener?.('change', updateIsMobilePreview);
      window.removeEventListener('resize', updateIsMobilePreview);
    };
  }, []);

  return isMobilePreview;
};

const RenderStage8 = ({ previewBlobUrl, totalPages, isPreviewLoading, previewError, copy, errorPages, theme, lang, isSaved, getPreviewLoadFailedMessage, transitionTo, handleFinalSave, setIsGridViewOpen }: any) => {
  const isMobilePreview = useIsMobilePreview();
  const isIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
  const openDocumentLabel = lang === 'ko' ? '\ubb38\uc11c \uc5f4\uae30' : 'Open document';
  const saveToFilesLabel = lang === 'ko' ? '\ud30c\uc77c\ub85c \uc800\uc7a5' : 'Save to Files';
  const mobileCardTitle = isIOS
    ? (lang === 'ko' ? 'iPhone\uc5d0\uc11c\ub294 \ud30c\uc77c\uc5d0 \uc800\uc7a5\ud574 \uc8fc\uc138\uc694.' : 'Save the document to Files on iPhone.')
    : (lang === 'ko' ? '\ubaa8\ubc14\uc77c\uc5d0\uc11c\ub294 \uc0c8 \ud0ed\uc73c\ub85c \ubb38\uc11c\ub97c \ud655\uc778\ud574 \uc8fc\uc138\uc694.' : 'Open the document in a new tab on mobile.');
  const mobileCardDescription = isIOS
    ? (lang === 'ko'
      ? 'iOS Safari\uc5d0\uc11c\ub294 blob \ubb38\uc11c \uc5f4\uae30\uac00 \uc81c\ud55c\ub420 \uc218 \uc788\uc5b4\uc11c \ud30c\uc77c \uc800\uc7a5 \ubc29\uc2dd\uc744 \uc0ac\uc6a9\ud569\ub2c8\ub2e4. \uc544\ub798 \ubc84\ud2bc\uc744 \ub20c\ub7ec Files\uc5d0 \uc800\uc7a5\ud55c \ub4a4 \uc5f4\uc5b4 \uc8fc\uc138\uc694.'
      : 'iOS Safari can block blob document opening, so use the save flow below and open the PDF from Files after saving.')
    : (lang === 'ko'
      ? '\ube0c\ub77c\uc6b0\uc800 \ub0b4\uc7a5 PDF \ubbf8\ub9ac\ubcf4\uae30\uac00 \uae30\uae30\ub9c8\ub2e4 \ub2e4\ub974\uac8c \ub3d9\uc791\ud560 \uc218 \uc788\uc5b4\uc694. \uc544\ub798 \ubc84\ud2bc\uc73c\ub85c \ubb38\uc11c\ub97c \uc548\uc815\uc801\uc73c\ub85c \uc5f4\uac70\ub098 \uc800\uc7a5\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.'
      : 'Built-in PDF previews vary across mobile browsers, so use the actions below to open or save the document reliably.');

  const mobileCardClassName = theme === 'dark'
    ? 'bg-bg-space-center/95 border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.35)]'
    : theme === 'pastel'
      ? 'bg-white/78 border-rose-100/80 shadow-[0_24px_80px_rgba(255,182,193,0.22)]'
      : 'bg-white/95 border-primary-blue/15 shadow-[0_24px_80px_rgba(38,121,235,0.14)]';

  const mobileBadgeClassName = theme === 'dark'
    ? 'bg-vivid-yellow/12 text-vivid-yellow shadow-lg shadow-vivid-yellow/10'
    : theme === 'pastel'
      ? 'bg-rose-100 text-rose-400 shadow-sm'
      : 'bg-primary-blue/10 text-primary-blue shadow-sm';

  const mobileTitleClassName = theme === 'dark' ? 'text-slate-100' : 'text-text-primary';
  const mobileDescriptionClassName = theme === 'dark' ? 'text-slate-300' : 'text-text-secondary';

  return (
    <div className="space-y-6 relative">
      {previewBlobUrl && totalPages !== null && !isPreviewLoading && !previewError && !isMobilePreview && (
        <div className="absolute top-2 left-2 z-30">
          <Tooltip content={copy.stage8.viewAll} side="bottom" align="start" theme={theme}>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsGridViewOpen(true)}
              className="w-10 h-10 spatial-card !rounded-full flex items-center justify-center shadow-lg group bg-white dark:bg-bg-space-center border border-black/5 dark:border-white/10"
            >
              <LayoutGrid size={18} className="text-primary-blue" />
            </motion.button>
          </Tooltip>
        </div>
      )}

      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold">{copy.stage8.title}</h2>
        <div className="flex flex-col items-center gap-1">
          {totalPages !== null && (
            <p className="text-sm text-text-secondary">{copy.stage8.subtitle.replace('{count}', String(totalPages))}</p>
          )}
          {errorPages.length > 0 && totalPages !== null && (
            <div className={`mt-1 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
              theme === 'pastel' ? 'bg-[#D9D2FF]/20 border-[#D9D2FF]/30 text-[#D9D2FF]' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
            }`}>
              {lang === 'ko'
                ? `${totalPages}\ud398\uc774\uc9c0 \uc911 ${errorPages.length}\ud398\uc774\uc9c0\uac00 \uc644\ubcbd\ud558\uac8c \uad50\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4`
                : `${errorPages.length} out of ${totalPages} pages have been perfectly corrected`}
            </div>
          )}
        </div>
      </div>

      {isSaved && !previewError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {copy.stage8.alreadySaved}
          </p>
        </motion.div>
      )}

      <div className={`bg-bg-space-edge/30 rounded-2xl border border-black/5 p-4 inner-shadow dark:border-white/5 ${previewBlobUrl && isMobilePreview ? '' : 'min-h-[460px]'}`}>
        {isPreviewLoading ? (
          <div className="min-h-[460px] flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
            <p className="text-sm font-medium text-text-secondary">{copy.stage8.loading}</p>
          </div>
        ) : previewError ? (
          <div className="min-h-[460px] flex flex-col items-center justify-center gap-5 text-center px-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <div className="space-y-2">
              <p className="text-base font-bold text-text-primary">{previewError}</p>
              <p className="text-sm text-text-secondary">{getPreviewLoadFailedMessage()}</p>
            </div>
            <button
              onClick={() => transitionTo(7)}
              className="px-5 py-3 clay-btn text-primary-blue text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ArrowLeft size={18} /> {copy.stage7.preview}
            </button>
          </div>
        ) : previewBlobUrl && isMobilePreview ? (
          <div className="flex items-center justify-center px-4 py-8 sm:px-6">
            <div className={`w-full max-w-md rounded-[32px] border p-5 text-center ${mobileCardClassName}`}>
              <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${mobileBadgeClassName}`}>
                <FileText size={22} />
              </div>
              <div className="space-y-3">
                <p className={`text-base font-bold ${mobileTitleClassName}`}>
                  {mobileCardTitle}
                </p>
                <p className={`text-sm leading-relaxed ${mobileDescriptionClassName}`}>
                  {mobileCardDescription}
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                {!isIOS && (
                  <a
                    href={previewBlobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="clay-btn-yellow flex w-full items-center justify-center gap-2 py-4 text-base font-bold shadow-lg"
                  >
                    <ExternalLink size={18} />
                    {openDocumentLabel}
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : previewBlobUrl ? (
          <iframe
            src={previewBlobUrl}
            title="PDF preview"
            className="w-full min-h-[460px] h-[68vh] max-h-[78vh] rounded-xl bg-white"
          />
        ) : (
          <div className="min-h-[460px] flex items-center justify-center text-sm text-text-secondary text-center px-6">
            {copy.stage8.loading}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {isSaved && !previewError && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => transitionTo(5)}
            className="w-full py-4 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-primary-blue border-2 border-primary-blue/30 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeft size={20} /> {copy.stage8.backToSuccess}
          </motion.button>
        )}

        {!previewError && (
          <button
            onClick={handleFinalSave}
            className="clay-btn-yellow w-full py-4 flex items-center justify-center gap-2 text-base font-bold shadow-lg"
          >
            <Save size={20} /> {copy.stage8.save}
          </button>
        )}

        <button
          onClick={() => transitionTo(2)}
          className="w-full py-3 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
        >
          {copy.stage8.backToReview}
        </button>
      </div>
    </div>
  );
};

export default RenderStage8;
