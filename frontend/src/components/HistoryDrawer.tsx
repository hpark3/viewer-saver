import { AnimatePresence, motion } from 'motion/react';
import { Clock, ExternalLink, History, RotateCcw, Trash2, X } from 'lucide-react';

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url || 'unknown';
  }
};

const HistoryDrawer = ({ 
  isOpen, 
  onClose, 
  history, 
  onView, 
  onDelete, 
  onClear,
  onRecapture,
  copy,
  lang,
  theme
}: any) => {
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (lang === 'ko') {
      if (mins < 1) return '\uBC29\uAE08 \uC804';
      if (mins < 60) return `${mins}\uBD84 \uC804`;
      if (hours < 24) return `${hours}\uC2DC\uAC04 \uC804`;
      return `${days}\uC77C \uC804`;
    } else {
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
  };

  const getExpiration = (timestamp: number) => {
    const expiryTime = timestamp + 24 * 60 * 60 * 1000;
    const remaining = expiryTime - Date.now();
    
    if (remaining <= 0) return { expired: true, text: copy.history.expired };
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    const timeText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    return { expired: false, text: copy.history.expiresIn.replace('{time}', timeText) };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 bottom-0 w-full max-w-[400px] z-[70] shadow-2xl border-l flex flex-col ${
              theme === 'pastel' 
                ? '!bg-white/95 !backdrop-blur-[60px] border-white/40' 
                : 'bg-bg-space-center/95 backdrop-blur-2xl border-black/5 dark:border-white/10'
            }`}
          >
            <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'pastel' ? 'bg-[#7E70E8]/10' : 'bg-primary-blue/10'}`}>
                  <History className={theme === 'pastel' ? 'text-[#7E70E8]' : 'text-primary-blue'} size={20} />
                </div>
                <h2 className={`text-lg font-bold ${theme === 'pastel' ? 'text-[#7E70E8]' : 'text-text-primary'}`}>{copy.history.title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${theme === 'pastel' ? 'bg-[#7E70E8]/10' : 'bg-black/5 dark:bg-white/5'}`}>
                    <Clock size={48} className={`${theme === 'pastel' ? 'text-[#7E70E8]' : 'text-text-secondary'} opacity-50`} />
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm font-bold ${theme === 'pastel' ? 'text-[#7E70E8]' : 'text-text-primary'}`}>{copy.history.empty}</p>
                    <p className="text-xs text-text-secondary opacity-60 leading-relaxed">
                      {lang === 'ko' ? '\uCEA1\uCC98\uD55C PDF \uAE30\uB85D\uC774 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.\n\uC9C0\uAE08 \uCCAB \uCEA1\uCC98\uB97C \uC2DC\uC791\uD574\uBCF4\uC138\uC694!' : 'Your captured PDF history will appear here.\nStart your first capture now!'}
                    </p>
                  </div>
                </div>
              ) : (
                history.map((item) => {
                  const expiry = getExpiration(item.timestamp);
                  return (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="clay-card p-4 space-y-3 group relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-bg-space-edge flex items-center justify-center shrink-0 border border-black/5">
                            <img 
                              src={`https://www.google.com/s2/favicons?domain=${getHostname(item.url)}&sz=64`} 
                              alt="favicon"
                              className="w-6 h-6"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-text-primary truncate">{getHostname(item.url)}</div>
                            <div className="text-[10px] text-text-secondary truncate opacity-60">{item.url}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="w-8 h-8 rounded-full hover:bg-red-500/10 text-text-secondary hover:text-red-500 flex items-center justify-center transition-colors shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            item.mode === 'quality' ? 'bg-primary-blue/10 text-primary-blue' : 'bg-vivid-yellow/10 text-vivid-yellow'
                          }`}>
                            {item.mode}
                          </span>
                          <span className="text-[10px] text-text-secondary font-medium">{formatTime(item.timestamp)}</span>
                        </div>
                        <div className={`text-[10px] font-bold ${expiry.expired ? 'text-red-500' : 'text-emerald-500'}`}>
                          {expiry.text}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        {!expiry.expired ? (
                          <button 
                            onClick={() => onView(item)}
                            className={`flex-1 py-2 bg-primary-blue ${theme === 'pastel' ? 'text-[#1A3A34]' : 'text-white'} text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-primary-blue/20 hover:bg-primary-blue/90 transition-all active:scale-95`}
                          >
                            <ExternalLink size={12} /> {copy.history.view}
                          </button>
                        ) : (
                          <button 
                            onClick={() => onRecapture(item.url, item.mode)}
                            className={`flex-1 py-2 bg-vivid-yellow ${theme === 'pastel' ? 'text-[#9B4D5D]' : 'text-slate-900'} text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-vivid-yellow/20 hover:bg-vivid-yellow/90 transition-all active:scale-95`}
                          >
                            <RotateCcw size={12} /> {copy.history.reCapture}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {history.length > 0 && (
              <div className="p-6 border-t border-black/5 dark:border-white/10">
                <button 
                  onClick={onClear}
                  className="w-full py-3 text-red-500 text-xs font-bold hover:bg-red-500/5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> {copy.history.clearAll}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistoryDrawer;
