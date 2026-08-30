import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, Code, Layers, FileText, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to determine the icon for a section
function getSectionIcon(title) {
  const lower = title.toLowerCase();
  if (lower.includes('tech') || lower.includes('stack')) return Code;
  if (lower.includes('arch') || lower.includes('structure')) return Layers;
  if (lower.includes('doc')) return FileText;
  if (lower.includes('suggest') || lower.includes('improve') || lower.includes('recommend')) return Lightbulb;
  return Box;
}

// Reusable Markdown components
const mdComponents = {
  code({node, inline, className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <SyntaxHighlighter
        {...props}
        children={String(children).replace(/\n$/, '')}
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        customStyle={{ background: "transparent", margin: 0, padding: "1rem", borderRadius: "0.5rem" }}
      />
    ) : (
      <code {...props} className={className}>
        {children}
      </code>
    )
  }
};

function CollapsibleSection({ title, content, isStreamingTarget }) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = getSectionIcon(title);
  
  return (
    <div className="bg-card border border-gray-800 rounded-xl shadow-sm mb-4 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-card hover:bg-white/[0.02] transition-colors border-b border-gray-800/0 focus:outline-none"
        style={{ borderBottomWidth: isOpen ? '1px' : '0px' }}
      >
        <div className="flex items-center gap-3 text-textPrimary font-semibold">
          <Icon size={18} className="text-textSecondary" />
          {title || "Analysis"}
        </div>
        <div className="flex items-center gap-3">
          {isStreamingTarget && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
          {isOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 py-4"
          >
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {content}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalysisResult({ content, isStreaming }) {
  const sections = useMemo(() => {
    if (!content) return [];
    
    // Split by Markdown H2 headings: `## ` at the start of a line.
    const regex = /(?=^##\s+|\n##\s+)/;
    const parts = content.split(regex);
    
    return parts.map((part, idx) => {
      const trimmed = part.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('## ')) {
        const firstNewline = trimmed.indexOf('\n');
        if (firstNewline === -1) {
          return { title: trimmed.replace(/^##\s+/, ''), content: "", id: idx };
        }
        const title = trimmed.slice(0, firstNewline).replace(/^##\s+/, '').trim();
        const body = trimmed.slice(firstNewline + 1);
        return { title, content: body, id: idx };
      } else {
        // Fallback for introductory text or H1 headers
        let title = "Overview";
        if (trimmed.startsWith('# ')) {
           const firstNewline = trimmed.indexOf('\n');
           title = firstNewline !== -1 ? trimmed.slice(0, firstNewline).replace(/^#\s+/, '').trim() : trimmed.replace(/^#\s+/, '').trim();
        }
        return { title, content: part, id: idx };
      }
    }).filter(Boolean);
  }, [content]);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {sections.map((section, idx) => {
        const isLast = idx === sections.length - 1;
        return (
          <CollapsibleSection 
            key={section.id} 
            title={section.title} 
            content={section.content} 
            isStreamingTarget={isStreaming && isLast} 
          />
        );
      })}
    </div>
  );
}
