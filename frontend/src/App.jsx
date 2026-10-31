import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import NetworkGraph from './pages/NetworkGraph';
import DisruptionDetection from './pages/DisruptionDetection';
import RipplePrediction from './pages/RipplePrediction';
import RiskAnalysis from './pages/RiskAnalysis';
import ScenarioSimulator from './pages/ScenarioSimulator';
import Recommendations from './pages/Recommendations';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Settings from './pages/Settings';
import api from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [targetCompanyId, setTargetCompanyId] = useState(null);
  const [activeDisruptionsCount, setActiveDisruptionsCount] = useState(4);
  const [databaseMode, setDatabaseMode] = useState('in_memory');

  // Load telemetry stats for topnav
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const dashboard = await api.getDashboard();
        setActiveDisruptionsCount(dashboard.kpis.active_disruptions || 4);
        setDatabaseMode(dashboard.database_status?.storage_mode || 'in_memory');
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, []);

  const handleNavigateToModule = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulateTarget = (companyId) => {
    setTargetCompanyId(companyId);
    setActiveTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePredictTarget = (companyId) => {
    setTargetCompanyId(companyId);
    setActiveTab('prediction');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGraphTarget = (companyId) => {
    setTargetCompanyId(companyId);
    setActiveTab('network');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearch = (query) => {
    if (query && query.length > 1) {
      // Navigate to network or risk tab where search takes effect
      if (activeTab !== 'network' && activeTab !== 'risk') {
        setActiveTab('network');
      }
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Top Command Bar */}
      <TopNav
        onSearch={handleGlobalSearch}
        activeDisruptionsCount={activeDisruptionsCount}
        databaseMode={databaseMode}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={handleNavigateToModule} />

        {/* Dynamic Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-navy-950 via-navy-900/60 to-navy-950">
          {activeTab === 'overview' && (
            <Overview
              onNavigateToModule={handleNavigateToModule}
              onSimulateTarget={handleSimulateTarget}
            />
          )}

          {activeTab === 'network' && (
            <NetworkGraph
              selectedOriginId={targetCompanyId}
              onNavigateToSimulator={handleSimulateTarget}
              onNavigateToPredict={handlePredictTarget}
            />
          )}

          {activeTab === 'disruptions' && (
            <DisruptionDetection onNavigateToSimulator={handleSimulateTarget} />
          )}

          {activeTab === 'prediction' && (
            <RipplePrediction
              defaultOriginId={targetCompanyId}
              onNavigateToSimulator={handleSimulateTarget}
            />
          )}

          {activeTab === 'risk' && (
            <RiskAnalysis onNavigateToSimulator={handleSimulateTarget} />
          )}

          {activeTab === 'simulator' && (
            <ScenarioSimulator
              initialCompanyId={targetCompanyId}
              onNavigateToGraph={handleGraphTarget}
            />
          )}

          {activeTab === 'recommendations' && (
            <Recommendations onNavigateToSimulator={handleSimulateTarget} />
          )}

          {activeTab === 'reports' && <ReportsAnalytics />}

          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default App;
