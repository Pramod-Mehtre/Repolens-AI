import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, File, ChevronRight, ChevronDown, FolderTree, Search, X
} from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';

function buildTree(paths) {
  const root = { name: 'root', type: 'tree', children: {}, path: '' };
  paths.forEach((item) => {
    const parts = item.path.split('/');
    let current = root;
    parts.forEach((part, index) => {
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: index === parts.length - 1 ? item.type : 'tree',
          children: {},
          path: parts.slice(0, index + 1).join('/'),
          size: index === parts.length - 1 ? item.size : 0,
        };
      }
      current = current.children[part];
    });
  });
  return root;
}

function matchesSearch(node, query) {
  if (!query) return true;
  if (node.name.toLowerCase().includes(query)) return true;
  return Object.values(node.children).some((c) => matchesSearch(c, query));
}

function TreeNode({ node, level = 0, onSelect, selected, searchQuery }) {
  const [isOpen, setIsOpen] = useState(level < 2 || !!searchQuery);
  const hasChildren = Object.keys(node.children).length > 0;
  const isSelected = selected === node.path;

  if (searchQuery && !matchesSearch(node, searchQuery.toLowerCase())) return null;
  if (node.name === 'root') {
    return (
      <div>
        {Object.values(node.children)
          .sort((a, b) => {
            if (a.type === 'tree' && b.type !== 'tree') return -1;
            if (a.type !== 'tree' && b.type === 'tree') return 1;
            return a.name.localeCompare(b.name);
          })
          .map((child) => (
            <TreeNode key={child.path} node={child} level={0} onSelect={onSelect} selected={selected} searchQuery={searchQuery} />
          ))}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer text-sm transition-colors ${
          isSelected
            ? 'bg-primary/15 text-primary'
            : 'hover:bg-gray-800/50 text-textSecondary hover:text-textPrimary'
        }`}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen);
          if (!hasChildren) onSelect(node);
        }}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren ? (
            isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />
          ) : (
            <span className="w-4" />
          )}
        </div>
        {node.type === 'tree' ? (
          <Folder size={14} className="text-blue-400 shrink-0" />
        ) : (
          <File size={13} className="text-gray-500 shrink-0" />
        )}
        <span className={`truncate text-xs ${node.type === 'tree' ? 'font-medium text-textPrimary' : ''}`}>
          {node.name}
        </span>
        {node.size > 0 && (
          <span className="ml-auto text-[10px] text-gray-600 shrink-0">
            {node.size > 1024 ? `${(node.size / 1024).toFixed(1)}KB` : `${node.size}B`}
          </span>
        )}
      </div>
      {hasChildren && isOpen && (
        <div>
          {Object.values(node.children)
            .sort((a, b) => {
              if (a.type === 'tree' && b.type !== 'tree') return -1;
              if (a.type !== 'tree' && b.type === 'tree') return 1;
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <TreeNode key={child.path} node={child} level={level + 1} onSelect={onSelect} selected={selected} searchQuery={searchQuery} />
            ))}
        </div>
      )}
    </div>
  );
}

export default function StructurePage() {
  const { tree, isLoading, hasStarted } = useAnalysis();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const files = Array.isArray(tree)
    ? tree
    : Array.isArray(tree?.tree)
        ? tree.tree
        : [];

  const treeData = useMemo(() => (files.length > 0 ? buildTree(files) : null), [files]);

  if (!hasStarted || (isLoading && files.length === 0)) {
    return <PageContainer><div><SkeletonCard lines={8} /></div></PageContainer>;
  }

  if (files.length === 0) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64 text-textSecondary text-sm">
          No file structure data available.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div>
        <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* File Explorer */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-gray-800 rounded-xl flex flex-col lg:w-80 shrink-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-textPrimary">
              <FolderTree size={15} className="text-textSecondary" />
              Explorer
            </div>
            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">
              {tree.length} files
            </span>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-gray-800">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files…"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-8 pr-8 py-1.5 text-xs text-textPrimary placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-textPrimary"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Tree */}
          <div className="p-2">
            {treeData && (
              <TreeNode
                node={treeData}
                onSelect={setSelectedFile}
                selected={selectedFile?.path}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </motion.div>

        {/* File Detail Panel */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-gray-800 rounded-xl flex-1 flex flex-col"
        >
          {selectedFile ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-800">
                <File size={15} className="text-textSecondary" />
                <span className="text-sm font-medium text-textPrimary">{selectedFile.name}</span>
                <span className="text-xs text-gray-600">{selectedFile.path}</span>
              </div>
              <div className="flex-1 p-5 flex flex-col gap-4">
                <div className="bg-background border border-gray-800 rounded-lg p-4">
                  <div className="text-xs text-textSecondary space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Path</span>
                      <span className="font-mono">{selectedFile.path}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span>{selectedFile.type === 'tree' ? 'Directory' : 'File'}</span>
                    </div>
                    {selectedFile.size > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size</span>
                        <span>{selectedFile.size > 1024 ? `${(selectedFile.size / 1024).toFixed(2)} KB` : `${selectedFile.size} B`}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 text-sm text-textSecondary">
                  <div className="text-xs font-semibold text-primary mb-2">AI Insight</div>
                  Click any file in the explorer to see its metadata. File-level AI explanations are generated during full analysis when the model includes them in the response.
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-textSecondary gap-3">
              <FolderTree size={36} className="text-gray-700" />
              <p className="text-sm">Select a file to view details</p>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
