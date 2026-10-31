import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Sparkles, 
  Send, 
  UploadCloud, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  Calendar, 
  DollarSign, 
  Clock, 
  Layers, 
  ExternalLink,
  RefreshCw,
  Tag,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';

const SAMPLE_REPORTS = [
  {
    title: "Taiwan Fab Shutdown",
    text: "Typhoon In-fa caused critical torrential flooding and power grid tripping at Taiwan Advanced Foundry (TAFC) in Hsinchu. Sub-micron cleanroom logic lines suspended operations for two weeks, delaying 3nm processor deliveries.",
    is_simulated: false
  },
  {
    title: "Rotterdam Port Congestion",
    text: "Port congestion and automated crane software desynchronization at Rotterdam EuroPort Central Vault delayed international freight shipments of critical chassis modules across European manufacturers by 14 days.",
    is_simulated: false
  },
  {
    title: "Semiconductor Wafer Shortage",
    text: "Severe particulate chemical contamination at Pacific Silicium Wafers Corp in Hsinchu led to an emergency purging cycle, causing an immediate raw wafer supply shortage for Tier-2 foundries.",
    is_simulated: true
  },
  {
    title: "Atacama Lithium Mine Strike",
    text: "Labor union strike and transportation road blockades at Andean Lithium Minerals Ltd in Antofagasta, Chile halted raw lithium hydroxide exports to battery packaging facilities for three weeks.",
    is_simulated: true
  }
];

