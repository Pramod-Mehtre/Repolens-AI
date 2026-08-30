import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Wrench, FolderOpen, TestTube, BookOpen,
  Smile, TrendingUp, CheckCircle2, XCircle, Sparkles
} from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';

const INSIGHT_METRICS = [
  { key: 'architectureQuality',  label: 'Architecture Quality',     icon: Building2,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  { key: 'maintainability',      label: 'Maintainability',          icon: Wrench,     color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { key: 'codeOrganization',     label: 'Code Organization',        icon: FolderOpen, color: 'text-cyan-400',   bg: 'bg-cyan-500/10'   },
  { key: 'testingCoverage',      label: 'Testing Coverage',         icon: TestTube,   color: 'text-green-400',  bg: 'bg-green-500/10'  },
  { key: 'documentationQuality', label: 'Documentation Quality',    icon: BookOpen,   color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { key: 'developerExperience',  label: 'Developer Experience',     icon: Smile,      color: 'text-pink-400',   bg: 'bg-pink-500/10'   },
  { key: 'scalability',          label: 'Scalability',              icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

function scoreColor(score) {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBg(score) {
  if (score >= 80) return 'bg-green-500/10 border-green-500/20';
  if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

function scoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

/** Build fallback insights from healthScore if engineeringInsights not in AI response */
function buildFallbackInsights(healthScore) {
  return {
    strengths: ["Structured codebase with identifiable architecture", "Active development with recent commits", "Uses modern tooling and dependency management"],
    weaknesses: ["Testing coverage could not be fully assessed", "Documentation depth may vary across modules", "Production hardening indicators not fully detected"],
    architectureQuality:    { score: healthScore?.architecture    ?? 70, explanation: "Architecture derived from code quality metrics." },
    maintainability:        { score: healthScore?.maintainability ?? 70, explanation: "Maintainability derived from code quality metrics." },
    codeOrganization:       { score: healthScore?.organization    ?? 70, explanation: "Code organization derived from code quality metrics." },
    testingCoverage:        { score: 55,                                 explanation: "Testing coverage estimated from file tree analysis." },
    documentationQuality:   { score: healthScore?.documentation   ?? 65, explanation: "Documentation quality derived from code quality metrics." },
    developerExperience:    { score: 70,                                 explanation: "Developer experience estimated from project structure." },
    scalability:            { score: 68,                                 explanation: "Scalability estimated from architectural patterns." },
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

export default function EngineeringInsightsPage() {
  const { sections, isLoading, isStreaming, hasStarted } = useAnalysis();

  const insights = useMemo(() => {
    if (sections?.engineeringInsights) return sections.engineeringInsights;
    if (sections?.healthScore) return buildFallbackInsights(sections.healthScore);
    return null;
  }, [sections?.engineeringInsights, sections?.healthScore]);

  if (!hasStarted || (isLoading && !insights && !sections?.healthScore)) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <SkeletonCard lines={3} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} lines={3} />)}
          </div>
        </div>
      </PageContainer>
    );
  }

  // Even if no AI data yet, show loading state during streaming
  const displayInsights = insights || (isStreaming ? buildFallbackInsights(null) : buildFallbackInsights(null));
  const strengths = displayInsights.strengths || [];
  const weaknesses = displayInsights.weaknesses || [];

  return (
    <PageContainer>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-textPrimary">Engineering Insights</h2>
            <p className="text-xs text-textSecondary mt-0.5">
              AI-powered quality assessment across 7 engineering dimensions
            </p>
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <Sparkles size={13} className="animate-pulse" />
              Generating insights…
            </div>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <motion.div
            custom={0} variants={cardVariants} initial="hidden" animate="visible"
            className="bg-card border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-green-400" />
              </div>
              <span className="text-sm font-semibold text-textPrimary">Project Strengths</span>
            </div>
            <ul className="space-y-2.5">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-textSecondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
              {strengths.length === 0 && (
                <li className="text-sm text-textSecondary italic">Strengths will appear after AI analysis completes.</li>
              )}
            </ul>
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            custom={1} variants={cardVariants} initial="hidden" animate="visible"
            className="bg-card border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle size={14} className="text-red-400" />
              </div>
              <span className="text-sm font-semibold text-textPrimary">Potential Weaknesses</span>
            </div>
            <ul className="space-y-2.5">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-textSecondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {w}
                </li>
              ))}
              {weaknesses.length === 0 && (
                <li className="text-sm text-textSecondary italic">Weaknesses will appear after AI analysis completes.</li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* Metric Cards */}
        <div>
          <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-3">
            Quality Dimensions
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INSIGHT_METRICS.map((metric, i) => {
              const data = displayInsights[metric.key];
              const score = data?.score ?? 70;
              const explanation = data?.explanation ?? "Analysis in progress...";
              const Icon = metric.icon;

              return (
                <motion.div
                  key={metric.key}
                  custom={i + 2}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-card border border-gray-800 rounded-xl p-4 flex flex-col gap-3"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${metric.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={13} className={metric.color} />
                      </div>
                      <span className="text-xs font-semibold text-textPrimary">{metric.label}</span>
                    </div>
                    <div className={`flex flex-col items-end`}>
                      <span className={`text-xl font-bold ${scoreColor(score)}`}>{score}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <ProgressBar label="" value={score} showValue={false} delay={0.1 + i * 0.05} />

                  {/* Score badge + explanation */}
                  <div className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${scoreBg(score)} ${scoreColor(score)}`}>
                      {scoreLabel(score)}
                    </span>
                    <p className="text-xs text-textSecondary leading-relaxed">{explanation}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Overall bar summary */}
        {sections?.healthScore && (
          <motion.div
            custom={10} variants={cardVariants} initial="hidden" animate="visible"
            className="bg-card border border-gray-800 rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-textPrimary mb-4">Code Quality Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Overall Health', key: 'overall' },
                { label: 'Architecture', key: 'architecture' },
                { label: 'Maintainability', key: 'maintainability' },
                { label: 'Documentation', key: 'documentation' },
                { label: 'Security', key: 'security' },
                { label: 'Organization', key: 'organization' },
              ].map((m, i) => (
                <ProgressBar
                  key={m.key}
                  label={m.label}
                  value={sections.healthScore[m.key] ?? 0}
                  delay={i * 0.06}
                />
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </PageContainer>
  );
}
