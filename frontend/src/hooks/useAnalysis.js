import { useContext } from 'react';
import { AnalysisContext } from '../context/AnalysisContext';

/**
 * Custom hook to consume the AnalysisContext
 * Ensures it is used within an AnalysisProvider
 */
export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
