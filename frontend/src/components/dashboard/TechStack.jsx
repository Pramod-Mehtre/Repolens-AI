import React, { memo } from 'react';
import { Code2 } from 'lucide-react';
import PropTypes from 'prop-types';

const TechStack = memo(function TechStack({ stack }) {
  if (!stack || stack.length === 0) return null;

  return (
    <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-textPrimary font-semibold mb-4">
        <Code2 size={18} className="text-textSecondary" aria-hidden="true" /> Tech Stack
      </div>
      <div className="flex flex-wrap gap-2">
        {stack.map((tech, idx) => (
          <span 
            key={idx} 
            className="bg-background border border-gray-800 rounded-md text-xs px-2.5 py-1 text-textPrimary font-medium"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
});

TechStack.propTypes = {
  stack: PropTypes.arrayOf(PropTypes.string),
};

export default TechStack;
