import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Layers,
  Percent,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  Loader2,
  ServerOff,
  RefreshCw,
  FileCode,
  Info,
  Cpu,
  ClipboardCheck,
  Bug,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { useTestContext } from '../context/TestContext';

export default function OverviewPage({ navigateTo }) {
  const {
    latestResult,
    history,
    isRunning,
    runningDuration,
    runningTarget,
    runTests,
    backendConnected,
    refreshData,
    manualMetrics,
    bugMetrics,
  } = useTestContext();

  const [activeChartTab, setActiveChartTab] = useState('combined'); // 'combined' | 'automated' | 'manual'

  // 1. Live Automated Test Stats (from actual latest backend Pytest execution)
  const autoSummary = latestResult?.summary || {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: 0,
  };
  const totalAutomated = autoSummary.total;
  const autoPassRate = totalAutomated > 0 ? Math.round((autoSummary.passed / totalAutomated) * 100) : 0;

  // 2. Manual Test Stats (from persistent manual testing ledger)
  // Strictly counting only tests that were actually executed manually
  const manualExecuted = manualMetrics.executedCount;
  const manualPassed = manualMetrics.passed;
  const manualFailed = manualMetrics.failed;
  const manualBlocked = manualMetrics.blocked;
  const manualNotRun = manualMetrics.notRunCount;
  const manualCatalogTotal = manualMetrics.totalCatalog;
  const manualPassRate = manualMetrics.passRate;

  // 3. Combined Active Execution Totals (prevents double-counting, excludes unexecuted 'Not Run' catalog items)
  const combinedActiveTotal = totalAutomated + manualExecuted;
  const combinedPassed = autoSummary.passed + manualPassed;
  const combinedFailed = autoSummary.failed + manualFailed;
  const combinedSkippedBlocked = autoSummary.skipped + manualBlocked;
  const combinedErrors = autoSummary.errors || 0;
  const combinedPassRate = combinedActiveTotal > 0 ? Math.round((combinedPassed / combinedActiveTotal) * 100) : 0;

  // Chart: Automated Duration Trend across genuine past runs
  const historyTrendData = history.length > 0
    ? [...history].reverse().map((r, i) => ({
        name: `Run #${i + 1}`,
        time: r.timestamp ? r.timestamp.split(' ')[1] : `Run ${i + 1}`,
        duration: r.duration_seconds || 0,
        passed: r.summary?.passed || 0,
        failed: r.summary?.failed || 0,
      }))
    : [];

  // Chart: Outcomes Data depending on active tab
  const getOutcomesPieData = () => {
    if (activeChartTab === 'automated') {
      return [
        { name: 'Auto Passed', value: autoSummary.passed, color: '#10b981' },
        { name: 'Auto Failed', value: autoSummary.failed, color: '#f43f5e' },
        { name: 'Auto Skipped', value: autoSummary.skipped, color: '#f59e0b' },
      ].filter((d) => d.value > 0);
    }
    if (activeChartTab === 'manual') {
      return [
        { name: 'Manual Passed', value: manualPassed, color: '#34d399' },
        { name: 'Manual Failed', value: manualFailed, color: '#f43f5e' },
        { name: 'Manual Blocked', value: manualBlocked, color: '#f59e0b' },
        { name: 'Not Run (Pending)', value: manualNotRun, color: '#64748b' },
      ].filter((d) => d.value > 0);
    }
    // Combined Active
    return [
      { name: 'Combined Passed', value: combinedPassed, color: '#10b981' },
      { name: 'Combined Failed', value: combinedFailed, color: '#f43f5e' },
      { name: 'Skipped / Blocked', value: combinedSkippedBlocked, color: '#f59e0b' },
    ].filter((d) => d.value > 0);
  };

  const outcomesData = getOutcomesPieData();

  // Side-by-side comparison bar chart data
  const comparisonBarData = [
    {
      metric: 'Passed',
      Automated: autoSummary.passed,
      Manual: manualPassed,
    },
    {
      metric: 'Failed',
      Automated: autoSummary.failed,
      Manual: manualFailed,
    },
    {
      metric: 'Skip/Block',
      Automated: autoSummary.skipped,
      Manual: manualBlocked,
    },
  ];

  const handleQuickRun = () => {
    runTests({ test_file: null, headless: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Backend Offline Warning Banner if disconnected */}
      {!backendConnected && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ServerOff size={20} color="#fb7185" />
            <div>
              <strong style={{ color: '#fb7185', fontSize: '0.875rem' }}>
                FastAPI Backend Server Offline
              </strong>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Start the backend server by running <code style={{ color: '#bae6fd' }}>python -m uvicorn main:app --reload --port 8000</code> in <code style={{ color: '#bae6fd' }}>dashboard/backend</code>.
              </div>
            </div>
          </div>
          <button
            onClick={refreshData}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
          >
            <RefreshCw size={13} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Top Banner & Quick Runner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 30px',
          background: 'linear-gradient(135deg, rgba(14, 25, 48, 0.85) 0%, rgba(20, 35, 68, 0.75) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-passed">
              <Shield size={12} />
              TESTORA Platform Live
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Test Smarter. Deliver Better. &bull; Target: SauceDemo.com
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            TESTORA — Quality Engineering Platform
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
            Consolidates live Selenium/Pytest automated executions with persistent manual QA audit records.
            Telemetry strictly separates automated subprocess runs from manual records without double-counting.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {isRunning ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
              }}
            >
              <Loader2 size={18} className="spin-icon" color="#38bdf8" />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#38bdf8' }}>
                  Executing {runningTarget} ({runningDuration}s)
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Pytest subprocess running in headless Chrome
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleQuickRun}
              className="btn btn-run"
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
              disabled={!backendConnected}
              title={!backendConnected ? 'Start FastAPI backend to execute tests' : 'Run all automated Pytest test suites'}
            >
              <Play size={18} fill="currentColor" />
              <span>Run Full Test Suite</span>
            </button>
          )}

          <button
            onClick={() => navigateTo('automation')}
            className="btn btn-secondary"
            style={{ padding: '12px 18px' }}
          >
            <span>Automation Hub</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Source Attribution & Calculation Transparency Notice */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} color="#38bdf8" />
          <div style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#f8fafc' }}>Data Source Integrity:</strong> Overview combines{' '}
            <strong style={{ color: '#38bdf8' }}>Live Automated Pytest Subprocess Results</strong> ({totalAutomated} tests) with{' '}
            <strong style={{ color: '#34d399' }}>Persistent Manual QA Records</strong> ({manualExecuted} executed of {manualCatalogTotal} catalog tests).{' '}
            Unexecuted manual tests ({manualNotRun} Not Run) are isolated to prevent metric skew.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            Auto: {totalAutomated}
          </span>
          <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
            Manual Executed: {manualExecuted}
          </span>
          <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }}>
            Manual Not Run: {manualNotRun}
          </span>
        </div>
      </div>

      {/* KPI Metrics Cards (Transparent Combined & Separate Data) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <MetricCard
          title="Active Tests Executed"
          value={combinedActiveTotal}
          subtitle={`${totalAutomated} Automated + ${manualExecuted} Manual (${manualNotRun} Pending)`}
          icon={Layers}
          accentColor="#38bdf8"
        />
        <MetricCard
          title="Passed Tests"
          value={combinedPassed}
          subtitle={`Auto: ${autoSummary.passed} | Manual: ${manualPassed}`}
          icon={CheckCircle2}
          accentColor="#10b981"
          progress={combinedPassRate}
        />
        <MetricCard
          title="Failed Tests"
          value={combinedFailed}
          subtitle={`Auto: ${autoSummary.failed} | Manual: ${manualFailed}`}
          icon={XCircle}
          accentColor="#f43f5e"
        />
        <MetricCard
          title="Skipped / Blocked"
          value={combinedSkippedBlocked}
          subtitle={`Auto: ${autoSummary.skipped} | Manual: ${manualBlocked}`}
          icon={AlertTriangle}
          accentColor="#f59e0b"
        />
        <MetricCard
          title="Pytest Errors"
          value={combinedErrors}
          subtitle="Subprocess execution errors"
          icon={AlertOctagon}
          accentColor={combinedErrors > 0 ? '#f43f5e' : '#64748b'}
        />
        <MetricCard
          title="Latest Automation Run"
          value={`${latestResult?.duration_seconds || '0'}s`}
          subtitle={`Combined Pass Rate: ${combinedPassRate}%`}
          icon={Clock}
          accentColor="#818cf8"
          progress={combinedPassRate}
        />
      </div>

      {/* Testing Scope Comparison Matrix (Automated vs Manual Side-by-Side) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Testing Scope & Execution Breakdown
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Side-by-side audit separating Live Automated Suite metrics from Persistent Manual Verification records
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
            Zero Double-Counting Guaranteed
          </span>
        </div>

        <div className="table-container">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Testing Modality</th>
                <th>Source Origin</th>
                <th>Total Defined</th>
                <th>Executed</th>
                <th>Not Run</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Skip/Block</th>
                <th>Pass Rate</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Automated Tests Row */}
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={16} color="#38bdf8" />
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>Automated Testing</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Selenium WebDriver + Pytest</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                    FastAPI (latest_results.json)
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>{totalAutomated}</td>
                <td style={{ fontWeight: 700, color: '#38bdf8' }}>{totalAutomated}</td>
                <td style={{ color: 'var(--text-muted)' }}>0</td>
                <td style={{ color: '#34d399', fontWeight: 700 }}>{autoSummary.passed}</td>
                <td style={{ color: autoSummary.failed > 0 ? '#fb7185' : 'var(--text-muted)', fontWeight: 700 }}>
                  {autoSummary.failed}
                </td>
                <td style={{ color: autoSummary.skipped > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                  {autoSummary.skipped}
                </td>
                <td>
                  <span className="badge badge-passed">{autoPassRate}%</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => navigateTo('automation')}
                    className="btn btn-secondary btn-sm"
                  >
                    View Automation
                  </button>
                </td>
              </tr>

              {/* Manual Tests Row */}
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardCheck size={16} color="#34d399" />
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>Manual Testing</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>QA Portfolio Test Ledger</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                    localStorage (qa_manual_tests)
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>{manualCatalogTotal}</td>
                <td style={{ fontWeight: 700, color: '#34d399' }}>{manualExecuted}</td>
                <td style={{ color: '#fbbf24', fontWeight: 700 }}>{manualNotRun}</td>
                <td style={{ color: '#34d399', fontWeight: 700 }}>{manualPassed}</td>
                <td style={{ color: manualFailed > 0 ? '#fb7185' : 'var(--text-muted)', fontWeight: 700 }}>
                  {manualFailed}
                </td>
                <td style={{ color: manualBlocked > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                  {manualBlocked}
                </td>
                <td>
                  <span className="badge badge-passed">{manualPassRate}%</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => navigateTo('manual')}
                    className="btn btn-secondary btn-sm"
                  >
                    View Manual Cases
                  </button>
                </td>
              </tr>

              {/* Defect Tracking Row */}
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bug size={16} color="#fb7185" />
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>Defect Tracking</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Defects (Confirmed vs Sample)</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: '#fb7185' }}>
                    localStorage (qa_bug_reports)
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>{bugMetrics.total} Bugs</td>
                <td style={{ fontWeight: 700, color: '#fb7185' }}>{bugMetrics.confirmed} Confirmed</td>
                <td style={{ color: '#c084fc', fontWeight: 700 }}>{bugMetrics.sample} Sample</td>
                <td style={{ color: '#34d399', fontWeight: 700 }}>{bugMetrics.resolved} Resolved</td>
                <td style={{ color: '#fb7185', fontWeight: 700 }}>{bugMetrics.open} Open</td>
                <td style={{ color: '#fbbf24' }}>{bugMetrics.inProgress} In Prog</td>
                <td>
                  <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                    {bugMetrics.open} Active
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => navigateTo('bugs')}
                    className="btn btn-secondary btn-sm"
                  >
                    View Bug Reports
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Execution History Duration Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Automated Pytest Execution Trend
                </h3>
                <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.65rem' }}>
                  {history.length} Runs Recorded
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Execution seconds of automated Pytest subprocess runs (loaded from test_history.json)
              </p>
            </div>
            <TrendingUp size={18} color="#38bdf8" />
          </div>

          <div style={{ height: '230px', width: '100%' }}>
            {historyTrendData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <span style={{ fontSize: '0.825rem' }}>No historical test runs recorded yet.</span>
                <span style={{ fontSize: '0.725rem', marginTop: '2px' }}>Click "Run Full Test Suite" to generate runtime data.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit="s" />
                  <Tooltip
                    contentStyle={{
                      background: '#0d1527',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="duration"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#durationGrad)"
                    name="Duration (s)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pass vs Fail Ratio Pie Chart with Scope Selector */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Test Outcomes Telemetry
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {activeChartTab === 'combined'
                  ? `Combined Active Scope (${combinedActiveTotal} Executed)`
                  : activeChartTab === 'automated'
                  ? `Live Automated Pytest Suite (${totalAutomated} Tests)`
                  : `TESTORA Manual Testing Ledger (${manualCatalogTotal} Defined, ${manualExecuted} Executed)`}
              </p>
            </div>

            {/* Scope Filter Buttons */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              {['combined', 'automated', 'manual'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeChartTab === tab ? '#38bdf8' : 'transparent',
                    color: activeChartTab === tab ? '#090d16' : 'var(--text-secondary)',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '230px', width: '100%' }}>
            {outcomesData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Activity size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <span style={{ fontSize: '0.825rem' }}>No outcome telemetry available.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {outcomesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0d1527',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val) => <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Test Executions & Live QA Audit Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Recent Executions Table */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Recent Automated Test Executions
              </h3>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Loaded live from test_history.json
              </span>
            </div>
            <button
              onClick={() => navigateTo('reports')}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              View Full History &rarr;
            </button>
          </div>

          <div className="table-container">
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                <Clock size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <div>No test runs recorded in history yet.</div>
                <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                  Execute a test run to view historical records here.
                </div>
              </div>
            ) : (
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Run ID</th>
                    <th>Timestamp</th>
                    <th>Target</th>
                    <th>Passed</th>
                    <th>Failed</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((run) => (
                    <tr key={run.run_id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                          {run.run_id}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                          {run.timestamp}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                          {run.test_target || 'All Suites'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>{run.summary?.passed ?? 0}</span>
                      </td>
                      <td>
                        <span style={{ color: run.summary?.failed ? '#fb7185' : 'var(--text-muted)', fontWeight: 600 }}>
                          {run.summary?.failed ?? 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                          {run.duration_seconds}s
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={run.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Target Application & Live Environment Info */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Environment & Target Profile
            </h3>
            <span className="badge badge-passed">Production Demo</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Target Application Under Test</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                SauceDemo E-Commerce Platform
              </div>
              <a
                href="https://www.saucedemo.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}
              >
                https://www.saucedemo.com/ &rarr;
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Test Framework</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Pytest 8.x + pytest-html
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Automation Engine</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Selenium WebDriver 4.x
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Backend Architecture</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  FastAPI + Uvicorn Async
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Frontend Stack</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  React 18 + Vite + Recharts
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Subprocess Concurrency Guard: <strong>Active (asyncio.Lock)</strong>
              </div>
              <span className="badge badge-passed">Safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
