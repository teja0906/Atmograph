import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  GitFork,
  Activity,
  Play
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import api from '../services/api';

const RiskAnalysis = ({ onNavigateToSimulator }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState('All');
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const res = await api.getRiskAnalysis();
      setRiskData(res);
      if (res.companies?.length > 0) {
        setExpandedCompanyId(res.companies[0].company_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  if (loading || !riskData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">
          Calculating multi-factor risk scores and dependency bottlenecks...
        </p>
      </div>
    );
  }

  const { average_network_risk, resilience_score, companies, risk_distribution } = riskData;

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedRiskCategory === 'All' || c.risk_category === selectedRiskCategory;
    return matchesSearch && matchesCat;
  });

  const expandedCompany = companies.find((c) => c.company_id === expandedCompanyId);

  // Radar chart data for expanded company
  const radarData = expandedCompany ? [
    { subject: 'Centrality', score: expandedCompany.score_breakdown.structural_centrality, fullMark: 25 },
    { subject: 'Upstream Exposure', score: expandedCompany.score_breakdown.upstream_exposure, fullMark: 25 },
    { subject: 'Single Source', score: expandedCompany.score_breakdown.single_source_penalty, fullMark: 20 },
    { subject: 'Buffer Deficit', score: expandedCompany.score_breakdown.buffer_deficiency, fullMark: 15 },
    { subject: 'Geo Hazard', score: expandedCompany.score_breakdown.geographic_hazard, fullMark: 15 },
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            Risk Analysis & Impact Assessment
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono">
              Transparent Scoring
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configurable 0-100 multi-factor risk decomposition evaluating structural centrality, sole-source exposure, and inventory buffers.
          </p>
        </div>

        {/* Global Network Resilience Score Gauge */}
        <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-navy-900 border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Network Resilience</div>
            <div className="text-lg font-bold font-mono text-emerald-400">{resilience_score} / 100</div>
          </div>
          <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${resilience_score}%` }} />
          </div>
        </div>
      </div>

      {/* Transparent Scoring Methodology Banner */}
      <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-slate-200">Mathematical Risk Decomposition Methodology:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Risk Score = <strong className="text-cyan-300">Structural Centrality</strong> (0-25) + <strong className="text-cyan-300">Upstream Exposure</strong> (0-25) + <strong className="text-cyan-300">Single Source Penalty</strong> (0-20) + <strong className="text-cyan-300">Buffer Deficiency</strong> (0-15) + <strong className="text-cyan-300">Geographic Hazard</strong> (0-15).
            Classified into: <span className="text-emerald-400 font-semibold">Low (0-30)</span>, <span className="text-amber-400 font-semibold">Medium (31-60)</span>, <span className="text-orange-400 font-semibold">High (61-80)</span>, <span className="text-red-400 font-semibold">Critical (81-100)</span>.
          </p>
        </div>
      </div>

      {/* Main Grid: Companies Table (Left 2 cols) & Company Drilldown Radar (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Companies Table */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter company or country..."
                  className="w-full bg-navy-900 text-xs text-slate-100 placeholder-slate-500 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono">Category:</span>
                <select
                  value={selectedRiskCategory}
                  onChange={(e) => setSelectedRiskCategory(e.target.value)}
                  className="bg-navy-900 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none font-sans"
                >
                  <option value="All">All Categories</option>
                  <option value="Critical Risk">Critical (81-100)</option>
                  <option value="High Risk">High (61-80)</option>
                  <option value="Medium Risk">Medium (31-60)</option>
                  <option value="Low Risk">Low (0-30)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 font-medium">Tier</th>
                    <th className="pb-2 font-medium">Score</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Est. Delay</th>
                    <th className="pb-2 font-medium">Downstream</th>
                    <th className="pb-2 font-medium text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredCompanies.map((c) => {
                    const isSelected = expandedCompanyId === c.company_id;
                    return (
                      <tr
                        key={c.company_id}
                        onClick={() => setExpandedCompanyId(c.company_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-2.5 font-medium text-slate-200">
                          <div className="font-semibold">{c.company_name}</div>
                          <div className="text-[10px] text-slate-400">{c.location}</div>
                        </td>
                        <td className="py-2.5 text-slate-300 text-[11px]">
                          {c.tier}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-slate-100">
                          {c.overall_risk_score}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            c.risk_category === 'Critical Risk' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            c.risk_category === 'High Risk' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                            c.risk_category === 'Medium Risk' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {c.risk_category}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-300">
                          +{c.estimated_delay_days} days
                        </td>
                        <td className="py-2.5 font-mono text-cyan-400 font-semibold">
                          {c.downstream_exposure_count} nodes
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-400">
                          {isSelected ? (
                            <ChevronUp className="w-4 h-4 inline text-cyan-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 inline" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Detailed Risk Factor Breakdown Card */}
        {expandedCompany && (
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between animate-in fade-in">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                    Risk Decomposition
                  </span>
                  <h3 className="text-base font-bold text-slate-100 leading-tight mt-0.5">
                    {expandedCompany.company_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{expandedCompany.location}</p>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  expandedCompany.risk_category === 'Critical Risk' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  expandedCompany.risk_category === 'High Risk' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {expandedCompany.overall_risk_score} pts
                </span>
              </div>

              {/* Radar Chart */}
              <div className="h-44 flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={9} />
                    <Radar name="Risk Factor" dataKey="score" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown Factor Bars */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Centrality (Max 25):</span>
                  <strong className="text-slate-200">{expandedCompany.score_breakdown.structural_centrality}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Upstream Exposure (Max 25):</span>
                  <strong className="text-slate-200">{expandedCompany.score_breakdown.upstream_exposure}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Single Source Penalty (Max 20):</span>
                  <strong className="text-amber-400">{expandedCompany.score_breakdown.single_source_penalty}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Buffer Deficiency (Max 15):</span>
                  <strong className="text-orange-400">{expandedCompany.score_breakdown.buffer_deficiency}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Geographic Hazard (Max 15):</span>
                  <strong className="text-red-400">{expandedCompany.score_breakdown.geographic_hazard}</strong>
                </div>
              </div>

              {/* Critical Paths through this node */}
              {expandedCompany.critical_paths?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1.5">
                    Critical Bottleneck Path
                  </span>
                  <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="text-cyan-400 font-mono font-semibold">
                      Cumulative Transit: {expandedCompany.critical_paths[0].combined_lead_time_days} days
                    </div>
                    <div className="truncate text-slate-400">
                      {expandedCompany.critical_paths[0].path.join(' → ')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigateToSimulator(expandedCompany.company_id)}
              className="w-full mt-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-glow-red"
            >
              <Play className="w-3.5 h-3.5" /> Simulate What-If Shock
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAnalysis;
