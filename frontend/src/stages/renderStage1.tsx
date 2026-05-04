import { AlertCircle, Search, Zap } from 'lucide-react';

const RenderStage1 = ({ copy, mode, completedPages, totalPages, progress, estimatedTime, theme, retryable, retryStream, handleCancelCapture, lang, logContainerRef, logs, logEndRef }: any) => (
  <div className="flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-text-primary">{copy.stage1.title}</h2>
      {mode === 'quality' ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-full text-xs font-bold shadow-lg shadow-primary-blue/20">
          <Search size={14} /> {copy.stage1.qualityBadge}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-vivid-yellow text-slate-900 rounded-full text-xs font-bold shadow-lg shadow-vivid-yellow/20">
          <Zap size={14} /> {copy.stage1.fastBadge}
        </div>
      )}
    </div>

    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-text-secondary">{copy.stage1.progress}</span>
        <div className="text-xl font-bold">{completedPages} <span className="text-sm text-text-secondary font-normal">/ {totalPages ?? copy.stage1.pagesUnknown} {copy.stage1.pagesComplete}</span></div>
      </div>
      <div className="progress-track h-3 bg-bg-space-edge border border-black/5 shadow-inner relative overflow-hidden">
        <div 
          className="progress-fill h-full rounded-full transition-all duration-500 ease-out relative" 
          style={{ width: `${progress}%` }} 
        >
          {/* Laser line effect */}
          <div className="absolute top-0 right-0 bottom-0 w-1 bg-white shadow-[0_0_10px_#fff] animate-pulse" />
        </div>
      </div>
      <div className="text-sm text-text-secondary font-medium flex items-center justify-between">
        <span>{copy.stage1.etaLabel}: {estimatedTime}</span>
        <span className={`text-[10px] uppercase tracking-widest opacity-50 animate-pulse ${theme === 'pastel' ? 'text-contrast' : ''}`}>Scanning...</span>
      </div>
    </div>

    {retryable && (
      <button
        onClick={retryStream}
        className="mb-4 w-full outline-none focus:outline-none rounded-2xl border border-primary-blue/20 bg-primary-blue/10 px-4 py-3 text-sm font-bold text-primary-blue transition-colors hover:bg-primary-blue/15"
      >
        {copy.stage1.retry}
      </button>
    )}

    <button
      onClick={() => void handleCancelCapture()}
      className="mb-4 w-full outline-none focus:outline-none rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-500/15 dark:text-red-400"
    >
      {lang === 'ko' ? '\uCEA1\uCC98 \uCDE8\uC18C' : 'Cancel Capture'}
    </button>

    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
      <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
      <p className="text-xs font-bold text-amber-600 dark:text-amber-500 leading-relaxed">
        {copy.stage1.exitWarning}
      </p>
    </div>

    <div className="flex flex-col">
      <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
        {copy.stage1.logsTitle}
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </h3>
      <div 
        ref={logContainerRef}
        style={{ overflowAnchor: 'none' }}
        className="bg-bg-space-edge/30 rounded-2xl p-4 h-[240px] overflow-y-auto font-mono text-[11px] space-y-1.5 inner-shadow border border-black/5 dark:border-white/5 scan-effect"
      >
        {logs.length === 0 ? (
          <div className="text-text-secondary opacity-50 italic">{copy.stage1.waitingLogs}</div>
        ) : logs.map((log, i) => (
          <div key={i} className="text-text-secondary opacity-80">
            {log.message && log.message.startsWith('[') ? log.message : (
              <>
                <span className={`mr-2 ${theme === 'pastel' ? 'text-emerald-500' : 'text-primary-blue/50'}`}>[{new Date(log.receivedAt).toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', { hour12: true })}]</span>
                {log.message}
              </>
            )}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  </div>
);

export default RenderStage1;
