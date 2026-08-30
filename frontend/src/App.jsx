import React, { useState, Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import UrlInput from "./components/UrlInput";
import Footer from "./components/Footer";
import { useAnalysis } from "./hooks/useAnalysis";

// Dashboard layout & tab pages — lazy loaded
const DashboardLayout = React.lazy(() => import("./components/layout/DashboardLayout"));
const OverviewPage = React.lazy(() => import("./pages/dashboard/OverviewPage"));
const AISummaryPage = React.lazy(() => import("./pages/dashboard/AISummaryPage"));
const ImprovementsPage = React.lazy(() => import("./pages/dashboard/ImprovementsPage"));
const ActivityPage = React.lazy(() => import("./pages/dashboard/ActivityPage"));
const SingleDashboardPage = React.lazy(() => import("./pages/dashboard/SingleDashboardPage"));
const HistoryModal = React.lazy(() => import("./components/dashboard/HistoryModal"));

// Skeleton for full page suspense
function PageSkeleton() {
  return (
    <div className="p-6 grid gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-card border border-gray-800 rounded-xl p-5 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-1/3 mb-4" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-800 rounded w-5/6" />
            <div className="h-3 bg-gray-800 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Guard: redirect to home if no analysis is in progress
function DashboardGuard({ children }) {
  const { hasStarted } = useAnalysis();
  if (!hasStarted) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const {
    isLoading,
    hasStarted,
    handleAnalyze,
    loadHistoryItem,
    resetAll,
  } = useAnalysis();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigate to dashboard when analysis starts
  useEffect(() => {
    if (hasStarted && location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [hasStarted, navigate, location.pathname]);

  // Wrap handleAnalyze so it also navigates
  const handleAnalyzeAndNavigate = async (url) => {
    await handleAnalyze(url);
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── LANDING / HOME ── */}
        <Route
          path="/"
          element={
            <motion.div
              className="flex flex-col items-center pt-24 pb-32 min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Hero */}
              <div className="flex flex-col items-center w-full max-w-2xl px-4 mb-16 mt-8">
                {/* Logo mark */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                    R
                  </div>
                  <span className="text-2xl font-bold text-textPrimary tracking-tight">RepoLens AI</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-textPrimary mb-4 text-center leading-tight">
                  Understand any repo<br />
                  <span className="text-primary">in under a minute</span>
                </h1>
                <p className="text-base text-textSecondary mb-10 text-center max-w-lg">
                  Paste a GitHub URL and get an AI-generated dashboard — structure, quality, security, and more.
                </p>

                <UrlInput onAnalyze={handleAnalyzeAndNavigate} isLoading={isLoading} mode="hero" />

                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="mt-6 flex items-center gap-2 text-sm text-textSecondary hover:text-textPrimary transition-colors"
                  aria-label="View Analysis History"
                >
                  <Clock size={15} aria-hidden="true" />
                  View Analysis History
                </button>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg px-4 mb-16">
                {[
                  'Repository Overview', 'Repository Metrics', 'Health Score',
                  'Engineering Report', 'Repository Activity', 'Improvement Roadmap',
                  'Export Report'
                ].map((f) => (
                  <span
                    key={f}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-800/60 border border-gray-700 text-textSecondary"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <Footer />
            </motion.div>
          }
        />

        {/* ── DASHBOARD (with sidebar layout) ── */}
        <Route
          path="/dashboard"
          element={
            <DashboardGuard>
              <Suspense fallback={<PageSkeleton />}>
                <DashboardLayout />
              </Suspense>
            </DashboardGuard>
          }
        >
          <Route index element={<Suspense fallback={<PageSkeleton />}><SingleDashboardPage /></Suspense>} />
          
          {/* Removed pages and old tabs — redirect to unified dashboard */}
          <Route path="overview" element={<Navigate to="../" replace />} />
          <Route path="ai-summary" element={<Navigate to="../" replace />} />
          <Route path="improvements" element={<Navigate to="../" replace />} />
          <Route path="activity" element={<Navigate to="../" replace />} />
          <Route path="structure" element={<Navigate to="../" replace />} />
          <Route path="insights" element={<Navigate to="../" replace />} />
          <Route path="dependencies" element={<Navigate to="../" replace />} />
          <Route path="code-quality" element={<Navigate to="../" replace />} />
          <Route path="security" element={<Navigate to="../" replace />} />
          <Route path="learning" element={<Navigate to="../" replace />} />
          <Route path="decision" element={<Navigate to="../" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* History Modal (global) */}
      <Suspense fallback={null}>
        {isHistoryOpen && (
          <HistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onLoadHistory={(item) => {
              loadHistoryItem(item);
              setIsHistoryOpen(false);
              navigate("/dashboard");
            }}
          />
        )}
      </Suspense>
    </AnimatePresence>
  );
}
