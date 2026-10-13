import React from 'react';
import { Scale, BookOpen, History, Sparkles, FileText } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenHistory,
  onOpenGuide,
}) => {
  return (
    <header id="header-main" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div id="header-brand" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-400/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              Análisis de Sentencias Judiciales
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IA Judicial
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Generador de fichas analíticas según la pauta de la Academia Judicial
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div id="header-actions" className="flex items-center space-x-2">
          <button
            id="btn-open-guide"
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors"
            title="Ver pauta e instrucciones"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Guía de Parámetros</span>
          </button>

          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Ver fichas guardadas"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Historial</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
