import React from 'react';

/**
 * PageContainer — the single source of truth for all dashboard page layout.
 * Every tab page must wrap its content in this component.
 * Do NOT add padding, max-width, or top spacing inside individual pages.
 */
export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`w-full max-w-[1200px] mx-auto py-5 px-4 md:px-8 ${className}`}>
      {children}
    </div>
  );
}
