import { Github, Globe, History, Moon, Sparkles, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import type { Dispatch, SetStateAction } from 'react';
import logoIconLight from '../assets/branding/logo-icon-light.png';
import logoIconDark from '../assets/branding/logo-icon-dark.png';
import logoIconPastel from '../assets/branding/logo-icon-pastel.png';
import logoTextLight from '../assets/branding/logo-text-light.png';
import logoTextDark from '../assets/branding/logo-text-dark.png';
import logoTextPastel from '../assets/branding/logo-text-pastel.png';
import type { Lang } from '../i18n';
import { REPO_URL, type AppTheme, type HistoryItem } from '../hooks/appShared';
import HistoryDrawer from './HistoryDrawer';
import Tooltip from './Tooltip';

type Copy = typeof import('../i18n').messages.ko;

type AppHeaderProps = {
  theme: AppTheme;
  lang: Lang;
  copy: Copy;
  history: HistoryItem[];
  isHistoryOpen: boolean;
  setIsHistoryOpen: Dispatch<SetStateAction<boolean>>;
  setLang: Dispatch<SetStateAction<Lang>>;
  setTheme: Dispatch<SetStateAction<AppTheme>>;
  onLogoHome: () => void;
  isLogoHomeDisabled: boolean;
  onViewHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onRecaptureHistory: (url: string, mode: 'fast' | 'quality' | null) => void;
};

const LOGO_ICONS: Record<string, string> = { light: logoIconLight, dark: logoIconDark, pastel: logoIconPastel };
const LOGO_TEXTS: Record<string, string> = { light: logoTextLight, dark: logoTextDark, pastel: logoTextPastel };

export default function AppHeader({
  theme,
  lang,
  copy,
  history,
  isHistoryOpen,
  setIsHistoryOpen,
  setLang,
  setTheme,
  onLogoHome,
  isLogoHomeDisabled,
  onViewHistory,
  onDeleteHistory,
  onClearHistory,
  onRecaptureHistory,
}: AppHeaderProps) {
  return (
    <>
      <div className="fixed top-5 left-5 z-50">
        <button
          type="button"
          onClick={onLogoHome}
          className={`logo flex items-center justify-start gap-2 rounded-2xl border-0 bg-transparent px-1 py-0.5 outline-none focus:outline-none ${isLogoHomeDisabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'}`}
          aria-label={lang === 'ko' ? '\uBA54\uC778 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30' : 'Return to home screen'}
          disabled={isLogoHomeDisabled}
          title={isLogoHomeDisabled ? (lang === 'ko' ? '\uBB38\uC11C \uCD94\uCD9C\uC774 \uC9C4\uD589 \uC911\uC77C \uB54C\uB294 \uD648\uC73C\uB85C \uC774\uB3D9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.' : 'Home navigation is disabled while extraction is running.') : undefined}
        >
          <div className="flex items-center gap-2">
            <img src={LOGO_ICONS[theme]} alt="" className="h-[36px] w-auto shrink-0 object-contain" />
            <img src={LOGO_TEXTS[theme]} alt="ViewerSaver" className="h-[38px] w-auto shrink-0 object-contain" />
          </div>
        </button>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Tooltip content={copy.app.github} align="end" theme={theme}>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="ViewerSaver GitHub repository"
            className={`inline-flex items-center justify-center outline-none focus:outline-none transition-colors ${theme === 'dark' ? 'text-white/35 hover:text-primary-blue' : 'text-text-secondary/70 hover:text-text-primary'}`}
          >
            <Github size={20} />
          </a>
        </Tooltip>
      </div>

      <div className="fixed top-6 right-20 z-50">
        <Tooltip content={copy.app.languageToggle} side="bottom" align="end" theme={theme}>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setLang((current) => current === 'ko' ? 'en' : 'ko')}
            className="flex h-12 w-12 items-center justify-center rounded-full spatial-card shadow-lg outline-none focus:outline-none"
            aria-label={copy.app.languageToggle}
          >
            <div className="relative">
              <Globe size={20} className={lang === 'ko' ? 'text-primary-blue' : 'text-vivid-yellow'} />
              <span className="absolute -right-1 -top-1 rounded bg-white px-0.5 text-[8px] font-black leading-none text-black shadow-sm dark:border dark:border-white/10 dark:bg-black dark:text-white">
                {lang === 'ko' ? 'KO' : 'EN'}
              </span>
            </div>
          </motion.button>
        </Tooltip>
      </div>

      <div className="fixed top-6 right-6 z-50">
        <Tooltip content={copy.app.themeToggle} side="bottom" align="end" theme={theme}>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme((current) => current === 'light' ? 'dark' : current === 'dark' ? 'pastel' : 'light')}
            className="flex h-12 w-12 items-center justify-center rounded-full spatial-card shadow-lg outline-none focus:outline-none"
            aria-label={copy.app.themeToggle}
          >
            {theme === 'light'
              ? <Sun size={20} className="text-vivid-yellow" />
              : theme === 'dark'
                ? <Moon size={20} className="text-primary-blue" />
                : <Sparkles size={20} className="text-rose-400" />}
          </motion.button>
        </Tooltip>
      </div>

      <div className="fixed bottom-6 left-6 z-50">
        <Tooltip content={copy.history.title} align="start" theme={theme}>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsHistoryOpen(true)}
            className="relative flex h-12 w-12 items-center justify-center rounded-full spatial-card shadow-lg outline-none focus:outline-none"
            aria-label={copy.history.title}
          >
            <History size={20} className="text-primary-blue" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-vivid-yellow text-[10px] font-bold text-slate-900 dark:border-bg-space-center">
                {history.length}
              </span>
            )}
          </motion.button>
        </Tooltip>
      </div>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onView={onViewHistory}
        onDelete={onDeleteHistory}
        onClear={onClearHistory}
        onRecapture={onRecaptureHistory}
        copy={copy}
        lang={lang}
        theme={theme}
      />
    </>
  );
}
