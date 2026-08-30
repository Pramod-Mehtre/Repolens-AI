import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Trash2, Box, ArrowRight, Activity, Award, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Workspace() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalAnalyses: 0, avgHealthScore: 0, favoriteLanguage: 'None' });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const fetchAnalyses = async (query = '') => {
    setIsLoading(true);
    try {
      const url = query ? `/api/saved-analyses?search=${encodeURIComponent(query)}` : '/api/saved-analyses';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAnalyses(data);
    } catch (error) {
      toast.error('Failed to load saved analyses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch stats once
      setIsStatsLoading(true);
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => toast.error('Failed to load workspace stats'))
        .finally(() => setIsStatsLoading(false));

      // Debounce search
      const timer = setTimeout(() => {
        fetchAnalyses(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, searchQuery]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const res = await fetch(`/api/saved-analyses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      setAnalyses(prev => prev.filter(a => a._id !== id));
      toast.success('Report deleted');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 px-4">
        <Box size={48} className="text-gray-700 mb-4" />
        <h2 className="text-2xl font-bold text-textPrimary mb-2">Sign in Required</h2>
        <p className="text-textSecondary text-center max-w-md">
          Please sign in using the button in the top right to access your personal workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      
      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="text-gray-500 mb-2 flex items-center gap-2 text-sm font-medium">
            <Box size={16} /> Total Analyzed
          </div>
          <div className="text-3xl font-bold text-textPrimary">
            {isStatsLoading ? <span className="animate-pulse text-gray-700">...</span> : stats.totalAnalyses}
          </div>
        </div>
        
        <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="text-gray-500 mb-2 flex items-center gap-2 text-sm font-medium">
            <Award size={16} /> Avg Health Score
          </div>
          <div className="text-3xl font-bold text-textPrimary">
            {isStatsLoading ? <span className="animate-pulse text-gray-700">...</span> : `${stats.avgHealthScore}/100`}
          </div>
        </div>
        
        <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="text-gray-500 mb-2 flex items-center gap-2 text-sm font-medium">
            <Star size={16} /> Favorite Language
          </div>
          <div className="text-3xl font-bold text-textPrimary">
            {isStatsLoading ? <span className="animate-pulse text-gray-700">...</span> : stats.favoriteLanguage}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary">Saved Reports</h2>
        </div>
        
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories..."
            className="w-full bg-background border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-textPrimary placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-textSecondary text-sm p-4 bg-card border border-gray-800 rounded-xl">
          <span className="animate-pulse">Loading saved reports...</span>
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-16 bg-card border border-gray-800 rounded-xl">
          <Box size={32} className="text-gray-700 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-textPrimary">No reports found</h3>
          <p className="text-sm text-textSecondary mt-1">
            {searchQuery ? "Try adjusting your search query." : "Save a repository analysis to see it here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.map(analysis => (
            <div key={analysis._id} className="bg-card border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors flex flex-col group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-textPrimary font-semibold break-all">
                  <Box size={18} className="text-textSecondary shrink-0" />
                  {analysis.repository.fullName}
                </div>
                <button 
                  onClick={() => handleDelete(analysis._id)}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  aria-label="Delete Report"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                {analysis.metadata.language && (
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs font-medium text-textSecondary">
                    {analysis.metadata.language}
                  </span>
                )}
                {analysis.healthScore && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    analysis.healthScore.overall >= 80 ? 'bg-green-500/10 text-green-400' :
                    analysis.healthScore.overall >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    Health: {analysis.healthScore.overall}/100
                  </span>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-800/50 flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 group-hover:text-primary transition-colors cursor-pointer">
                  View Report <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
