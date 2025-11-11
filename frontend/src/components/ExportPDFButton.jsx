import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

/**
 * Export PDF button component.
 *
 * @param {string} endpoint - API endpoint (e.g., /api/reports/executive-pdf)
 * @param {string} filename - Output filename (e.g., executive-summary.pdf)
 * @param {string} label - Button text
 */
const ExportPDFButton = ({ 
  endpoint, 
  filename = 'report.pdf',
  label = 'Export PDF',
  className = '',
  variant = 'primary'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request PDF generation
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error(`Error generating PDF: ${response.statusText}`);
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`[PDF] ${filename} downloaded successfully`);
    } catch (err) {
      console.error('[PDF] Error exporting:', err);
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
            <span>Generating PDF...</span>
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

