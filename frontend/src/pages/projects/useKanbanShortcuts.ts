import { useEffect } from 'react';

interface UseKanbanShortcutsParams {
  listCount: number;
  addingList: boolean;
  onBootstrap: () => void;
  onOpenQuickAdd: () => void;
}

export function useKanbanShortcuts({
  listCount,
  addingList,
  onBootstrap,
  onOpenQuickAdd,
}: UseKanbanShortcutsParams) {
  // N key — bootstrap empty board
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

  // Cmd/Ctrl+K — open quick-add
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenQuickAdd();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpenQuickAdd]);
}
