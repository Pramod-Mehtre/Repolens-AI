import React, { useState, useEffect } from 'react';
import { Clock, X, Trash2, Search, ArrowRight } from 'lucide-react';
import { getHistory, deleteFromHistory } from '../../services/storage';

function formatDistanceToNow(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes";
  return Math.floor(seconds) + " seconds";
}

export default function HistoryModal({ isOpen, onClose, onLoadHistory }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredHistory = history.filter(h => 
    h.metadata?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (e, fullName) => {
    e.stopPropagation();
    const updated = deleteFromHistory(fullName);
    setHistory(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-background/50">
          <div className="flex items-center gap-2 text-textPrimary font-semibold">
            <Clock size={18} className="text-textSecondary" />
            Analysis History
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded transition-colors text-textSecondary hover:text-textPrimary">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-800 bg-background/30">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search past analyses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-sm text-textPrimary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-textSecondary text-sm">
              {searchTerm ? 'No matching history found.' : 'No previous analyses yet.'}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div 
                key={item.timestamp}
                onClick={() => {
                  onLoadHistory(item);
                  onClose();
                }}
                className="group flex items-start justify-between p-4 bg-background border border-gray-800 hover:border-gray-600 rounded-lg cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                  <div className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 truncate">
                    {item.metadata?.fullName}
                  </div>
                  {item.metadata?.description && (
                    <div className="text-xs text-textSecondary line-clamp-1">
                      {item.metadata.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span>Analyzed {formatDistanceToNow(item.timestamp)} ago</span>
                    <span>•</span>
                    <span>{item.languages ? Object.keys(item.languages)[0] : 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleDelete(e, item.metadata?.fullName)}
                    className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition-colors"
                    title="Delete from history"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="p-1.5 hover:bg-gray-800 text-textSecondary hover:text-textPrimary rounded transition-colors">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
