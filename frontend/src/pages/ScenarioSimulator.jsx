import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  RotateCcw, 
  Sparkles, 
  AlertOctagon, 
  Clock, 
  DollarSign, 
  Network, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import api from '../services/api';

const SCENARIOS = [
  { id: 'Supplier shutdown', label: 'Supplier Shutdown (Machinery Failure, Labor Action)', icon: '🏭' },
  { id: 'Transportation disruption', label: 'Transportation Disruption (Port Congestion, Canal Blockage)', icon: '🚢' },
  { id: 'Raw material shortage', label: 'Raw Material Shortage (Silicon, Lithium, Rare Earths)', icon: '🧪' },
  { id: 'Natural disaster', label: 'Natural Disaster (Typhoon, Flood, Seismic Shock)', icon: '🌪️' },
  { id: 'Production delay', label: 'Production Delay (Quality Defect, Retooling Outage)', icon: '⚙️' },
];

const ScenarioSimulator = ({ initialCompanyId, onNavigateToGraph }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId || 'node-t2-01');
  const [scenarioType, setScenarioType] = useState('Supplier shutdown');
  const [severity, setSeverity] = useState(0.85);
  const [durationDays, setDurationDays] = useState(21);

  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlayingWaves, setIsPlayingWaves] = useState(false);
  const [error, setError] = useState(null);

  // Load companies
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

  // Update company if passed as prop
  useEffect(() => {
    if (initialCompanyId) setSelectedCompanyId(initialCompanyId);
  }, [initialCompanyId]);

  // Execute Simulation
  const handleSimulate = async (e) => {
    e?.preventDefault();
    if (!selectedCompanyId) return;

    try {
      setSimulating(true);
      setError(null);
      const res = await api.simulateScenario(selectedCompanyId, scenarioType, severity, durationDays);
      setSimulationResult(res);
      setCurrentStepIndex(0);
    } catch (err) {
      setError('Simulation engine encountered an error. Check backend connection.');
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  // Run automatically on mount
  useEffect(() => {
    handleSimulate();
  }, [selectedCompanyId]);

  // Wave step player timer
  useEffect(() => {
    let interval = null;
    if (isPlayingWaves && simulationResult?.ripple_steps?.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= simulationResult.ripple_steps.length - 1) {
            setIsPlayingWaves(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlayingWaves, simulationResult]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            What-If Scenario Simulator
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-mono">
              Shock Cascade Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate synthetic stress-tests, analyze dynamic downstream wave propagations, and evaluate AI remediations.
          </p>
        </div>

        <button
          onClick={() => onNavigateToGraph(selectedCompanyId)}
          className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-2 transition-all shadow-sm"
        >
          <Network className="w-3.5 h-3.5" /> View Animated on Canvas
        </button>
      </div>

      {/* Main Grid: Parameters Control (Left) & Simulation Dynamics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Simulator Setup Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-5">
          <form onSubmit={handleSimulate} className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono block mb-1.5">
                Targeted Company / Choke Point
              </span>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full bg-navy-900 text-sm text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:border-red-500 font-sans focus:outline-none"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.tier})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono block mb-1.5">
                Disruption Scenario
              </span>
              <div className="space-y-1.5">
                {SCENARIOS.map((scen) => (
                  <label
                    key={scen.id}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      scenarioType === scen.id
                        ? 'bg-red-500/15 border-red-500/50 text-red-300 font-semibold'
                        : 'bg-navy-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-navy-850'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scenario"
                      value={scen.id}
                      checked={scenarioType === scen.id}
                      onChange={(e) => setScenarioType(e.target.value)}
                      className="sr-only"
                    />
                    <span>{scen.icon}</span>
                    <span className="truncate">{scen.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold font-mono mb-1.5">
                <span className="text-slate-300 uppercase">Disruption Severity</span>
                <span className="text-red-400 font-bold">{(severity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={severity}
                onChange={(e) => setSeverity(parseFloat(e.target.value))}
                className="w-full h-2 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>10% Minor</span>
                <span>50% Severe</span>
                <span>100% Total Outage</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold font-mono mb-1.5">
                <span className="text-slate-300 uppercase">Projected Outage Days</span>
                <span className="text-cyan-400 font-bold">{durationDays} Days</span>
              </div>
              <input
                type="range"
                min="7"
                max="90"
                step="7"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 Week</span>
                <span>1 Month</span>
                <span>3 Months</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={simulating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-red disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Computing Shock Cascade...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  Simulate Ripple Effect
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Simulation Dynamics & Wave Player */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {simulationResult && (
            <>
              {/* Top Business Impact KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Total Revenue Impact</span>
                  <div className="text-xl font-bold font-mono text-red-400 mt-1">
                    {simulationResult.total_revenue_loss_est_usd}
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Max Transit Delay</span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    +{simulationResult.max_network_delay_days} <span className="text-xs font-normal text-slate-400">days</span>
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Affected Entities</span>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {simulationResult.total_affected_companies} <span className="text-xs font-normal text-slate-400">nodes</span>
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Simulation ID</span>
                  <div className="text-xs font-bold font-mono text-cyan-400 mt-2 truncate">
                    {simulationResult.scenario_id}
                  </div>
                </div>
              </div>

              {/* Time-Stepped Cascade Wave Player */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Dynamic Propagation Wave Timeline
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Step-by-step cascade propagation through multi-tier network layers
                    </p>
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlayingWaves(!isPlayingWaves)}
                      className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      {isPlayingWaves ? 'Pause Waves' : 'Play Cascade'}
                    </button>
                    <button
                      onClick={() => setCurrentStepIndex(0)}
                      className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400"
                      title="Rewind to Wave 0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Wave Steps Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {simulationResult.ripple_steps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsPlayingWaves(false);
                        setCurrentStepIndex(idx);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 ${
                        currentStepIndex === idx
                          ? 'bg-red-500 text-white shadow-glow-red'
                          : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      Wave {step.step_number}
                    </button>
                  ))}
                </div>

                {/* Current Active Step Card */}
                {simulationResult.ripple_steps[currentStepIndex] && (
                  <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-red-400 font-mono uppercase">
                        Current Propagation Wave: Step {simulationResult.ripple_steps[currentStepIndex].step_number}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Active Inbound Delay: +{simulationResult.ripple_steps[currentStepIndex].accumulated_delay_days} days
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {simulationResult.ripple_steps[currentStepIndex].description}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">
                        Affected Nodes in Wave: <strong className="text-cyan-400">{simulationResult.ripple_steps[currentStepIndex].active_wave_node_ids.length}</strong>
                      </span>
                      <span className="text-slate-400">
                        Accumulated Impact: <strong className="text-red-400">${simulationResult.ripple_steps[currentStepIndex].accumulated_revenue_loss_usd}M</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended Mitigation Actions */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono block">
                  Actionable Mitigation Playbook
                </span>
                <div className="space-y-2">
                  {simulationResult.mitigation_actions.map((act, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
