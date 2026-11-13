import React, { useState } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  Menu,
  CheckCircle2,
  AlertTriangle,
  X,
  User,
} from 'lucide-react';
import { useTestContext } from '../context/TestContext';

const PAGE_TITLES = {
  overview: 'TESTORA Overview & Telemetry',
  manual: 'Manual Test Execution',
  automation: 'Pytest & Selenium Automation',
  api: 'REST API Test Specifications',
  bugs: 'Bug Reports & QA Defect Tracker',
  reports: 'Test Execution Reports',
  settings: 'TESTORA Pipeline & Environment Settings',
};

export default function TopNav({ activePage, toggleSidebar }) {
  const {
    backendConnected,
    refreshData,
    searchQuery,
    setSearchQuery,
    notifications,
    dismissNotification,
    isRunning,
  } = useTestContext();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="top-nav">
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
          className="mobile-only-btn"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {PAGE_TITLES[activePage] || 'TESTORA — Quality Engineering Platform'}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            TESTORA &bull; Quality Engineering Platform &bull; SauceDemo
          </p>
        </div>
      </div>

      {/* Right: Search, Status, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search Field */}
        <div style={{ position: 'relative', width: '240px' }} className="search-desktop">
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="input-glass"
            placeholder="Search test cases, bugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.825rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Backend Connection Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '999px',
            background: backendConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${backendConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <span className={`status-dot ${backendConnected ? 'active' : 'inactive'}`} />
          <span style={{ color: backendConnected ? '#34d399' : '#fb7185' }}>
            {backendConnected ? (isRunning ? 'Running Tests...' : 'Backend Live') : 'Offline'}
          </span>
          <button
            onClick={handleRefresh}
            title="Refresh backend status"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              marginLeft: '4px',
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} />
          </button>
        </div>

        {/* Notifications Icon with Badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '340px',
                background: '#0d1527',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                padding: '16px',
                zIndex: 100,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>System Notifications</span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{notifications.length} updates</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '16px' }}>
                    No unread notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.8rem',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ color: n.type === 'error' ? '#fb7185' : n.type === 'success' ? '#34d399' : '#38bdf8' }}>
                          {n.title}
                        </strong>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.75rem' }}>{n.message}</p>
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        {n.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 12px 4px 6px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-glass)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            M
          </div>
          <div className="profile-text" style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>Monish</div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>QA Engineer</div>
          </div>
        </div>
      </div>
    </header>
  );
}
