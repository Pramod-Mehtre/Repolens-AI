import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, GitPullRequest, Server, BookOpen, Clock, 
  CheckCircle, XCircle, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import PageContainer from '../../components/ui/PageContainer';
import { SkeletonCard } from '../../components/ui/SkeletonCard';

const VERDICT_CONFIG = {
  'Highly Recommended': { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
  'Recommended': { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: ShieldCheck },
  'Consider with Caution': { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: AlertTriangle },
  'Not Recommended': { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

function DecisionCard({ title, icon: Icon, data, index = 0, isStreaming }) {
  if (!data && !isStreaming) return null;

  const verdict = data?.verdict || 'Recommended';
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG['Recommended'];
  const VerdictIcon = cfg.icon;

  if (isStreaming && !data) {
    return (
      <div className="bg-card border border-gray-800 rounded-xl p-5 space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gray-800" />
            <div className="w-32 h-4 rounded bg-gray-800" />
          </div>
          <div className="w-24 h-6 rounded bg-gray-800" />
        </div>
        <div className="w-full h-16 rounded bg-gray-800 mt-4" />
      </div>
    );
  }

  // Handle legacy fallback if old `reason` string is present instead of arrays
  const explanation = data.explanation || data.reason || '';
  const reasons = data.reasons || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
            <Icon size={20} className="text-textSecondary" />
          </div>
          <h3 className="text-base font-bold text-textPrimary">{title}</h3>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {data.confidence && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 text-textSecondary text-xs font-semibold border border-gray-700">
              Confidence: <span className="text-textPrimary">{data.confidence}%</span>
            </div>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color} text-xs font-bold`}>
            <VerdictIcon size={14} />
            {verdict}
          </div>
        </div>
      </div>

      <div className="text-sm text-textSecondary mb-4 leading-relaxed">
        {explanation}
      </div>

      {reasons.length > 0 && (
        <ul className="space-y-2 mt-4">
          {reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-textSecondary">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

export default function DecisionPage() {
  const { sections, isLoading, isStreaming, hasStarted } = useAnalysis();
  const decision = sections?.decision;

  if (!hasStarted || (isLoading && !decision)) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <SkeletonCard lines={2} />
          <div className="grid md:grid-cols-2 gap-4">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        </div>
      </PageContainer>
    );
  }

  // Handle older saved analyses that didn't generate decision objects
  if (!decision && !isStreaming) return null;

  const isLegacy = decision?.shouldLearn && !decision?.learn;

  const cards = isLegacy ? [
    { title: 'Should I Learn This?', icon: GraduationCap, data: decision.shouldLearn },
    { title: 'Should I Contribute?', icon: GitPullRequest, data: decision.shouldContribute },
    { title: 'Use in Production?', icon: Server, data: decision.shouldUseInProduction },
    { title: 'Should I Study It?', icon: BookOpen, data: decision.shouldStudy },
  ] : [
    { title: 'Should I Learn This?', icon: GraduationCap, data: decision?.learn },
    { title: 'Should I Contribute?', icon: GitPullRequest, data: decision?.contribute },
    { title: 'Use in Production?', icon: Server, data: decision?.production },
    { title: 'Is It Beginner Friendly?', icon: BookOpen, data: decision?.beginnerFriendly },
    { title: 'Is It Well Maintained?', icon: Clock, data: decision?.wellMaintained },
  ];

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Final Verdict</h2>
          <p className="text-sm text-textSecondary mt-1">
            AI-powered recommendations based on the full repository analysis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <DecisionCard 
              key={card.title} 
              title={card.title} 
              icon={card.icon} 
              data={card.data} 
              index={i} 
              isStreaming={isStreaming} 
            />
          ))}
        </div>

        {/* Overall Recommendation */}
        {(decision?.overall || isStreaming) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-blue-400 mb-3">Overall Recommendation</h3>
              {decision?.overall?.summary ? (
                <p className="text-textSecondary text-sm leading-relaxed max-w-3xl">
                  {decision.overall.summary}
                </p>
              ) : (
                <div className="h-4 bg-blue-900/30 rounded w-3/4 animate-pulse mx-auto md:mx-0" />
              )}
            </div>

            <div className="shrink-0 flex flex-col items-center justify-center p-5 bg-[#0f172a] rounded-xl border border-gray-800 min-w-[160px]">
              <div className="text-xs text-textSecondary font-bold uppercase tracking-wider mb-2">
                Overall Rating
              </div>
              {decision?.overall?.rating ? (
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {decision.overall.rating}
                </div>
              ) : (
                <div className="h-8 bg-gray-800 rounded w-16 animate-pulse" />
              )}
              {decision?.overall?.score && (
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  Score: {decision.overall.score} / 100
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
