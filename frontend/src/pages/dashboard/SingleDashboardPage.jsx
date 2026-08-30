import React from 'react';
import OverviewPage from './OverviewPage';
import AISummaryPage from './AISummaryPage';
import ActivityPage from './ActivityPage';
import ImprovementsPage from './ImprovementsPage';
import DecisionPage from './DecisionPage';

export default function SingleDashboardPage() {
  return (
    <div className="flex flex-col gap-10 pb-16 pt-12">
      <section id="overview" className="scroll-mt-32">
        <OverviewPage />
      </section>

      <section id="analysis" className="scroll-mt-32">
        <AISummaryPage />
      </section>

      <section id="insights" className="scroll-mt-32">
        <ActivityPage />
      </section>

      {/* 4. Improvement Roadmap */}
      <section id="roadmap" className="scroll-mt-32 pb-8">
        <ImprovementsPage />
      </section>

      {/* 5. Final Decision Panel */}
      <section id="decision" className="scroll-mt-32 pb-12">
        <DecisionPage />
      </section>
    </div>
  );
}
