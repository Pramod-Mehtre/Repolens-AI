import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = React.lazy(() => import('react-markdown'));

function detectSeverity(warning) {
  const w = warning.toLowerCase();
  if (w.includes('critical') || w.includes('inject') || w.includes('rce') || w.includes('remote')) return 'critical';
  if (w.includes('high') || w.includes('vulnerab') || w.includes('exploit')) return 'high';
  if (w.includes('medium') || w.includes('xss') || w.includes('csrf') || w.includes('outdated')) return 'medium';
  return 'low';
}

export default function SecurityPage() {
  const { security, sections, isLoading, isStreaming, hasStarted } = useAnalysis();
  const score = sections?.healthScore?.security ?? null;

  if (!hasStarted || isLoading) {
    return <PageContainer><div className="space-y-4"><SkeletonCard lines={4} /><SkeletonCard lines={4} /></div></PageContainer>;
  }

  const warnings = security || [];
  const hasWarnings = warnings.length > 0;
  const hasSecurityDetails = sections?.securityDetails && sections.securityDetails.trim();

  return (
    <PageContainer>
      <div className="space-y-5">
      {/* Security Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-gray-800 rounded-xl p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              !hasWarnings ? 'bg-green-500/10' : 'bg-orange-500/10'
            }`}>
              {hasWarnings
                ? <AlertTriangle size={22} className="text-orange-400" />
                : <CheckCircle size={22} className="text-green-400" />
              }
            </div>
            <div>
              <div className="text-xs text-textSecondary mb-0.5">Security Status</div>
              <div className={`text-lg font-bold ${hasWarnings ? 'text-orange-400' : 'text-green-400'}`}>
                {hasWarnings ? `${warnings.length} Issue${warnings.length > 1 ? 's' : ''} Found` : 'No Issues Detected'}
              </div>
            </div>
          </div>

          {score !== null && (
            <div className="sm:ml-auto sm:w-64">
              <ProgressBar label="Security Score" value={score} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Warnings List */}
      {hasWarnings && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-gray-800 rounded-xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-800">
            <ShieldAlert size={15} className="text-orange-400" />
            <span className="text-sm font-semibold text-textPrimary">Security Warnings</span>
            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full ml-1">
              {warnings.length}
            </span>
          </div>
          <div className="divide-y divide-gray-800/50">
            {warnings.map((warning, i) => {
              const severity = detectSeverity(warning);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-800/20 transition-colors"
                >
                  <SeverityBadge level={severity} />
                  <p className="text-sm text-textSecondary flex-1">{warning}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* AI Security Analysis */}
      {(hasSecurityDetails || isStreaming) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-gray-800 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-textPrimary mb-4">
            <ShieldCheck size={15} className="text-primary" />
            AI Security Analysis
            {isStreaming && <span className="text-xs text-primary animate-pulse ml-2">Streaming…</span>}
          </div>
          {hasSecurityDetails ? (
            <div className="prose prose-invert prose-sm max-w-none text-textSecondary">
              <Suspense fallback={<div className="animate-pulse h-24 bg-gray-800 rounded" />}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{sections.securityDetails}</ReactMarkdown>
              </Suspense>
            </div>
          ) : (
            <div className="animate-pulse space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-800 rounded" style={{ width: `${85 - i * 10}%` }} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* All-clear state */}
      {!hasWarnings && !hasSecurityDetails && !isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-500/5 border border-green-500/20 rounded-xl p-6 text-center"
        >
          <CheckCircle size={36} className="text-green-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-green-400 mb-1">Looks Clean</p>
          <p className="text-xs text-textSecondary">No security issues were detected in this repository's surface-level scan.</p>
        </motion.div>
      )}

      {/* Severity legend */}
      <div className="flex flex-wrap gap-3 text-xs text-textSecondary pt-2">
        <span className="font-medium text-gray-500">Severity legend:</span>
        {['critical', 'high', 'medium', 'low'].map((s) => (
          <SeverityBadge key={s} level={s} />
        ))}
      </div>
      </div>
    </PageContainer>
  );
}
