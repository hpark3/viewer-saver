import { ChevronRight, Info, Search, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const RenderStage0 = ({ copy, url, setUrl, mode, setMode, theme, isStarting, startCapture }: any) => {
  const startDisabledMessage = !url
    ? copy.stage0.startDisabledUrl
    : !mode
      ? copy.stage0.startDisabledMode
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold text-text-primary">{copy.stage0.title}</h2>
        <p className="text-xs text-text-secondary">{copy.stage0.subtitle}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-primary ml-1">{copy.stage0.urlLabel}</label>
          <div className="relative">
            <input
              type="url"
              placeholder={copy.stage0.urlPlaceholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-5 py-3.5 border border-black/5 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all text-sm inner-shadow clay-card !rounded-[20px]"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-text-primary ml-1">{copy.stage0.modeLabel}</label>
          <p className="ml-1 text-[11px] text-text-secondary">{copy.stage0.modeHelp}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('fast')}
              className={`clay-card outline-none focus:outline-none px-5 py-7 text-left flex flex-col gap-4 transition-all duration-300 border-2 min-h-[210px] justify-between ${
                mode === 'fast'
                  ? (theme === 'pastel' ? 'border-[#BFFFC7] bg-[#BFFFC7]/[0.1]' : 'border-primary-blue bg-primary-blue/[0.05] dark:bg-primary-blue/[0.1]')
                  : 'border-transparent'
              }`}
            >
              <div className={`w-10 h-10 clay-icon-badge shrink-0 transition-colors duration-300 ${mode === 'fast' ? (theme === 'pastel' ? '!bg-[#BFFFC7]' : '!bg-[#2679EB]') : (theme === 'pastel' ? '!bg-[#FFD1DC]' : '!bg-[#FFD600]')}`}>
                <Zap className={`${theme === 'pastel' ? 'text-[#333]' : 'text-white'} w-5 h-5`} fill="currentColor" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-text-primary">{copy.stage0.fastTitle}</h3>
                <p className={`text-xs font-semibold ${theme === 'pastel' ? 'text-[#555]' : 'text-primary-blue'}`}>{copy.stage0.fastSpeed}</p>
                <div className="pt-1.5 space-y-0.5">
                  <p className="text-[11px] text-text-secondary">{copy.stage0.fastLine1}</p>
                  <p className="text-[11px] text-text-secondary">{copy.stage0.fastLine2}</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('quality')}
              className={`clay-card outline-none focus:outline-none px-5 py-7 text-left flex flex-col gap-4 transition-all duration-300 border-2 min-h-[210px] justify-between ${
                mode === 'quality'
                  ? (theme === 'pastel' ? 'border-[#D9D2FF] bg-[#D9D2FF]/[0.1]' : 'border-primary-blue bg-primary-blue/[0.05] dark:bg-primary-blue/[0.1]')
                  : 'border-transparent'
              }`}
            >
              <div className={`w-10 h-10 clay-icon-badge shrink-0 transition-colors duration-300 ${mode === 'quality' ? (theme === 'pastel' ? '!bg-[#D9D2FF]' : '!bg-[#2679EB]') : (theme === 'pastel' ? '!bg-[#FFD1DC]' : '!bg-[#FFD600]')}`}>
                <Search className={`${theme === 'pastel' ? 'text-[#333]' : 'text-white'} w-5 h-5`} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-text-primary">{copy.stage0.qualityTitle}</h3>
                <p className={`text-xs font-semibold ${theme === 'pastel' ? 'text-[#555]' : 'text-primary-blue'}`}>{copy.stage0.qualitySpeed}</p>
                <div className="pt-1.5 space-y-0.5">
                  <p className="text-[11px] text-text-secondary">{copy.stage0.qualityLine1}</p>
                  <p className="text-[11px] text-text-secondary">{copy.stage0.qualityLine2}</p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{
          scale: 1.01,
          y: -2,
          shadow: theme === 'pastel' ? '0 20px 40px rgba(232, 168, 153, 0.3)' : '0 20px 40px rgba(255, 214, 0, 0.3)',
        }}
        whileTap={{ scale: 0.97 }}
        disabled={!url || !mode || isStarting}
        onClick={() => startCapture()}
        className="clay-btn-yellow outline-none focus:outline-none w-full py-4 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-shadow"
      >
        {isStarting ? copy.stage0.starting : copy.stage0.start} <ChevronRight size={18} />
      </motion.button>

      {startDisabledMessage && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-secondary">
          <Info size={12} className="shrink-0" />
          <p>{startDisabledMessage}</p>
        </div>
      )}
    </div>
  );
};

export default RenderStage0;
