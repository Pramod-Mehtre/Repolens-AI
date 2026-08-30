import React from 'react';

export function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 transition-colors ${
      accent
        ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
        : 'bg-card border-gray-800 hover:border-gray-700'
    }`}>
      <div className="flex items-center gap-2 text-xs text-textSecondary font-medium mb-1">
        {Icon && <Icon size={14} className={accent ? 'text-primary' : 'text-textSecondary'} />}
        {label}
      </div>
      <div className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-textPrimary'}`}>
        {value ?? '—'}
      </div>
      {sub && <div className="text-xs text-textSecondary mt-0.5">{sub}</div>}
    </div>
  );
}
