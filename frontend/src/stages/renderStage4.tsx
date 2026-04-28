import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, FolderUp, Loader2, Upload, X } from 'lucide-react';

const RenderStage4 = ({ copy, theme, isDraggingGlobal, setIsDraggingGlobal, dragCounter, handleBulkFiles, errorPages, capturedImages, handleFile, setCapturedImages, isManualMergeSaving, handleSave, transitionTo, lang }: any) => {
  const completedCount = Object.keys(capturedImages).length;
  const bulkSlotClassName = theme === 'pastel'
    ? 'border-[#9FE8B5] bg-[#9FE8B5]/8 hover:bg-[#9FE8B5]/14'
    : 'border-primary-blue dark:border-yellow-500/40 bg-primary-blue/5 dark:bg-yellow-500/10';
  const emptySlotClassName = theme === 'pastel'
    ? 'border-[#CFF8D8] bg-[#F8FDF9] hover:border-[#9FE8B5] hover:bg-[#9FE8B5]/10'
    : 'border-primary-blue/20 bg-bg-space-edge dark:bg-white/5 hover:border-primary-blue hover:bg-primary-blue/10';
  return (
    <div 
      className="space-y-6 relative"
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          setIsDraggingGlobal(true);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) {
          setIsDraggingGlobal(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingGlobal(false);
        dragCounter.current = 0;
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          handleBulkFiles(files);
        }
      }}
    >
      <AnimatePresence>
        {isDraggingGlobal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-primary-blue/10 backdrop-blur-[8px] rounded-[32px] border-2 border-dashed border-primary-blue/40 flex flex-col items-center justify-center gap-6 pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-24 h-24 rounded-full bg-white dark:bg-bg-space-center flex items-center justify-center shadow-2xl border border-primary-blue/20"
            >
              <FolderUp size={48} className="text-primary-blue animate-bounce" />
            </motion.div>
            <div className="text-center space-y-2">
              <p className={`text-xl font-bold drop-shadow-sm ${theme === 'pastel' ? 'text-[#2A5F55]' : 'text-primary-blue'}`}>
                {copy.stage3.dropAnywhere}
              </p>
              <p className={`text-sm font-medium ${theme === 'pastel' ? 'text-[#2A5F55]/60' : 'text-primary-blue/60'}`}>
                {copy.stage3.bulkConstraints}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{copy.stage3.title}</h2>
          <p className="text-sm text-text-secondary">
            {copy.stage3.subtitle.replace('{completed}', String(completedCount)).replace('{total}', String(errorPages.length))}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className={`px-3 py-1 rounded-full border inline-flex items-center gap-2 ${theme === 'pastel' ? 'bg-[#1A3A34]/5 border-[#1A3A34]/10' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'pastel' ? 'text-[#1A3A34]' : 'text-text-secondary'}`}>
              {copy.stage3.constraints}
            </span>
          </div>
          <span className={`text-[10px] font-medium ${theme === 'pastel' ? 'text-[#1A3A34]/60' : 'text-text-secondary opacity-60'}`}>
            {copy.stage3.bulkConstraints}
          </span>
          <div className={`mt-2 px-4 py-1.5 rounded-lg border flex items-center gap-2 ${theme === 'pastel' ? 'bg-[#1A3A34]/5 border-[#1A3A34]/10' : 'bg-primary-blue/5 border-primary-blue/10'}`}>
            <AlertCircle size={12} className={theme === 'pastel' ? 'text-[#1A3A34]' : 'text-primary-blue'} />
            <span className={`text-[10px] font-medium ${theme === 'pastel' ? 'text-[#1A3A34]' : 'text-primary-blue'}`}>
              {copy.stage3.matchingGuide}
            </span>
          </div>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-6 p-1">
          {/* Special Bulk Upload Slot */}
          <div className="flex flex-col gap-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-3 text-center cursor-pointer transition-all group relative overflow-hidden ${bulkSlotClassName}`}
              onDragEnter={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-primary-blue', 'bg-primary-blue/10');
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-primary-blue', 'bg-primary-blue/10');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingGlobal(false);
                dragCounter.current = 0;
                e.currentTarget.classList.remove('border-primary-blue', 'bg-primary-blue/10');
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  handleBulkFiles(files);
                }
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleBulkFiles(files);
                };
                input.click();
              }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${theme === 'pastel' ? 'bg-[#1A3A34]/10' : 'bg-primary-blue/10 dark:bg-yellow-500/20'}`}>
                <FolderUp className={`transition-colors ${theme === 'pastel' ? 'text-[#1A3A34]/60 group-hover:text-[#1A3A34]' : 'text-primary-blue/60 dark:text-yellow-500/60 group-hover:text-primary-blue dark:group-hover:text-yellow-500'}`} size={20} />
              </div>
              <div className="space-y-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${theme === 'pastel' ? 'text-[#1A3A34]' : 'text-text-primary dark:text-yellow-500'}`}>
                  {copy.stage3.bulkSlotTitle}
                </span>
                <span className={`text-[9px] font-medium leading-tight block ${theme === 'pastel' ? 'text-[#1A3A34]/70' : 'text-text-secondary dark:text-yellow-500/60'}`}>
                  {copy.stage3.bulkSlotDesc}
                </span>
              </div>
            </motion.div>
            <p className="text-[10px] text-primary-blue font-bold text-center uppercase tracking-widest opacity-0">BULK</p>
          </div>

          {errorPages.map((page, i) => (
            <div key={page} className="flex flex-col gap-2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: i * 0.05 }}
                className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-3 text-center cursor-pointer transition-all group relative overflow-hidden ${
                  capturedImages[page] 
                    ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10' 
                    : emptySlotClassName
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-primary-blue', 'bg-primary-blue/10');
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary-blue', 'bg-primary-blue/10');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingGlobal(false);
                  dragCounter.current = 0;
                  e.currentTarget.classList.remove('border-primary-blue', 'bg-primary-blue/10');
                  const files = e.dataTransfer.files;
                  if (files && files.length > 1) {
                    handleBulkFiles(files);
                  } else if (files && files.length === 1) {
                    handleFile(files[0], page);
                  }
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFile(file, page);
                  };
                  input.click();
                }}
              >
                {capturedImages[page] ? (
                  <>
                    <img
                      src={capturedImages[page].url}
                      alt={copy.stage3.pageLabel.replace('{page}', String(page))}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-xl">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md uppercase tracking-widest">{copy.stage3.pageLabel.replace('{page}', String(page))}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCapturedImages(prev => {
                          const next = { ...prev };
                          delete next[page];
                          return next;
                        });
                      }}
                      className="absolute top-2 right-2 z-20 p-1 bg-black/40 hover:bg-red-500 text-white rounded-full transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${theme === 'pastel' ? 'bg-[#1A3A34]/10' : 'bg-primary-blue/10'}`}>
                      <Upload className={`transition-colors ${theme === 'pastel' ? 'text-[#1A3A34]/60 group-hover:text-[#1A3A34]' : 'text-primary-blue/60 group-hover:text-primary-blue'}`} size={20} />
                    </div>
                    <div className="space-y-1">
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${theme === 'pastel' ? 'text-[#1A3A34]' : 'text-text-primary'}`}>
                        {copy.stage3.pageLabel.replace('{page}', String(page))}
                      </span>
                      <span className={`text-[9px] font-medium leading-tight block ${theme === 'pastel' ? 'text-[#1A3A34]/70' : 'text-text-secondary'}`} dangerouslySetInnerHTML={{ __html: copy.stage3.clickOrDrop }} />
                    </div>
                  </>
                )}
              </motion.div>
              {capturedImages[page] && (
                <p className="text-[10px] text-text-secondary truncate px-1 font-medium text-center">
                  {capturedImages[page].name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          disabled={completedCount < errorPages.length || isManualMergeSaving}
          onClick={() => {
            void handleSave();
          }}
          className="clay-btn-primary py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isManualMergeSaving && <Loader2 size={18} className="animate-spin" />}
          {isManualMergeSaving ? (lang === 'ko' ? '\uBCD1\uD569 \uC911...' : 'Merging...') : copy.stage3.mergeAndSave}
        </button>
        <button onClick={() => transitionTo(3)} className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors py-2">{copy.stage3.back}</button>
      </div>
    </div>
  );
};

export default RenderStage4;
