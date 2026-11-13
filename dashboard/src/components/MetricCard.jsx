import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = '#38bdf8',
  glowColor = 'rgba(56, 189, 248, 0.2)',
  progress = null,
}) {
  return (
    <div
      className="glass-panel glass-panel-interactive"
      style={{
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background light spot */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: glowColor,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: `rgba(${accentColor === '#38bdf8' ? '56, 189, 248' : accentColor === '#10b981' ? '16, 185, 129' : accentColor === '#f43f5e' ? '244, 63, 94' : '129, 140, 248'}, 0.12)`,
              border: `1px solid ${accentColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f8fafc', lineHeight: 1.1 }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ marginTop: '8px', fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {subtitle}
        </div>
      )}

      {progress !== null && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Success Rate</span>
            <span style={{ fontWeight: 700, color: accentColor }}>{progress}%</span>
          </div>
          <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, progress))}%`,
                background: `linear-gradient(90deg, ${accentColor}, #818cf8)`,
                borderRadius: '999px',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
