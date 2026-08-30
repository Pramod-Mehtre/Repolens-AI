import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Building2, BrainCircuit, FileText } from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { SkeletonCard, SkeletonText } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = React.lazy(() => import('react-markdown'));

function ReportCard({ icon: Icon, title, content, isStreaming, index = 0 }) {
  const hasContent = content && typeof content === 'string' && content.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="bg-card border border-gray-800 rounded-xl overflow-hidden p-6 mb-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
        {isStreaming && !hasContent && (
          <span className="text-xs text-primary animate-pulse ml-2">Generating…</span>
        )}
      </div>

      <div className="text-textSecondary text-sm leading-relaxed">
        {hasContent ? (
          <div className="prose prose-invert prose-sm max-w-none text-textSecondary">
            <Suspense fallback={<SkeletonText lines={3} />}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </Suspense>
          </div>
        ) : isStreaming ? (
          <SkeletonText lines={4} />
        ) : (
          <p className="italic">This section was not included in the AI analysis for this repository.</p>
        )}
      </div>
    </motion.div>
  );
}

export default function AISummaryPage() {
  const { sections, isStreaming, isLoading, hasStarted } = useAnalysis();

  if (!hasStarted) return null;

  if (isLoading && !sections?.summary) {
    return (
      <PageContainer>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      </PageContainer>
    );
  }

  // Synthesize "Engineering Insights" from existing fields if available
  let engineeringInsightsText = sections?.engineeringDecisions || "";
  if (sections?.strengths) engineeringInsightsText += `\n\n### Strengths\n${sections.strengths}`;
  if (sections?.weaknesses) engineeringInsightsText += `\n\n### Weaknesses\n${sections.weaknesses}`;

  // Synthesize "Final Recommendation" from decision object if available
  let recommendationText = sections?.productionReadiness || "";
  if (sections?.decision) {
    recommendationText += `\n\n### Recommendations\n`;
    if (sections.decision.shouldUseInProduction) {
      recommendationText += `- **Production:** ${sections.decision.shouldUseInProduction.verdict}. ${sections.decision.shouldUseInProduction.reason}\n`;
    }
    if (sections.decision.shouldContribute) {
      recommendationText += `- **Contributing:** ${sections.decision.shouldContribute.verdict}. ${sections.decision.shouldContribute.reason}\n`;
    }
    if (sections.decision.shouldLearn) {
      recommendationText += `- **Learning:** ${sections.decision.shouldLearn.verdict}. ${sections.decision.shouldLearn.reason}\n`;
    }
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-textPrimary tracking-tight">Engineering Report</h2>
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-primary mt-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Streaming Analysis…
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <ReportCard
          icon={Sparkles}
          title="Executive Summary"
          content={sections?.summary || sections?.repositoryPurpose}
          isStreaming={isStreaming}
          index={0}
        />
        <ReportCard
          icon={Building2}
          title="Architecture Analysis"
          content={sections?.architectureAnalysis || sections?.maintainabilityAnalysis}
          isStreaming={isStreaming}
          index={1}
        />
        <ReportCard
          icon={BrainCircuit}
          title="Engineering Insights"
          content={engineeringInsightsText || sections?.insights}
          isStreaming={isStreaming}
          index={2}
        />
        <ReportCard
          icon={FileText}
          title="Final Recommendation"
          content={recommendationText || sections?.documentation}
          isStreaming={isStreaming}
          index={3}
        />
      </div>
    </PageContainer>
  );
}
