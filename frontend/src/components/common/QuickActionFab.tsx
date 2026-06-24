import { useState, useRef, useCallback } from 'react';
import {
  PlusOutlined,
  ProjectOutlined,
  BgColorsOutlined,
  TranslationOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';

/** ====== Menu Item Definition ====== */

export interface QuickActionItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  onClick: () => void;
}

interface QuickActionFabProps {
  items: QuickActionItem[];
}

/** ====== Radial Fan Quick Action FAB ====== */

const FAB_SIZE = 52;
const ITEM_SIZE = 44;
const RADIUS = 110;       // Distance from FAB center to item center
const ARC_START = -150;   // degrees: leftmost item
const ARC_END = -30;      // degrees: rightmost item

export default function QuickActionFab({ items }: QuickActionFabProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Small delay so the user can move to a menu item
    leaveTimerRef.current = setTimeout(() => {
      setHovered(false);
    }, 180);
  }, []);

  const handleItemClick = useCallback(
    (item: QuickActionItem) => {
      setHovered(false);
      setPressed(true);
      setTimeout(() => setPressed(false), 300);
      item.onClick();
    },
    [],
  );

  // Calculate positions for each menu item along the arc
  const itemCount = items.length;
  const getItemStyle = (index: number): React.CSSProperties => {
    const angleDeg =
      itemCount === 1
        ? (ARC_START + ARC_END) / 2
        : ARC_START + (index / (itemCount - 1)) * (ARC_END - ARC_START);
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = RADIUS * Math.cos(angleRad);
    const y = RADIUS * Math.sin(angleRad);

    const delay = index * 0.04;
    const exitDelay = (itemCount - 1 - index) * 0.03;

    return {
      position: 'absolute',
      width: ITEM_SIZE,
      height: ITEM_SIZE,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      padding: 0,
      // Position relative to FAB center; FAB is at (RADIUS, RADIUS) in the container
      left: RADIUS + x - ITEM_SIZE / 2,
      top: RADIUS + y - ITEM_SIZE / 2,
      transform: hovered
        ? 'scale(1)'
        : 'scale(0.3)',
      opacity: hovered ? 1 : 0,
      pointerEvents: hovered ? 'auto' : 'none',
      transition: [
        `transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`,
        `opacity 0.35s cubic-bezier(0.19, 1, 0.22, 1) ${delay}s`,
      ].join(', '),
      // On exit, reverse the stagger
      ...(hovered ? {} : {
        transitionDelay: `${exitDelay}s, ${exitDelay}s`,
      }),
      zIndex: hovered ? 98 : 0,
    };
  };

  // Menu item labels positioned next to each item
  const getLabelStyle = (index: number): React.CSSProperties => {
    const angleDeg =
      itemCount === 1
        ? (ARC_START + ARC_END) / 2
        : ARC_START + (index / (itemCount - 1)) * (ARC_END - ARC_START);
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = RADIUS * Math.cos(angleRad);
    const y = RADIUS * Math.sin(angleRad);

    // Place label to the left if item is on the right side, and vice versa
    const isLeftSide = angleDeg < -90;
    const labelX = isLeftSide
      ? x - ITEM_SIZE / 2 - 8  // left of the icon
      : x + ITEM_SIZE / 2 + 8;  // right of the icon
    const labelY = y;

    const delay = index * 0.04 + 0.06;

    return {
      position: 'absolute',
      left: RADIUS + labelX,
      top: RADIUS + labelY,
      transform: hovered
        ? `translate(${isLeftSide ? '-100%' : '0'}, -50%) scale(1)`
        : `translate(${isLeftSide ? '-80%' : '-20%'}, -50%) scale(0.6)`,
      opacity: hovered ? 1 : 0,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      color: 'var(--color-ink-primary)',
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '4px 12px',
      borderRadius: 9999,
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      transition: [
        `transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`,
        `opacity 0.35s cubic-bezier(0.19, 1, 0.22, 1) ${delay}s`,
      ].join(', '),
      zIndex: hovered ? 97 : 0,
    };
  };

  return (
    <div
      className="quick-action-fab-area"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        // The container covers the fan area + FAB
        // Fan extends RADIUS px in all directions from FAB center
        bottom: 32 - RADIUS,
        right: 36 - RADIUS,
        width: RADIUS * 2 + FAB_SIZE,
        height: RADIUS * 2 + FAB_SIZE,
        zIndex: 100,
        pointerEvents: 'none', // Container doesn't block clicks
      }}
    >
      {/* Radial menu items */}
      {items.map((item, i) => (
        <div key={item.key} style={{ pointerEvents: hovered ? 'auto' : 'none' }}>
          {/* Icon button */}
          <button
            type="button"
            className="quick-action-item"
            style={getItemStyle(i)}
            onClick={() => handleItemClick(item)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${item.color}40, 0 0 0 4px ${item.color}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 2px 8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)`;
            }}
            aria-label={item.label}
          >
            <span style={{ fontSize: 17, color: item.color, lineHeight: 1, display: 'flex' }}>
              {item.icon}
            </span>
          </button>

          {/* Label */}
          <span style={getLabelStyle(i)}>{item.label}</span>
        </div>
      ))}

      {/* Central FAB button */}
      <button
        type="button"
        className="quick-action-fab"
        onMouseEnter={handleMouseEnter}
        style={{
          position: 'absolute',
          bottom: RADIUS,
          right: RADIUS,
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: '50%',
          border: 'none',
          background: hovered
            ? 'linear-gradient(135deg, #8b88c4 0%, #7a77b8 50%, #6b67a8 100%)'
            : 'linear-gradient(135deg, #5B9FED 0%, #4A85D9 50%, #3D6FBF 100%)',
          color: '#fff',
          fontSize: 22,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99,
          pointerEvents: 'auto',
          boxShadow: hovered
            ? '0 6px 24px rgba(107, 103, 168, 0.45), 0 0 0 6px rgba(107, 103, 168, 0.10)'
            : pressed
              ? '0 2px 8px rgba(74, 133, 217, 0.25)'
              : '0 4px 16px rgba(74, 133, 217, 0.35), 0 0 0 2px rgba(74, 133, 217, 0.1)',
          transform: hovered ? 'rotate(45deg) scale(1.08)' : pressed ? 'scale(0.9)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        aria-label="Quick actions"
      >
        <PlusOutlined style={{ fontSize: 22, transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
      </button>

      {/* Subtle radial pulse ring when hovered */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: RADIUS,
            right: RADIUS,
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: '50%',
            border: '1px solid rgba(107, 103, 168, 0.12)',
            background: 'transparent',
            pointerEvents: 'none',
            animation: 'fabPulse 2s ease-out infinite',
            zIndex: 0,
          }}
        />
      )}

      {/* Inline keyframes for the pulse ring */}
      <style>{`
        @keyframes fabPulse {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(2.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/** ====== Pre-built menu item presets ====== */

export function useQuickActionItems(
  onCreateProject: () => void,
  onToggleTheme: () => void,
  onToggleLanguage: () => void,
): QuickActionItem[] {
  const navigate = useNavigate();

  return [
    {
      key: 'new-project',
      icon: <ProjectOutlined />,
      label: '新建项目',
      color: '#9b97d4',
      bg: 'rgba(155, 151, 212, 0.12)',
      onClick: onCreateProject,
    },
    {
      key: 'quick-task',
      icon: <ThunderboltOutlined />,
      label: '快速任务',
      color: '#f0a850',
      bg: 'rgba(240, 168, 80, 0.12)',
      onClick: () => navigate(ROUTES.PROJECTS),
    },
    {
      key: 'theme',
      icon: <BgColorsOutlined />,
      label: '主题切换',
      color: '#9bbc9e',
      bg: 'rgba(155, 188, 158, 0.12)',
      onClick: onToggleTheme,
    },
    {
      key: 'language',
      icon: <TranslationOutlined />,
      label: '语言',
      color: '#99bcdb',
      bg: 'rgba(153, 188, 219, 0.12)',
      onClick: onToggleLanguage,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      color: '#c4a0d4',
      bg: 'rgba(196, 160, 212, 0.12)',
      onClick: () => navigate(ROUTES.SETTINGS),
    },
  ];
}
