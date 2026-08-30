import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, FolderTree, Play, Code2, Terminal,
  TestTube, Clock, Sparkles, ArrowDown, CheckCircle2
} from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';

const STEP_ICONS = [BookOpen, FolderTree, Play, Code2, Terminal, TestTube];

const DEFAULT_STEPS = [
  { step: 1, title: 'Read the README',           description: 'Start with the README to understand the project purpose, installation steps, and usage examples.',      estimatedTime: '15 min' },
  { step: 2, title: 'Explore Folder Structure',  description: 'Map out top-level directories and understand what each one is responsible for in the codebase.',        estimatedTime: '20 min' },
  { step: 3, title: 'Find the Entry Point',      description: 'Locate the main file (server.js, main.py, index.ts, etc.) and trace the initial execution flow.',       estimatedTime: '30 min' },
  { step: 4, title: 'Understand Core Modules',   description: 'Read through the core business logic files and understand the primary abstractions used.',              estimatedTime: '1 hour' },
  { step: 5, title: 'Run the Project Locally',   description: 'Follow the setup instructions to get the project running on your machine and explore it hands-on.',    estimatedTime: '30 min' },
  { step: 6, title: 'Study the Tests',           description: 'Read existing tests to understand expected behavior and edge cases the authors accounted for.',         estimatedTime: '45 min' },
];

function StepCard({ step, icon: Icon, title, description, estimatedTime, isLast, index }) {
  return (
    <div className="flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.08, duration: 0.3 }}
          className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 relative z-10"
        >
          <Icon size={15} className="text-primary" />
        </motion.div>
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-primary/20 to-transparent my-1 min-h-[32px]" />
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08 + 0.05, duration: 0.3 }}
        className="flex-1 pb-6"
      >
        <div className="bg-card border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-mono">
                Step {step}
              </span>
              <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-textSecondary shrink-0">
              <Clock size={11} className="text-gray-500" />
              <span>{estimatedTime}</span>
            </div>
          </div>
          <p className="text-xs text-textSecondary leading-relaxed">{description}</p>
        </div>
        {!isLast && (
          <div className="flex justify-start ml-4 mt-2">
            <ArrowDown size={12} className="text-gray-700" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function LearningGuidePage() {
  const { sections, isLoading, isStreaming, hasStarted, metadata } = useAnalysis();

  const guide = useMemo(() => {
    if (sections?.learningGuide) return sections.learningGuide;
    return { steps: DEFAULT_STEPS, totalTime: '3–4 hours' };
  }, [sections?.learningGuide]);

  if (!hasStarted || (isLoading && !guide)) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <SkeletonCard lines={2} />
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      </PageContainer>
    );
  }

  const steps = guide.steps || DEFAULT_STEPS;
  const totalTime = guide.totalTime || '3–4 hours';
  const hasCustomGuide = !!sections?.learningGuide;

  return (
    <PageContainer>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-textPrimary">Learning Guide</h2>
            <p className="text-xs text-textSecondary mt-0.5">
              {hasCustomGuide
                ? `Tailored roadmap for ${metadata?.name || 'this repository'}`
                : 'General onboarding roadmap · customize once AI analysis completes'}
            </p>
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <Sparkles size={13} className="animate-pulse" />
              Generating guide…
            </div>
          )}
        </div>

        {/* Total time banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-primary" />
          </div>
          <div>
            <div className="text-xs text-textSecondary">Estimated Total Learning Time</div>
            <div className="text-lg font-bold text-textPrimary">{totalTime}</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            <CheckCircle2 size={12} />
            {steps.length} steps
          </div>
        </motion.div>

        {/* Steps */}
        <div>
          {steps.map((stepData, i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
              <StepCard
                key={stepData.step || i}
                step={stepData.step || i + 1}
                icon={Icon}
                title={stepData.title}
                description={stepData.description}
                estimatedTime={stepData.estimatedTime}
                isLast={i === steps.length - 1}
                index={i}
              />
            );
          })}
        </div>

        {/* Completion note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: steps.length * 0.08 + 0.2 }}
          className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-green-400">Ready to Contribute</div>
            <p className="text-xs text-textSecondary mt-0.5">
              After completing these steps you should have a solid understanding of the codebase and be ready to submit your first contribution.
            </p>
          </div>
        </motion.div>

      </div>
    </PageContainer>
  );
}
