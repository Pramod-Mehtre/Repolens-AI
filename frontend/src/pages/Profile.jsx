import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Mail, Calendar, Activity, Star, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    avgHealthScore: 0,
    favoriteLanguage: 'None'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => toast.error('Failed to load profile stats'))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 px-4">
        <User size={48} className="text-gray-700 mb-4" />
        <h2 className="text-2xl font-bold text-textPrimary mb-2">Sign in Required</h2>
        <p className="text-textSecondary text-center max-w-md">
          Please sign in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
        {/* Header Cover Area */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 w-full relative">
          <div className="absolute -bottom-12 left-8 border-4 border-card rounded-full overflow-hidden bg-gray-800">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-24 h-24 object-cover" />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-3xl font-bold text-white bg-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary">{user.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-textSecondary">
                <div className="flex items-center gap-1.5 text-sm">
                  <Mail size={16} />
                  {user.email}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar size={16} />
                  Member since {new Date(user.createdAt).getFullYear()}
                </div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-8">
            <h2 className="text-xl font-bold text-textPrimary mb-6 flex items-center gap-2">
              <Activity className="text-primary" /> Platform Usage
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background border border-gray-800 rounded-xl p-5">
                <div className="text-gray-500 mb-2 flex items-center gap-2 text-sm font-medium">
                  <Box size={16} /> Repositories Analyzed
                </div>
                <div className="text-3xl font-bold text-textPrimary">
                  {isLoading ? <span className="animate-pulse text-gray-700">...</span> : stats.totalAnalyses}
                </div>
              </div>
              
              <div className="bg-background border border-gray-800 rounded-xl p-5">
                <div className="text-gray-500 mb-2 flex items-center gap-2 text-sm font-medium">
                  <Award size={16} /> Avg Health Score
                </div>
                <div className="text-3xl font-bold text-textPrimary">
                  {isLoading ? <span className="animate-pulse text-gray-700">...</span> : `${stats.avgHealthScore}/100`}
                </div>
              </div>
              
              <div className="bg-background border border-gray-800 rounded-xl p-5">
                <div className="text-gray-500 mb-2 flex items-center gap-2 text-sm font-medium">
                  <Star size={16} /> Favorite Language
                </div>
                <div className="text-3xl font-bold text-textPrimary">
                  {isLoading ? <span className="animate-pulse text-gray-700">...</span> : stats.favoriteLanguage}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
