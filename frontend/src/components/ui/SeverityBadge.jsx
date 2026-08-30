import React from 'react';

const SEVERITY = {
  critical: { label: 'Critical', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  high:     { label: 'High',     className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  medium:   { label: 'Medium',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  low:      { label: 'Low',      className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  info:     { label: 'Info',     className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
};

export function SeverityBadge({ level = 'info' }) {
  const cfg = SEVERITY[level.toLowerCase()] || SEVERITY.info;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
