import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DeductionBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}
    title="Este contenido no aparece expresamente en el texto de la sentencia; fue deducido por la IA a partir del contexto procesal. Se recomienda verificarlo."
  >
    <AlertTriangle className="w-3 h-3" />
    Deducido por IA
  </span>
);