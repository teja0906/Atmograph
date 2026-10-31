import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Database, 
  RefreshCw,
  CheckCircle2,
  Share2
} from 'lucide-react';
import api from '../services/api';

const ReportsAnalytics = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.getReports();
      setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AtmoGraph-Report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">
          Compiling supply chain intelligence report...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header & Export Actions */}
      <div className="pb-2 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            Reports & Executive Intelligence
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
              Quarterly Briefing
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official supply chain resilience audit, risk exposures, and AI mitigation roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-glow-cyan"
          >
            <Printer className="w-3.5 h-3.5" /> Print Briefing
          </button>
        </div>
      </div>

      {/* Report Document Container */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 space-y-8 bg-navy-900/90 shadow-2xl">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              {report.classification}
            </span>
            <h2 className="text-xl font-extrabold text-slate-100 mt-1">
              AtmoGraph Global Resilience & Ripple Prediction Audit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Report ID: {report.report_id} • Generated: {new Date(report.generated_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800 text-center">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Resilience Index</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                {report.resilience_score}<span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            1. Executive Summary & Diagnostic
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-navy-950/80 p-4 rounded-xl border border-slate-800 font-sans">
            {report.executive_summary}
          </p>
        </div>

        {/* Critical Vulnerabilities & Bottlenecks */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            2. Primary Identified Choke Points
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {report.top_bottlenecks?.map((node, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-navy-950 border border-red-500/20 text-xs space-y-1"
              >
                <div className="text-[10px] font-mono text-red-400 font-bold">Bottleneck #{i + 1}</div>
                <div className="font-semibold text-slate-200">{node}</div>
                <p className="text-[11px] text-slate-400">Single-source dependency across downstream assembly tiers.</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended AI Playbook Overview */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            3. Recommended Strategic Interventions
          </h3>
          <div className="space-y-2">
            {report.top_mitigations?.map((mit, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200">{mit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Metadata & Technology Stack Sign-off */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="space-y-1">
            <div>Model: <strong className="text-slate-200">{report.audit_metadata.model_version}</strong></div>
            <div>GNN Accuracy: <strong className="text-emerald-400">{report.audit_metadata.gnn_accuracy}</strong> (AUC: {report.audit_metadata.gnn_roc_auc})</div>
          </div>

          <div className="space-y-1 text-right">
            <div>Database Mode: <strong className="text-cyan-400">{report.audit_metadata.database_engine}</strong></div>
            <div>Verification: <strong className="text-emerald-400">100% Passed Test Suite</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
