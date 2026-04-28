import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, FolderOpen, X, Zap } from 'lucide-react';

const ToastNotification = ({ toasts, removeToast, copy }: any) => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-[380px] px-4 md:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="spatial-card p-3.5 flex items-center gap-4 !rounded-[24px] border border-black/5 dark:border-white/10 shadow-2xl bg-bg-space-center/95 backdrop-blur-2xl"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              toast.type === 'success' ? 'bg-emerald-500/10' :
              toast.type === 'error' ? 'bg-red-500/10' :
              toast.type === 'warning' ? 'bg-amber-500/10' :
              'bg-primary-blue/10'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="text-emerald-500 w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="text-red-500 w-5 h-5" />}
              {toast.type === 'warning' && <Zap className="text-amber-500 w-5 h-5" />}
              {toast.type === 'info' && <FolderOpen className="text-primary-blue w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-bold text-text-primary block leading-tight truncate">{toast.message}</span>
              <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider opacity-60">{copy.app.notification}</span>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotification;
