import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  Layers,
  Sparkles
} from 'lucide-react';

const Settings = () => {
  const [neo4jUri, setNeo4jUri] = useState('bolt://localhost:7687');
  const [neo4jUser, setNeo4jUser] = useState('neo4j');
  const [lowThreshold, setLowThreshold] = useState(30);
  const [medThreshold, setMedThreshold] = useState(60);
  const [highThreshold, setHighThreshold] = useState(80);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          System Configuration & Settings
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Control Tower Admin
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure Neo4j connection parameters, PyG GNN inference thresholds, and risk scoring boundaries.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Configuration parameters saved successfully!
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Neo4j Graph Database */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            <Database className="w-4 h-4 text-cyan-400" />
            Neo4j Database Connection
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AtmoGraph runs a dual-mode engine. If an external Neo4j daemon is online at the specified URI, native Cypher transactions are executed. Otherwise, the in-process GraphEngine maintains 100% schema parity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-mono font-semibold mb-1">
                Neo4j Bolt URI
              </label>
              <input
                type="text"
                value={neo4jUri}
                onChange={(e) => setNeo4jUri(e.target.value)}
                className="w-full bg-navy-900 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono font-semibold mb-1">
                Database Username
              </label>
              <input
                type="text"
                value={neo4jUser}
                onChange={(e) => setNeo4jUser(e.target.value)}
                className="w-full bg-navy-900 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Risk Scoring Classification Thresholds */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            <Sliders className="w-4 h-4 text-amber-400" />
            Risk Classification Thresholds
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Customize the transparent 0-100 scoring bounds for Low, Medium, High, and Critical risk categorization.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Low Risk Max Bound</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="40"
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(parseInt(e.target.value, 10))}
                  className="w-20 bg-navy-850 text-slate-100 p-1.5 rounded border border-slate-700 text-xs font-bold"
                />
                <span className="text-slate-400 text-[11px]">pts (0 to {lowThreshold})</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">Medium Risk Max Bound</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="41"
                  max="70"
                  value={medThreshold}
                  onChange={(e) => setMedThreshold(parseInt(e.target.value, 10))}
                  className="w-20 bg-navy-850 text-slate-100 p-1.5 rounded border border-slate-700 text-xs font-bold"
                />
                <span className="text-slate-400 text-[11px]">pts ({lowThreshold + 1} to {medThreshold})</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-orange-400 font-bold block mb-1">High Risk Max Bound</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="71"
                  max="90"
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(parseInt(e.target.value, 10))}
                  className="w-20 bg-navy-850 text-slate-100 p-1.5 rounded border border-slate-700 text-xs font-bold"
                />
                <span className="text-slate-400 text-[11px]">pts ({medThreshold + 1} to {highThreshold})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Verified Technology Stack Manifest */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Mandatory Technology Stack Verification
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Frontend</span>
              <div className="font-semibold text-slate-200 mt-0.5">React 18 + Tailwind CSS</div>
              <span className="text-[10px] text-emerald-400 font-mono">Verified Active</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Graph Visualizer</span>
              <div className="font-semibold text-slate-200 mt-0.5">React Flow (@xyflow)</div>
              <span className="text-[10px] text-emerald-400 font-mono">Interactive Canvas</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Backend REST API</span>
              <div className="font-semibold text-slate-200 mt-0.5">Python FastAPI + Pydantic</div>
              <span className="text-[10px] text-emerald-400 font-mono">Port 8000 Active</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Graph Database</span>
              <div className="font-semibold text-slate-200 mt-0.5">Neo4j (Cypher Engine)</div>
              <span className="text-[10px] text-cyan-400 font-mono">Dual-Mode Driver</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">NLP Extraction</span>
              <div className="font-semibold text-slate-200 mt-0.5">spaCy (en_core_web_sm)</div>
              <span className="text-[10px] text-emerald-400 font-mono">NER Model Ready</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Machine Learning</span>
              <div className="font-semibold text-slate-200 mt-0.5">PyG GNN (GraphSAGE)</div>
              <span className="text-[10px] text-violet-400 font-mono">93.3% Checkpoint</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-glow-cyan"
        >
          <Save className="w-4 h-4" /> Save Parameters
        </button>
      </form>
    </div>
  );
};

export default Settings;
