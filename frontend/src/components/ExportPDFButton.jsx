import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

/**
 * Botão of Export PDF
 * 
 * @param {string} endpoint - Endpoint of API (ex: /api/reports/executive-pdf)
 * @param {string} filename - Nome of arquivo (ex: executive-summary.pdf)
 * @param {string} label - Texto of botão
 */
const ExportPDFButton = ({ 
  endpoint, 
  filename = 'relatorio.pdf',
  label = 'Exportar PDF',
  className = '',
  variant = 'primary'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fazer requisição para gerar PDF
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error(`Error gerar PDF: ${response.statusText}`);
      }

      // Converter resposta em blob
      const blob = await response.blob();

      // Criar link of download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`[PDF] ${filename} baixado com sucesso`);
    } catch (err) {
      console.error('[PDF] Error exportar:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVariantClasses = () => {
    const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2';
    
    switch (variant) {
      case 'primary':
        return `${base} bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed`;
      case 'secondary':
        return `${base} bg-card text-card-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed`;
      case 'outline':
        return `${base} border border-primary text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed`;
      default:
        return `${base} bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed`;
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleExport}
        disabled={loading}
        className={`${getVariantClasses()} ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gerando PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExportPDFButton;

