import { useState, useRef } from 'react'
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from './label'

export function FileUpload({ 
  label, 
  accept = '*/*',
  maxSize = 10, // MB
  value,
  onChange,
  disabled = false,
  className 
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFile = (file) => {
    // Validate size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`Arquivo muito grande. Máximo: ${maxSize}MB`)
      return false
    }

    // Validate type
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      const fileType = file.type
      
      const isValid = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase()
        }
        return fileType.match(new RegExp(type.replace('*', '.*')))
      })

      if (!isValid) {
        setError(`Tipo de arquivo não permitido. Aceitos: ${accept}`)
        return false
      }
    }

    setError('')
    return true
  }

  const handleFileChange = (file) => {
    if (!file) return

    if (validateFile(file)) {
      onChange?.(file)
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleRemove = () => {
    onChange?.(null)
    setError('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all duration-base cursor-pointer",
          isDragging && !disabled && "border-primary bg-primary/5",
          !isDragging && !disabled && "border-border/50 hover:border-primary/50 hover:bg-muted/20",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {!value ? (
          // Empty state
          <div className="p-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Upload className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Clique ou arraste o arquivo aqui
              </p>
              <p className="text-xs text-muted-foreground">
                {accept !== '*/*' && `Formatos: ${accept}`}
                {accept !== '*/*' && maxSize && ' • '}
                {maxSize && `Máx: ${maxSize}MB`}
              </p>
            </div>
          </div>
        ) : (
          // File selected
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2 rounded-lg bg-muted/50 border border-border/50">
                <File className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{value.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(value.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                disabled={disabled}
                className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          {error}
        </div>
      )}
    </div>
  )
}

// File upload with preview and upload status
export function FileUploadWithStatus({ 
  label,
  accept,
  maxSize,
  value,
  onChange,
  onUpload,
  uploadStatus = 'idle', // idle, uploading, success, error
  uploadProgress = 0,
  disabled = false,
  className
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <FileUpload
        label={label}
        accept={accept}
        maxSize={maxSize}
        value={value}
        onChange={onChange}
        disabled={disabled || uploadStatus === 'uploading'}
      />

      {uploadStatus === 'uploading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Enviando...</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-base"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          Arquivo enviado com sucesso
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          Erro ao enviar arquivo. Tente novamente.
        </div>
      )}
    </div>
  )
}

