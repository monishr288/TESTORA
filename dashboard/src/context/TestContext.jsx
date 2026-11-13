import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { INITIAL_MANUAL_TESTS } from '../data/manualTests';
import { INITIAL_BUG_REPORTS } from '../data/bugReports';

const TestContext = createContext(null);

export function TestProvider({ children }) {
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [testFiles, setTestFiles] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [availableReports, setAvailableReports] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runningTarget, setRunningTarget] = useState('all');
  const [runningDuration, setRunningDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent Manual Test Cases State
  const [manualTests, setManualTests] = useState(() => {
    try {
      const saved = localStorage.getItem('qa_manual_tests');
      return saved ? JSON.parse(saved) : INITIAL_MANUAL_TESTS;
    } catch {
      return INITIAL_MANUAL_TESTS;
    }
  });

  // Persistent Bug Reports State
  const [bugReports, setBugReports] = useState(() => {
    try {
      const saved = localStorage.getItem('qa_bug_reports');
      return saved ? JSON.parse(saved) : INITIAL_BUG_REPORTS;
    } catch {
      return INITIAL_BUG_REPORTS;
    }
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "TESTORA Platform Operational",
      message: "Quality Engineering Platform ready for live automated and manual testing.",
      type: "info",
      timestamp: "Just now"
    }
  ]);

  const timerRef = useRef(null);

  const addNotification = useCallback((notif) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [
      { id, timestamp: new Date().toLocaleTimeString(), ...notif },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Update Manual Test Case
  const updateManualTest = useCallback((testId, updates) => {
    setManualTests((prev) => {
      const updated = prev.map((tc) => {
        if (tc.id === testId) {
          const next = { ...tc, ...updates };
          // If status is Not Run, explicitly mark isExecutedManually as false
          if (next.status === 'Not Run') {
            next.isExecutedManually = false;
            next.executedAt = null;
          } else {
            next.isExecutedManually = true;
            if (!next.executedAt || updates.status) {
              next.executedAt = new Date().toLocaleString();
            }
          }
          return next;
        }
        return tc;
      });
      localStorage.setItem('qa_manual_tests', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Reset Manual Test Cases
  const resetManualTests = useCallback(() => {
    setManualTests(INITIAL_MANUAL_TESTS);
    localStorage.setItem('qa_manual_tests', JSON.stringify(INITIAL_MANUAL_TESTS));
    addNotification({
      title: "Manual Tests Reset",
      message: "Restored default portfolio manual test ledger.",
      type: "info"
    });
  }, [addNotification]);

  // Update Bug Report
  const updateBug = useCallback((bugId, updates) => {
    setBugReports((prev) => {
      const updated = prev.map((b) => (b.id === bugId ? { ...b, ...updates } : b));
      localStorage.setItem('qa_bug_reports', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Reset Bug Reports
  const resetBugs = useCallback(() => {
    setBugReports(INITIAL_BUG_REPORTS);
    localStorage.setItem('qa_bug_reports', JSON.stringify(INITIAL_BUG_REPORTS));
    addNotification({
      title: "Bug Reports Reset",
      message: "Restored default defect catalog.",
      type: "info"
    });
  }, [addNotification]);

  // Derived Manual Execution Metrics (Strictly counts only executed manual tests)
  const manualMetrics = useMemo(() => {
    const totalCatalog = manualTests.length;
    const executedTests = manualTests.filter((t) => t.isExecutedManually && t.status !== 'Not Run');
    const executedCount = executedTests.length;
    const notRunCount = totalCatalog - executedCount;
    const passed = executedTests.filter((t) => t.status === 'Passed').length;
    const failed = executedTests.filter((t) => t.status === 'Failed').length;
    const blocked = executedTests.filter((t) => t.status === 'Blocked').length;
    const passRate = executedCount > 0 ? Math.round((passed / executedCount) * 100) : 0;

    return {
      totalCatalog,
      executedCount,
      notRunCount,
      passed,
      failed,
      blocked,
      passRate,
    };
  }, [manualTests]);

  // Derived Bug Metrics
  const bugMetrics = useMemo(() => {
    const total = bugReports.length;
    const confirmed = bugReports.filter((b) => b.classification === 'Confirmed').length;
    const sample = bugReports.filter((b) => b.classification === 'Sample').length;
    const open = bugReports.filter((b) => b.status === 'Open').length;
    const inProgress = bugReports.filter((b) => b.status === 'In Progress').length;
    const resolved = bugReports.filter((b) => b.status === 'Resolved' || b.status === 'Verified').length;

    return {
      total,
      confirmed,
      sample,
      open,
      inProgress,
      resolved,
    };
  }, [bugReports]);

  // Fetch all live data from backend
  const refreshData = useCallback(async () => {
    try {
      const statusRes = await api.getStatus();
      setBackendStatus(statusRes);
      setBackendConnected(true);

      if (statusRes.is_test_running) {
        setIsRunning(true);
      }
    } catch {
      setBackendConnected(false);
    }

    try {
      const latestRes = await api.getLatestResult();
      if (latestRes && latestRes.latest) {
        setLatestResult(latestRes.latest);
      }
    } catch {
      // quiet fail
    }

    try {
      const historyRes = await api.getHistory(30);
      if (historyRes && Array.isArray(historyRes.history)) {
        setHistory(historyRes.history);
      }
    } catch {
      // quiet fail
    }

    try {
      const filesRes = await api.getTestFiles();
      if (filesRes && Array.isArray(filesRes.files)) {
        setTestFiles(filesRes.files);
      }
    } catch {
      // quiet fail
    }

    try {
      const screenshotsRes = await api.getScreenshots();
      if (screenshotsRes && Array.isArray(screenshotsRes.screenshots)) {
        setScreenshots(screenshotsRes.screenshots);
      }
    } catch {
      // quiet fail
    }

    try {
      const reportsRes = await api.getReports();
      if (reportsRes && Array.isArray(reportsRes.reports)) {
        setAvailableReports(reportsRes.reports);
      }
    } catch {
      // quiet fail
    }
  }, []);

  // Initial load & periodic polling
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [refreshData]);

  // Elapsed execution timer
  useEffect(() => {
    if (isRunning) {
      setRunningDuration(0);
      timerRef.current = setInterval(() => {
        setRunningDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Run tests trigger function
  const runTests = useCallback(
    async ({ test_file = null, headless = true, browser = 'chrome' } = {}) => {
      if (isRunning) return;

      setIsRunning(true);
      setRunningTarget(test_file || 'all');
      addNotification({
        title: "Test Suite Started",
        message: `Executing ${test_file || 'all test suites'} in ${headless ? 'headless' : 'headed'} mode (${browser})...`,
        type: "info"
      });

      try {
        const response = await api.runTests({ test_file, headless, browser });
        if (response.success && response.run) {
          setLatestResult(response.run);
          await refreshData();

          const passCount = response.run.summary?.passed ?? 0;
          const failCount = response.run.summary?.failed ?? 0;
          const isSuccess = response.run.status === 'passed';

          addNotification({
            title: isSuccess ? "Tests Passed Successfully" : "Test Execution Completed with Failures",
            message: `Completed ${response.run.summary?.total ?? 0} tests in ${response.run.duration_seconds}s. Passed: ${passCount}, Failed: ${failCount}`,
            type: isSuccess ? "success" : "error"
          });
          return response.run;
        }
      } catch (err) {
        addNotification({
          title: "Execution Error",
          message: err.message || "Failed to execute tests",
          type: "error"
        });
        throw err;
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, refreshData, addNotification]
  );

  const clearHistoryAction = useCallback(async () => {
    try {
      await api.clearHistory();
      setHistory([]);
      addNotification({
        title: "History Cleared",
        message: "Test execution records have been cleared from test_history.json",
        type: "info"
      });
      await refreshData();
    } catch (err) {
      addNotification({
        title: "Clear Failed",
        message: err.message || "Could not clear test history",
        type: "error"
      });
    }
  }, [addNotification, refreshData]);

  return (
    <TestContext.Provider
      value={{
        backendConnected,
        backendStatus,
        latestResult,
        history,
        testFiles,
        screenshots,
        availableReports,
        isRunning,
        runningTarget,
        runningDuration,
        searchQuery,
        setSearchQuery,
        manualTests,
        updateManualTest,
        resetManualTests,
        manualMetrics,
        bugReports,
        updateBug,
        resetBugs,
        bugMetrics,
        notifications,
        addNotification,
        dismissNotification,
        refreshData,
        runTests,
        clearHistoryAction,
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTestContext() {
  const ctx = useContext(TestContext);
  if (!ctx) {
    throw new Error('useTestContext must be used within a TestProvider');
  }
  return ctx;
}
