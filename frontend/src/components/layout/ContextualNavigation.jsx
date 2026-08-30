import React from 'react';
import { motion } from 'framer-motion';

export default function ContextualNavigation({ items, activeSection, onNavigate }) {
  return (
    <div className="sticky top-[64px] z-40 bg-[#0B1120]/90 backdrop-blur-md py-4 px-5 flex justify-center">
      <nav className="relative flex items-center gap-1.5 p-1 bg-gray-900/60 rounded-full border border-gray-800/60 shadow-inner overflow-x-auto no-scrollbar">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={(e) => onNavigate(e, id)}
              className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 shrink-0 z-10 focus:outline-none ${
                isActive 
                  ? 'text-blue-400'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-gray-800/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-full shadow-sm z-[-1]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={14} className={`transition-colors duration-300 relative z-10 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
              <span className="hidden sm:inline relative z-10">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
