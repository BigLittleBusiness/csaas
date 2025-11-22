import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry)
    if (window.errorReporter) {
      window.errorReporter.captureException(error, {
        extra: errorInfo,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#EF4444]/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Something went wrong</CardTitle>
                  <CardDescription>
                    We encountered an unexpected error. Our team has been notified.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-[#0F172A] text-white p-4 rounded-lg overflow-auto">
                  <p className="font-semibold text-[#14B8A6] mb-2">Error Details:</p>
                  <p className="text-sm font-mono mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[#14B8A6] text-sm">
                        Component Stack
                      </summary>
                      <pre className="text-xs mt-2 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>

              <div className="text-sm text-[#64748B] text-center">
                If this problem persists, please contact support at{' '}
                <a href="mailto:support@upliftcs.com" className="text-[#14B8A6] hover:text-[#0891B2]">
                  support@upliftcs.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
