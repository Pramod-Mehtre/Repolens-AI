import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Star, GitFork, BookOpen, Calendar, ExternalLink,
  Tag, Activity, Shield, Code, User, Database, GitBranch,
  Gauge, GraduationCap, Clock, Trophy, ShieldCheck, FileCode, Users
} from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';

function formatNumber(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function LanguageBar({ languages }) {
  if (!languages || Object.keys(languages).length === 0) return null;
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];

  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden gap-px mb-3">
        {Object.entries(languages).slice(0, 7).map(([lang, bytes], i) => (
          <div
            key={lang}
            className={colors[i % colors.length]}
            style={{ width: `${(bytes / total) * 100}%` }}
            title={`${lang}: ${((bytes / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {Object.entries(languages).slice(0, 7).map(([lang, bytes], i) => (
          <div key={lang} className="flex items-center gap-1.5 text-xs text-textSecondary">
            <span className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
            <span>{lang}</span>
            <span className="text-gray-600">{((bytes / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
      </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

function ScoreBar({ label, score, icon: Icon }) {
  const numScore = parseInt(score, 10);
  const isValid = !isNaN(numScore);
  const colorClass = !isValid ? 'bg-gray-700' : numScore >= 80 ? 'bg-green-500' : numScore >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="bg-[#0f172a]/50 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-textSecondary text-sm font-medium">
          <Icon size={14} /> {label}
        </div>
        <span className="text-sm font-bold text-textPrimary">{isValid ? `${numScore}/100` : '—'}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: isValid ? `${numScore}%` : '0%' }} 
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { metadata, languages, sections, isLoading } = useAnalysis();

  if (isLoading && !metadata) {
    return (
      <PageContainer>
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonCard lines={5} className="lg:col-span-2" />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      </PageContainer>
    );
  }

  if (!metadata) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64 text-textSecondary text-sm">
          No repository data. Analyze a repo first.
        </div>
      </PageContainer>
    );
  }

  const score = sections?.healthScore;

  return (
    <PageContainer>
      <div className="space-y-6">
      {/* ── REPO CARD ── */}
      <motion.div
        custom={0} variants={cardVariants} initial="hidden" animate="visible"
        className="bg-card border border-gray-800 rounded-xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <img
            src={metadata.owner?.avatarUrl}
            alt={metadata.owner?.login}
            className="w-14 h-14 rounded-xl border border-gray-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-textPrimary">{metadata.name}</h1>
              {metadata.language && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  {metadata.language}
                </span>
              )}
              {metadata.isPrivate && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-textSecondary">Private</span>
              )}
              {metadata.defaultBranch && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-textSecondary border border-gray-700">
                  <GitBranch size={10} />
                  {metadata.defaultBranch}
                </span>
              )}
            </div>
            <p className="text-sm text-textSecondary mb-3">{metadata.owner?.login} / {metadata.name}</p>
            {metadata.description && (
              <p className="text-sm text-textSecondary leading-relaxed mb-4">{metadata.description}</p>
            )}

            {/* Topics */}
            {metadata.topics?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {metadata.topics.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-gray-800 text-textSecondary border border-gray-700">
                    <Tag size={10} />
                    {t}
                  </span>
                ))}
              </div>
            )}

            <a
              href={`https://github.com/${metadata.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink size={14} />
              github.com/{metadata.fullName}
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-textSecondary mb-1"><Star size={12} /> Stars</div>
            <div className="text-lg font-bold text-textPrimary">{formatNumber(metadata.stars)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-textSecondary mb-1"><GitFork size={12} /> Forks</div>
            <div className="text-lg font-bold text-textPrimary">{formatNumber(metadata.forks)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-textSecondary mb-1"><BookOpen size={12} /> License</div>
            <div className="text-sm font-semibold text-textPrimary">{metadata.license || 'None'}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-textSecondary mb-1"><Calendar size={12} /> Updated</div>
            <div className="text-sm font-semibold text-textPrimary">{formatDate(metadata.updatedAt)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-textSecondary mb-1"><Database size={12} /> Size</div>
            <div className="text-sm font-semibold text-textPrimary">{(metadata.size / 1024).toFixed(1)} MB</div>
          </div>
        </div>

        {/* Language bar */}
        {languages && Object.keys(languages).length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-800">
            <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-3">Languages</div>
            <LanguageBar languages={languages} />
          </div>
        )}
      </motion.div>

      {/* ── OWNER CARD ── */}
      <motion.div
        custom={1} variants={cardVariants} initial="hidden" animate="visible"
        className="bg-card border border-gray-800 rounded-xl p-5 flex items-center gap-4"
      >
        <User size={16} className="text-textSecondary shrink-0" />
        <div>
          <div className="text-xs text-textSecondary mb-0.5">Repository Owner</div>
          <div className="text-sm font-semibold text-textPrimary">{metadata.owner?.login}</div>
        </div>
      </motion.div>

      {/* ── HEALTH SCORE ── */}
      {score && (
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="bg-card border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-textPrimary tracking-tight">Repository Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ScoreBar icon={Trophy} label="Overall Health" score={score.overall} />
            <ScoreBar icon={GraduationCap} label="Architecture" score={score.architecture} />
            <ScoreBar icon={Gauge} label="Maintainability" score={score.maintainability} />
            <ScoreBar icon={Clock} label="Documentation" score={score.documentation} />
            {score.security && <ScoreBar icon={ShieldCheck} label="Security" score={score.security} />}
            {score.organization && <ScoreBar icon={FileCode} label="Organization" score={score.organization} />}
            {score.community && <ScoreBar icon={Users} label="Community" score={score.community} />}
          </div>
        </motion.div>
      )}
      </div>
    </PageContainer>
  );

}
