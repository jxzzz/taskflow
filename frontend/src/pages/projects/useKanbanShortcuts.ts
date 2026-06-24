import { useEffect } from 'react';

interface UseKanbanShortcutsParams {
  listCount: number;
  addingList: boolean;
  onBootstrap: () => void;
}

export function useKanbanShortcuts({
  listCount,
  addingList,
  onBootstrap,
}: UseKanbanShortcutsParams) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (listCount === 0 && !addingList) {
          onBootstrap();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [listCount, addingList, onBootstrap]);
}
