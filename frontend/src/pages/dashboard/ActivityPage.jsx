import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, GitBranch, Star, GitFork, AlertCircle,
  BookOpen, Scale, HardDrive, Activity, Users, TrendingUp,
  CheckCircle2, XCircle, Minus, ExternalLink, Globe, Tag
} from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';

function formatDate(dateStr, relative = false) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (relative) {
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Today';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

function getMaintenanceStatus(pushedAt) {
  if (!pushedAt) return { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', icon: Minus };
  const days = (Date.now() - new Date(pushedAt).getTime()) / 86400000;
  if (days < 30)  return { label: 'Actively Maintained',  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  icon: CheckCircle2 };
  if (days < 90)  return { label: 'Recently Active',      color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',    icon: CheckCircle2 };
  if (days < 180) return { label: 'Moderate Activity',    color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Minus };
  if (days < 365) return { label: 'Slow Maintenance',     color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: Minus };
  return { label: 'Possibly Unmaintained', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle };
}

function getCommunityActivity(stars, forks, openIssues) {
  const score = (stars / 100) + (forks / 20) + (openIssues > 0 ? 10 : 0);
  if (score > 200) return { label: 'Very High',  color: 'text-green-400' };
  if (score > 50)  return { label: 'High',       color: 'text-blue-400'  };
  if (score > 10)  return { label: 'Moderate',   color: 'text-yellow-400' };
  if (score > 2)   return { label: 'Low',        color: 'text-orange-400' };
  return { label: 'Very Low', color: 'text-gray-400' };
}

function estimateBusFactor(stars, forks) {
  // Heuristic: high-community repos usually have lower bus factor (more contributors)
  const ratio = forks > 0 ? stars / forks : 0;
  if (forks > 500)  return { estimate: '> 10 contributors', risk: 'Low', color: 'text-green-400' };
  if (forks > 100)  return { estimate: '5–10 contributors', risk: 'Low', color: 'text-blue-400'  };
  if (forks > 20)   return { estimate: '2–5 contributors',  risk: 'Medium', color: 'text-yellow-400' };
  return { estimate: '1–2 contributors', risk: 'High', color: 'text-red-400' };
}

function estimateGrowth(stars, createdAt) {
  if (!createdAt || !stars) return '—';
  const ageMonths = (Date.now() - new Date(createdAt).getTime()) / (30 * 86400000);
  if (ageMonths < 1) return '—';
  const starsPerMonth = stars / ageMonths;
  if (starsPerMonth > 1000) return 'Viral growth 🚀';
  if (starsPerMonth > 100)  return 'Rapid growth';
  if (starsPerMonth > 10)   return 'Steady growth';
  if (starsPerMonth > 1)    return 'Slow growth';
  return 'Minimal growth';
}

function MetricCard({ icon: Icon, label, value, sub, color = 'text-textPrimary', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-card border border-gray-800 rounded-xl p-4 flex items-start gap-3 hover:border-gray-700 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-gray-800/60 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-textSecondary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-textSecondary mb-0.5">{label}</div>
        <div className={`text-sm font-bold ${color} truncate`}>{value}</div>
        {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}

export default function ActivityPage() {
  const { metadata, isLoading, hasStarted } = useAnalysis();

  const derived = useMemo(() => {
    if (!metadata) return null;
    return {
      maintenance: getMaintenanceStatus(metadata.pushedAt || metadata.updatedAt),
      community: getCommunityActivity(metadata.stars || 0, metadata.forks || 0, metadata.openIssues || 0),
      busFactor: estimateBusFactor(metadata.stars || 0, metadata.forks || 0),
      growth: estimateGrowth(metadata.stars || 0, metadata.createdAt),
    };
  }, [metadata]);

  if (!hasStarted || (isLoading && !metadata)) {
    return (
      <PageContainer>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <SkeletonCard key={i} lines={2} />)}
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

  const maintenance = derived?.maintenance;
  const community = derived?.community;
  const busFactor = derived?.busFactor;

  return (
    <PageContainer>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-base font-semibold text-textPrimary">Repository Activity</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Metadata-derived health signals and community analytics
          </p>
        </div>

        {/* Maintenance status banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-4 p-4 rounded-xl border ${maintenance.bg}`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <maintenance.icon size={20} className={maintenance.color} />
          </div>
          <div>
            <div className="text-xs text-textSecondary">Maintenance Status</div>
            <div className={`text-base font-bold ${maintenance.color}`}>{maintenance.label}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-textSecondary">Last Activity</div>
            <div className="text-sm font-semibold text-textPrimary">
              {formatDate(metadata.pushedAt || metadata.updatedAt, true)}
            </div>
          </div>
        </motion.div>

        {/* Core metrics grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricCard icon={Calendar}   label="Repository Created"  value={formatDate(metadata.createdAt)}                        index={0} />
          <MetricCard icon={Activity}   label="Latest Commit"       value={formatDate(metadata.pushedAt, true)} sub={formatDate(metadata.pushedAt)} index={1} />
          <MetricCard icon={Tag}        label="Latest Release"      value="—" sub="No release data available" index={2} />
          
          <MetricCard icon={Users}      label="Contributors"        value={busFactor.estimate} sub="Estimated from forks" color={busFactor.color} index={3} />
          <MetricCard icon={AlertCircle} label="Open Issues"        value={formatNumber(metadata.openIssues)} color={metadata.openIssues > 100 ? 'text-orange-400' : 'text-textPrimary'} index={4} />
          <MetricCard icon={CheckCircle2} label="Closed Issues"     value="—" sub="Requires full issue scan" index={5} />
          
          <MetricCard icon={TrendingUp} label="Community Activity"  value={community.label} color={community.color} sub={`${formatNumber(metadata.stars)} stars · ${formatNumber(metadata.forks)} forks`} index={6} />
          <MetricCard icon={Clock}      label="Release Frequency"   value="—" sub="No release data available" index={7} />
          
          <MetricCard icon={Star}       label="Stars"               value={formatNumber(metadata.stars)} color="text-yellow-400" index={8} />
          <MetricCard icon={GitFork}    label="Forks"               value={formatNumber(metadata.forks)} color="text-blue-400" index={9} />
          <MetricCard icon={BookOpen}   label="License"             value={metadata.license || 'None'} color={metadata.license ? 'text-green-400' : 'text-red-400'} index={10} />
          <MetricCard icon={HardDrive}  label="Repository Size"     value={metadata.size ? `${(metadata.size / 1024).toFixed(1)} MB` : '—'} index={11} />
        </div>

        {/* Topics */}
        {metadata.topics?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-gray-800 rounded-xl p-5"
          >
            <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-3">Topics</div>
            <div className="flex flex-wrap gap-2">
              {metadata.topics.map(topic => (
                <a
                  key={topic}
                  href={`https://github.com/topics/${topic}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  {topic}
                </a>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </PageContainer>
  );
}
