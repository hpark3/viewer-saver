import { Eye, FileText, Save } from 'lucide-react';

const RenderStage7 = ({ copy, totalPages, errorPages, theme, lang, handleOpenPreview, handleFinalSave, transitionTo }: any) => (
  <div className="space-y-8 py-4">
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 rounded-full bg-vivid-yellow flex items-center justify-center shadow-lg shadow-vivid-yellow/20">
        <FileText className="text-white w-8 h-8" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-text-primary">
          {copy.stage7.title.replace('{count}', totalPages?.toString() ?? copy.stage7.pageCountUnknown)}
        </h2>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-text-secondary">{copy.stage7.subtitle}</p>
          {errorPages.length > 0 && totalPages !== null && (
            <div className={`mt-1 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
              theme === 'pastel' ? 'bg-[#D9D2FF]/20 border-[#D9D2FF]/30 text-[#D9D2FF]' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
            }`}>
              {lang === 'ko'
                ? `${totalPages}\ud398\uc774\uc9c0 \uc911 ${errorPages.length}\ud398\uc774\uc9c0\uac00 \uc644\ubcbd\ud558\uac8c \uad50\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4`
                : `${errorPages.length} out of ${totalPages} pages have been perfectly corrected`}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-4 max-w-xs mx-auto pt-2">
      <button 
        onClick={() => void handleOpenPreview()}
        className="px-6 py-3 clay-btn text-primary-blue text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <Eye size={18} /> {copy.stage7.preview}
      </button>
      <button 
        onClick={handleFinalSave}
        className="px-6 py-3 clay-btn-primary text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        <Save size={18} /> {copy.stage7.saveNow}
      </button>
      <button 
        onClick={() => transitionTo(2)}
        className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors py-2"
      >
        {copy.stage8.backToReview}
      </button>
    </div>
  </div>
);

export default RenderStage7;
