import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Building2, 
  Factory, 
  Warehouse, 
  Truck, 
  Store, 
  AlertTriangle, 
  ShieldAlert, 
  Globe2 
} from 'lucide-react';

const SupplyChainNode = ({ data, selected }) => {
  const {
    id,
    name,
    category,
    tier,
    type,
    city,
    country,
    risk_score,
    status,
    single_source,
    lead_time_days,
    isHighlighted,
    isDisrupted,
    isOrigin,
  } = data;

  // Icon mapping
  const getCategoryIcon = () => {
    switch (category) {
      case 'Supplier':
        return tier?.includes('Raw') ? <Globe2 className="w-4 h-4 text-cyan-400" /> : <Factory className="w-4 h-4 text-cyan-400" />;
      case 'Manufacturer':
        return <Building2 className="w-4 h-4 text-violet-400" />;
      case 'Warehouse':
        return <Warehouse className="w-4 h-4 text-amber-400" />;
      case 'Distributor':
        return <Truck className="w-4 h-4 text-emerald-400" />;
      case 'Retailer':
        return <Store className="w-4 h-4 text-blue-400" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-400" />;
    }
  };

  // Color schemes based on Risk Level (0-30 Low, 31-60 Med, 61-80 High, 81-100 Crit)
  const getRiskStyles = () => {
    if (isOrigin) {
      return {
        border: 'border-red-500',
        glow: 'shadow-glow-red ring-2 ring-red-500 animate-pulse',
        badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
        indicator: 'bg-red-500',
      };
    }
    if (isHighlighted || isDisrupted) {
      return {
        border: 'border-orange-500',
        glow: 'shadow-glow-violet ring-2 ring-orange-500/80 animate-pulse-slow',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        indicator: 'bg-orange-500',
      };
    }
    if (risk_score <= 30) {
      return {
        border: selected ? 'border-emerald-400' : 'border-emerald-500/30',
        glow: selected ? 'ring-2 ring-emerald-400 shadow-lg' : 'hover:border-emerald-500/60',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        indicator: 'bg-emerald-500',
      };
    } else if (risk_score <= 60) {
      return {
        border: selected ? 'border-amber-400' : 'border-amber-500/30',
        glow: selected ? 'ring-2 ring-amber-400 shadow-lg' : 'hover:border-amber-500/60',
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        indicator: 'bg-amber-500',
      };
    } else if (risk_score <= 80) {
      return {
        border: selected ? 'border-orange-400' : 'border-orange-500/40',
        glow: selected ? 'ring-2 ring-orange-400 shadow-glow-violet' : 'hover:border-orange-500/70',
        badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
        indicator: 'bg-orange-500',
      };
    } else {
      return {
        border: selected ? 'border-red-400' : 'border-red-500/50',
        glow: 'shadow-glow-red ring-1 ring-red-500/60',
        badgeBg: 'bg-red-500/20 text-red-300 border-red-500/50',
        indicator: 'bg-red-500 animate-pulse',
      };
    }
  };

  const riskStyle = getRiskStyles();

  return (
    <div
      className={`relative w-72 rounded-xl bg-navy-850/95 backdrop-blur-md p-3.5 transition-all duration-300 border ${riskStyle.border} ${riskStyle.glow} cursor-pointer group`}
    >
      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-navy-950 !-left-1.5 transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-navy-950 !-right-1.5 transition-transform hover:scale-125"
      />

      {/* Origin Shock Ribbon */}
      {isOrigin && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
          <ShieldAlert className="w-3 h-3" /> Shock Origin
        </div>
      )}

      {/* Top Meta Header: Icon + Category + Risk Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-md bg-navy-800 border border-slate-700/50">
            {getCategoryIcon()}
          </div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {category}
          </span>
        </div>

        {/* Risk Status Pill */}
        <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${riskStyle.badgeBg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.indicator}`} />
          {status || `${Math.round(risk_score)} Risk`}
        </div>
      </div>

      {/* Company Name */}
      <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
        {name}
      </h4>

      {/* Type & Subtitle */}
      <p className="text-[11px] text-slate-400 truncate mt-0.5">
        {type || tier}
      </p>

      {/* Bottom Metrics Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 truncate max-w-[120px]">
          <span className="text-slate-500">📍</span> {city}, {country}
        </span>

        <div className="flex items-center gap-2 font-mono">
          {single_source && (
            <span 
              className="text-amber-400 font-sans flex items-center gap-0.5 text-[10px] bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20"
              title="Single-source dependency: No secondary supplier certified"
            >
              <AlertTriangle className="w-2.5 h-2.5" /> Sole Source
            </span>
          )}
          <span className="text-slate-300 font-semibold">
            {Math.round(risk_score)}<span className="text-[9px] text-slate-500 font-normal">/100</span>
          </span>
        </div>
      </div>

      {/* Risk Progress Bar */}
      <div className="w-full bg-navy-950 h-1 rounded-full mt-2 overflow-hidden border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            risk_score <= 30 ? 'bg-emerald-500' :
            risk_score <= 60 ? 'bg-amber-500' :
            risk_score <= 80 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(5, risk_score))}%` }}
        />
      </div>
    </div>
  );
};

export default memo(SupplyChainNode);
