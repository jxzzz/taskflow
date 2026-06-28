import { useState, useCallback, useEffect, useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { parseColorToRgb } from '@/utils/color';

export interface QuickActionItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

interface QuickActionFabProps {
  items: QuickActionItem[];
}

const FAB_SIZE = 52;

export default function QuickActionFab({ items }: QuickActionFabProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  const handleItemClick = useCallback((item: QuickActionItem) => {
    setOpen(false);
    item.onClick();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 36,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'flex-end',
        gap: 12,
      }}
    >
      {/* FAB — always at the bottom (first child in column-reverse = bottom) */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: '50%',
          border: 'none',
          background: open
            ? 'linear-gradient(135deg, #005bab 0%, #004a9e 100%)'
            : 'linear-gradient(135deg, #0075de 0%, #005bab 100%)',
          color: '#fff',
          fontSize: 22,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: open
            ? '0 6px 28px rgba(0,117,222,0.45), 0 0 0 6px rgba(0,117,222,0.08)'
            : '0 4px 18px rgba(0,117,222,0.35), 0 0 0 3px rgba(0,117,222,0.10)',
          transform: open ? 'rotate(45deg) scale(1.08)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          flexShrink: 0,
        }}
      >
        <PlusOutlined style={{ fontSize: 22 }} />
      </button>

      {/* Menu items — stack upward from FAB (after FAB in column-reverse = above it) */}
      {items.map((item, i) => {
        const delay = i * 0.04;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => handleItemClick(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: 'none',
              background: 'var(--color-bg-elevated)',
              borderRadius: 9999,
              padding: '10px 18px',
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
              transform: open
                ? 'translateY(0) scale(1)'
                : `translateY(${16 + i * 8}px) scale(0.8)`,
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: `all 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`,
              ...(open ? {} : { transitionDelay: `${(items.length - 1 - i) * 0.03}s` }),
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(${parseColorToRgb(item.color)}, 0.08)`;
              e.currentTarget.style.boxShadow = `0 4px 16px ${item.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-elevated)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)';
            }}
          >
            <span style={{ fontSize: 16, color: item.color, display: 'flex' }}>
              {item.icon}
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-ink-primary)',
              fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

