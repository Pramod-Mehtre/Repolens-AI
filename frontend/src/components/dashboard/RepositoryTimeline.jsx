import React from 'react';
import { Clock, GitCommit, GitBranch, Calendar } from 'lucide-react';

export default function RepositoryTimeline({ metadata }) {
  if (!metadata) return null;

  const events = [
    {
      title: "Repository Created",
      date: new Date(metadata.createdAt).toLocaleDateString(),
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Latest Activity",
      date: new Date(metadata.pushedAt).toLocaleDateString(),
      icon: GitCommit,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Last Update",
      date: new Date(metadata.updatedAt).toLocaleDateString(),
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-textPrimary font-semibold mb-6">
        <GitBranch size={18} className="text-textSecondary" /> Timeline
      </div>
      
      <div className="relative border-l border-gray-800 ml-3 space-y-6">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-6">
            <div className={`absolute -left-3.5 top-0.5 w-7 h-7 rounded-full flex items-center justify-center ${event.bg}`}>
              <event.icon size={14} className={event.color} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-textPrimary">{event.title}</h4>
              <p className="text-xs text-textSecondary mt-0.5">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
