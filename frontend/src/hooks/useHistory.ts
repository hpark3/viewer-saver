import { useEffect, useState } from 'react';
import type { HistoryItem, Mode } from './appShared';

type ViewHistoryItemArgs = {
  item: HistoryItem;
  setUrl: (value: string) => void;
  setMode: (value: Mode) => void;
  setOutputPath: (value: string) => void;
  setIsSaved: (value: boolean) => void;
  transitionTo: (stage: 5) => void;
};

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('capture_history');
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as HistoryItem[];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('capture_history', JSON.stringify(history));
  }, [history]);

  const viewHistoryItem = ({
    item,
    setUrl,
    setMode,
    setOutputPath,
    setIsSaved,
    transitionTo,
  }: ViewHistoryItemArgs) => {
    setUrl(item.url);
    setMode(item.mode);
    setOutputPath(item.outputPath);
    setIsSaved(true);
    transitionTo(5);
    setIsHistoryOpen(false);
  };

  return {
    history,
    setHistory,
    isHistoryOpen,
    setIsHistoryOpen,
    viewHistoryItem,
  };
};
