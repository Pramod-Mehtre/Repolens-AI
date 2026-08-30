import React, { memo } from "react";
import { Star, GitFork, Code, HardDrive, BookOpen } from "lucide-react";
import PropTypes from "prop-types";

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

const RepoStats = memo(function RepoStats({ metadata, languages }) {
  const primaryLanguage = Object.keys(languages || {})[0] || "Unknown";
  
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Info Card */}
      <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm">
        <div className="flex gap-4 items-center mb-4">
          <img
            src={metadata.owner.avatarUrl}
            alt={metadata.owner.login}
            className="w-10 h-10 rounded-lg border border-gray-800"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Repository</div>
            <h2 className="text-lg font-bold text-textPrimary truncate" title={metadata.fullName}>
              {metadata.name}
            </h2>
          </div>
        </div>
        
        {metadata.description && (
          <p className="text-sm text-textSecondary line-clamp-2 mb-4" title={metadata.description}>
            {metadata.description}
          </p>
        )}

        {metadata.topics && metadata.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800/50">
            {metadata.topics.map((topic) => (
              <span key={topic} className="bg-background border border-gray-800 rounded-md px-2 py-1 text-xs text-textSecondary">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-textSecondary mb-2">
            <Star size={14} aria-hidden="true" /> Stars
          </div>
          <div className="text-xl font-bold text-textPrimary">{formatNumber(metadata.stars)}</div>
        </div>
        
        <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-textSecondary mb-2">
            <GitFork size={14} aria-hidden="true" /> Forks
          </div>
          <div className="text-xl font-bold text-textPrimary">{formatNumber(metadata.forks)}</div>
        </div>
        
        <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-textSecondary mb-2">
            <Code size={14} aria-hidden="true" /> Language
          </div>
          <div className="text-sm font-bold text-textPrimary truncate" title={primaryLanguage}>
            {primaryLanguage}
          </div>
        </div>
        
        <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-textSecondary mb-2">
            <HardDrive size={14} aria-hidden="true" /> Size
          </div>
          <div className="text-sm font-bold text-textPrimary">
            {(metadata.size / 1024).toFixed(1)} MB
          </div>
        </div>
      </div>
      
      <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-textPrimary">
           <BookOpen size={16} className="text-textSecondary" aria-hidden="true" /> License
        </div>
        <div className="text-sm text-textSecondary">
          {metadata.license || "None"}
        </div>
      </div>
      
      <div className="flex flex-col gap-2 mt-2">
        <a 
          href={`https://github.com/${metadata.fullName}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-center bg-white/5 hover:bg-white/10 text-textPrimary border border-gray-800 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          aria-label={`View ${metadata.name} on GitHub`}
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
});

RepoStats.propTypes = {
  metadata: PropTypes.shape({
    owner: PropTypes.shape({
      avatarUrl: PropTypes.string,
      login: PropTypes.string,
    }),
    fullName: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    topics: PropTypes.arrayOf(PropTypes.string),
    stars: PropTypes.number,
    forks: PropTypes.number,
    size: PropTypes.number,
    license: PropTypes.string,
  }).isRequired,
  languages: PropTypes.object,
};

export default RepoStats;
