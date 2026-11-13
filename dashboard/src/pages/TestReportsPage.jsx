import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Calendar,
  Layers,
  FileCheck,
  Globe,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useTestContext } from '../context/TestContext';
import { api } from '../services/api';

export default function TestReportsPage() {
  const { history, screenshots, availableReports, latestResult } = useTestContext();

  const [activeRunModal, setActiveRunModal] = useState(null);
  const [activeScreenshotModal, setActiveScreenshotModal] = useState(null);

  const displayHistory = history.length > 0 ? history : (latestResult ? [latestResult] : []);

  // Check if live HTML report exists
  const hasHtmlReport = availableReports.some((r) => r.filename === 'report.html' || r.type === 'html');
  const htmlReportUrl = api.getReportUrl('report.html');

  const handleExportJson = (run) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(run, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${run.run_id}_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
              <FileCheck size={12} />
              TESTORA Verified Artifacts
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Pytest HTML Reports &bull; Screenshots &bull; JSON Telemetry
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
            TESTORA Test Reports & Visual Evidence Hub
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Access self-contained Pytest HTML reports, regression audit history, and auto-captured failure screenshots.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {hasHtmlReport ? (
            <a
              href={htmlReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <Globe size={16} />
              <span>Open Pytest HTML Report</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Run tests to generate HTML report
            </div>
          )}
        </div>
      </div>

      {/* Available Report Files On Disk */}
      {availableReports.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Generated Report Artifacts On Server ({availableReports.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {availableReports.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#bae6fd', fontFamily: 'var(--font-mono)' }}>
                    {r.filename}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {r.created_at} &bull; {Math.round(r.size_bytes / 1024)} KB
                  </div>
                </div>
                <a
                  href={api.getReportUrl(r.filename)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <Eye size={12} />
                  <span>View</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Runs Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Historical Test Runs ({displayHistory.length})
        </h3>

        {displayHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div>No test execution reports found.</div>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              Execute an automated test suite from the Automation page to record your first run.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Timestamp</th>
                  <th>Target Suite</th>
                  <th>Outcome</th>
                  <th>Duration</th>
                  <th>Summary (P / F / S)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayHistory.map((run) => (
                  <tr
                    key={run.run_id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveRunModal(run)}
                  >
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#93c5fd' }}>
                        {run.run_id}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {run.timestamp}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {run.target || 'Pytest_Tests'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={run.status} size="sm" />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {run.duration_seconds}s
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem' }}>
                        <strong style={{ color: '#34d399' }}>{run.summary?.passed || 0}</strong> /{' '}
                        <strong style={{ color: '#fb7185' }}>{run.summary?.failed || 0}</strong> /{' '}
                        <strong style={{ color: '#fbbf24' }}>{run.summary?.skipped || 0}</strong>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setActiveRunModal(run)}
                          className="btn btn-secondary btn-sm"
                          title="View Test Breakdown"
                        >
                          <Eye size={13} />
                          Details
                        </button>
                        <button
                          onClick={() => handleExportJson(run)}
                          className="btn btn-secondary btn-sm"
                          title="Export Report JSON"
                        >
                          <Download size={13} />
                          JSON
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Failure Screenshots Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Auto-Captured Failure Screenshots ({screenshots.length})
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              High-resolution browser captures saved automatically when any Selenium assertion fails.
            </p>
          </div>
        </div>

        {screenshots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            <ImageIcon size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div>No failure screenshots recorded.</div>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              All tests passed cleanly in recent runs with zero visual defects!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {screenshots.map((s, idx) => {
              const url = api.getScreenshotUrl(s.filename);

              return (
                <div
                  key={idx}
                  className="glass-panel"
                  style={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    background: 'rgba(10, 16, 30, 0.6)',
                  }}
                >
                  <div
                    style={{
                      height: '140px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#050810',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onClick={() => setActiveScreenshotModal(s)}
                  >
                    <img
                      src={url}
                      alt={s.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      style={{
                        display: 'none',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fb7185',
                        fontSize: '0.75rem',
                      }}
                    >
                      Image preview unavailable
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={s.filename}
                    >
                      {s.filename}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>{s.created_at || 'Recorded'}</span>
                      <span>{Math.round((s.size_bytes || 0) / 1024)} KB</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setActiveScreenshotModal(s)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem' }}
                    >
                      <Eye size={12} /> View Full
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      title="Open in new browser tab"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Run Details Modal */}
      {activeRunModal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveRunModal(null)}
          title={`Test Execution Report: ${activeRunModal.run_id}`}
          maxWidth="750px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <button
                onClick={() => handleExportJson(activeRunModal)}
                className="btn btn-secondary btn-sm"
              >
                <Download size={14} /> Download JSON
              </button>
              <button onClick={() => setActiveRunModal(null)} className="btn btn-primary btn-sm">
                Close
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Run KPI banner */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <StatusBadge status={activeRunModal.status} />
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                Duration: {activeRunModal.duration_seconds}s
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                Target: {activeRunModal.target || 'all'}
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                Timestamp: {activeRunModal.timestamp}
              </span>
            </div>

            {/* Test Items Table */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Test Cases Breakdown ({(activeRunModal.tests || []).length})
              </h4>

              {(activeRunModal.tests || []).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No granular test cases recorded for this run.
                </div>
              ) : (
                <div className="table-container" style={{ maxHeight: '350px' }}>
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th>File</th>
                        <th>Duration</th>
                        <th>Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRunModal.tests.map((t, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{t.name}</div>
                            {t.error_message && (
                              <div style={{ fontSize: '0.7rem', color: '#fb7185', marginTop: '2px' }}>
                                {t.error_message.slice(0, 150)}...
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                              {t.file}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {t.duration}s
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={t.outcome} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Screenshot Viewer Modal */}
      {activeScreenshotModal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveScreenshotModal(null)}
          title={`Failure Screenshot: ${activeScreenshotModal.filename}`}
          maxWidth="900px"
        >
          <div style={{ textAlign: 'center' }}>
            <img
              src={api.getScreenshotUrl(activeScreenshotModal.filename)}
              alt={activeScreenshotModal.filename}
              style={{
                width: '100%',
                maxHeight: '560px',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
