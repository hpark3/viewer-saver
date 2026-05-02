import confetti from 'canvas-confetti';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '../i18n';
import { type AppTheme, type ModalConfig, type Stage, type Toast } from './appShared';

const defaultModalConfig: ModalConfig = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  onConfirm: () => {},
};

export const useAppShellState = () => {
  const themeStorageKey = 'viewersaver-theme-v2';
  const [stage, setStage] = useState<Stage>(0);
  const [prevStage, setPrevStage] = useState<Stage>(0);
  const [direction, setDirection] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isGridViewOpen, setIsGridViewOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>(defaultModalConfig);
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(themeStorageKey);
    return (saved as AppTheme) || 'light';
  });
  const [lang, setLang] = useState<Lang>('en');
  const langRef = useRef<Lang>('en');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);

  const transitionTo = useCallback((nextStage: Stage) => {
    const current = Number(stage);
    const next = Number(nextStage);
    setDirection(next > current ? 1 : -1);
    setPrevStage(stage);
    setStage(nextStage);
  }, [stage]);

  useEffect(() => {
    if (stage === 5) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 300 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: number = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          window.clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => window.clearInterval(interval);
    }

    return undefined;
  }, [stage]);

  useEffect(() => {
    localStorage.setItem(themeStorageKey, theme);
  }, [theme, themeStorageKey]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      return;
    }

    document.documentElement.classList.remove('dark');
  }, [theme]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    if (type !== 'error') {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    stage,
    setStage,
    prevStage,
    direction,
    transitionTo,
    isSaved,
    setIsSaved,
    isGridViewOpen,
    setIsGridViewOpen,
    modalConfig,
    setModalConfig,
    theme,
    setTheme,
    lang,
    setLang,
    langRef,
    toasts,
    addToast,
    removeToast,
    isDraggingGlobal,
    setIsDraggingGlobal,
  };
};
