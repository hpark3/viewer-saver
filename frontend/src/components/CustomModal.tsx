import { AnimatePresence, motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';

const CustomModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText,
  theme 
}: any) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`w-full max-w-md spatial-card p-8 flex flex-col gap-6 text-center ${theme === 'pastel' ? '!bg-white/90' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme === 'pastel' ? 'bg-[#D9D2FF]/20' : 'bg-primary-blue/10'}`}>
              <HelpCircle size={32} className={theme === 'pastel' ? 'text-[#D9D2FF]' : 'text-primary-blue'} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-primary">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed break-keep">{message}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 outline-none focus:outline-none bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary font-bold rounded-2xl transition-all border border-black/5 dark:border-white/10"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 py-3.5 outline-none focus:outline-none clay-btn-primary shadow-lg rounded-2xl"
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomModal;
