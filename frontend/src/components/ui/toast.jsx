import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast])
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast])
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const { type, message } = toast

  const icons = {
    success: <CheckCircle className="h-4 w-4" strokeWidth={1.5} />,
    error: <AlertCircle className="h-4 w-4" strokeWidth={1.5} />,
    info: <Info className="h-4 w-4" strokeWidth={1.5} />,
  }

  const styles = {
    success: 'border-green-500/20 bg-card text-green-400',
    error: 'border-red-500/20 bg-card text-red-400',
    info: 'border-primary/20 bg-card text-primary',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border shadow-elegant-hover',
        'animate-in slide-in-from-right duration-base',
        styles[type]
      )}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-medium text-foreground">
        {message}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 rounded-md hover:bg-muted/20 transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </button>
    </div>
  )
}


