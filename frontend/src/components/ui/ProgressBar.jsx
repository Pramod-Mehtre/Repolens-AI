import React from 'react';
import { motion } from 'framer-motion';

function getColor(value) {
  if (value >= 80) return 'bg-green-500';
  if (value >= 60) return 'bg-yellow-500';
  if (value >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function ProgressBar({ label, value = 0, showValue = true, delay = 0, colorOverride }) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const colorClass = colorOverride || getColor(clampedValue);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-textSecondary font-medium">{label}</span>
        {showValue && <span className="text-textPrimary font-bold tabular-nums">{clampedValue}</span>}
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
