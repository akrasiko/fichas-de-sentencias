import React, { useState, useEffect, useRef } from 'react';
import { FichaAnalisis } from './types';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { FichaResultTable } from './components/FichaResultTable';
import { GuideModal } from './components/GuideModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Scale, Sparkles, AlertCircle, FileCheck, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentFicha, setCurrentFicha] = useState<FichaAnalisis | null>(null);
  const [savedFichas, setSavedFichas] = useState<FichaAnalisis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('judicial_fichas_history');
      if (stored) {
        setSavedFichas(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error cargando historial de localStorage:', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistoryToStorage = (newHistory: FichaAnalisis[]) => {
    setSavedFichas(newHistory);
    try {
      localStorage.setItem('judicial_fichas_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error guardando historial:', e);
    }
  };

  const handleAnalyze = async (payload: {
    text?: string;
    pdfBase64?: string;
    mimeType?: string;
    fileName?: string;
  }) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze-sentence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Error procesando la sentencia judicial.');
      }

      const nuevaFicha = resData.data;
      setCurrentFicha(nuevaFicha);

      // Guardar automáticamente en el historial para no perder ninguna sentencia analizada
      setSavedFichas((prev) => {
        const sinDuplicados = prev.filter((f) => f.id !== nuevaFicha.id);
        const actualizado = [nuevaFicha, ...sinDuplicados];
        try {
          localStorage.setItem('judicial_fichas_history', JSON.stringify(actualizado));
        } catch (e) {
          console.error('Error guardando automáticamente en historial:', e);
        }
        return actualizado;
      });

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Error en análisis:', err);
      setErrorMsg(err.message || 'No se pudo completar el análisis de la sentencia. Verifique el archivo o clave de API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFicha = (updated: FichaAnalisis) => {
    setCurrentFicha(updated);
    // If it's already in savedFichas, update it there too
    const exists = savedFichas.some((f) => f.id === updated.id);
    if (exists) {
      const updatedList = savedFichas.map((f) => (f.id === updated.id ? updated : f));
      saveHistoryToStorage(updatedList);
    }
  };

  const handleSaveToHistory = (ficha: FichaAnalisis) => {
    const exists = savedFichas.some((f) => f.id === ficha.id);
    if (!exists) {
      const newList = [ficha, ...savedFichas];
      saveHistoryToStorage(newList);
    }
  };

  const handleDeleteFicha = (id: string) => {
    const newList = savedFichas.filter((f) => f.id !== id);
    saveHistoryToStorage(newList);
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Está seguro de que desea borrar todo el historial de fichas guardadas?')) {
      saveHistoryToStorage([]);
    }
  };

  const isCurrentSaved = currentFicha
    ? savedFichas.some((f) => f.id === currentFicha.id)
    : false;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <Header
        savedCount={savedFichas.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              Modelo de Análisis y Resumen Estructurado de Sentencias
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Extraiga de forma automatizada los 10 criterios fundamentales de sentencias judiciales (en formato <strong>.PDF</strong> o <strong>.MD</strong>). Desglosa detalladamente hechos, razonamientos (6.1 al 6.7), decisión, fallo y doctrina conforme a las pautas procesales.
            </p>
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow transition-colors shrink-0 flex items-center justify-center gap-1.5"
          >
            <FileCheck className="w-4 h-4" />
            Ver Tabla de Parámetros
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error al procesar la sentencia</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Input Form Section */}
        <InputSection onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* Result Table Section */}
        <div ref={resultRef}>
          {currentFicha && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Resultado del Análisis Judicial
                </span>
                <span className="text-xs text-slate-500">
                  Generado el {new Date(currentFicha.createdAt).toLocaleDateString('es-CL')}
                </span>
              </div>

              <FichaResultTable
                ficha={currentFicha}
                onUpdateFicha={handleUpdateFicha}
                onSaveToHistory={handleSaveToHistory}
                isSaved={isCurrentSaved}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sistema de Fichas de Análisis y Resumen de Sentencias Judiciales</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Pauta de Criterios Judiciales • Procesamiento con Inteligencia Artificial Gemini
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedFichas={savedFichas}
        onSelectFicha={(f) => {
          setCurrentFicha(f);
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onDeleteFicha={handleDeleteFicha}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
