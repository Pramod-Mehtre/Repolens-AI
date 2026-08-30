import { AlertCircle, RefreshCw, Clock, Ban, WifiOff, FileX } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorMessage({ message, errorType, onRetry }) {
  let Icon = AlertCircle;
  let title = "Analysis Failed";

  if (errorType === "NOT_FOUND") {
    Icon = FileX;
    title = "Repository Not Found";
  } else if (errorType === "RATE_LIMIT") {
    Icon = Clock;
    title = "Rate Limit Exceeded";
  } else if (errorType === "FORBIDDEN") {
    Icon = Ban;
    title = "Access Denied";
  } else if (errorType === "NETWORK_ERROR" || errorType === "API_ERROR") {
    Icon = WifiOff;
    title = "Connection Error";
  }

  return (
    <motion.div 
      className="bg-card border border-error/50 rounded-xl p-5 flex flex-col gap-4 shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
          <Icon className="text-error" size={20} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-sm font-semibold text-textPrimary mb-1">{title}</h4>
          <div className="text-sm text-textSecondary leading-relaxed">{message}</div>
          {errorType && (
            <div className="text-xs text-textSecondary/50 font-mono mt-2">
              Error Code: {errorType}
            </div>
          )}
        </div>
      </div>
      
      {onRetry && (
        <div className="pt-4 border-t border-gray-800/50 flex justify-end">
          <button 
            onClick={onRetry}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}
    </motion.div>
  );
}
