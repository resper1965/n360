import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * ErrorBoundary Component
 * Captura erros of React e mostra UI elegante
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
    // Log error para monitoramento
    console.error('ErrorBoundary caught:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Aqui poof enviar para Sentry, LogRocket, etc
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
              {/* Ícone */}
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>

              {/* Título */}
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  Ops! Algo deu errado
                </h2>
                <p className="text-sm text-muted-foreground">
                  Encontramos um erro inesperado. Nossa equipe já foi notificada.
                </p>
              </div>

              {/* Error Message (apenas em development) */}
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

              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                >
                  Tentar Novamente
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Back ao Início
                </Button>
              </div>

              {/* Link of suporte */}
              <p className="text-xs text-muted-foreground">
                Precisa of ajuda?{' '}
                <a 
                  href="mailto:suporte@nsecops.com.br" 
                  className="text-primary hover:underline"
                >
                  Entre em contato
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


