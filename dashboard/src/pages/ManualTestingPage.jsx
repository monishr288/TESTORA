import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Clock,
  UserCheck,
  Layers,
  Check,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useTestContext } from '../context/TestContext';

export default function ManualTestingPage() {
  const { searchQuery, addNotification, manualTests, updateManualTest, resetManualTests, manualMetrics } = useTestContext();

  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeModalTest, setActiveModalTest] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Test Case Form State
  const [newTest, setNewTest] = useState({
    id: `TC-MAN-${Math.floor(100 + Math.random() * 900)}`,
    scenario: '',
    module: 'Authentication',
    priority: 'High',
    status: 'Not Run',
    isExecutedManually: false,
    preconditions: '',
    steps: '',
    expectedResult: '',
    actualResult: 'Pending manual execution',
  });

  // Modules list for filtering
  const modules = useMemo(() => {
    const set = new Set(manualTests.map((t) => t.module));
    return ['All', ...Array.from(set)];
  }, [manualTests]);

  // Filter & Search logic
  const filteredTests = useMemo(() => {
    return manualTests.filter((tc) => {
      const matchModule = selectedModule === 'All' || tc.module === selectedModule;
      const matchPriority = selectedPriority === 'All' || tc.priority === selectedPriority;
      const matchStatus = selectedStatus === 'All' || tc.status === selectedStatus;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        tc.id.toLowerCase().includes(query) ||
        tc.scenario.toLowerCase().includes(query) ||
        tc.module.toLowerCase().includes(query);

      return matchModule && matchPriority && matchStatus && matchSearch;
    });
  }, [manualTests, selectedModule, selectedPriority, selectedStatus, searchQuery]);

  // Update status for a specific test case
  const handleStatusChange = (testId, newStatus) => {
    const isNowExecuted = newStatus !== 'Not Run';
    const actualResult =
      newStatus === 'Passed'
        ? 'Verified successfully against expected criteria.'
        : newStatus === 'Failed'
        ? 'Execution failed; bug logged.'
        : newStatus === 'Blocked'
        ? 'Execution blocked pending dependency resolution.'
        : 'Pending manual execution';

    updateManualTest(testId, {
      status: newStatus,
      isExecutedManually: isNowExecuted,
      actualResult,
      executedAt: isNowExecuted ? new Date().toLocaleString() : null,
      tester: isNowExecuted ? 'Monish (QA Automation Lead)' : 'Unassigned',
    });

    if (activeModalTest && activeModalTest.id === testId) {
      setActiveModalTest((prev) => ({
        ...prev,
        status: newStatus,
        isExecutedManually: isNowExecuted,
        actualResult,
        executedAt: isNowExecuted ? new Date().toLocaleString() : null,
      }));
    }

    addNotification({
      title: 'Manual Test Updated',
      message: `${testId} status changed to ${newStatus}. Execution recorded in persistent ledger.`,
      type: newStatus === 'Passed' ? 'success' : newStatus === 'Failed' ? 'error' : 'info',
    });
  };

  // Add new test case
  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!newTest.scenario.trim()) return;

    const formatted = {
      ...newTest,
      steps: newTest.steps.split('\n').filter((s) => s.trim().length > 0),
      isExecutedManually: newTest.status !== 'Not Run',
      executedAt: newTest.status !== 'Not Run' ? new Date().toLocaleString() : null,
      tester: newTest.status !== 'Not Run' ? 'Monish (QA Engineer)' : 'Unassigned',
    };

    // Insert at front
    updateManualTest(formatted.id, formatted);
    setIsCreatingNew(false);
    setNewTest({
      id: `TC-MAN-${Math.floor(100 + Math.random() * 900)}`,
      scenario: '',
      module: 'Authentication',
      priority: 'High',
      status: 'Not Run',
      isExecutedManually: false,
      preconditions: '',
      steps: '',
      expectedResult: '',
      actualResult: 'Pending manual execution',
    });

    addNotification({
      title: 'Test Case Created',
      message: `${formatted.id} added to manual testing repository.`,
      type: 'success',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Filter Controls */}
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
              <span className="badge badge-passed">
                <ClipboardCheck size={12} />
                TESTORA Manual QA Ledger
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Persistent Browser Ledger ('qa_manual_tests')
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
              TESTORA Manual Test Repository
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Interactive manual execution ledger. Only manually executed tests count toward execution metrics.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsCreatingNew(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              Add Test Case
            </button>
            <button
              onClick={resetManualTests}
              className="btn btn-secondary btn-sm"
              title="Reset to default portfolio manual test cases"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Live Manual Execution Audit Metric Summary */}
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
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Catalog</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>{manualMetrics.totalCatalog}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>Executed Manually</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{manualMetrics.executedCount}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Not Run (Pending)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#94a3b8' }}>{manualMetrics.notRunCount}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Passed</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{manualMetrics.passed}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#fb7185', textTransform: 'uppercase', fontWeight: 700 }}>Failed</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fb7185' }}>{manualMetrics.failed}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>Blocked</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>{manualMetrics.blocked}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.675rem', color: '#a78bfa', textTransform: 'uppercase', fontWeight: 700 }}>Execution Pass Rate</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa' }}>{manualMetrics.passRate}%</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Filter size={15} />
            <span>Filters:</span>
          </div>

          <select
            className="select-glass"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            {modules.map((m) => (
              <option key={m} value={m}>Module: {m}</option>
            ))}
          </select>

          <select
            className="select-glass"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="All">Priority: All</option>
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
            <option value="All">Status: All ({manualTests.length})</option>
            <option value="Passed">Passed ({manualMetrics.passed})</option>
            <option value="Failed">Failed ({manualMetrics.failed})</option>
            <option value="Blocked">Blocked ({manualMetrics.blocked})</option>
            <option value="Not Run">Not Run ({manualMetrics.notRunCount})</option>
          </select>

          {(selectedModule !== 'All' || selectedPriority !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSelectedModule('All');
                setSelectedPriority('All');
                setSelectedStatus('All');
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

      {/* Manual Tests Table */}
      <div className="table-container">
        <table className="table-custom">
          <thead>
            <tr>
              <th style={{ width: '130px' }}>Test ID</th>
              <th>Test Scenario</th>
              <th>Module</th>
              <th>Priority</th>
              <th>Execution State</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No manual test cases matching your current filter criteria.
                </td>
              </tr>
            ) : (
              filteredTests.map((tc) => (
                <tr
                  key={tc.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveModalTest(tc)}
                >
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
                      {tc.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tc.scenario}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {Array.isArray(tc.steps) ? `${tc.steps.length} test steps` : 'Steps defined'} &bull; {tc.executedAt ? `Executed: ${tc.executedAt}` : 'Unexecuted'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {tc.module}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color:
                          tc.priority === 'Critical'
                            ? '#f43f5e'
                            : tc.priority === 'High'
                            ? '#f59e0b'
                            : tc.priority === 'Medium'
                            ? '#38bdf8'
                            : '#94a3b8',
                      }}
                    >
                      {tc.priority}
                    </span>
                  </td>
                  <td>
                    {tc.isExecutedManually && tc.status !== 'Not Run' ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.15)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Check size={12} />
                        Executed
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#94a3b8',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={12} />
                        Not Run
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={tc.status} size="sm" />
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {/* Quick Status Dropdown */}
                      <select
                        className="select-glass"
                        style={{ fontSize: '0.75rem', padding: '4px 8px', height: '28px' }}
                        value={tc.status}
                        onChange={(e) => handleStatusChange(tc.id, e.target.value)}
                      >
                        <option value="Not Run">Not Run</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                        <option value="Blocked">Blocked</option>
                      </select>

                      <button
                        onClick={() => setActiveModalTest(tc)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 9px' }}
                        title="View Full Test Case Steps"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Test Case Detail View Modal */}
      {activeModalTest && (
        <Modal
          isOpen={!!activeModalTest}
          onClose={() => setActiveModalTest(null)}
          title={`Manual Test Specification: ${activeModalTest.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Top Info Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scenario Title</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                  {activeModalTest.scenario}
                </h4>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StatusBadge status={activeModalTest.status} />

                {/* Status Change Dropdown inside Modal */}
                <select
                  className="select-glass"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  value={activeModalTest.status}
                  onChange={(e) => handleStatusChange(activeModalTest.id, e.target.value)}
                >
                  <option value="Not Run">Mark as Not Run</option>
                  <option value="Passed">Mark as Passed</option>
                  <option value="Failed">Mark as Failed</option>
                  <option value="Blocked">Mark as Blocked</option>
                </select>
              </div>
            </div>

            {/* Metadata Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Module</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeModalTest.module}</div>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Priority</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeModalTest.priority}</div>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Execution State</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: activeModalTest.isExecutedManually ? '#34d399' : '#94a3b8' }}>
                  {activeModalTest.isExecutedManually ? '✓ Executed' : '○ Not Run'}
                </div>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Executed At</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeModalTest.executedAt || 'Not executed'}
                </div>
              </div>
            </div>

            {/* Preconditions */}
            {activeModalTest.preconditions && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Preconditions
                </span>
                <div
                  style={{
                    marginTop: '6px',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {activeModalTest.preconditions}
                </div>
              </div>
            )}

            {/* Test Steps */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Test Steps
              </span>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.isArray(activeModalTest.steps) ? (
                  activeModalTest.steps.map((st, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.825rem',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ color: 'var(--text-primary)', marginTop: '1px' }}>{st}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{activeModalTest.steps}</p>
                )}
              </div>
            </div>

            {/* Expected Result */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                Expected Result
              </span>
              <div
                style={{
                  marginTop: '6px',
                  padding: '12px 14px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.825rem',
                  color: '#d1fae5',
                }}
              >
                {activeModalTest.expectedResult}
              </div>
            </div>

            {/* Actual Result & Evidence */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                Actual Observed Result
              </span>
              <div
                style={{
                  marginTop: '6px',
                  padding: '12px 14px',
                  background: 'rgba(56, 189, 248, 0.06)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  fontSize: '0.825rem',
                  color: '#e0f2fe',
                }}
              >
                {activeModalTest.actualResult || 'No execution observations logged.'}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Test Case Modal */}
      {isCreatingNew && (
        <Modal
          isOpen={isCreatingNew}
          onClose={() => setIsCreatingNew(false)}
          title="Create New Manual Test Case"
        >
          <form onSubmit={handleCreateTest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Test Case Scenario Title *
              </label>
              <input
                type="text"
                required
                className="input-glass"
                style={{ marginTop: '6px' }}
                placeholder="e.g. Verify checkout calculation when discount coupon is applied"
                value={newTest.scenario}
                onChange={(e) => setNewTest({ ...newTest, scenario: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Target Module
                </label>
                <select
                  className="select-glass"
                  style={{ marginTop: '6px' }}
                  value={newTest.module}
                  onChange={(e) => setNewTest({ ...newTest, module: e.target.value })}
                >
                  <option value="Authentication">Authentication</option>
                  <option value="Product Catalog">Product Catalog</option>
                  <option value="Shopping Cart">Shopping Cart</option>
                  <option value="Checkout">Checkout</option>
                  <option value="Performance">Performance</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Priority
                </label>
                <select
                  className="select-glass"
                  style={{ marginTop: '6px' }}
                  value={newTest.priority}
                  onChange={(e) => setNewTest({ ...newTest, priority: e.target.value })}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Initial Status
              </label>
              <select
                className="select-glass"
                style={{ marginTop: '6px' }}
                value={newTest.status}
                onChange={(e) => setNewTest({ ...newTest, status: e.target.value })}
              >
                <option value="Not Run">Not Run (Pending)</option>
                <option value="Passed">Passed (Verified)</option>
                <option value="Failed">Failed (Bug Found)</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Preconditions
              </label>
              <input
                type="text"
                className="input-glass"
                style={{ marginTop: '6px' }}
                placeholder="e.g. User logged in with items in cart"
                value={newTest.preconditions}
                onChange={(e) => setNewTest({ ...newTest, preconditions: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Test Steps (One step per line) *
              </label>
              <textarea
                required
                className="input-glass"
                style={{ marginTop: '6px' }}
                rows={4}
                placeholder="Step 1: Navigate to page&#10;Step 2: Enter credential&#10;Step 3: Click button"
                value={newTest.steps}
                onChange={(e) => setNewTest({ ...newTest, steps: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Expected Result *
              </label>
              <input
                type="text"
                required
                className="input-glass"
                style={{ marginTop: '6px' }}
                placeholder="e.g. Order confirms with 200 OK and reference number displayed"
                value={newTest.expectedResult}
                onChange={(e) => setNewTest({ ...newTest, expectedResult: e.target.value })}
              />
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
                Create Test Case
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
