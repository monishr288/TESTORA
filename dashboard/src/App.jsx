import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestProvider, useTestContext } from './context/TestContext';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

import OverviewPage from './pages/OverviewPage';
import ManualTestingPage from './pages/ManualTestingPage';
import AutomationTestingPage from './pages/AutomationTestingPage';
import ApiTestingPage from './pages/ApiTestingPage';
import BugReportsPage from './pages/BugReportsPage';
import TestReportsPage from './pages/TestReportsPage';
import SettingsPage from './pages/SettingsPage';

function DashboardContent() {
  const [activePage, setActivePage] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage navigateTo={setActivePage} />;
      case 'manual':
        return <ManualTestingPage />;
      case 'automation':
        return <AutomationTestingPage />;
      case 'api':
        return <ApiTestingPage />;
      case 'bugs':
        return <BugReportsPage />;
      case 'reports':
        return <TestReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage navigateTo={setActivePage} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setMobileOpen(false);
        }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div className={`main-content-wrapper ${collapsed ? 'collapsed' : ''}`}>
        {/* Sticky Glass Top Header */}
        <TopNav
          activePage={activePage}
          toggleSidebar={() => setCollapsed(!collapsed)}
        />

        {/* Dynamic Page Container with Motion Transitions */}
        <main className="page-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <TestProvider>
      <DashboardContent />
    </TestProvider>
  );
}
