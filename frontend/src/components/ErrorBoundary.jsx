import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production, this would go to Sentry or similar service
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="bg-card border border-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-textPrimary mb-2">Something went wrong</h2>
            <p className="text-textSecondary text-sm mb-6">
              An unexpected error occurred in the application. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors w-full justify-center"
            >
              <RefreshCw size={18} />
              Reload Application
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-900 rounded border border-gray-800 text-left w-full overflow-x-auto text-xs text-red-400 font-mono">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
