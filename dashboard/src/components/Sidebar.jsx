import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Cpu,
  Network,
  Bug,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useTestContext } from '../context/TestContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'manual', label: 'Manual Testing', icon: ClipboardCheck },
  { id: 'automation', label: 'Automation Testing', icon: Cpu },
  { id: 'api', label: 'API Testing', icon: Network },
  { id: 'bugs', label: 'Bug Reports', icon: Bug },
  { id: 'reports', label: 'Test Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  const { isRunning, backendConnected } = useTestContext();

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        background: 'rgba(8, 12, 22, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--topbar-height)',
          padding: collapsed ? '0 16px' : '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-glass)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(56, 189, 248, 0.45)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} color="#ffffff" />
          </div>
          {!collapsed && (
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  letterSpacing: '0.06em',
                  background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TESTORA
              </div>
              <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Quality Platform
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '6px',
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Brand Tagline Banner */}
      {!collapsed && (
        <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.01em', fontStyle: 'italic' }}>
            Test Smarter. Deliver Better.
          </span>
          <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 700 }}>
            v1.0
          </span>
        </div>
      )}

      {/* Target Application Badge */}
      {!collapsed ? (
        <div style={{ padding: '10px 20px 8px' }}>
          <a
            href="https://www.saucedemo.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.775rem',
              color: '#bae6fd',
            }}
          >
            <span>Target: <strong>saucedemo.com</strong></span>
            <ExternalLink size={13} />
          </a>
        </div>
      ) : (
        <div style={{ padding: '12px 0', textAlign: 'center' }}>
          <button
            onClick={() => setCollapsed(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
            title="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const showRunningBadge = item.id === 'automation' && isRunning;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: collapsed ? '12px 0' : '11px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.18) 0%, rgba(129, 140, 248, 0.08) 100%)'
                  : 'transparent',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                position: 'relative',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(56, 189, 248, 0.3)' : 'none',
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} color={isActive ? '#38bdf8' : 'currentColor'} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && showRunningBadge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#38bdf8',
                    boxShadow: '0 0 8px #38bdf8',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status Indicator */}
      <div
        style={{
          padding: collapsed ? '16px 8px' : '16px 20px',
          borderTop: '1px solid var(--border-glass)',
          background: 'rgba(5, 8, 16, 0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            className={`status-dot ${backendConnected ? 'active' : 'inactive'}`}
            title={backendConnected ? 'Backend Connected' : 'Backend Disconnected'}
          />
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {backendConnected ? 'TESTORA Engine Live' : 'Backend Offline'}
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                {backendConnected ? 'FastAPI :8000' : 'Start with uvicorn'}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
