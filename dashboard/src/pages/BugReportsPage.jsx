import React, { useState, useMemo } from 'react';
import {
  Bug,
  Filter,
  Search,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  FlaskConical,
  Info,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useTestContext } from '../context/TestContext';

export default function BugReportsPage() {
  const { searchQuery, addNotification, bugReports, updateBug, resetBugs, bugMetrics } = useTestContext();

  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedClassification, setSelectedClassification] = useState('All');
  const [activeBugModal, setActiveBugModal] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Bug Form
  const [newBug, setNewBug] = useState({
    id: `BUG-SD-${Math.floor(100 + Math.random() * 900)}`,
    title: '',
    module: 'Product Catalog',
    severity: 'High',
    priority: 'P1',
    status: 'Open',
    classification: 'Confirmed',
    environment: 'Chrome 124, Windows 11, https://www.saucedemo.com/',
    reporter: 'Monish (QA Automation Lead)',
    assignee: 'Frontend Developer',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    suggestedFix: '',
  });

  const modules = useMemo(() => {
    const set = new Set(bugReports.map((b) => b.module));
    return ['All', ...Array.from(set)];
  }, [bugReports]);

  const filteredBugs = useMemo(() => {
    return bugReports.filter((bug) => {
      const matchSeverity = selectedSeverity === 'All' || bug.severity === selectedSeverity;
      const matchStatus = selectedStatus === 'All' || bug.status === selectedStatus;
      const matchModule = selectedModule === 'All' || bug.module === selectedModule;
      const matchClass = selectedClassification === 'All' || bug.classification === selectedClassification;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        bug.id.toLowerCase().includes(q) ||
        bug.title.toLowerCase().includes(q) ||
        bug.module.toLowerCase().includes(q);

      return matchSeverity && matchStatus && matchModule && matchClass && matchQuery;
    });
  }, [bugReports, selectedSeverity, selectedStatus, selectedModule, selectedClassification, searchQuery]);

  const handleStatusChange = (bugId, newStatus) => {
    updateBug(bugId, { status: newStatus });
    if (activeBugModal && activeBugModal.id === bugId) {
      setActiveBugModal((prev) => ({ ...prev, status: newStatus }));
    }
    addNotification({
      title: 'Bug Report Updated',
      message: `${bugId} status marked as ${newStatus}.`,
      type: newStatus === 'Resolved' || newStatus === 'Verified' ? 'success' : 'info',
    });
  };

  const handleClassificationChange = (bugId, newClassification) => {
    updateBug(bugId, { classification: newClassification });
    if (activeBugModal && activeBugModal.id === bugId) {
      setActiveBugModal((prev) => ({ ...prev, classification: newClassification }));
    }
    addNotification({
      title: 'Classification Updated',
      message: `${bugId} reclassified as ${newClassification}.`,
      type: 'info',
    });
  };

  const handleCreateBug = (e) => {
    e.preventDefault();
    if (!newBug.title.trim()) return;

    const formatted = {
      ...newBug,
      dateReported: new Date().toISOString().split('T')[0],
      stepsToReproduce: newBug.stepsToReproduce.split('\n').filter((s) => s.trim().length > 0),
    };

    updateBug(formatted.id, formatted);
    setIsCreatingNew(false);
    setNewBug({
      id: `BUG-SD-${Math.floor(100 + Math.random() * 900)}`,
      title: '',
      module: 'Product Catalog',
      severity: 'High',
      priority: 'P1',
      status: 'Open',
      classification: 'Confirmed',
      environment: 'Chrome 124, Windows 11, https://www.saucedemo.com/',
      reporter: 'Monish (QA Automation Lead)',
      assignee: 'Frontend Developer',
      stepsToReproduce: '',
      expectedResult: '',
      actualResult: '',
      suggestedFix: '',
    });

    addNotification({
      title: 'Defect Logged',
      message: `${formatted.id} registered under ${formatted.classification} defect tracking.`,
      type: 'success',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Controls */}
      <div
        className="glass-panel"
        style={{
          padding: '22px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-failed">
                <Bug size={12} />
                TESTORA Defect Registry
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Audited against SauceDemo test scenarios
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
              TESTORA Defect Reports & Bug Tracker
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Tracks verified live application defects alongside documented portfolio sample specifications.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsCreatingNew(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              Report New Defect
            </button>
            <button
              onClick={resetBugs}
              className="btn btn-secondary btn-sm"
              title="Reset default bug reports"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Classification & Status Summary Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Defects</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>{bugMetrics.total}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Confirmed (Live Bugs)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{bugMetrics.confirmed}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700 }}>Sample (Demo Defects)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#c084fc' }}>{bugMetrics.sample}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#fb7185', textTransform: 'uppercase', fontWeight: 700 }}>Open</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fb7185' }}>{bugMetrics.open}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>In Progress</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>{bugMetrics.inProgress}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>Resolved / Verified</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{bugMetrics.resolved}</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Filter size={15} />
            <span>Filters:</span>
          </div>

          <select
            className="select-glass"
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
          >
            <option value="All">Classification: All ({bugReports.length})</option>
            <option value="Confirmed">Confirmed Live Bugs ({bugMetrics.confirmed})</option>
            <option value="Sample">Sample Demo Defects ({bugMetrics.sample})</option>
          </select>

          <select
            className="select-glass"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            <option value="All">Severity: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            className="select-glass"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Verified">Verified</option>
          </select>

          <select
            className="select-glass"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            {modules.map((m) => (
              <option key={m} value={m}>Module: {m}</option>
            ))}
          </select>

          {(selectedClassification !== 'All' || selectedSeverity !== 'All' || selectedStatus !== 'All' || selectedModule !== 'All') && (
            <button
              onClick={() => {
                setSelectedClassification('All');
                setSelectedSeverity('All');
                setSelectedStatus('All');
                setSelectedModule('All');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Bugs Table */}
      <div className="table-container">
        <table className="table-custom">
          <thead>
            <tr>
              <th style={{ width: '130px' }}>Bug ID</th>
              <th>Defect Title</th>
              <th>Classification</th>
              <th>Severity</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Module</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBugs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No defects matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredBugs.map((bug) => (
                <tr
                  key={bug.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveBugModal(bug)}
                >
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fb7185' }}>
                      {bug.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bug.title}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Reported: {bug.dateReported} by {bug.reporter}
                    </div>
                  </td>
                  <td>
                    {bug.classification === 'Confirmed' ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShieldCheck size={12} />
                        Confirmed Live Bug
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#c084fc',
                          background: 'rgba(168, 85, 247, 0.15)',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <FlaskConical size={12} />
                        Sample (Demo Defect)
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color:
                          bug.severity === 'Critical'
                            ? '#f43f5e'
                            : bug.severity === 'High'
                            ? '#fb7185'
                            : bug.severity === 'Medium'
                            ? '#f59e0b'
                            : '#94a3b8',
                      }}
                    >
                      {bug.severity}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#bae6fd',
                      }}
                    >
                      {bug.priority}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={bug.status} size="sm" />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {bug.module}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveBugModal(bug)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={13} />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bug Details Modal */}
      {activeBugModal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveBugModal(null)}
          title={`Defect Specification: ${activeBugModal.id}`}
          maxWidth="760px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status:</span>
                  <select
                    className="select-glass"
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                    value={activeBugModal.status}
                    onChange={(e) => handleStatusChange(activeBugModal.id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Verified">Verified</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classification:</span>
                  <select
                    className="select-glass"
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                    value={activeBugModal.classification}
                    onChange={(e) => handleClassificationChange(activeBugModal.id, e.target.value)}
                  >
                    <option value="Confirmed">Confirmed Live Bug</option>
                    <option value="Sample">Sample Demo Defect</option>
                  </select>
                </div>
              </div>

              <button onClick={() => setActiveBugModal(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Classification Advisory Banner */}
            {activeBugModal.classification === 'Confirmed' ? (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <ShieldCheck size={20} color="#34d399" />
                <div style={{ fontSize: '0.825rem', color: '#d1fae5' }}>
                  <strong>Confirmed Live Defect:</strong> This defect was reproduced and verified against the live target application (https://www.saucedemo.com/).
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(168, 85, 247, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FlaskConical size={20} color="#c084fc" />
                <div style={{ fontSize: '0.825rem', color: '#f3e8ff' }}>
                  <strong>Sample Demonstration Defect:</strong> This defect is logged as an industry-standard defect specification for QA portfolio review and has not been reproduced as a confirmed live issue.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge status={activeBugModal.status} />
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#fb7185' }}>
                Severity: {activeBugModal.severity}
              </span>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#93c5fd' }}>
                Priority: {activeBugModal.priority}
              </span>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
                Module: {activeBugModal.module}
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                {activeBugModal.title}
              </h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Environment: <code style={{ color: '#bae6fd' }}>{activeBugModal.environment}</code> &bull; Assignee: {activeBugModal.assignee}
              </p>
            </div>

            {/* Reproduction Steps */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Steps to Reproduce
              </span>
              <ol style={{ margin: '8px 0 0 18px', padding: 0, fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeBugModal.stepsToReproduce.map((s, idx) => (
                  <li key={idx} style={{ lineHeight: 1.4 }}>{s}</li>
                ))}
              </ol>
            </div>

            {/* Expected vs Actual */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ padding: '12px 14px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>Expected Result</span>
                <p style={{ fontSize: '0.8rem', color: '#d1fae5', marginTop: '4px', lineHeight: 1.4 }}>
                  {activeBugModal.expectedResult}
                </p>
              </div>

              <div style={{ padding: '12px 14px', background: 'rgba(244, 63, 94, 0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase' }}>Actual Result</span>
                <p style={{ fontSize: '0.8rem', color: '#ffe4e6', marginTop: '4px', lineHeight: 1.4 }}>
                  {activeBugModal.actualResult}
                </p>
              </div>
            </div>

            {/* Suggested Fix */}
            {activeBugModal.suggestedFix && (
              <div style={{ padding: '12px 14px', background: 'rgba(56, 189, 248, 0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>Developer Remediation Guidance</span>
                <p style={{ fontSize: '0.8rem', color: '#e0f2fe', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  {activeBugModal.suggestedFix}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Report New Defect Modal */}
      {isCreatingNew && (
        <Modal
          isOpen={isCreatingNew}
          onClose={() => setIsCreatingNew(false)}
          title="Log New Defect Report"
        >
          <form onSubmit={handleCreateBug} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Defect Title *
              </label>
              <input
                type="text"
                required
                className="input-glass"
                style={{ marginTop: '6px' }}
                placeholder="e.g. Shopping cart fails to calculate sales tax on checkout step two"
                value={newBug.title}
                onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Classification *
                </label>
                <select
                  className="select-glass"
                  style={{ marginTop: '6px' }}
                  value={newBug.classification}
                  onChange={(e) => setNewBug({ ...newBug, classification: e.target.value })}
                >
                  <option value="Confirmed">Confirmed Live Bug</option>
                  <option value="Sample">Sample Demo Defect</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Module *
                </label>
                <select
                  className="select-glass"
                  style={{ marginTop: '6px' }}
                  value={newBug.module}
                  onChange={(e) => setNewBug({ ...newBug, module: e.target.value })}
                >
                  <option value="Authentication">Authentication</option>
                  <option value="Product Catalog">Product Catalog</option>
                  <option value="Shopping Cart">Shopping Cart</option>
                  <option value="Checkout">Checkout</option>
                  <option value="Performance">Performance</option>
                  <option value="Accessibility / UI">Accessibility / UI</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Severity
                </label>
                <select
                  className="select-glass"
                  style={{ marginTop: '6px' }}
                  value={newBug.severity}
                  onChange={(e) => setNewBug({ ...newBug, severity: e.target.value })}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Priority
                </label>
                <select
                  className="select-glass"
                  style={{ marginTop: '6px' }}
                  value={newBug.priority}
                  onChange={(e) => setNewBug({ ...newBug, priority: e.target.value })}
                >
                  <option value="P1">P1 (Immediate)</option>
                  <option value="P2">P2 (Next Sprint)</option>
                  <option value="P3">P3 (Backlog)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Steps to Reproduce (One step per line) *
              </label>
              <textarea
                required
                className="input-glass"
                style={{ marginTop: '6px' }}
                rows={4}
                placeholder="1. Login as standard_user&#10;2. Add item to cart&#10;3. Click checkout"
                value={newBug.stepsToReproduce}
                onChange={(e) => setNewBug({ ...newBug, stepsToReproduce: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Expected Result *
                </label>
                <textarea
                  required
                  className="input-glass"
                  style={{ marginTop: '6px' }}
                  rows={2}
                  placeholder="Expected behavior..."
                  value={newBug.expectedResult}
                  onChange={(e) => setNewBug({ ...newBug, expectedResult: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Actual Result *
                </label>
                <textarea
                  required
                  className="input-glass"
                  style={{ marginTop: '6px' }}
                  rows={2}
                  placeholder="Actual observed behavior..."
                  value={newBug.actualResult}
                  onChange={(e) => setNewBug({ ...newBug, actualResult: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Defect Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
