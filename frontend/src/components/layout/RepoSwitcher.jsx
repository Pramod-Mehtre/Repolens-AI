import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, GitBranch, Clock, ExternalLink } from 'lucide-react';
import { getHistory } from '../../services/storage';

export default function RepoSwitcher({ currentMetadata, onLoadHistory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentMetadata) return null;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-gray-800/80 px-3 py-1.5 rounded-lg transition-colors group text-left border border-transparent hover:border-gray-700/50"
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Current Repository</span>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-sm text-textPrimary font-bold truncate max-w-[120px]">
              {currentMetadata.name}
            </span>
            <span className="text-xs text-textSecondary font-medium truncate max-w-[120px]">
              {currentMetadata.fullName}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-[#0B1120] border border-gray-700/80 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/40">
            <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Recently Viewed</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto no-scrollbar">
            {history.length === 0 ? (
              <div className="p-4 text-sm text-center text-gray-500">
                No recent repositories
              </div>
            ) : (
              <ul className="py-1">
                {history.map((item, idx) => {
                  const isCurrent = item.metadata?.fullName === currentMetadata.fullName;
                  return (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          if (!isCurrent) onLoadHistory(item);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                          isCurrent 
                            ? 'bg-blue-500/10 border-l-2 border-blue-500' 
                            : 'hover:bg-gray-800/60 border-l-2 border-transparent'
                        }`}
                      >
                        <GitBranch size={16} className={isCurrent ? 'text-blue-400' : 'text-gray-500'} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${isCurrent ? 'text-blue-400 font-semibold' : 'text-textPrimary'}`}>
                            {item.metadata?.fullName}
                          </div>
                          {item.timestamp && (
                            <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="p-2 border-t border-gray-800 bg-gray-900/40">
             <a
                href={`https://github.com/${currentMetadata.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 text-xs font-medium text-textSecondary hover:text-textPrimary hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
              >
                <ExternalLink size={14} />
                Open on GitHub
              </a>
          </div>
        </div>
      )}
    </div>
  );
}
