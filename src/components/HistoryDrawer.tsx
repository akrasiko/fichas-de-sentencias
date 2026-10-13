import React, { useState } from 'react';
import { FichaAnalisis } from '../types';
import { X, Search, Trash2, ExternalLink, Download, FileText, Scale } from 'lucide-react';
import { generateFullMarkdown, downloadFile } from '../utils/exporter';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedFichas: FichaAnalisis[];
  onSelectFicha: (ficha: FichaAnalisis) => void;
  onDeleteFicha: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedFichas,
  onSelectFicha,
  onDeleteFicha,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredFichas = savedFichas.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.rol.toLowerCase().includes(term) ||
      f.tribunal.toLowerCase().includes(term) ||
      f.partes.toLowerCase().includes(term) ||
      (f.nombreArchivo && f.nombreArchivo.toLowerCase().includes(term))
    );
  });

  return (
    <div id="history-drawer-overlay" className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div id="history-drawer-panel" className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold">Historial de Fichas Guardadas ({savedFichas.length})</h2>
          </div>
          <button
            id="btn-close-history"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por Rol, Tribunal, Partes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredFichas.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {savedFichas.length === 0
                ? 'No hay fichas guardadas aún. Realice un análisis y presione "Guardar en Historial".'
                : 'No se encontraron fichas con los términos ingresados.'}
            </div>
          ) : (
            filteredFichas.map((ficha) => (
              <div
                key={ficha.id}
                className="p-3.5 bg-white rounded-lg border border-slate-200 hover:border-emerald-500 shadow-2xs transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      Rol: {ficha.rol || 'S/N'}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {ficha.tribunal}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ficha.createdAt).toLocaleDateString('es-CL')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2">
                  <strong>Partes:</strong> {ficha.partes}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <button
                    onClick={() => {
                      onSelectFicha(ficha);
                      onClose();
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir Ficha
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        const md = generateFullMarkdown(ficha);
                        downloadFile(md, `Ficha_${ficha.rol || 'Sentencia'}.md`);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                      title="Descargar Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteFicha(ficha.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Eliminar de historial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedFichas.length > 0 && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <button
              onClick={onClearHistory}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar Historial
            </button>
            <span className="text-[11px] text-slate-400">Guardado local</span>
          </div>
        )}
      </div>
    </div>
  );
};
