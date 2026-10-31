import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Sparkles, 
  Cpu, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Play
} from 'lucide-react';
import api from '../services/api';

const RipplePrediction = ({ defaultOriginId, onNavigateToSimulator }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(defaultOriginId || 'node-t2-01');
  const [category, setCategory] = useState('Supplier Failures');
  const [severity, setSeverity] = useState(0.85);
  const [hops, setHops] = useState(3);

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  // Load companies for the origin dropdown
  useEffect(() => {
    const fetchComps = async () => {
      try {
        const res = await api.getCompanies();
        setCompanies(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComps();
  }, []);

  // Run GNN Prediction
  const handlePredict = async (e) => {
    e?.preventDefault();
    if (!selectedOrigin) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.predictRipple(selectedOrigin, category, severity, hops);
      setPrediction(res);
    } catch (err) {
      setError('GNN inference failed. Ensure PyTorch Geometric engine is loaded.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first mount
  useEffect(() => {
    handlePredict();
  }, [selectedOrigin]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            Ripple Effect Prediction Engine
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
              PyTorch Geometric GNN
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inductive Graph Neural Network (GraphSAGE) analyzing component dependencies, topology, and propagation probabilities.
          </p>
        </div>

        {/* Model Specs Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span>GraphSAGE-2L:</span>
          <span className="text-emerald-400 font-bold">93.3% Accuracy</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 font-bold">0.923 AUC</span>
        </div>
      </div>

      {/* Main Grid: Control Panel (Left) & Predictions Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: GNN Input Parameters */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <form onSubmit={handlePredict} className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono block mb-1.5">
                Shock Origin Entity
              </span>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full bg-navy-900 text-sm text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none font-sans"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.tier})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Select upstream supplier, foundry, or logistics hub where shock originates.
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono block mb-1.5">
                Disruption Category
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-navy-900 text-sm text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none font-sans"
              >
                <option value="Supplier Failures">Supplier Failures (Equipment, Insolvency)</option>
                <option value="Transportation Delays">Transportation Delays (Port, Canal)</option>
                <option value="Natural Disasters">Natural Disasters (Floods, Typhoons)</option>
                <option value="Raw Material Shortages">Raw Material Shortages (Wafers, Lithium)</option>
                <option value="Political Instability">Political Instability (Sanctions, Tariffs)</option>
                <option value="Factory Shutdowns">Factory Shutdowns (Fire, Maintenance)</option>
              </select>
            </div>

            {/* Severity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold font-mono mb-1.5">
                <span className="text-slate-300 uppercase">Initial Shock Severity</span>
                <span className="text-red-400 font-bold">{(severity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={severity}
                onChange={(e) => setSeverity(parseFloat(e.target.value))}
                className="w-full h-2 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>10% Minor</span>
                <span>50% Moderate</span>
                <span>100% Critical</span>
              </div>
            </div>

            {/* Propagation Hops Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold font-mono mb-1.5">
                <span className="text-slate-300 uppercase">Max Propagation Hops</span>
                <span className="text-cyan-400 font-bold">{hops} Hops</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={hops}
                onChange={(e) => setHops(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Limits recursive forward propagation analysis through multi-tier assembly chains.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-cyan disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                  Running GNN Forward Pass...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Predict Ripple Effect
                </>
              )}
            </button>
          </form>

          {/* Model Specs Card */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2">
              Architecture Specifications
            </span>
            <div className="p-3 rounded-xl bg-navy-900/80 border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Model Architecture:</span>
                <span className="text-slate-200">GraphSAGE 2-Layer</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Trainable Parameters:</span>
                <span className="text-slate-200">{prediction?.model_metrics?.total_parameters || 2258}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Test Accuracy:</span>
                <span className="text-emerald-400">{((prediction?.model_metrics?.test_accuracy || 0.9332) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Inference Latency:</span>
                <span className="text-cyan-400">{prediction?.execution_time_ms || 14.2} ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Prediction Impact Summary & Cascade Table */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {prediction && (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Global Propagation</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {(prediction.propagation_probability_global * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Affected Entities</span>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {prediction.affected_companies_count} <span className="text-xs font-normal text-slate-400">nodes</span>
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Critical Risk Nodes</span>
                  <div className="text-xl font-bold font-mono text-red-400 mt-1">
                    {prediction.critical_risk_nodes_count} <span className="text-xs font-normal text-slate-400">nodes</span>
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Max Cascade Depth</span>
                  <div className="text-xl font-bold font-mono text-violet-400 mt-1">
                    {prediction.max_downstream_hops} <span className="text-xs font-normal text-slate-400">hops</span>
                  </div>
                </div>
              </div>

              {/* Propagation Path Visualizer */}
              {prediction.propagation_paths?.length > 0 && (
                <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2">
                    Critical Cascade Paths Discovered
                  </span>
                  <div className="space-y-2">
                    {prediction.propagation_paths.slice(0, 3).map((path, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-xs flex items-center gap-2 overflow-x-auto"
                      >
                        <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">
                          Path {idx + 1}:
                        </span>
                        {path.map((nodeId, nIdx) => {
                          const comp = companies.find((c) => c.id === nodeId);
                          const name = comp?.name || nodeId;
                          return (
                            <React.Fragment key={nIdx}>
                              <span className={`px-2 py-0.5 rounded font-medium truncate shrink-0 ${
                                nIdx === 0 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                nIdx === path.length - 1 ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' :
                                'bg-navy-850 text-slate-300 border border-slate-700'
                              }`}>
                                {name}
                              </span>
                              {nIdx < path.length - 1 && (
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Downstream Affected Nodes Table */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                      Downstream Ripple Impact Assessment
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      GNN predicted disruption probabilities and projected risk score elevation
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToSimulator(prediction.origin_company_id)}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-glow-red"
                  >
                    <Play className="w-3 h-3" /> Simulate in What-If Engine
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        <th className="pb-2 font-medium">Downstream Company</th>
                        <th className="pb-2 font-medium">Hop</th>
                        <th className="pb-2 font-medium">Propagation Prob</th>
                        <th className="pb-2 font-medium">Base Risk</th>
                        <th className="pb-2 font-medium">Projected</th>
                        <th className="pb-2 font-medium">Buffer Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {prediction.affected_nodes.map((node) => (
                        <tr key={node.node_id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 font-medium text-slate-200">
                            <div className="font-semibold">{node.company_name}</div>
                            <div className="text-[10px] text-slate-400">{node.tier}</div>
                          </td>
                          <td className="py-2.5 font-mono text-slate-300">
                            Hop {node.hop_distance}
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-cyan-400">
                                {(node.propagation_probability * 100).toFixed(0)}%
                              </span>
                              <div className="w-16 bg-slate-800 h-1 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-400"
                                  style={{ width: `${node.propagation_probability * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 font-mono text-slate-400">
                            {node.baseline_risk}
                          </td>
                          <td className="py-2.5 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              node.projected_risk >= 80 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                              node.projected_risk >= 60 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {node.projected_risk} <span className="text-[9px] font-normal">(+{node.risk_delta})</span>
                            </span>
                          </td>
                          <td className="py-2.5 font-mono text-slate-300">
                            <span className="text-amber-400 font-bold">{node.estimated_buffer_exhaustion_days}d</span> until stockout
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RipplePrediction;
