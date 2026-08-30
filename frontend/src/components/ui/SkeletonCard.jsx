import React from 'react';

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`bg-card border border-gray-800 rounded-xl p-5 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-800 rounded w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-800 rounded mb-2"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 4 }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-800 rounded" style={{ width: `${90 - (i % 3) * 12}%` }} />
      ))}
    </div>
  );
}
