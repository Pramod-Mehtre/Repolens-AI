import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, FolderTree } from 'lucide-react';

const buildTree = (paths) => {
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
};

const TreeNode = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = Object.keys(node.children).length > 0;
  
  if (node.name === 'root') {
    return (
      <div className="w-full">
        {Object.values(node.children).map((child) => (
          <TreeNode key={child.path} node={child} level={level + 1} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        className={`flex items-center gap-1.5 py-1 px-2 hover:bg-gray-800/50 rounded cursor-pointer text-sm transition-colors`}
        style={{ paddingLeft: `${level * 12}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren ? (
            isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
          ) : (
            <span className="w-4" /> // spacer
          )}
        </div>
        
        {node.type === 'tree' ? (
          <Folder size={14} className="text-blue-400 shrink-0" />
        ) : (
          <File size={14} className="text-gray-400 shrink-0" />
        )}
        
        <span className={`truncate ${node.type === 'tree' ? 'text-textPrimary font-medium' : 'text-textSecondary'}`}>
          {node.name}
        </span>
      </div>

      {hasChildren && isOpen && (
        <div className="flex flex-col">
          {Object.values(node.children)
            // Sort: directories first, then alphabetical
            .sort((a, b) => {
              if (a.type === 'tree' && b.type !== 'tree') return -1;
              if (a.type !== 'tree' && b.type === 'tree') return 1;
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
            <TreeNode key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProjectTree({ tree }) {
  if (!tree || tree.length === 0) return null;

  const treeData = buildTree(tree);

  return (
    <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800/50 pb-3">
        <div className="flex items-center gap-2 text-textPrimary font-semibold">
          <FolderTree size={18} className="text-textSecondary" />
          Project Structure
        </div>
        <div className="text-xs text-textSecondary bg-gray-800 px-2 py-1 rounded">
          {tree.length} files (preview)
        </div>
      </div>
      
      <div className="bg-background border border-gray-800 rounded-lg p-2 max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <TreeNode node={treeData} />
      </div>
    </div>
  );
}
