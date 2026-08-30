import React from 'react';
import { Package, ShieldAlert } from 'lucide-react';

export function DependencyList({ dependencies }) {
  if (!dependencies || (!dependencies.major?.length && !dependencies.dev?.length)) return null;

  return (
    <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-textPrimary font-semibold mb-4">
        <Package size={18} className="text-textSecondary" /> Dependencies
      </div>
      <div className="space-y-4">
        {dependencies.major?.length > 0 && (
          <div>
            <h4 className="text-xs text-textSecondary uppercase tracking-wider mb-2">Production</h4>
            <div className="flex flex-wrap gap-2">
              {dependencies.major.slice(0, 15).map((dep, idx) => (
                <span key={idx} className="bg-background border border-gray-800 rounded text-xs px-2 py-1 text-textPrimary">
                  {dep}
                </span>
              ))}
              {dependencies.major.length > 15 && (
                <span className="text-xs text-textSecondary py-1">+{dependencies.major.length - 15} more</span>
              )}
            </div>
          </div>
        )}
        {dependencies.dev?.length > 0 && (
          <div>
            <h4 className="text-xs text-textSecondary uppercase tracking-wider mb-2">Development</h4>
            <div className="flex flex-wrap gap-2">
              {dependencies.dev.slice(0, 10).map((dep, idx) => (
                <span key={idx} className="bg-background border border-gray-800 rounded text-xs px-2 py-1 text-textSecondary">
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SecurityWarnings({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="bg-error/10 border border-error/20 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-error font-semibold mb-3">
        <ShieldAlert size={18} /> Security Overview
      </div>
      <ul className="space-y-2">
        {warnings.map((warn, idx) => (
          <li key={idx} className="text-sm text-textPrimary flex items-start gap-2">
            <span className="text-error mt-0.5">•</span> {warn}
          </li>
        ))}
      </ul>
    </div>
  );
}
