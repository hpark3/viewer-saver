import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, LayoutGrid, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const GridViewModal = ({ 
  isOpen, 
  onClose, 
  totalPages, 
  recapturedPages, 
  pagePreviews,
  copy, 
  theme 
}: any) => {
  const [loadedPages, setLoadedPages] = useState<Record<number, boolean>>({});
  const [failedPages, setFailedPages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLoadedPages({});
    setFailedPages({});
  }, [isOpen, pagePreviews, totalPages]);

  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`w-full max-w-[min(92vw,1600px)] h-full max-h-[92vh] spatial-card p-4 sm:p-6 md:p-8 overflow-hidden flex flex-col gap-6 ${
            theme === 'pastel' ? '!bg-white/60 !backdrop-blur-[60px] border-white/40' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center">
                <LayoutGrid size={20} className="text-primary-blue" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">{copy.stage8.viewAll}</h2>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {pagePreviews.length === 0 ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-black/10 bg-black/5 px-6 text-center text-sm font-semibold text-text-secondary dark:border-white/10 dark:bg-white/5">
                {copy.stage8.pageLoadFailed}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {pagePreviews.map((preview) => {
                  const pageNum = preview.page;
                  const isRecaptured = recapturedPages.includes(pageNum);
                  const isLoaded = loadedPages[pageNum] === true;
                  const isFailed = failedPages[pageNum] === true;
                  const pagePreviewAlt = copy.stage8.pagePreviewAlt.replace('{page}', String(pageNum));

                  return (
                    <div key={preview.imageUrl} className="space-y-2 group">
                      <div className="aspect-[16/9] bg-bg-space-edge/50 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden relative shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                        {!isFailed && (
                          <img
                            src={preview.imageUrl}
                            alt={pagePreviewAlt}
                            loading="lazy"
                            onLoad={() => {
                              setLoadedPages((prev) => ({ ...prev, [pageNum]: true }));
                              setFailedPages((prev) => ({ ...prev, [pageNum]: false }));
                            }}
                            onError={() => {
                              setLoadedPages((prev) => ({ ...prev, [pageNum]: false }));
                              setFailedPages((prev) => ({ ...prev, [pageNum]: true }));
                            }}
                            className={`w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                          />
                        )}

                        {!isLoaded && !isFailed && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg-space-edge/60 dark:bg-black/30 text-text-secondary">
                            <Loader2 size={20} className="animate-spin text-primary-blue" />
                            <span className="text-[10px] font-bold text-center px-3">{copy.stage8.loading}</span>
                          </div>
                        )}

                        {isFailed && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center bg-bg-space-edge/60 dark:bg-black/30 text-text-secondary">
                            <AlertCircle size={20} className="text-red-500" />
                            <span className="text-[10px] font-bold leading-snug">{copy.stage8.pageLoadFailed}</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[11px] font-black backdrop-blur-xl border bg-black/50 text-white border-white/10">
                          #{pageNum}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-1 gap-2">
                        <span className="text-[10px] font-bold text-text-secondary truncate">{pagePreviewAlt}</span>
                        {isRecaptured && (
                          <div className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-black border border-emerald-500/20 shrink-0">
                            {copy.stage8.recaptured}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GridViewModal;
