import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Filter, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  Play, 
  RotateCcw, 
  X, 
  ArrowRight, 
  Activity, 
  AlertTriangle,
  Building2,
  Warehouse,
  Truck,
  Globe2
} from 'lucide-react';
import api from '../services/api';
import SupplyChainNode from '../graph/SupplyChainNode';

const nodeTypes = {
  supplyChainNode: SupplyChainNode,
};

const NetworkGraph = ({ selectedOriginId, onNavigateToSimulator, onNavigateToPredict }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [originalNodes, setOriginalNodes] = useState([]);
  const [originalEdges, setOriginalEdges] = useState([]);

  const [loading, setLoading] = useState(true);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');

  // Animation simulation state
  const [animatingCascade, setAnimatingCascade] = useState(false);
  const [currentWaveStep, setCurrentWaveStep] = useState(0);

  // Fetch Supply Chain Graph Data
  const loadGraph = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSupplyChainGraph();

      // Configure edge markers and styling
      const enhancedEdges = data.edges.map((e) => ({
        ...e,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: '#38BDF8',
        },
        style: { stroke: '#334155', strokeWidth: 2 },
      }));

      setNodes(data.nodes);
      setEdges(enhancedEdges);
      setOriginalNodes(data.nodes);
      setOriginalEdges(enhancedEdges);

      // Pre-select origin if passed from other views
      if (selectedOriginId) {
        const found = data.nodes.find((n) => n.id === selectedOriginId);
        if (found) setSelectedNodeData(found.data);
      }
    } catch (err) {
      console.error('Failed to load supply chain graph:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedOriginId, setNodes, setEdges]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Filtering Logic
  useEffect(() => {
    let filteredNodes = [...originalNodes];

    if (selectedCategory !== 'All') {
      filteredNodes = filteredNodes.filter((n) => n.data.category === selectedCategory);
    }

    if (selectedRisk !== 'All') {
      filteredNodes = filteredNodes.filter((n) => n.data.status === selectedRisk);
    }

    // Keep edges only between visible nodes
    const visibleIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = originalEdges.filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    );

    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [selectedCategory, selectedRisk, originalNodes, originalEdges, setNodes, setEdges]);

  // Handle Node Click
  const onNodeClick = useCallback(async (event, node) => {
    try {
      // Fetch full topological metadata for clicked node
      const detail = await api.getCompanyById(node.id);
      setSelectedNodeData(detail);

      // Highlight downstream cascade nodes
      highlightDownstream(node.id);
    } catch (err) {
      setSelectedNodeData(node.data);
      highlightDownstream(node.id);
    }
  }, [originalNodes, originalEdges]);

  // Highlight all downstream edges and nodes
  const highlightDownstream = (originId) => {
    // Find all reachable downstream nodes (BFS)
    const downstreamSet = new Set();
    const activeEdgesSet = new Set();
    const queue = [originId];

    while (queue.length > 0) {
      const current = queue.shift();
      originalEdges.forEach((e) => {
        if (e.source === current) {
          downstreamSet.add(e.target);
          activeEdgesSet.add(e.id);
          queue.push(e.target);
        }
      });
    }

    // Update nodes styling
    setNodes((prevNodes) =>
      prevNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isOrigin: n.id === originId,
          isHighlighted: downstreamSet.has(n.id),
        },
      }))
    );

    // Update edges styling with pulse class
    setEdges((prevEdges) =>
      prevEdges.map((e) => {
        const isCascade = activeEdgesSet.has(e.id);
        return {
          ...e,
          animated: isCascade || e.animated,
          className: isCascade ? 'highlight-cascade' : '',
          style: isCascade
            ? { stroke: '#EF4444', strokeWidth: 3 }
            : { stroke: '#334155', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: isCascade ? '#EF4444' : '#38BDF8',
          },
        };
      })
    );
  };

  // Reset graph highlights
  const resetHighlights = () => {
    setNodes(originalNodes);
    setEdges(originalEdges);
    setSelectedNodeData(null);
    setAnimatingCascade(false);
  };

  // Animate Disruption Ripple Wave
  const triggerRippleAnimation = async () => {
    if (!selectedNodeData) return;
    setAnimatingCascade(true);

    try {
      // Trigger simulation API to obtain wave steps
      const sim = await api.simulateScenario(selectedNodeData.id, 'Supplier shutdown', 0.85, 21);

      // Sequentially animate waves
      for (let i = 0; i < sim.ripple_steps.length; i++) {
        const step = sim.ripple_steps[i];
        setCurrentWaveStep(i);

        setNodes((prev) =>
          prev.map((n) => ({
            ...n,
            data: {
              ...n.data,
              isOrigin: step.active_wave_node_ids.includes(selectedNodeData.id) && i === 0,
              isDisrupted: step.active_wave_node_ids.includes(n.id),
            },
          }))
        );

        setEdges((prev) =>
          prev.map((e) => ({
            ...e,
            className: step.active_edge_ids.includes(e.id) ? 'highlight-cascade' : '',
            style: step.active_edge_ids.includes(e.id)
              ? { stroke: '#EF4444', strokeWidth: 3.5 }
              : { stroke: '#334155', strokeWidth: 2 },
          }))
        );

        // Delay 1.2s per wave
        await new Promise((r) => setTimeout(r, 1200));
      }
    } catch (err) {
      console.error('Ripple animation error:', err);
    } finally {
      setAnimatingCascade(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[75vh] space-y-4">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">
          Assembling React Flow topological canvas...
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-navy-950">
      {/* Top Filter and Controls Bar */}
      <div className="h-14 bg-navy-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-300">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-navy-850 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="All">All Categories (18)</option>
              <option value="Supplier">Suppliers (Tier 1-3)</option>
              <option value="Manufacturer">Manufacturers (OEMs)</option>
              <option value="Warehouse">Warehouses & Hubs</option>
              <option value="Distributor">Distributors</option>
              <option value="Retailer">Retailers</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Risk Level:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-navy-850 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="All">All Risk Brackets</option>
              <option value="Low Risk">Low Risk (0-30)</option>
              <option value="Medium Risk">Medium Risk (31-60)</option>
              <option value="High Risk">High Risk (61-80)</option>
              <option value="Critical Risk">Critical Risk (81-100)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Ripple Simulation & Reset */}
        <div className="flex items-center gap-2">
          {selectedNodeData && (
            <button
              onClick={triggerRippleAnimation}
              disabled={animatingCascade}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                animatingCascade
                  ? 'bg-red-500/20 text-red-300 border border-red-500 animate-pulse'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-glow-red'
              }`}
            >
              <Play className="w-3 h-3" />
              {animatingCascade ? `Simulating Wave ${currentWaveStep}...` : `Animate Ripple on ${selectedNodeData.name.split(' ')[0]}`}
            </button>
          )}

          <button
            onClick={resetHighlights}
            className="px-3 py-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Reset Filters and Highlights"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset View
          </button>
        </div>
      </div>

      {/* Main React Flow Graph Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={1.8}
        >
          <Background color="#1E293B" gap={20} size={1} />
          <Controls showInteractive={false} position="bottom-left" />
          <MiniMap
            nodeColor={(n) => {
              const score = n.data?.risk_score || 30;
              if (score <= 30) return '#10B981';
              if (score <= 60) return '#F59E0B';
              if (score <= 80) return '#F97316';
              return '#EF4444';
            }}
            maskColor="rgba(7, 11, 20, 0.75)"
            position="bottom-right"
          />
        </ReactFlow>

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 glass-panel px-3.5 py-2.5 rounded-xl border border-slate-800 pointer-events-auto z-10 hidden sm:block">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
            Vulnerability Legend
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300 text-[11px]">Low (0-30)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300 text-[11px]">Med (31-60)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-slate-300 text-[11px]">High (61-80)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-300 text-[11px]">Critical (81-100)</span>
            </span>
          </div>
        </div>

        {/* Node Detail Drawer / Inspection Modal */}
        {selectedNodeData && (
          <div className="absolute top-4 right-4 w-96 rounded-2xl glass-panel-elevated p-5 z-30 shadow-2xl animate-in slide-in-from-right-4 border border-cyan-500/30">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  {selectedNodeData.tier}
                </span>
                <h3 className="text-base font-bold text-slate-100 leading-snug mt-0.5">
                  {selectedNodeData.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <span>📍</span> {selectedNodeData.city}, {selectedNodeData.country}
                </p>
              </div>

              <button
                onClick={() => setSelectedNodeData(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Risk & Performance Metrics */}
            <div className="grid grid-cols-2 gap-2.5 my-4">
              <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Risk Score</span>
                <div className="text-lg font-bold font-mono text-slate-100 mt-0.5 flex items-baseline gap-1">
                  {selectedNodeData.risk_score}
                  <span className={`text-[10px] font-sans px-1.5 py-0.2 rounded font-semibold ${
                    selectedNodeData.risk_score <= 30 ? 'text-emerald-400' :
                    selectedNodeData.risk_score <= 60 ? 'text-amber-400' :
                    selectedNodeData.risk_score <= 80 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {selectedNodeData.status}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Buffer Stock</span>
                <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                  {selectedNodeData.buffer_days || 15} <span className="text-xs font-normal text-slate-400">days</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Lead Time</span>
                <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                  {selectedNodeData.lead_time_days || 14} <span className="text-xs font-normal text-slate-400">days</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Dependency Type</span>
                <div className="text-xs font-bold text-slate-200 mt-1.5 flex items-center gap-1">
                  {selectedNodeData.single_source ? (
                    <span className="text-amber-400 flex items-center gap-1 font-mono">
                      <AlertTriangle className="w-3 h-3" /> Sole Source
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-mono">Multi-Sourced</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed bg-navy-900/60 p-2.5 rounded-xl border border-slate-800/80 mb-4">
              {selectedNodeData.description || 'Enterprise component node participating in multi-tier semiconductor and assembly workflows.'}
            </p>

            {/* Connected Supply Chain Partners */}
            <div className="space-y-2 text-xs mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Direct Downstream Dependents ({selectedNodeData.direct_downstream?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedNodeData.direct_downstream?.length > 0 ? (
                    selectedNodeData.direct_downstream.map((name, i) => (
                      <span key={i} className="text-[10px] bg-navy-850 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">None (End of tier distribution)</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Direct Upstream Suppliers ({selectedNodeData.direct_upstream?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedNodeData.direct_upstream?.length > 0 ? (
                    selectedNodeData.direct_upstream.map((name, i) => (
                      <span key={i} className="text-[10px] bg-navy-850 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">None (Raw material baseline)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => onNavigateToSimulator(selectedNodeData.id)}
                className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-glow-red"
              >
                <Play className="w-3.5 h-3.5" /> Simulate Shock
              </button>

              <button
                onClick={() => onNavigateToPredict(selectedNodeData.id)}
                className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-glow-cyan"
              >
                <Sparkles className="w-3.5 h-3.5" /> GNN Ripple
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkGraph;
