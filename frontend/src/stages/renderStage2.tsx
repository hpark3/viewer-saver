import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, ChevronRight, Eye, Hash, Plus, X } from 'lucide-react';

const RenderStage2 = ({ totalPages, pagePreviews, stage2PreviewError, lang, copy, errorPages, setModalConfig, transitionTo, setErrorPages, highlightedPage, addToast, showBackToTop, backToTop, previewPanelRef, handlePreviewScroll, theme, scrollToPage, newPageNumber, setNewPageNumber, handleAddPage, handleRecapture, handleSkipToSave }: any) => {
  const stage2PageCount = totalPages ?? pagePreviews.length;
  const defaultStage2PreviewStatusMessage = lang === 'ko'
    ? '\uC2E4\uC81C \uCD94\uCD9C \uD398\uC774\uC9C0 \uBBF8\uB9AC\uBCF4\uAE30\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.'
    : 'Unable to load the extracted page previews.';
  const stage2PreviewStatusMessage = stage2PreviewError ?? defaultStage2PreviewStatusMessage;

  return (
  <div className="flex flex-col lg:grid lg:grid-cols-[1fr_350px] gap-10 lg:h-full lg:min-h-0 lg:overflow-hidden relative">
    {/* Back Button for Stage 2 */}
    <motion.button 
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        if (errorPages.length > 0) {
          setModalConfig({
            isOpen: true,
            title: lang === 'ko' ? '\uC2DC\uC791\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30' : 'Back to Start',
            message: copy.stage2.backConfirm,
            confirmText: lang === 'ko' ? '\uB3CC\uC544\uAC00\uAE30' : 'Go Back',
            cancelText: lang === 'ko' ? '\uCDE8\uC18C' : 'Cancel',
            onConfirm: () => {
              transitionTo(0);
              setErrorPages([]);
            },
          });
        } else {
          transitionTo(0);
        }
      }}
      className="absolute top-0 left-0 -translate-y-12 flex items-center gap-2 text-text-secondary hover:text-primary-blue transition-colors text-xs font-bold uppercase tracking-widest group"
    >
      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary-blue/10 transition-colors">
        <ArrowLeft size={16} />
      </div>
      {copy.stage2.backToStart}
    </motion.button>

    {/* Left: Preview Panel */}
    <div className="flex flex-col gap-5 lg:h-full lg:min-h-0 relative">
      <div className="flex items-center justify-between px-1 shrink-0">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Eye size={18} className="text-primary-blue" />
          {copy.stage2.previewTitle}
        </h3>
        <span className="text-[10px] font-mono text-text-secondary bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full border border-black/5 dark:border-white/5">
          {lang === 'ko' ? `\uCD1D ${stage2PageCount}\uD398\uC774\uC9C0` : `TOTAL: ${stage2PageCount} PAGES`}
        </span>
      </div>

      <div 
        ref={previewPanelRef}
        onScroll={handlePreviewScroll}
        className="max-h-[50vh] lg:max-h-none lg:flex-1 overflow-y-scroll bg-bg-space-edge/20 dark:bg-black/20 rounded-[32px] border border-black/5 dark:border-white/5 p-8 inner-shadow custom-scrollbar scroll-smooth"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {pagePreviews.length === 0 ? (
            <div className="col-span-full flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-black/10 bg-black/5 px-6 text-center text-sm font-semibold text-text-secondary dark:border-white/10 dark:bg-white/5">
              {stage2PreviewStatusMessage}
            </div>
          ) : pagePreviews.map((preview) => {
            const pageNum = preview.page;
            const isError = errorPages.includes(pageNum);
            const isHighlighted = highlightedPage === pageNum;

            return (
              <motion.div 
                key={preview.imageUrl} 
                id={`preview-page-${pageNum}`}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.95, rotate: -1 }}
                onClick={() => {
                  if (isError) {
                    setErrorPages(prev => prev.filter(p => p !== pageNum));
                  } else {
                    setErrorPages(prev => [...prev, pageNum].sort((a, b) => a - b));
                    addToast('warning', copy.app.pageAdded.replace('{num}', String(pageNum)));
                  }
                }}
                className={`relative aspect-[4/3] bg-bg-space-center dark:bg-bg-space-edge rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden group shadow-sm ${
                  isError 
                    ? 'border-red-500 shadow-lg shadow-red-500/20' 
                    : isHighlighted 
                      ? 'border-primary-blue shadow-lg shadow-primary-blue/20' 
                      : 'border-black/5 dark:border-white/5 hover:border-primary-blue/40'
                }`}
              >
                <img 
                  src={preview.imageUrl}
                  alt={`Page ${pageNum}`}
                  className={`w-full h-full object-cover transition-all duration-700 ${isError ? 'opacity-30 grayscale scale-110' : 'opacity-90 group-hover:scale-110'}`}
                  loading="lazy"
                />

                {/* Page Number Badge */}
                <div className={`absolute top-4 left-4 px-2.5 py-1.5 rounded-xl text-[11px] font-black backdrop-blur-xl border ${
                  isError ? 'bg-red-500 text-white border-red-400' : 'bg-black/50 text-white border-white/10'
                }`}>
                  #{pageNum}
                </div>

                {/* Error Overlay */}
                {isError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-red-500 text-white p-3 rounded-full shadow-2xl"
                    >
                      <X size={24} strokeWidth={3} />
                    </motion.div>
                  </div>
                )}

                {!isError && (
                  <div className="absolute inset-0 bg-primary-blue/0 group-hover:bg-primary-blue/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                     <div className="bg-white text-primary-blue p-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                       <Plus size={24} strokeWidth={3} />
                     </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Back to Top Button - Moved to Left */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={backToTop}
            className="absolute bottom-8 left-10 w-16 h-16 bg-primary-blue text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-30 border-4 border-white dark:border-bg-space-center"
          >
            <ChevronRight className="-rotate-90 w-8 h-8" strokeWidth={4} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>

    {/* Right: Controls */}
    <div className="flex flex-col lg:h-full lg:min-h-0">
      <div className="lg:flex-1 lg:overflow-y-auto pr-2 space-y-8 custom-scrollbar pb-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">{copy.stage2.title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed opacity-80">{copy.stage2.subtitle}</p>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.15em] opacity-60">
              {copy.stage2.detectedLabel.replace('{count}', String(errorPages.length))}
            </label>
            {errorPages.length > 0 && (
              <button 
                onClick={() => setErrorPages([])}
                className="text-[10px] font-bold text-red-500/80 hover:text-red-500 transition-colors"
              >
                CLEAR ALL
              </button>
            )}
          </div>

          <div className={`flex flex-wrap content-start gap-2.5 min-h-[120px] p-5 rounded-3xl border inner-shadow ${
            theme === 'pastel' ? 'bg-[#D9D2FF]/5 border-[#D9D2FF]/10' : 'bg-bg-space-edge/30 dark:bg-black/30 border-black/5 dark:border-white/5'
          }`}>
            {errorPages.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme === 'pastel' ? 'bg-[#D9D2FF]/20' : 'bg-black/5 dark:bg-white/5'}`}>
                  <CheckCircle2 size={32} className={`${theme === 'pastel' ? 'text-[#D9D2FF]' : 'text-text-secondary'} opacity-40`} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'pastel' ? 'text-[#D9D2FF]' : 'text-text-secondary'} opacity-40`}>
                  {copy.stage2.noErrors}
                </span>
              </div>
            ) : (
              errorPages.map((page) => {
                const isSelected = highlightedPage === page;
                const tagStyle = isSelected 
                  ? {} 
                  : theme === 'pastel'
                    ? { backgroundColor: 'rgba(255, 209, 220, 0.2)', borderColor: 'rgba(255, 182, 193, 0.4)', color: '#FFB6C1' }
                    : theme === 'dark' 
                      ? { backgroundColor: 'rgba(69, 10, 10, 0.4)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }
                      : { backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#ef4444' };

                return (
                  <motion.div 
                    key={page}
                    layoutId={`tag-${page}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={tagStyle}
                    className={`group flex items-center justify-between gap-2 pl-4 pr-2.5 py-2 rounded-full border transition-all cursor-pointer w-fit min-w-[85px] ${
                      isSelected 
                        ? 'bg-primary-blue border-primary-blue text-white shadow-lg shadow-primary-blue/40' 
                        : ''
                    }`}
                    onClick={() => scrollToPage(page)}
                  >
                    <span className="text-xs font-black">#{page}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setErrorPages(prev => prev.filter(p => p !== page));
                      }} 
                      style={!isSelected && theme === 'dark' ? { color: 'rgba(248, 113, 113, 0.6)' } : {}}
                      className={`p-1 rounded-full transition-colors ${
                        isSelected ? 'hover:bg-white/20' : 'hover:bg-red-500/10 text-slate-400 hover:text-red-500'
                      }`}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.15em] opacity-60 ml-1">{copy.stage2.addPage}</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input 
                type="number" 
                placeholder={copy.stage2.pagePlaceholder}
                value={newPageNumber}
                onChange={(e) => setNewPageNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
                className="w-full pl-12 pr-4 py-4 bg-bg-space-edge/40 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 transition-all inner-shadow text-text-primary"
              />
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40" size={18} />
            </div>
            <button 
              onClick={handleAddPage}
              className="w-14 h-14 clay-btn text-primary-blue hover:bg-primary-blue/5 transition-all shadow-sm shrink-0"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons - No white box, sophisticated dark theme */}
      <div className="pt-8 pb-2 space-y-4 shrink-0 bg-transparent border-t border-black/5 dark:border-white/5 z-20">
        <motion.button 
          whileHover={{ scale: 1.01, y: -2, shadow: "0 20px 40px rgba(38, 121, 235, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRecapture} 
          disabled={errorPages.length === 0}
          className="w-full clay-btn-primary font-bold py-5 flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-40 disabled:grayscale text-lg"
        >
          {copy.stage2.startRecapture} <ChevronRight size={22} />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSkipToSave} 
          className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary rounded-2xl text-sm font-bold transition-all border border-black/5 dark:border-white/5"
        >
          {copy.stage2.skipAndSave}
        </motion.button>
      </div>
    </div>
  </div>
);
};

export default RenderStage2;
