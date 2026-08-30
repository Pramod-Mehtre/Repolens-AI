import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Target, Gauge, GraduationCap, Clock, ShieldCheck, Bug, Activity } from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';

function ScoreRing({ value = 0 }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? '#22C55E' : value >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1F2937" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-textPrimary">{value}</span>
        <span className="text-xs text-textSecondary">/ 100</span>
      </div>
    </div>
  );
}

const QUALITY_METRICS = [
  { key: 'maintainability', label: 'Maintainability' },
  { key: 'architecture',    label: 'Architecture'    },
  { key: 'documentation',   label: 'Documentation'   },
  { key: 'organization',    label: 'Code Organization' },
  { key: 'security',        label: 'Security'         },
];

export default function CodeQualityPage() {
  const { sections, isLoading, isStreaming, hasStarted } = useAnalysis();
  const score = sections?.healthScore;

  if (!hasStarted || (isLoading && !score)) {
    return (
      <PageContainer>
        <div className="grid md:grid-cols-2 gap-4">
          <SkeletonCard lines={4} className="md:col-span-2" />
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
        </div>
      </PageContainer>
    );
  }

  if (!score) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64 text-textSecondary text-sm">
          <div className="text-center">
            <Code2 size={32} className="text-gray-700 mx-auto mb-3" />
            <p>{isStreaming ? 'Code quality scores not yet available.' : 'AI analysis for code quality is temporarily unavailable.'}</p>
            {isStreaming && <p className="text-xs mt-1 text-primary animate-pulse">AI is still generating…</p>}
          </div>
        </div>
      </PageContainer>
    );
  }

  const ratingLabel = (v) =>
    v >= 90 ? 'Excellent' : v >= 75 ? 'Good' : v >= 60 ? 'Fair' : v >= 40 ? 'Needs Work' : 'Poor';

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Overall score */}
      <div className="grid md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3"
        >
          <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Overall Health Score</div>
          <ScoreRing value={score.overall ?? 0} />
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
            (score.overall ?? 0) >= 80 ? 'bg-green-500/10 text-green-400' :
            (score.overall ?? 0) >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {ratingLabel(score.overall ?? 0)}
          </div>
        </motion.div>

        {/* Metric breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-gray-800 rounded-xl p-5 md:col-span-2 space-y-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-textPrimary mb-2">
            <Activity size={15} className="text-textSecondary" /> Metric Breakdown
          </div>
          {QUALITY_METRICS.map((m, i) => (
            <ProgressBar
              key={m.key}
              label={m.label}
              value={score[m.key] ?? 0}
              delay={i * 0.08}
            />
          ))}
        </motion.div>
      </div>

      {/* Detail cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUALITY_METRICS.map(({ key, label }, i) => {
          const val = score[key] ?? 0;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-card border border-gray-800 rounded-xl p-4"
            >
              <div className="text-xs text-textSecondary mb-2">{label}</div>
              <div className="text-2xl font-bold text-textPrimary mb-1">{val}</div>
              <div className={`text-xs font-medium ${
                val >= 80 ? 'text-green-400' : val >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {ratingLabel(val)}
              </div>
              <div className="mt-3">
                <ProgressBar label="" value={val} showValue={false} delay={0.3 + i * 0.05} />
              </div>
            </motion.div>
          );
        })}
      </div>
      </div>
    </PageContainer>
  );
}
