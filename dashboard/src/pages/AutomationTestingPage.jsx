import React, { useState } from 'react';
import {
  Play,
  RotateCw,
  Terminal,
  Clock,
  CheckCircle2,
  XCircle,
  FileCode,
  Image as ImageIcon,
  Cpu,
  Monitor,
  ExternalLink,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useTestContext } from '../context/TestContext';
import { api } from '../services/api';

const AUTOMATION_SUITES = [
  {
    file: 'test_login.py',
    name: 'Authentication & Session',
    module: 'Authentication',
    count: 2,
    description: 'Valid login redirects to /inventory.html, header verification, and burger menu logout session teardown.',
  },
  {
    file: 'test_login_scenarios.py',
    name: 'Login Edge Cases & Validation',
    module: 'Authentication',
    count: 5,
    description: 'Invalid username, invalid password, empty credentials, and locked_out_user error banner assertions.',
  },
  {
    file: 'test_products.py',
    name: 'Product Catalog & Sorting',
    module: 'Catalog',
    count: 3,
    description: 'Inventory items count (6 items), price/name non-empty verification, low-to-high and Z-to-A dropdown sorting.',
  },
  {
    file: 'test_cart.py',
    name: 'Shopping Cart Management',
    module: 'Shopping Cart',
    count: 4,
    description: 'Add single/multiple items, cart badge counter updates, inventory removal, and /cart.html item verification.',
  },
  {
    file: 'test_checkout.py',
    name: 'Checkout & Order Fulfillment',
    module: 'Checkout',
    count: 4,
    description: 'Step 1 customer form validations (empty first/last/zip), order overview calculation, and thank you order confirmation.',
  },
];

