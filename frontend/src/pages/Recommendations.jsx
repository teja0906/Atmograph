import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Filter, 
  DollarSign, 
  Globe2, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';

const Recommendations = ({ onNavigateToSimulator }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterType, setFilterType] = useState('All'); // 'All', 'model_driven', 'policy'

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.getRecommendations();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">
          Generating AI mitigation strategies and alternative supplier matches...
        </p>
      </div>
    );
  }

  const { total_recommendations, model_driven_count, top_priority_count, recommendations } = data;

  const filtered = recommendations.filter((r) => {
    const matchesPriority = filterPriority === 'All' || r.priority === filterPriority;
    const matchesType = filterType === 'All' ||
      (filterType === 'model_driven' && r.is_model_driven) ||
      (filterType === 'policy' && !r.is_model_driven);
    return matchesPriority && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            AI Mitigation Recommendations
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
              Autonomous Remediation
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prescriptive playbooks generated from GNN vulnerability predictions and network bottlenecks.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 text-cyan-400 font-semibold">
            {model_driven_count} GNN Model Driven
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 text-red-400 font-semibold">
            {top_priority_count} Critical / High
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-semibold font-mono">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-navy-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="All">All Priorities ({total_recommendations})</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold font-mono">Source:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-navy-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="All">All Sources</option>
              <option value="model_driven">GNN Model Predicted ({model_driven_count})</option>
              <option value="policy">Strategic Enterprise Policy</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          Showing {filtered.length} of {total_recommendations} actionable strategies
        </span>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4"
          >
            {/* Top Meta Line */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  rec.priority === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                  rec.priority === 'High' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {rec.priority} Priority
                </span>

                <span className="text-xs font-semibold text-cyan-400 font-mono">
                  {rec.category}
                </span>

                <span className="text-slate-500">•</span>

                <span className="text-xs text-slate-300 font-medium">
                  Target: <strong className="text-slate-100">{rec.target_company_name}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {rec.is_model_driven ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> GNN Model Output
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                    Policy Predefined
                  </span>
                )}
              </div>
            </div>

            {/* Title & Problem Statement */}
            <div>
              <h3 className="text-base font-bold text-slate-100 mb-1">
                {rec.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300 font-mono uppercase text-[10px] block mb-0.5">Vulnerability Diagnostic:</strong>
                {rec.problem_statement}
              </p>
            </div>

            {/* Actionable Remediation */}
            <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800/80 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Actionable Remediation Plan
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {rec.actionable_remediation}
              </p>
            </div>

            {/* Qualified Alternative Suppliers (if any) */}
            {rec.alternative_suppliers?.length > 0 && (
              <div className="p-3 rounded-xl bg-navy-850 border border-cyan-500/20 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono block">
                  Qualified Alternative Suppliers for Dual-Sourcing
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {rec.alternative_suppliers.map((alt) => (
                    <div
                      key={alt.supplier_id}
                      className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{alt.supplier_name}</div>
                        <div className="text-[11px] text-slate-400">📍 {alt.country} • Lead Time: {alt.lead_time_days}d</div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-cyan-400">{(alt.similarity_score * 100).toFixed(0)}% match</span>
                        <div className="text-[10px] text-slate-400">
                          {alt.cost_delta_percent > 0 ? `+${alt.cost_delta_percent}%` : `${alt.cost_delta_percent}%`} cost
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Meta & Action */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
                <span>Expected Risk Reduction: <strong className="text-emerald-400">-{rec.expected_risk_reduction_percent}%</strong></span>
                <span>CapEx: <strong className="text-slate-300">{rec.estimated_cost_level}</strong></span>
              </div>

              <button
                onClick={() => onNavigateToSimulator(rec.target_company_id)}
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                Simulate Remediation Impact <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
