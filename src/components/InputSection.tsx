import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, X, Check, FileCode, AlertCircle, RefreshCw } from 'lucide-react';
import { SAMPLE_SENTENCES } from '../data/samples';
import { SampleSentence } from '../types';

interface InputSectionProps {
  onAnalyze: (payload: {
    text?: string;
    pdfBase64?: string;
    mimeType?: string;
    fileName?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'samples'>('upload');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    base64?: string;
    text?: string;
    type: 'pdf' | 'md' | 'txt';
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    const name = file.name.toLowerCase();
    const isPdf = name.endsWith('.pdf');
    const isMd = name.endsWith('.md');
    const isTxt = name.endsWith('.txt');

    if (!isPdf && !isMd && !isTxt) {
      setErrorMsg('Por favor seleccione un archivo con formato válido (.pdf, .md o .txt).');
      return;
    }

    const reader = new FileReader();

    if (isPdf) {
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setSelectedFile({
          file,
          base64,
          type: 'pdf',
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setSelectedFile({
          file,
          text,
          type: isMd ? 'md' : 'txt',
        });
        setInputText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleSentence) => {
    setInputText(sample.content);
    setSelectedFile(null);
    setActiveTab('text');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === 'upload' && selectedFile) {
      if (selectedFile.type === 'pdf' && selectedFile.base64) {
        await onAnalyze({
          pdfBase64: selectedFile.base64,
          mimeType: 'application/pdf',
          fileName: selectedFile.file.name,
        });
      } else if (selectedFile.text) {
        await onAnalyze({
          text: selectedFile.text,
          fileName: selectedFile.file.name,
        });
      }
    } else if (inputText.trim().length > 0) {
      await onAnalyze({
        text: inputText,
        fileName: selectedFile?.file.name || 'Texto de sentencia ingresado',
      });
    } else {
      setErrorMsg('Ingrese el texto de la sentencia judicial o cargue un archivo .pdf / .md.');
    }
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  return (
    <div id="input-section-card" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 pt-3 flex flex-wrap gap-2">
        <button
          id="tab-btn-upload"
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-t border-x ${
            activeTab === 'upload'
              ? 'bg-white text-slate-900 border-slate-200 border-b-white -mb-px'
              : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-emerald-600" />
          Subir Archivo (.pdf, .md, .txt)
        </button>

        <button
          id="tab-btn-text"
          type="button"
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-t border-x ${
            activeTab === 'text'
              ? 'bg-white text-slate-900 border-slate-200 border-b-white -mb-px'
              : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          Pegar / Editar Texto
          {wordCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px]">
              {wordCount} palabras
            </span>
          )}
        </button>

        <button
          id="tab-btn-samples"
          type="button"
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-t border-x ${
            activeTab === 'samples'
              ? 'bg-white text-slate-900 border-slate-200 border-b-white -mb-px'
              : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-amber-600" />
          Casos de Ejemplo (1-Clic)
        </button>
      </div>

      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                id="drop-zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : selectedFile
                    ? 'border-slate-300 bg-slate-50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.md,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      Arrastre y suelte su archivo de sentencia aquí
                    </div>
                    <p className="text-xs text-slate-500">
                      Soporta formatos <strong className="text-slate-700">.PDF</strong>, <strong className="text-slate-700">.MD</strong> (Markdown) y <strong className="text-slate-700">.TXT</strong>
                    </p>
                    <span className="mt-2 inline-flex items-center px-3 py-1 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100">
                      Seleccionar archivo desde equipo
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-2xs max-w-lg mx-auto">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {selectedFile.type}
                      </div>
                      <div className="text-left truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {selectedFile.file.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {(selectedFile.file.size / 1024).toFixed(1)} KB • Listo para procesar
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setInputText('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Quitar archivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TEXT EDITOR */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pegue o redacte el texto completo de la sentencia judicial:</span>
                <span>
                  {charCount.toLocaleString()} caracteres • {wordCount.toLocaleString()} palabras
                </span>
              </div>
              <textarea
                id="sentence-textarea"
                rows={10}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pegue aquí el texto procesal de la sentencia (incluyendo VISTOS, CONSIDERANDO y RESUELVO / FALLO)..."
                className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all leading-relaxed"
              />
            </div>
          )}

          {/* TAB 3: SAMPLES */}
          {activeTab === 'samples' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_SENTENCES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="p-4 border border-slate-200 hover:border-emerald-500 rounded-lg bg-slate-50/50 hover:bg-emerald-50/30 cursor-pointer transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 group-hover:bg-emerald-200 group-hover:text-emerald-900 mb-2">
                      {sample.materia}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 line-clamp-2">
                      {sample.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {sample.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="w-full mt-2 py-1.5 px-3 bg-white group-hover:bg-emerald-600 text-slate-700 group-hover:text-white border border-slate-300 group-hover:border-emerald-600 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    Cargar este Caso
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <div className="text-xs text-slate-500 hidden sm:block">
              Cumple los 10 criterios de análisis de la tabla oficial.
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              {(inputText || selectedFile) && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setSelectedFile(null);
                    setErrorMsg(null);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Limpiar
                </button>
              )}

              <button
                id="btn-analyze-submit"
                type="submit"
                disabled={isLoading || (!selectedFile && !inputText.trim())}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Analizando Sentencia con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Generar Ficha de Análisis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
