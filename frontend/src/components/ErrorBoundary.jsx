import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * ErrorBoundary Component
 * Captures React errors and displays a polished fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error for monitoring
    console.error('ErrorBoundary caught:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Hook into Sentry, LogRocket, etc. here if needed
    // sendToErrorTracking(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon */}
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  Oops! Something went wrong
                </h2>
                <p className="text-sm text-muted-foreground">
                  We hit an unexpected error. Our team has been notified.
                </p>
              </div>

              {/* Error message (development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full rounded-lg bg-muted p-4 text-left">
                  <p className="text-xs font-mono text-destructive">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-medium">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Back to Home
                </Button>
              </div>

              {/* Support link */}
              <p className="text-xs text-muted-foreground">
                Need assistance?{' '}
                <a 
                  href="mailto:suporte@nsecops.com.br" 
                  className="text-primary hover:underline"
                >
                  Contact support
                </a>
              </p>

              {/* Brand */}
              <div className="pt-4 border-t w-full">
                <p className="text-xs text-muted-foreground">
                  ness<span className="text-primary">.</span> | n360 Platform
                </p>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary



