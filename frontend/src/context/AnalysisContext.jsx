import React, { createContext, useState, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { analyzeRepo } from '../services/api';
import { parseAnalysisStream } from '../utils/parser';
import { saveToHistory } from '../services/storage';
import toast from 'react-hot-toast';

export const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [metadata, setMetadata] = useState(null);
  const [languages, setLanguages] = useState(null);
  const [techStack, setTechStack] = useState(null);
  const [dependencies, setDependencies] = useState(null);
  const [security, setSecurity] = useState(null);
  const [tree, setTree] = useState(null);
  const [analysisContent, setAnalysisContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  // AbortController ref to cancel ongoing requests
  const abortControllerRef = useRef(null);

  const sections = useMemo(() => parseAnalysisStream(analysisContent), [analysisContent]);

  const resetState = useCallback(() => {
    setMetadata(null);
    setLanguages(null);
    setTechStack(null);
    setDependencies(null);
    setSecurity(null);
    setTree(null);
    setAnalysisContent("");
    setIsStreaming(false);
    setError(null);
    setLoadingStage(0);
  }, []);

  const handleAnalyze = useCallback(
    async (url) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      resetState();
      setIsLoading(true);
      setLoadingStage(0);
      setHasStarted(true);
      
      const toastId = toast.loading('Initializing analysis...');

      await analyzeRepo(url, {
        signal: abortControllerRef.current.signal,
        onMetadata: (meta, langs, stack, deps, sec, treeRaw) => {
          if (abortControllerRef.current?.signal.aborted) return;
          
          setMetadata(meta);
          setLanguages(langs || {});
          setTechStack(stack);
          setDependencies(deps);
          setSecurity(sec);
          setTree(treeRaw);
          setLoadingStage(2);
          toast.success('Repository data fetched', { id: toastId });

          setIsLoading(false);
          setIsStreaming(true);
          toast.loading('AI Analysis streaming...', { id: toastId });
        },
        onChunk: (text) => setAnalysisContent((prev) => prev + text),
        onComplete: (finalMetadata, finalContent) => {
          if (abortControllerRef.current?.signal.aborted) return;
          
          setIsLoading(false);
          setIsStreaming(false);
          toast.success('Analysis complete!', { id: toastId });
          
          // Save to history once completed successfully
          // We use the final metadata and content to avoid stale closures
          if (finalMetadata && finalContent) {
            saveToHistory({
              metadata: finalMetadata,
              languages,
              techStack,
              dependencies,
              security,
              tree,
              analysisContent: finalContent
            });
          }
        },
        onError: (errorMsg, errorType) => {
          if (errorType === 'ABORTED' || abortControllerRef.current?.signal.aborted) {
            toast.dismiss(toastId);
            return;
          }

          setIsLoading(false);
          setIsStreaming(false);
          setError({ message: errorMsg, type: errorType });
          
          toast.error(errorMsg, { id: toastId });
        },
      });
    },
    [resetState, languages, techStack, dependencies, security, tree]
  );

  const loadHistoryItem = useCallback((item) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMetadata(item.metadata);
    setLanguages(item.languages);
    setTechStack(item.techStack);
    setDependencies(item.dependencies);
    setSecurity(item.security);
    setTree(item.tree);
    setAnalysisContent(item.analysisContent);
    setLoadingStage(2);
    setIsLoading(false);
    setIsStreaming(false);
    setHasStarted(true);
    setError(null);
    toast.success('History loaded');
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setHasStarted(false);
  }, []);

  const resetAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setHasStarted(false);
    resetState();
  }, [resetState]);

  const value = useMemo(() => ({
    isLoading,
    loadingStage,
    metadata,
    languages,
    techStack,
    dependencies,
    security,
    tree,
    analysisContent,
    isStreaming,
    error,
    hasStarted,
    sections,
    handleAnalyze,
    loadHistoryItem,
    handleRetry,
    resetAll
  }), [
    isLoading, loadingStage, metadata, languages, techStack, dependencies, 
    security, tree, analysisContent, isStreaming, error, hasStarted, sections,
    handleAnalyze, loadHistoryItem, handleRetry, resetAll
  ]);

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

AnalysisProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
