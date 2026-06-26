import { useRef, useEffect } from 'react';

/**
 * Debug hook — logs which props changed between renders.
 * Drop in production builds automatically (no-op).
 *
 * Usage: useWhyDidYouUpdate('ComponentName', props);
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, unknown>) {
  const prev = useRef<Record<string, unknown>>();

  useEffect(() => {
    if (import.meta.env.PROD) return;
    if (prev.current) {
      const allKeys = Object.keys({ ...prev.current, ...props });
      const changed = allKeys.filter((k) => prev.current![k] !== props[k]);

      if (changed.length) {
        console.log(
          `%c[${name}] re-render caused by:`,
          'color: #9b97d4; font-weight: 600',
          changed,
        );
      }
    }
    prev.current = { ...props };
  });
}
