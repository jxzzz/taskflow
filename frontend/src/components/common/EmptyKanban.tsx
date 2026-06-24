import { useState, useEffect } from 'react';
import { Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface EmptyKanbanProps {
  onCreateTask: () => void;
}

/** Ghost column placeholder — suggests board structure */
function GhostColumn({ index }: { index: number }) {
  const cardHeights = [
    [48, 36, 56],
    [52, 42],
    [44, 58, 38, 48],
  ][index % 3];

  return (
    <div
      style={{
        width: 280,
        minWidth: 280,
        flexShrink: 0,
        border: '2px dashed rgba(155, 151, 212, 0.15)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: 0.4,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Ghost header */}
      <div
        style={{
          height: 10,
          width: '55%',
          borderRadius: 5,
          background: 'rgba(155, 151, 212, 0.12)',
          marginBottom: 4,
          marginLeft: 4,
        }}
      />
      {/* Ghost cards */}
      {cardHeights.map((h, i) => (
        <div
          key={i}
          style={{
            height: h,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(155, 151, 212, 0.06)',
            border: '1px dashed rgba(155, 151, 212, 0.1)',
          }}
        />
      ))}
    </div>
  );
}

/** CSS rocket illustration — pure CSS art */
function RocketIllustration() {
  return (
    <div
      style={{
        position: 'relative',
        width: 220,
        height: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      {/* Ambient glow behind rocket */}
      <div
        className="rocket-glow"
        style={{
          position: 'absolute',
          width: 140,
          height: 140,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(155, 151, 212, 0.18) 0%, rgba(153, 188, 219, 0.08) 40%, transparent 70%)',
          filter: 'blur(12px)',
          bottom: 50,
        }}
      />

      {/* Floating particles */}
      {[
        { char: '✦', top: '8%', left: '10%', size: 10, delay: '0s', color: '#c9c6ee' },
        { char: '◆', top: '18%', right: '12%', size: 6, delay: '0.8s', color: '#e8cf8e' },
        { char: '•', top: '55%', left: '6%', size: 8, delay: '1.4s', color: '#9bbc9e' },
        { char: '✧', top: '42%', right: '8%', size: 11, delay: '0.3s', color: '#99bcdb' },
        { char: '·', top: '12%', left: '24%', size: 5, delay: '2.0s', color: '#e8a09c' },
        { char: '◇', top: '68%', right: '16%', size: 7, delay: '1.1s', color: '#c9c6ee' },
      ].map((p, i) => (
        <span
          key={i}
          className="rocket-particle"
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            right: p.right,
            fontSize: p.size,
            color: p.color,
            animationDelay: p.delay,
            opacity: 0,
          }}
        >
          {p.char}
        </span>
      ))}

      {/* === ROCKET GROUP (floating) === */}
      <div
        className="rocket-group"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          filter: 'drop-shadow(0 8px 24px rgba(155, 151, 212, 0.2))',
        }}
      >
        {/* Nose cone */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '28px solid transparent',
            borderRight: '28px solid transparent',
            borderBottom: '42px solid #e8a09c',
            marginBottom: -2,
            position: 'relative',
            zIndex: 2,
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.06))',
          }}
        />
        {/* Nose highlight */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: '24px solid rgba(255,255,255,0.35)',
            zIndex: 3,
          }}
        />

        {/* Rocket body */}
        <div
          style={{
            width: 56,
            height: 108,
            borderRadius: '28px 28px 10px 10px',
            background: 'linear-gradient(105deg, #f5f3f0 0%, #ffffff 18%, #faf9f6 40%, #ffffff 62%, #eeebe6 100%)',
            position: 'relative',
            zIndex: 1,
            boxShadow:
              'inset 2px 0 6px rgba(255,255,255,0.8), inset -3px 0 8px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Subtle body stripe */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, transparent 0%, rgba(155,151,212,0.25) 20%, rgba(155,151,212,0.35) 50%, rgba(155,151,212,0.25) 80%, transparent 100%)',
              borderRadius: 2,
            }}
          />

          {/* Window / Porthole */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f4f8 0%, #c5ddef 40%, #a8c8de 100%)',
              marginTop: 26,
              position: 'relative',
              boxShadow:
                'inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.08), 0 0 0 3px rgba(255,255,255,0.5), 0 0 0 5px rgba(155,151,212,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Window reflection */}
            <div
              style={{
                position: 'absolute',
                top: 4,
                left: 6,
                width: 10,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                transform: 'rotate(-30deg)',
              }}
            />

            {/* Cute face */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Eyes */}
              <div style={{ display: 'flex', gap: 7, marginBottom: 0 }}>
                <span
                  style={{
                    width: 5,
                    height: 5.5,
                    borderRadius: '50%',
                    background: '#2b2825',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    width: 5,
                    height: 5.5,
                    borderRadius: '50%',
                    background: '#2b2825',
                    display: 'inline-block',
                  }}
                />
              </div>
              {/* Smile */}
              <div
                style={{
                  width: 10,
                  height: 5,
                  borderBottom: '2px solid #2b2825',
                  borderRadius: '0 0 50% 50%',
                  marginTop: 2,
                }}
              />
            </div>
          </div>

          {/* Second stripe */}
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: 4,
              right: 4,
              height: 2,
              background: 'linear-gradient(90deg, transparent 0%, rgba(155,151,212,0.2) 30%, rgba(155,151,212,0.3) 50%, rgba(155,151,212,0.2) 70%, transparent 100%)',
              borderRadius: 1,
            }}
          />
        </div>

        {/* Fins */}
        {/* Left fin */}
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            left: -16,
            width: 22,
            height: 36,
            background: 'linear-gradient(180deg, #e8a09c 0%, #d48580 100%)',
            borderRadius: '4px 14px 6px 4px',
            transform: 'rotate(18deg)',
            zIndex: 0,
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          }}
        />
        {/* Right fin */}
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            right: -16,
            width: 22,
            height: 36,
            background: 'linear-gradient(180deg, #d48580 0%, #c0706b 100%)',
            borderRadius: '14px 4px 4px 6px',
            transform: 'rotate(-18deg)',
            zIndex: 0,
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          }}
        />
        {/* Center fin (front-facing, smaller) */}
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 12,
            height: 20,
            background: 'linear-gradient(180deg, #f0c4c1 0%, #e8a09c 100%)',
            borderRadius: '2px 2px 6px 6px',
            zIndex: 2,
          }}
        />

        {/* === FLAME === */}
        <div
          className="rocket-flame-group"
          style={{
            position: 'absolute',
            bottom: -38,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: -1,
          }}
        >
          {/* Outer flame */}
          <div
            className="flame-outer"
            style={{
              width: 36,
              height: 44,
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
              background: 'linear-gradient(180deg, #f9c970 0%, #f5a623 40%, #e8873a 100%)',
              filter: 'blur(1.5px)',
              marginTop: -6,
            }}
          />
          {/* Inner flame */}
          <div
            className="flame-inner"
            style={{
              width: 22,
              height: 30,
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
              background: 'linear-gradient(180deg, #fff8e1 0%, #fde0a6 30%, #f9c970 100%)',
              position: 'absolute',
              top: 8,
            }}
          />
          {/* Core flame */}
          <div
            className="flame-core"
            style={{
              width: 10,
              height: 18,
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
              background: 'linear-gradient(180deg, #ffffff 0%, #fff8e1 60%, #fde0a6 100%)',
              position: 'absolute',
              top: 14,
            }}
          />
        </div>
      </div>

      {/* Ground shadow ellipse */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 90,
          height: 14,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(155,151,212,0.12) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

export default function EmptyKanban({ onCreateTask }: EmptyKanbanProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Stagger entrance
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 480,
        overflow: 'hidden',
        padding: '48px 24px',
      }}
    >
      {/* ====== GHOST COLUMNS BACKGROUND ====== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '20px 60px',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1.2s cubic-bezier(0.19, 1, 0.22, 1)',
          transitionDelay: '0.1s',
        }}
      >
        {[0, 1, 2].map((i) => (
          <GhostColumn key={i} index={i} />
        ))}
      </div>

      {/* ====== CENTERED CONTENT ====== */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s cubic-bezier(0.19, 1, 0.22, 1), transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)',
          transitionDelay: '0.2s',
        }}
      >
        {/* Rocket Illustration */}
        <RocketIllustration />

        {/* Heading */}
        <Title
          level={3}
          style={{
            margin: '0 0 6px',
            fontFamily: "'Newsreader', Georgia, 'Times New Roman', serif",
            fontWeight: 500,
            fontSize: 26,
            color: 'var(--color-ink-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
          }}
        >
          Start your first project
        </Title>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 14,
            color: 'var(--color-ink-tertiary)',
            lineHeight: 1.6,
            marginBottom: 28,
            display: 'block',
            maxWidth: 340,
          }}
        >
          Create a task to kick off your Kanban board. Organize, prioritize, and ship with clarity.
        </Text>

        {/* CTA Button — vibrant blue as requested */}
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={onCreateTask}
          className="empty-kanban-cta"
          style={{
            height: 48,
            paddingInline: 32,
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #5B9FED 0%, #4A85D9 50%, #3D6FBF 100%)',
            border: 'none',
            boxShadow:
              '0 2px 8px rgba(74, 133, 217, 0.25), 0 6px 24px rgba(74, 133, 217, 0.18), 0 0 0 4px rgba(74, 133, 217, 0.06)',
            letterSpacing: '0.01em',
            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow =
              '0 4px 14px rgba(74, 133, 217, 0.32), 0 10px 36px rgba(74, 133, 217, 0.22), 0 0 0 8px rgba(74, 133, 217, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow =
              '0 2px 8px rgba(74, 133, 217, 0.25), 0 6px 24px rgba(74, 133, 217, 0.18), 0 0 0 4px rgba(74, 133, 217, 0.06)';
          }}
        >
          + Create Task
        </Button>

        {/* Subtle hint */}
        <Text
          style={{
            fontSize: 11.5,
            color: 'var(--color-ink-disabled)',
            marginTop: 18,
            letterSpacing: '0.03em',
          }}
        >
          Press{' '}
          <kbd
            style={{
              display: 'inline-block',
              padding: '1px 6px',
              borderRadius: 4,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-default)',
              fontSize: 10.5,
              fontFamily: "'DM Sans', sans-serif",
              color: 'var(--color-ink-tertiary)',
              margin: '0 2px',
            }}
          >
            N
          </kbd>{' '}
          or click the button above to get started
        </Text>
      </div>
    </div>
  );
}
