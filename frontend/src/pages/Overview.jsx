import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Factory, 
  GitCommit, 
  AlertOctagon, 
  ShieldAlert, 
  TrendingUp, 
  Network, 
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Play
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../services/api';

const Overview = ({ onNavigateToModule, onSimulateTarget }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      setError('Unable to load dashboard intelligence. Verify backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400 font-mono tracking-wide">
          Streaming supply chain network telemetry...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-12 glass-panel-elevated rounded-2xl border-red-500/40 text-center">
        <AlertOctagon className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-100">Telemetry Ingestion Error</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6">{error || 'Unknown error occurred.'}</p>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs tracking-wider uppercase hover:bg-cyan-400 transition-colors shadow-glow-cyan"
        >
          Retry Ingestion
        </button>
      </div>
    );
  }

  const { kpis, risk_distribution, disruption_trends, geographic_risk, recent_disruptions, top_vulnerable_suppliers } = data;

  const kpiCards = [
    { title: 'Total Suppliers', value: kpis.total_suppliers, subtitle: 'Raw Materials & Foundries', icon: Factory, color: 'text-cyan-400', border: 'border-cyan-500/20' },
    { title: 'Total Manufacturers', value: kpis.total_manufacturers, subtitle: 'OEM Assembly Giants', icon: Building2, color: 'text-violet-400', border: 'border-violet-500/20' },
    { title: 'Active Connections', value: kpis.active_connections, subtitle: 'Multi-Modal Logistics', icon: GitCommit, color: 'text-blue-400', border: 'border-blue-500/20' },
    { title: 'Active Disruptions', value: kpis.active_disruptions, subtitle: 'Real-Time Shock Events', icon: AlertOctagon, color: 'text-red-400', border: 'border-red-500/30' },
    { title: 'High-Risk Companies', value: kpis.high_risk_companies, subtitle: 'Score > 60 Vulnerability', icon: ShieldAlert, color: 'text-orange-400', border: 'border-orange-500/20' },
    { title: 'Avg Disruption Prob', value: `${(kpis.average_disruption_probability * 100).toFixed(1)}%`, subtitle: 'GNN Baseline Cascade', icon: TrendingUp, color: 'text-amber-400', border: 'border-amber-500/20' },
    { title: 'Predicted Affected', value: kpis.predicted_affected_companies, subtitle: 'Downstream In Exposure', icon: Network, color: 'text-pink-400', border: 'border-pink-500/20' },
    { title: 'Resilience Score', value: `${kpis.overall_resilience_score}/100`, subtitle: 'Network Fault Tolerance', icon: ShieldCheck, color: 'text-emerald-400', border: 'border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            Enterprise Command Center
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tier supply chain health, GNN ripple projections, and disruption event tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToModule('network')}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-2 transition-all shadow-sm"
          >
            <Network className="w-3.5 h-3.5" /> Open 2D Network Graph
          </button>
          <button
            onClick={fetchDashboard}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI 8-Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass-panel p-4 rounded-xl border ${card.border} hover:border-cyan-500/40 transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  {card.title}
                </span>
                <div className="p-1.5 rounded-lg bg-navy-900 border border-slate-800 group-hover:scale-110 transition-transform">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {card.value}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Risk Distribution Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Risk Distribution
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                18 Total Nodes
              </span>
            </div>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={risk_distribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800 text-xs">
            {risk_distribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 truncate text-[11px]">{item.category}</span>
                <span className="font-mono text-slate-200 font-semibold ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Disruption Trends Area Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Disruption Trend (6-Mo)
              </h3>
              <span className="text-[10px] text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                +33% Severity
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={disruption_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="incidents" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#trendGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 pt-3 border-t border-slate-800">
            Escalating weather events in Southeast Asia drove October incident volume up by 45%.
          </p>
        </div>

        {/* Chart 3: Geographic Risk Overview Horizontal Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Geographic Risk Index
              </h3>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                7 Corridors
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geographic_risk.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                  <XAxis type="number" stroke="#64748B" fontSize={10} domain={[0, 100]} />
                  <YAxis dataKey="country" type="category" stroke="#94A3B8" fontSize={10} width={75} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="risk_index" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 pt-3 border-t border-slate-800">
            Taiwan and Rotterdam remain prime exposure corridors with combined vulnerability of 74.7.
          </p>
        </div>
      </div>

      {/* Lower Section: Top Vulnerable Suppliers & Recent Disruption Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Most Vulnerable Suppliers Table */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Top 5 Most Vulnerable Suppliers
              </h3>
              <p className="text-[11px] text-slate-400">Prioritized by downstream impact and single-source risk</p>
            </div>
            <button
              onClick={() => onNavigateToModule('risk')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-2 font-medium">Company Name</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Risk Score</th>
                  <th className="pb-2 font-medium">Downstream</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {top_vulnerable_suppliers.map((supp) => (
                  <tr key={supp.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-2.5 font-medium text-slate-200 flex items-center gap-2">
                      <span className="truncate max-w-[170px]">{supp.name}</span>
                      {supp.single_source && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1 py-0.5 rounded font-mono" title="Sole source supplier">
                          Sole
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-400">{supp.country}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        supp.risk_score >= 80 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        supp.risk_score >= 60 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {supp.risk_score}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">{supp.downstream_impact_count} nodes</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onSimulateTarget(supp.id)}
                        className="px-2 py-1 rounded-md bg-navy-800 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-semibold transition-all inline-flex items-center gap-1"
                        title="Simulate Disruption on this Company"
                      >
                        <Play className="w-2.5 h-2.5" /> Simulate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Disruption Activity */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  Recent Disruption Activity
                </h3>
                <p className="text-[11px] text-slate-400">Events processed by spaCy NLP and logged in Neo4j</p>
              </div>
              <button
                onClick={() => onNavigateToModule('disruptions')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                Ingest Report <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recent_disruptions.slice(0, 3).map((disr) => (
                <div
                  key={disr.id}
                  className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                        {disr.title}
                      </span>
                      {disr.is_simulated ? (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                          Simulated
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                          Detected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {disr.summary}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
                      <span>Impact: <strong className="text-slate-300">{disr.financial_impact_est_usd}</strong></span>
                      <span>Duration: <strong className="text-slate-300">{disr.estimated_duration_days}d</strong></span>
                      <span>Affected: <strong className="text-cyan-400">{disr.affected_nodes_count} nodes</strong></span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    disr.status === 'Active' ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse-slow' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {disr.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Disruptions logged to Neo4j graph store</span>
            <button
              onClick={() => onNavigateToModule('prediction')}
              className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
            >
              Analyze Propagation Paths <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
