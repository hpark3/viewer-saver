import { RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const RenderStage6 = ({ copy, errorPages, recaptureIndex, progress, estimatedTime, logs, handleManualUpload, theme, logContainerRef }: any) => (
  <div className="flex h-full min-h-0 flex-col items-center justify-center gap-8 py-4">
    {/* Animation Element */}
    <div className="relative w-24 h-24 flex items-center justify-center mb-2">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/30"
      />
      <div className="absolute inset-2 rounded-full bg-indigo-400/10 animate-pulse" />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="relative z-10"
      >
        <RotateCcw className="text-indigo-400/60" size={32} />
      </motion.div>
    </div>

    <div className="text-center space-y-3">
      <h2 className="text-2xl font-bold text-text-primary">{copy.stage6.title}</h2>
      <p className="text-sm font-medium text-text-secondary">
        {copy.stage6.subtitle.replace('{page}', String(errorPages[recaptureIndex])).replace('{current}', String(Math.min(recaptureIndex + 1, errorPages.length))).replace('{total}', String(errorPages.length))}
      </p>
    </div>

    <div className="w-full max-w-[650px] px-4 space-y-3">
      <div className="progress-track h-3 bg-bg-space-edge border border-black/5 shadow-inner">
        <div 
          className="progress-fill h-full rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      <div className="flex items-center justify-between text-[11px] font-medium text-text-secondary px-1">
        <span>{Math.round(progress)}%</span>
        <span>{estimatedTime}</span>
      </div>
      <div
        ref={logContainerRef}
        className="rounded-2xl border border-black/5 dark:border-white/5 bg-bg-space-edge/30 px-4 py-3 text-left space-y-1.5 h-[124px] overflow-y-auto custom-scrollbar"
      >
        {logs.slice(-6).map((log) => (
          <p key={log.receivedAt} className="text-[11px] leading-relaxed text-text-secondary break-words">
            {log.message}
          </p>
        ))}
      </div>
    </div>

    <div className="text-center pt-2">
      <button 
        onClick={handleManualUpload} 
        className={`text-primary-blue outline-none focus:outline-none hover:text-active-blue text-sm font-bold transition-all ${theme === 'pastel' ? 'text-contrast' : ''}`}
      >
        {copy.stage6.manualFallback}
      </button>
    </div>
  </div>
);

export default RenderStage6;
