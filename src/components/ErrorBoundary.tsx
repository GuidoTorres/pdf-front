import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

type ErrorBoundaryProps = {
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled UI error:", error, info);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-gray-600 mt-2">
              An unexpected error occurred. Please try refreshing the page. If the problem
              persists, contact support.
            </p>
            <button
              onClick={this.resetError}
              className="mt-6 rounded-md bg-primary px-4 py-2 text-white shadow-sm hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
