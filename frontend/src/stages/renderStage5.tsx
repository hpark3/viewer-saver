import { Download, FileText, FolderOpen, Loader2, Save, Search } from 'lucide-react';
import { motion } from 'motion/react';

const RenderStage5 = ({ copy, theme, getStage5FileInfo, handleOpenPreview, outputPath, handleDownloadPdf, isDownloadingPdf, handleFinalSave, transitionTo }: any) => (
  <div className="space-y-8 py-2">
    <div className="text-center space-y-3">
      <h2 className="text-2xl font-bold text-text-primary">{copy.stage4.title}</h2>
      <p className="text-sm text-text-secondary max-w-[280px] mx-auto">{copy.stage4.subtitle}</p>
    </div>

    <div className="relative group">
      <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${
        theme === 'pastel' ? 'bg-gradient-to-r from-rose-300 to-indigo-300' : 'bg-gradient-to-r from-primary-blue/20 to-vivid-yellow/20'
      }`}></div>
      <div className={`relative aspect-video rounded-2xl border flex flex-col items-center justify-center overflow-hidden shadow-inner ${
        theme === 'pastel' ? 'bg-white/40 border-white/40' : 'bg-bg-space-edge border-black/5 dark:border-white/5'
      }`}>
        <div className="flex flex-col items-center gap-4 opacity-40 group-hover:opacity-60 transition-opacity">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${theme === 'pastel' ? 'bg-white/60' : 'bg-black/5'}`}>
            <FileText size={40} className={theme === 'pastel' ? 'text-rose-400' : 'text-primary-blue'} />
          </div>
          <div className="text-center space-y-1">
            <p className={`text-xs font-black uppercase tracking-widest ${theme === 'pastel' ? 'text-rose-400' : 'text-text-primary'}`}>{copy.stage4.previewArea}</p>
            {getStage5FileInfo() && (
              <p className={`text-[10px] font-bold ${theme === 'pastel' ? 'text-rose-400/60' : 'text-text-secondary'}`}>
                {getStage5FileInfo()}
              </p>
            )}
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <button 
            onClick={() => { void handleOpenPreview(); }}
            className="bg-white outline-none focus:outline-none text-text-primary px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-white/90 active:scale-95"
          >
            <Search size={18} className="text-text-secondary" /> {copy.stage4.preview}
          </button>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="clay-card p-4 flex items-center gap-4 border border-black/5 dark:border-white/5 relative group/card">
        <div className="w-12 h-12 clay-icon-badge bg-vivid-yellow/10 flex items-center justify-center shrink-0">
          <FolderOpen className="text-vivid-yellow" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-0.5">{copy.stage4.outputPath}</div>
          <div className="text-xs font-mono truncate text-text-primary opacity-80">{outputPath}</div>
        </div>
        <button 
          onClick={() => { void handleDownloadPdf(); }}
          disabled={isDownloadingPdf}
          className="w-10 h-10 outline-none focus:outline-none rounded-full bg-vivid-yellow/10 dark:bg-vivid-yellow/20 hover:bg-vivid-yellow/20 dark:hover:bg-vivid-yellow/30 text-vivid-yellow flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0 border border-vivid-yellow/20 disabled:opacity-60 disabled:cursor-not-allowed"
          title={copy.stage4.downloadPdf}
        >
          {isDownloadingPdf ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <motion.button 
          whileHover={{ scale: 1.01, y: -2, shadow: "0 10px 30px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { void handleFinalSave(true); }}
          className="w-full outline-none focus:outline-none py-4 bg-white dark:bg-white/5 text-primary-blue text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-black/5"
        >
          <Save size={18} /> {copy.stage4.chooseSaveLocationAgain}
        </motion.button>

        <div className="flex items-center justify-between px-4 pt-2">
          <motion.button 
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => transitionTo(2)} 
            className="text-text-secondary outline-none focus:outline-none hover:text-text-primary text-[11px] font-bold transition-colors py-2"
          >
            {copy.stage8.backToReview}
          </motion.button>
          <div className="w-px h-3 bg-black/10 dark:bg-white/10" />
          <motion.button 
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()} 
            className="text-text-secondary outline-none focus:outline-none hover:text-text-primary text-[11px] font-bold transition-colors py-2"
          >
            {copy.stage4.restart}
          </motion.button>
        </div>
      </div>
    </div>
  </div>
);

export default RenderStage5;
