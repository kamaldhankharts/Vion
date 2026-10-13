import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-4">We're sorry, but an unexpected error occurred.</p>
            <pre className="bg-black/50 p-4 rounded-lg text-sm text-gray-400 overflow-auto max-h-48 mb-6">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
