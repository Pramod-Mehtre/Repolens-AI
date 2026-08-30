import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, FileText, FileJson, Printer,
  Clipboard, ClipboardCheck, File, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  exportAsJSON, exportAsMarkdown, exportAsPDF,
  copyToClipboard, buildMarkdownReport, buildJSONExport
} from '../../utils/export';

const EXPORT_OPTIONS = [
  {
    id: 'pdf',
    label: 'PDF Report',
    description: 'Print or save as PDF via browser print dialog',
    icon: File,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description: 'Full structured report in .md format',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'Machine-readable complete data export',
    icon: FileJson,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    id: 'clipboard',
    label: 'Copy to Clipboard',
    description: 'Copy full Markdown report to clipboard',
    icon: Clipboard,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 'print',
    label: 'Print Report',
    description: 'Open system print dialog',
    icon: Printer,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
];

export default function ExportModal({ isOpen, onClose, metadata, sections, analysisContent, languages, techStack, dependencies, security }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(null);

  const repoName = metadata?.name || 'repository';
  const safeFilename = repoName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

  const handleExport = async (id) => {
    setLoading(id);
    try {
      switch (id) {
        case 'pdf':
        case 'print':
          exportAsPDF();
          toast.success('Print dialog opened');
          break;

        case 'markdown': {
          const md = buildMarkdownReport({ metadata, sections, languages, techStack });
          exportAsMarkdown(md, `${safeFilename}-analysis.md`);
          toast.success('Markdown report downloaded');
          break;
        }

        case 'json': {
          const jsonData = buildJSONExport({ metadata, sections, languages, techStack, dependencies, security });
          exportAsJSON(jsonData, `${safeFilename}-analysis.json`);
          toast.success('JSON report downloaded');
          break;
        }

        case 'clipboard': {
          const md = buildMarkdownReport({ metadata, sections, languages, techStack });
          await copyToClipboard(md);
          setCopied(true);
          toast.success('Copied to clipboard!');
          setTimeout(() => setCopied(false), 3000);
          break;
        }
      }
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none p-4"
          >
            <div
              className="pointer-events-auto w-full max-w-md bg-[#0d1526] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Download size={14} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-textPrimary">Export Report</div>
                    {metadata?.name && (
                      <div className="text-xs text-textSecondary">{metadata.fullName}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-gray-800 transition-colors"
                  aria-label="Close export modal"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Export options */}
              <div className="p-4 space-y-2">
                {EXPORT_OPTIONS.map((opt) => {
                  const Icon = opt.id === 'clipboard' && copied ? ClipboardCheck : opt.icon;
                  const isLoading = loading === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleExport(opt.id)}
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-800 hover:border-gray-700 bg-card hover:bg-gray-800/40 transition-all text-left group disabled:opacity-60"
                      aria-label={opt.label}
                    >
                      <div className={`w-8 h-8 rounded-lg ${opt.bg} border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                        <Icon size={15} className={opt.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-textPrimary">
                          {opt.id === 'clipboard' && copied ? 'Copied!' : opt.label}
                        </div>
                        <div className="text-xs text-textSecondary truncate">{opt.description}</div>
                      </div>
                      {isLoading && (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer note */}
              <div className="px-5 pb-4">
                <p className="text-[11px] text-textSecondary text-center">
                  Reports include all analyzed sections, metrics, and AI insights
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
