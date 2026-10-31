import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Bell, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const TopNav = ({ onSearch, activeDisruptionsCount = 4, databaseMode = 'in_memory' }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Logo & Mission Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-navy-850 to-violet-500/20 border border-cyan-500/30 shadow-glow-cyan">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              AtmoGraph
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Enterprise 2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Supply Chain Ripple Effect Predictor & GNN Intelligence
          </p>
        </div>
      </div>

      {/* Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search suppliers, foundries, materials, locations (e.g. TAFC, Silicon)..."
            className="w-full bg-navy-900/90 text-sm text-slate-200 placeholder-slate-500 pl-10 pr-4 py-1.5 rounded-lg border border-slate-700/60 focus:border-cyan-500/70 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all font-sans"
          />
        </div>
      </div>

      {/* System Status Indicators, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Real-Time Database Mode Pill */}
        <div 
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-900/90 border border-slate-800 text-[11px] font-mono text-slate-300"
          title={`Active Graph Engine: ${databaseMode === 'neo4j_live' ? 'Neo4j Live Cluster' : 'Neo4j GraphEngine'}`}
        >
          <Database className={`w-3.5 h-3.5 ${databaseMode === 'neo4j_live' ? 'text-emerald-400' : 'text-cyan-400'}`} />
          <span>Neo4j:</span>
          <span className="font-semibold text-cyan-400">{databaseMode === 'neo4j_live' ? 'Connected' : 'Schema-Active'}</span>
        </div>

        {/* GNN Engine Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-violet-400" />
          <span>PyG GNN:</span>
          <span className="font-semibold text-violet-400">93.3% Acc</span>
        </div>

        {/* Date Display */}
        <span className="text-xs text-slate-400 hidden xl:inline font-mono">
          {currentDate}
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-navy-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-colors"
            title="Disruption Feed Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeDisruptionsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {activeDisruptionsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-navy-900 border border-slate-700/80 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Active Disruption Alerts
                </span>
                <span className="text-[10px] text-red-400 font-mono font-semibold">
                  {activeDisruptionsCount} High Priority
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-navy-850 border border-red-500/20 hover:border-red-500/40">
                  <div className="font-semibold text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Typhoon In-fa (Taiwan)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Affecting Taiwan Advanced Foundry 3nm logic fabs.</p>
                </div>
                <div className="p-2 rounded bg-navy-850 border border-amber-500/20 hover:border-amber-500/40">
                  <div className="font-semibold text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Rotterdam Port Congestion
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Crane glitch caused container vessel queuing in the North Sea.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
            AG
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">Director Ops</div>
            <div className="text-[10px] text-cyan-400 font-mono">Control Tower</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
