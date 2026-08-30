import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Box, Search, BarChart2, User, Settings as SettingsIcon } from 'lucide-react';
import Footer from '../Footer';
import UrlInput from '../UrlInput';
import { useAnalysis } from '../../hooks/useAnalysis';

export default function SaaSLayout({ children }) {
  const navigate = useNavigate();
  const { resetAll, handleAnalyze, isLoading } = useAnalysis();

  const handleReturnHome = () => {
    resetAll();
    navigate('/');
  };

  const navItems = [
    { name: 'Analyze', path: '/', icon: Search, onClick: handleReturnHome },
    { name: 'Workspace', path: '/workspace', icon: Box },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-gray-800 px-6 py-3 shadow-sm">
        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <button
              className="flex items-center gap-2 cursor-pointer shrink-0 appearance-none bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              onClick={handleReturnHome}
              aria-label="Return to Home"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold" aria-hidden="true">R</div>
              <span className="text-sm font-semibold text-textPrimary tracking-tight hidden sm:block">RepoLens AI</span>
            </button>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) =>
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg text-textSecondary hover:text-textPrimary hover:bg-gray-800 transition-colors"
                  >
                    <item.icon size={16} />
                    {item.name}
                  </button>
                ) : (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'text-textSecondary hover:text-textPrimary hover:bg-gray-800'
                      }`
                    }
                  >
                    <item.icon size={16} />
                    {item.name}
                  </NavLink>
                )
              )}
            </nav>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden lg:block">
            <UrlInput onAnalyze={handleAnalyze} isLoading={isLoading} mode="compact" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto">
        {children}
      </main>

      <Footer />
    </div>
  );
}
