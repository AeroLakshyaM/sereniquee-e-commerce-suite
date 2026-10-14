import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Route-level error boundary. Catches unhandled render errors and shows
 * a friendly recovery UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to the console in development; swap for a real error reporting
    // service (e.g. Sentry) in production.
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-4xl">🕯️</div>
          <h2 className="font-serif text-2xl">Something went wrong</h2>
          <p className="text-muted-foreground max-w-sm">
            An unexpected error occurred. Please try refreshing the page, or go
            back to the home page.
          </p>
          {this.state.error && (
            <p className="text-xs text-destructive font-mono bg-muted px-3 py-1.5 rounded max-w-sm break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleReset}>
              Try again
            </Button>
            <Button onClick={() => (window.location.href = '/')}>
              Go home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

