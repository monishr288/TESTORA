import React, { useState } from 'react';
import {
  Settings,
  Server,
  Trash2,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Shield,
  Monitor,
  Code,
  Info,
} from 'lucide-react';
import { useTestContext } from '../context/TestContext';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl, api } from '../services/api';

export default function SettingsPage() {
  const {
    backendConnected,
    backendStatus,
    clearHistoryAction,
    addNotification,
    refreshData,
  } = useTestContext();

  const [backendUrl, setBackendUrlInput] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [headlessDefault, setHeadlessDefault] = useState(true);
  const [defaultBrowser, setDefaultBrowser] = useState('chrome');
  const [defaultTimeout, setDefaultTimeout] = useState('10');

  const handleSaveBackendUrl = (e) => {
    e.preventDefault();
    const clean = setApiBaseUrl(backendUrl);
    setBackendUrlInput(clean);
    refreshData();
    addNotification({
      title: 'Settings Saved',
      message: `Backend API URL configured to ${clean}`,
      type: 'success',
    });
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await api.getStatus();
      addNotification({
        title: 'Connection Successful',
        message: `FastAPI responded with status: ${res.status}`,
        type: 'success',
      });
      await refreshData();
    } catch (err) {
      addNotification({
        title: 'Connection Failed',
        message: err.message || 'Could not connect to specified backend URL',
        type: 'error',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleResetUrl = () => {
    const def = resetApiBaseUrl();
    setBackendUrlInput(def);
    refreshData();
    addNotification({
      title: 'Reset to Default',
      message: `Backend URL restored to ${def}`,
      type: 'info',
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all recorded test history from test_history.json?')) {
      clearHistoryAction();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-passed">
              <Settings size={12} />
              TESTORA Configuration Panel
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Environment, Server & Automation Controls
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
            TESTORA Pipeline & Environment Settings
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Configure backend host endpoints, browser automation flags, and pipeline credentials.
          </p>
        </div>
      </div>

      {/* Grid: Backend Connection & Test Engine Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Backend Connection Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              FastAPI Backend Endpoint
            </h3>
          </div>

          <form onSubmit={handleSaveBackendUrl} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Backend Base URL
              </label>
              <input
                type="text"
                className="input-glass"
                style={{ marginTop: '6px', fontFamily: 'var(--font-mono)' }}
                value={backendUrl}
                onChange={(e) => setBackendUrlInput(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                required
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Default: http://127.0.0.1:8000 (FastAPI Uvicorn local server)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                <Save size={14} /> Save Endpoint
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                className="btn btn-secondary btn-sm"
                disabled={testingConnection}
              >
                <RefreshCw size={13} className={testingConnection ? 'spin-icon' : ''} />
                Test Connection
              </button>
              <button
                type="button"
                onClick={handleResetUrl}
                className="btn btn-secondary btn-sm"
              >
                Reset Default
              </button>
            </div>
          </form>

          {/* Connection Status Box */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: backendConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              border: `1px solid ${backendConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Live Server Status:</span>
            <strong style={{ color: backendConnected ? '#34d399' : '#fb7185' }}>
              {backendConnected ? 'Online & Ready' : 'Disconnected / Offline'}
            </strong>
          </div>
        </div>

        {/* Automation Runner Configuration */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Monitor size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Automation Execution Settings
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Default Automation Browser
              </label>
              <select
                className="select-glass"
                style={{ width: '100%', marginTop: '6px' }}
                value={defaultBrowser}
                onChange={(e) => setDefaultBrowser(e.target.value)}
              >
                <option value="chrome">Google Chrome (Recommended)</option>
                <option value="edge">Microsoft Edge</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Explicit Wait Timeout (Seconds)
              </label>
              <input
                type="number"
                className="input-glass"
                style={{ marginTop: '6px' }}
                value={defaultTimeout}
                onChange={(e) => setDefaultTimeout(e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Applied to WebDriverWait and element visibility checks.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>Default Headless Mode</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Prevents browser popups during automated test runs
                </div>
              </div>
              <input
                type="checkbox"
                checked={headlessDefault}
                onChange={(e) => setHeadlessDefault(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Target Application & Data Management */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Target Info */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Target Application Specification
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.825rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Application Under Test</span>
              <strong>SauceDemo E-Commerce</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target URL</span>
              <a href="https://www.saucedemo.com/" target="_blank" rel="noopener noreferrer">
                https://www.saucedemo.com/ &rarr;
              </a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Primary Test Account</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>standard_user / secret_sauce</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Defect Showcase Account</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>problem_user / secret_sauce</span>
            </div>
          </div>
        </div>

        {/* Data Management & History Purge */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Test History Data Store
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Execution records are persisted inside <code style={{ color: '#38bdf8' }}>test_history.json</code> on
              the backend filesystem. You can reset or purge this history whenever starting a new regression benchmark.
            </p>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button onClick={handleClearHistory} className="btn btn-danger btn-sm">
              <Trash2 size={14} />
              Clear Execution History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
