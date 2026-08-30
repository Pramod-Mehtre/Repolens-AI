import React, { useState } from 'react';
import { Download, FileJson, FileText, File, Cloud } from 'lucide-react';
import { exportAsJSON, exportAsMarkdown, exportAsPDF } from '../../utils/export';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ExportBar({ metadata, analysisContent, healthScore, sections }) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const handleJSON = () => {
    exportAsJSON({ metadata, analysis: analysisContent }, `${metadata?.name || 'repo'}-analysis.json`);
  };

  const handleMarkdown = () => {
    exportAsMarkdown(`# ${metadata?.name || 'Repo'} Analysis\n\n${analysisContent}`, `${metadata?.name || 'repo'}-analysis.md`);
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      toast.error('Please sign in to save analyses');
      return;
    }
    
    setIsSaving(true);
    const toastId = toast.loading('Saving analysis...');
    
    try {
      const res = await fetch('/api/saved-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository: {
            owner: metadata.owner,
            repo: metadata.name,
            fullName: metadata.fullName
          },
          metadata,
          healthScore,
          report: sections // Storing the structured JSON object
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      toast.success('Analysis saved to Workspace', { id: toastId });
    } catch (err) {
      toast.error('Failed to save analysis', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
      <div className="text-sm font-semibold text-textPrimary flex items-center gap-2">
        <Download size={16} /> Export Report
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <button 
            onClick={handleSaveToCloud} 
            disabled={isSaving}
            className="flex items-center gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            <Cloud size={14} /> {isSaving ? 'Saving...' : 'Save to Workspace'}
          </button>
        )}
        <div className="w-px h-6 bg-gray-800 mx-1 hidden sm:block"></div>
        <button onClick={exportAsPDF} className="flex items-center gap-2 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-textPrimary px-3 py-1.5 rounded transition-colors">
          <File size={14} /> PDF
        </button>
        <button onClick={handleMarkdown} className="flex items-center gap-2 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-textPrimary px-3 py-1.5 rounded transition-colors">
          <FileText size={14} /> Markdown
        </button>
        <button onClick={handleJSON} className="flex items-center gap-2 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-textPrimary px-3 py-1.5 rounded transition-colors">
          <FileJson size={14} /> JSON
        </button>
      </div>
    </div>
  );
}
