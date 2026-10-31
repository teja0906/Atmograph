import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  AlertOctagon, 
  GitFork, 
  ShieldAlert, 
  PlayCircle, 
  Lightbulb, 
  FileText, 
  Settings,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'network', label: 'Supply Chain Network', icon: Network, badge: 'Live' },
  { id: 'disruptions', label: 'Disruption Detection', icon: AlertOctagon, badge: 'spaCy' },
  { id: 'prediction', label: 'Ripple Prediction', icon: GitFork, badge: 'GNN' },
  { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert, badge: null },
  { id: 'simulator', label: 'Scenario Simulator', icon: PlayCircle, badge: 'What-If' },
  { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb, badge: 'AI' },
  { id: 'reports', label: 'Reports & Analytics', icon: FileText, badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null },
];

const Sidebar = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-navy-950/95 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-3.5 space-y-6 overflow-y-auto">
        {/* Navigation Section */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 font-mono">
            Intelligence Modules
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 via-navy-850 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-navy-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Status Card */}
      <div className="p-3.5 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              GNN Resilience Core
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            PyG GraphSAGE checkpoint active. Monitoring 18 global supply nodes.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
