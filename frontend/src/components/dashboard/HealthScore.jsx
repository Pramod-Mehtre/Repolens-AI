import React, { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const HealthScore = memo(function HealthScore({ score }) {
  if (!score) return null;

  const getColor = (val) => {
    if (val >= 90) return 'bg-success';
    if (val >= 70) return 'bg-warning';
    return 'bg-error';
  };

  const metrics = [
    { label: 'Documentation', value: score.documentation },
    { label: 'Architecture', value: score.architecture },
    { label: 'Maintainability', value: score.maintainability },
    { label: 'Security', value: score.security },
    { label: 'Organization', value: score.organization },
  ];

  return (
    <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-textPrimary">Health Score</h3>
        <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-gray-800 relative" aria-label={`Overall score ${score.overall || 0}`}>
          <span className="text-sm font-bold text-textPrimary">{score.overall || 0}</span>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36" aria-hidden="true">
            <path
              className="text-gray-800"
              strokeDasharray="100, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="3"
            />
            <path
              className={`${score.overall >= 90 ? 'text-success' : score.overall >= 70 ? 'text-warning' : 'text-error'}`}
              strokeDasharray={`${score.overall || 0}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="3"
            />
          </svg>
        </div>
      </div>
      
      <div className="space-y-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-textSecondary">{m.label}</span>
              <span className="text-textPrimary font-semibold">{m.value || 0}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden" aria-label={`${m.label} score ${m.value || 0}`}>
              <motion.div
                className={`h-1.5 rounded-full ${getColor(m.value)}`}
                initial={{ width: 0 }}
                animate={{ width: `${m.value || 0}%` }}
                transition={{ duration: 1, delay: 0.1 * idx }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

HealthScore.propTypes = {
  score: PropTypes.shape({
    overall: PropTypes.number,
    documentation: PropTypes.number,
    architecture: PropTypes.number,
    maintainability: PropTypes.number,
    security: PropTypes.number,
    organization: PropTypes.number,
  }),
};

export default HealthScore;
