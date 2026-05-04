import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, FolderOpen, X, Zap } from 'lucide-react';

const ToastNotification = ({ toasts, removeToast, copy }: any) => {
  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-[380px] -translate-x-1/2 flex-col gap-3 px-0 sm:bottom-6 sm:left-auto sm:right-6 sm:w-full sm:translate-x-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
              <span className="block text-[13px] font-bold leading-[1.35] text-text-primary whitespace-normal break-words">{toast.message}</span>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-wider text-text-secondary opacity-60">{copy?.app?.notification ?? 'Notification'}</span>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-text-secondary outline-none focus:outline-none hover:text-text-primary transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
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
