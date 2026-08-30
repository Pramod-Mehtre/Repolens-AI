import React, { useMemo, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, AlertCircle, AlertTriangle, Info, Sparkles,
  ChevronDown, ChevronUp, Code2, Shield, TestTube,
  FileText, Zap, Server, Wrench
} from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = React.lazy(() => import('react-markdown'));

const PRIORITY_CONFIG = {
  high: { label: 'High', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20', badge: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
  medium: { label: 'Medium', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/5 border-yellow-500/20', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
  low: { label: 'Low', icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/20', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
};

const EFFORT_CONFIG = {
  Low: 'bg-green-500/10 text-green-400 border-green-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  High: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const CATEGORY_ICONS = {
  Architecture: Code2,
  Security: Shield,
  Testing: TestTube,
  Documentation: FileText,
  Performance: Zap,
  DevOps: Server,
  'Developer Experience': Wrench,
  'Code Quality': Wrench,
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || Code2;
}

function StructuredImprovementCard({ item, priority, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY_CONFIG[priority];
  const PriorityIcon = cfg.icon;
  const CategoryIcon = getCategoryIcon(item.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border p-4 ${cfg.bg}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <PriorityIcon size={14} className={`${cfg.color} mt-0.5 shrink-0`} />
          <span className={`text-sm font-semibold ${cfg.color} leading-snug`}>{item.title}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:justify-end">
          {item.category && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border bg-gray-800/60 text-textSecondary border-gray-700 font-medium">
              <CategoryIcon size={9} />
              {item.category}
            </span>
          )}
          {item.effort && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${EFFORT_CONFIG[item.effort] || EFFORT_CONFIG.Medium}`}>
              {item.effort} effort
            </span>
          )}
          {item.impact && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${cfg.badge}`}>
              {item.impact} impact
            </span>
          )}
        </div>
      </div>

      {/* Problem */}
      {item.problem && (
        <div className="mb-2">
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Problem</span>
          <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">{item.problem}</p>
        </div>
      )}

      {/* Why it matters */}
      {item.whyItMatters && (
        <div className="mb-2">
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Why It Matters</span>
          <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">{item.whyItMatters}</p>
        </div>
      )}

      {/* Evidence */}
      {item.evidence && (
        <div className="mb-2">
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Repository Evidence</span>
          <p className="text-xs text-textSecondary mt-0.5 leading-relaxed font-mono bg-black/20 px-2 py-1 rounded">{item.evidence}</p>
        </div>
      )}

      {/* Suggested Implementation — collapsible */}
      {item.implementation && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider hover:text-blue-300 transition-colors mt-1"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            Suggested Implementation
          </button>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-textSecondary mt-1.5 leading-relaxed border-l-2 border-primary/30 pl-2">
                  {item.implementation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/** Legacy card for old history items with string-format improvements */
function LegacyImprovementCard({ title, body, priority, index }) {
  const cfg = PRIORITY_CONFIG[priority];
  const Icon = cfg.icon;
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border p-4 ${cfg.bg}`}
    >
      <div className={`text-xs font-semibold mb-2 ${cfg.color} flex items-start gap-1.5`}>
        <Icon size={12} className="mt-0.5 shrink-0" />
        <span>{title.replace(/\*\*/g, '')}</span>
      </div>
      {body && body !== title && (
        <p className="text-xs text-textSecondary leading-relaxed">
          {body.replace(/\*\*/g, '').slice(0, 200)}
          {body.length > 200 && '…'}
        </p>
      )}
    </motion.div>
  );
}

/** Parse old markdown format for backward compat with history items */
function parseLegacySuggestions(roadmap) {
  if (!roadmap) return { high: [], medium: [], low: [], raw: '' };
  const lines = roadmap.split('\n');
  const result = { high: [], medium: [], low: [], raw: roadmap };
  let currentPriority = 'medium';
  let currentItem = null;

  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (lower.includes('high priority') || lower.includes('## high') || lower.includes('### high')) {
      currentPriority = 'high';
    } else if (lower.includes('medium priority') || lower.includes('## medium') || lower.includes('### medium')) {
      currentPriority = 'medium';
    } else if (lower.includes('low priority') || lower.includes('## low') || lower.includes('### low')) {
      currentPriority = 'low';
    } else if (line.match(/^[-*]\s+\*\*/) || line.match(/^\d+\.\s+\*\*/)) {
      if (currentItem) result[currentPriority].push(currentItem);
      const text = line.replace(/^[-*\d.]+\s+/, '').trim();
      currentItem = { title: text.replace(/\*\*/g, '').slice(0, 80), body: text };
    } else if (line.match(/^[-*]\s+/) && line.length > 20) {
      if (currentItem) result[currentPriority].push(currentItem);
      const text = line.replace(/^[-*]\s+/, '').trim();
      currentItem = { title: text.slice(0, 70), body: text };
    } else if (currentItem && line.trim()) {
      currentItem.body += '\n' + line;
    }
  });
  if (currentItem) result[currentPriority].push(currentItem);
  return result;
}

export default function ImprovementsPage() {
  const { sections, isLoading, isStreaming, hasStarted } = useAnalysis();
  const structured = sections?.structuredImprovements;
  const roadmap = sections?.roadmap;

  const legacySuggestions = useMemo(() => {
    if (structured) return null; // use structured path
    return parseLegacySuggestions(roadmap);
  }, [structured, roadmap]);

  const hasStructuredItems = structured && (
    structured.high.length + structured.medium.length + structured.low.length > 0
  );
  const hasLegacyItems = legacySuggestions && (
    legacySuggestions.high.length + legacySuggestions.medium.length + legacySuggestions.low.length > 0
  );

  if (!hasStarted || (isLoading && !structured && !roadmap)) {
    return <PageContainer><div className="space-y-4"><SkeletonCard lines={4} /><SkeletonCard lines={4} /></div></PageContainer>;
  }

  if (!structured && !roadmap && !isStreaming) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64 text-textSecondary text-sm">
          <div className="text-center">
            <Lightbulb size={32} className="text-gray-700 mx-auto mb-3" />
            <p>No improvement suggestions generated yet.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const renderColumn = (priority, items, isStructured) => {
    const cfg = PRIORITY_CONFIG[priority];
    const Icon = cfg.icon;
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-800">
          <Icon size={16} className={cfg.color} />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label} Priority</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${cfg.badge}`}>
            {items.length}
          </span>
        </div>
        {items.length === 0 ? (
          <div className="bg-card border border-gray-800 rounded-xl p-4 text-xs text-textSecondary text-center">
            None identified
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, i) =>
              isStructured ? (
                <StructuredImprovementCard key={i} item={item} priority={priority} index={i} />
              ) : (
                <LegacyImprovementCard key={i} title={item.title} body={item.body} priority={priority} index={i} />
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-textPrimary">Improvement Roadmap</h2>
            {hasStructuredItems && (
              <p className="text-xs text-textSecondary mt-0.5">
                Repository-specific recommendations · 9 items
              </p>
            )}
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <Sparkles size={13} className="animate-pulse" />
              Generating suggestions…
            </div>
          )}
        </div>

        {/* Structured new-format cards */}
        {hasStructuredItems && (
          <div className="flex flex-col gap-10">
            {renderColumn('high', structured.high, true)}
            {renderColumn('medium', structured.medium, true)}
            {renderColumn('low', structured.low, true)}
          </div>
        )}

        {/* Legacy format (old history items) */}
        {!hasStructuredItems && hasLegacyItems && (
          <div className="flex flex-col gap-10">
            {renderColumn('high', legacySuggestions.high, false)}
            {renderColumn('medium', legacySuggestions.medium, false)}
            {renderColumn('low', legacySuggestions.low, false)}
          </div>
        )}

        {/* Fallback: render raw markdown */}
        {!hasStructuredItems && !hasLegacyItems && roadmap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border border-gray-800 rounded-xl p-6"
          >
            <div className="prose prose-invert prose-sm max-w-none text-textSecondary">
              <Suspense fallback={<div className="animate-pulse h-32 bg-gray-800 rounded" />}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{roadmap}</ReactMarkdown>
              </Suspense>
            </div>
          </motion.div>
        )}

        {/* Streaming skeleton */}
        {isStreaming && !hasStructuredItems && !hasLegacyItems && !roadmap && (
          <div className="flex flex-col gap-10">
            {['high', 'medium', 'low'].map((p) => (
              <div key={p} className="space-y-4">
                <div className="h-5 bg-gray-800 rounded w-32 animate-pulse mb-2" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card border border-gray-800 rounded-xl p-5 space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-800 rounded w-5/6" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
