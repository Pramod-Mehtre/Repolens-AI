import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronRight, Loader2, ExternalLink, Telescope, Clock, ShieldCheck, Download,
  BarChart2, FileText, TrendingUp, Wrench, CheckCircle2
} from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import ContextualNavigation from './ContextualNavigation';
import { SkeletonCard } from '../ui/SkeletonCard';
import PageContainer from '../ui/PageContainer';
import RepoSwitcher from './RepoSwitcher';

/* ─── Header Search Bar ─────────────────────────────────────── */
function HeaderSearch({ onAnalyze, isLoading }) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAnalyze(trimmed);
  };

  // Keyboard shortcut: / or Ctrl+K to focus
  useEffect(() => {
    const handler = (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') inputRef.current?.blur();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full max-w-[520px] h-9 rounded-lg border transition-all duration-200 ${isFocused
          ? 'border-primary/60 bg-background shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'
          : 'border-gray-700/80 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800/60'
        }`}
    >
      <div className="pl-3 flex items-center shrink-0">
        {isLoading
          ? <Loader2 size={15} className="text-textSecondary animate-spin" />
          : <Search size={15} className={`transition-colors ${isFocused ? 'text-primary' : 'text-gray-500'}`} />
        }
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search or paste a GitHub repository..."
        disabled={isLoading}
        autoComplete="off"
        spellCheck={false}
        className="flex-1 bg-transparent border-none text-sm text-textPrimary placeholder:text-gray-500 focus:outline-none focus:ring-0 px-2.5 h-full min-w-0"
      />

      {/* Keyboard hint */}
      {!isFocused && !value && (
        <div className="hidden lg:flex items-center gap-1 pr-2.5 shrink-0">
          <kbd className="text-[10px] text-gray-600 bg-gray-700/50 border border-gray-600/50 rounded px-1.5 py-0.5 font-mono leading-none">/</kbd>
        </div>
      )}

      {/* Analyze button — only show when user has typed */}
      {value.trim() && (
        <motion.button
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          type="submit"
          disabled={isLoading}
          className="mr-1.5 shrink-0 px-3 h-6 text-xs font-semibold bg-primary hover:bg-blue-500 text-white rounded-md transition-colors disabled:opacity-50"
        >
          Analyze
        </motion.button>
      )}
    </form>
  );
}

/* ─── Main DashboardLayout ──────────────────────────────────── */
export default function DashboardLayout() {
  const { metadata, error, isLoading, isStreaming, handleAnalyze, resetAll, loadHistoryItem } = useAnalysis();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const mainRef = useRef(null);

  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'analysis', label: 'Analysis', icon: FileText },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'roadmap', label: 'Roadmap', icon: Wrench },
    { id: 'decision', label: 'Decision', icon: CheckCircle2 },
  ];

  const sectionIds = NAV_ITEMS.map(item => item.id);
  const { activeSection, scrollToSection } = useScrollSpy(sectionIds);

  const HistoryModal = React.lazy(() => import('../dashboard/HistoryModal'));
  const ExportModal = React.lazy(() => import('../dashboard/ExportModal'));

  const handleReturnHome = () => {
    resetAll();
    navigate('/');
  };

  const handleNewAnalyze = (url) => {
    // Smooth scroll to top when starting a new analysis
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    handleAnalyze(url);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ════════════════════════════════════════
          GLOBAL HEADER (Top Layer)
      ════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 h-[64px] bg-[#0B1120]/95 backdrop-blur-xl border-b border-gray-800/80 flex items-center px-5 gap-4 justify-between">
        
        {/* ── LEFT: Logo + Repo Switcher ── */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleReturnHome}
            className="flex items-center gap-2.5 group focus:outline-none mr-2"
            aria-label="Return to Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow shrink-0">
              <Telescope size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-textPrimary tracking-tight hidden lg:block group-hover:text-primary transition-colors">
              RepoLens
            </span>
          </button>

          {metadata && (
            <>
              <div className="w-px h-5 bg-gray-700 shrink-0 hidden sm:block" />
              <RepoSwitcher 
                currentMetadata={metadata} 
                onLoadHistory={(item) => {
                  if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  loadHistoryItem(item);
                  navigate('/dashboard');
                }} 
              />
              
              {/* Streaming status pill */}
              {(isLoading || isStreaming) && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden xl:flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {isLoading ? 'Fetching…' : 'Streaming…'}
                </motion.span>
              )}
            </>
          )}
        </div>

        {/* ── CENTER: Persistent Search ── */}
        <div className="flex-1 flex justify-center px-2 min-w-0 max-w-2xl hidden md:flex">
          <HeaderSearch onAnalyze={handleNewAnalyze} isLoading={isLoading} />
        </div>

        {/* ── RIGHT: Global Actions ── */}
        <div className="flex items-center gap-3 shrink-0">
          {metadata && (
            <>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-textPrimary bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-colors group"
                title="Analysis History"
              >
                <Clock size={14} className="transition-transform group-hover:-translate-y-0.5" />
                <span className="hidden sm:inline">History</span>
              </button>

              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-textPrimary bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-colors group"
                title="Export Report"
              >
                <Download size={14} className="transition-transform group-hover:-translate-y-0.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* ════════════════════════════════════════
          CONTEXTUAL HEADER (Second Layer)
      ════════════════════════════════════════ */}
      {metadata && (
        <ContextualNavigation 
          items={NAV_ITEMS}
          activeSection={activeSection}
          onNavigate={scrollToSection}
        />
      )}

      {/* ════════════════════════════════════════
          BODY: Content Area
      ════════════════════════════════════════ */}
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={typeof window !== 'undefined' ? window.location.pathname : 'dashboard'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="min-h-full"
          >
            <PageContainer>
              <Suspense
                fallback={
                  <div className="grid gap-4">
                    <SkeletonCard lines={4} />
                    <SkeletonCard lines={3} />
                  </div>
                }
              >
                {error && !metadata ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-2xl mx-auto mt-12">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck size={32} className="text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-textPrimary mb-3">Analysis Failed</h3>
                    <p className="text-sm text-textSecondary mb-8 max-w-md mx-auto leading-relaxed">
                      {error.message || "An unexpected error occurred while analyzing the repository."}
                    </p>
                    <button
                      onClick={handleReturnHome}
                      className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Return to Home
                    </button>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-4">
                        <ShieldCheck size={20} className="text-red-400 shrink-0" />
                        <p className="text-sm text-red-200">
                          <strong>AI Analysis Error:</strong> {error.message} Some AI-generated sections may be empty.
                        </p>
                      </div>
                    )}
                    <Outlet />
                  </>
                )}
              </Suspense>
            </PageContainer>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── History Modal ── */}
      <Suspense fallback={null}>
        {isHistoryOpen && (
          <HistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onLoadHistory={(item) => {
              loadHistoryItem(item);
              setIsHistoryOpen(false);
              navigate('/dashboard');
            }}
          />
        )}
      </Suspense>

      {/* ── Export Modal ── */}
      <Suspense fallback={null}>
        {showExport && (
          <ExportModal
            isOpen={showExport}
            onClose={() => setShowExport(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