const DisruptionDetection = ({ onNavigateToSimulator }) => {
  const [inputText, setInputText] = useState(SAMPLE_REPORTS[0].text);
  const [isSimulated, setIsSimulated] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [disruptionsList, setDisruptionsList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState(null);

  const fetchDisruptions = async () => {
    try {
      setLoadingList(true);
      const res = await api.getDisruptions();
      setDisruptionsList(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDisruptions();
  }, []);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!inputText || inputText.length < 10) return;

    try {
      setAnalyzing(true);
      setError(null);
      const result = await api.analyzeDisruption(inputText, 'Disruption Detection Console', isSimulated);
      setAnalysisResult(result);
      // Refresh list to include newly saved disruption
      fetchDisruptions();
    } catch (err) {
      setError('NLP Analysis failed. Please check backend spaCy engine.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSampleClick = (sample) => {
    setInputText(sample.text);
    setIsSimulated(sample.is_simulated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            AI-Powered Disruption Detection
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30 font-mono">
              spaCy NLP Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ingest unstructured reports, news excerpts, and incident feeds to extract entities, classify risks, and persist to Neo4j.
          </p>
        </div>

        <button
          onClick={fetchDisruptions}
          className="px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Refresh Disruption Log
        </button>
      </div>

      {/* Main Grid: Input Form (Left) & NLP Analysis Result (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Console */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            {/* Quick Sample Selector */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono block mb-2">
                Load Sample Incident Scenarios
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_REPORTS.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleSampleClick(sample)}
                    className="p-2 text-left rounded-xl bg-navy-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-navy-850 transition-all text-xs group"
                  >
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                      {sample.title}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {sample.is_simulated ? 'Synthetic Test' : 'Real-World Pattern'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-1.5">
                  Raw Incident Report Text
                </label>
                <textarea
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste disruption article, news bulletin, or logistics alert..."
                  className="w-full bg-navy-900/90 text-sm text-slate-100 placeholder-slate-500 p-3.5 rounded-xl border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none transition-all leading-relaxed font-sans"
                />
              </div>

              {/* Simulation Mode Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-navy-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-300">Incident Event Classification</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 cursor-pointer flex items-center gap-1.5 font-mono">
                    <input
                      type="checkbox"
                      checked={isSimulated}
                      onChange={(e) => setIsSimulated(e.target.checked)}
                      className="rounded bg-navy-800 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    Mark as Simulated Incident
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={analyzing || !inputText.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-cyan disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    Extracting Entities with spaCy...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    Analyze Disruption Report
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: NLP Analysis Output Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                spaCy Extraction Results
              </h3>
              {analysisResult && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  analysisResult.is_simulated ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {analysisResult.is_simulated ? 'SIMULATED DATA' : 'CONFIRMED DETECTION'}
                </span>
              )}
            </div>

            {analysisResult ? (
              <div className="space-y-4 text-xs animate-in fade-in">
                {/* Category & Severity Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Taxonomy Category</span>
                    <div className="text-sm font-bold text-cyan-400 mt-1">
                      {analysisResult.category}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Calculated Severity</span>
                    <div className="text-sm font-bold font-mono text-red-400 mt-1 flex items-baseline gap-1">
                      {(analysisResult.severity * 100).toFixed(0)}%
                      <span className="text-[10px] text-slate-400 font-normal">Shock Intensity</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${analysisResult.severity * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Graph Node Resolution */}
                <div className="p-3 rounded-xl bg-navy-900 border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">
                    Graph Entity Resolution (Neo4j Match)
                  </span>
                  <div className="text-sm font-bold text-slate-100 mt-1 flex items-center justify-between">
                    <span>{analysisResult.origin_company_name}</span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      ID: {analysisResult.origin_company_id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    📍 Resolved Location: <strong className="text-slate-300">{analysisResult.location}</strong>
                  </p>
                </div>

                {/* Extracted Named Entities */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2">
                    Extracted Named Entities ({analysisResult.extracted_entities.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {analysisResult.extracted_entities.map((ent, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-navy-850 border border-slate-700/80 text-[11px] flex items-center gap-1.5 text-slate-200"
                      >
                        <Tag className="w-2.5 h-2.5 text-violet-400" />
                        <strong className="text-cyan-300">{ent.text}</strong>
                        <span className="text-[9px] text-slate-400 font-mono">[{ent.label}]</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Impact Estimates */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                  <div className="p-2 rounded bg-navy-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[9px]">Financial Impact</span>
                    <strong className="text-slate-200">{analysisResult.financial_impact_est_usd}</strong>
                  </div>
                  <div className="p-2 rounded bg-navy-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[9px]">Duration</span>
                    <strong className="text-slate-200">{analysisResult.estimated_duration_days} days</strong>
                  </div>
                  <div className="p-2 rounded bg-navy-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[9px]">Downstream Spread</span>
                    <strong className="text-cyan-400">{analysisResult.affected_nodes_count} nodes</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500">
                <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30 text-cyan-400" />
                <p className="text-xs">No report analyzed yet. Select a sample or paste custom report text to begin.</p>
              </div>
            )}
          </div>

          {analysisResult && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Event Synced to Neo4j Graph
              </span>
              <button
                onClick={() => onNavigateToSimulator(analysisResult.origin_company_id)}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-glow-red"
              >
                Simulate Ripple Propagation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Disruption Registry Table (Persisted in Neo4j) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Neo4j Disruption Registry
            </h3>
            <p className="text-[11px] text-slate-400">
              Active and historical disruption shocks recorded in the graph knowledge base
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            {disruptionsList.length} Total Incidents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-2 font-medium">Incident Title</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Origin Node</th>
                <th className="pb-2 font-medium">Severity</th>
                <th className="pb-2 font-medium">Impact (USD)</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {disruptionsList.map((disr) => (
                <tr key={disr.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-slate-200 max-w-[220px] truncate">
                    {disr.title}
                  </td>
                  <td className="py-3 text-cyan-300 font-medium">
                    {disr.category}
                  </td>
                  <td className="py-3 text-slate-300">
                    {disr.origin_company_name || 'Network Choke Point'}
                  </td>
                  <td className="py-3 font-mono font-bold text-red-400">
                    {(disr.severity * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {disr.financial_impact_est_usd}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                      disr.is_simulated ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {disr.is_simulated ? 'Simulated' : 'Detected'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      disr.status === 'Active' ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse-slow' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {disr.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onNavigateToSimulator(disr.origin_company_id)}
                      className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-cyan-400 border border-cyan-500/30 font-semibold text-[10px] transition-colors"
                    >
                      Simulate Ripple
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisruptionDetection;