export default function AutomationTestingPage() {
  const {
    latestResult,
    isRunning,
    runningDuration,
    runningTarget,
    runTests,
    backendConnected,
    addNotification,
  } = useTestContext();

  const [headless, setHeadless] = useState(true);
  const [browser, setBrowser] = useState('chrome');
  const [selectedSuiteToRun, setSelectedSuiteToRun] = useState('all');
  const [activeLogModal, setActiveLogModal] = useState(false);
  const [activeScreenshotModal, setActiveScreenshotModal] = useState(null);

  const handleExecute = async (testFile = null) => {
    try {
      await runTests({
        test_file: testFile === 'all' ? null : testFile,
        headless,
        browser,
      });
    } catch (err) {
      // Notification handled in context
    }
  };

  const testsList = latestResult?.tests || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Execution Control Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(24, 38, 72, 0.8) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-running">
              <Cpu size={12} />
              TESTORA Subprocess Engine
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Pytest &bull; Selenium WebDriver &bull; Chrome Headless
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
            TESTORA Automated Test Suite Runner
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Safely invokes native Pytest processes on the server to execute real browser automation.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Headless Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <input
              type="checkbox"
              checked={headless}
              onChange={(e) => setHeadless(e.target.checked)}
              disabled={isRunning}
            />
            <span>Headless Mode</span>
          </label>

          {/* Suite Selector */}
          <select
            className="select-glass"
            value={selectedSuiteToRun}
            onChange={(e) => setSelectedSuiteToRun(e.target.value)}
            disabled={isRunning}
            style={{ fontSize: '0.825rem' }}
          >
            <option value="all">Run All Suites (18 Tests)</option>
            {AUTOMATION_SUITES.map((s) => (
              <option key={s.file} value={s.file}>{s.name} ({s.count} tests)</option>
            ))}
          </select>

          {/* Primary Run Button */}
          {isRunning ? (
            <button
              className="btn btn-run"
              style={{ padding: '10px 22px' }}
              disabled={true}
            >
              <Loader2 size={16} className="spin-icon" />
              <span>Running {runningTarget} ({runningDuration}s)...</span>
            </button>
          ) : (
            <button
              onClick={() => handleExecute(selectedSuiteToRun)}
              className="btn btn-run"
              style={{ padding: '10px 22px' }}
              disabled={!backendConnected}
            >
              <Play size={16} fill="currentColor" />
              <span>Execute Selected Suite</span>
            </button>
          )}

          {latestResult?.stdout_summary && (
            <button
              onClick={() => setActiveLogModal(true)}
              className="btn btn-secondary"
              style={{ padding: '10px 14px' }}
              title="View Raw Pytest Terminal Log"
            >
              <Terminal size={16} />
              <span>Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Test Suites Cards Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Available Automated Test Suites ({AUTOMATION_SUITES.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total 18 Automated Selenium Test Cases
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {AUTOMATION_SUITES.map((suite) => {
            const isCurrentlyRunningThis = isRunning && (runningTarget === suite.file || runningTarget === 'all');

            return (
              <div
                key={suite.file}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isCurrentlyRunningThis ? '1px solid #38bdf8' : '1px solid var(--border-glass)',
                  boxShadow: isCurrentlyRunningThis ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCode size={16} color="#38bdf8" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                        {suite.file}
                      </span>
                    </div>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      {suite.count} Tests
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {suite.name}
                  </h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {suite.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Module: <strong>{suite.module}</strong>
                  </span>

                  <button
                    onClick={() => handleExecute(suite.file)}
                    className="btn btn-secondary btn-sm"
                    disabled={isRunning || !backendConnected}
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Run File</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Execution Breakdown Results Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Latest Execution Breakdown
              </h3>
              {latestResult && <StatusBadge status={latestResult.status} size="sm" />}
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {latestResult ? (
                <>
                  Run ID: <strong style={{ color: '#93c5fd' }}>{latestResult.run_id}</strong> &bull; Total Duration: <strong>{latestResult.duration_seconds}s</strong> &bull; Timestamp: {latestResult.timestamp}
                </>
              ) : (
                'No automated execution recorded yet. Click Execute above to run Pytest.'
              )}
            </p>
          </div>

          {latestResult?.summary && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                Total: {latestResult.summary.total}
              </span>
              <span className="badge badge-passed">Passed: {latestResult.summary.passed}</span>
              <span className="badge badge-failed">Failed: {latestResult.summary.failed}</span>
              <span className="badge badge-skipped">Skipped: {latestResult.summary.skipped}</span>
              <span className="badge" style={{ background: latestResult.summary.errors ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: latestResult.summary.errors ? '#fb7185' : 'var(--text-muted)' }}>
                Errors: {latestResult.summary.errors || 0}
              </span>
              <span className="badge" style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>
                Duration: {latestResult.duration_seconds}s
              </span>
            </div>
          )}
        </div>

        {testsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Cpu size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <div>No individual test details to display.</div>
            <p style={{ fontSize: '0.775rem', marginTop: '4px' }}>
              Trigger an automated execution run using the button above.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Test Case Name</th>
                  <th>Test Suite File</th>
                  <th>Duration</th>
                  <th>Outcome</th>
                  <th style={{ textAlign: 'right' }}>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {testsList.map((t, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                      {t.error_message && (
                        <div
                          style={{
                            fontSize: '0.725rem',
                            color: '#fb7185',
                            fontFamily: 'var(--font-mono)',
                            marginTop: '4px',
                            maxHeight: '60px',
                            overflowY: 'auto',
                            background: 'rgba(244, 63, 94, 0.08)',
                            padding: '6px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {t.error_message.slice(0, 300)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {t.file}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {t.duration}s
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={t.outcome} size="sm" />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {t.screenshot ? (
                        <button
                          onClick={() => setActiveScreenshotModal(t.screenshot)}
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
                        >
                          <ImageIcon size={13} />
                          Screenshot
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Terminal Log Output Modal */}
      {activeLogModal && latestResult && (
        <Modal
          isOpen={true}
          onClose={() => setActiveLogModal(false)}
          title={`Pytest Subprocess Log: ${latestResult.run_id}`}
          maxWidth="800px"
          footer={
            <button onClick={() => setActiveLogModal(false)} className="btn btn-secondary btn-sm">
              Close Log
            </button>
          }
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Target: {latestResult.target || 'all'}</span>
              <span>Exit Code: {latestResult.exit_code}</span>
            </div>
            <pre className="code-terminal" style={{ maxHeight: '450px' }}>
              {latestResult.stdout_summary || 'No stdout output available.'}
            </pre>
          </div>
        </Modal>
      )}

      {/* Screenshot Viewer Modal */}
      {activeScreenshotModal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveScreenshotModal(null)}
          title="Failure Screenshot Evidence"
          maxWidth="850px"
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Path: {activeScreenshotModal}
            </p>
            <img
              src={api.getScreenshotUrl(activeScreenshotModal.split(/[\\/]/).pop())}
              alt="Test Failure Screenshot"
              style={{
                width: '100%',
                maxHeight: '520px',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{ display: 'none', padding: '30px', color: '#fb7185' }}>
              Could not load screenshot asset from backend static endpoint.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
