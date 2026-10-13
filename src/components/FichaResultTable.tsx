import React, { useMemo, useState } from 'react';
import {
  FichaAnalisis,
  RazonamientosDetalle
} from '../types';
import {
  Copy,
  Check,
  Download,
  Edit3,
  Save,
  Printer,
  ChevronDown,
  ChevronUp,
  Scale,
  Sparkles,
  FileText,
  Share2,
  Trash2
} from 'lucide-react';
import {
  generateMarkdownTable,
  generateFullMarkdown,
  copyToClipboard,
  downloadFile,
  exportToPdf,
  exportToDocx
} from '../utils/exporter';
import { FormattedText } from './FormattedText';
import { DeductionBadge } from './DeductionBadge';
import { stripDeductionMarker, parsePartesList } from '../utils/textAnalysis';

interface FichaResultTableProps {
  ficha: FichaAnalisis;
  onUpdateFicha: (updated: FichaAnalisis) => void;
  onSaveToHistory: (ficha: FichaAnalisis) => void;
  isSaved: boolean;
}

export const FichaResultTable: React.FC<FichaResultTableProps> = ({
  ficha,
  onUpdateFicha,
  onSaveToHistory,
  isSaved,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<FichaAnalisis>(ficha);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRazonamientosExpanded, setIsRazonamientosExpanded] = useState(true);

  // Synchronize when prop changes
  React.useEffect(() => {
    setEditedData(ficha);
  }, [ficha]);

  const handleCopySection = async (key: string, text: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyFullTableMarkdown = async () => {
    const md = generateMarkdownTable(editedData);
    await copyToClipboard(md);
    setCopiedKey('full-table');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateFullMarkdown(editedData);
    const filename = `Ficha_Analisis_${editedData.rol.replace(/[/\\?%*:|"<>]/g, '_') || 'Sentencia'}.md`;
    downloadFile(md, filename);
  };

  const handleDownloadPdf = () => {
    exportToPdf(editedData);
  };

  const handleDownloadDocx = () => {
    exportToDocx(editedData);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveEdits = () => {
    onUpdateFicha(editedData);
    setIsEditing(false);
  };

  const updateField = (field: keyof FichaAnalisis, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateRazonamiento = (subField: keyof RazonamientosDetalle, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      razonamientos: {
        ...prev.razonamientos,
        [subField]: value,
      },
    }));
  };

  // Strip the "[DEDUCCIÓN]" marker from every displayed field so the badge
  // can be shown separately instead of the raw marker text.
  const clean = useMemo(() => {
    const r = editedData.razonamientos;
    return {
      rol: stripDeductionMarker(editedData.rol),
      tribunal: stripDeductionMarker(editedData.tribunal),
      partes: stripDeductionMarker(editedData.partes),
      tipoProcedimiento: stripDeductionMarker(editedData.tipoProcedimiento),
      hechos: stripDeductionMarker(editedData.hechos),
      decision: stripDeductionMarker(editedData.decision),
      fallo: stripDeductionMarker(editedData.fallo),
      doctrinaNormativaJurisprudencia: stripDeductionMarker(editedData.doctrinaNormativaJurisprudencia),
      comentario: stripDeductionMarker(editedData.comentario),
      razonamientos: {
        hipotesisSujetoActivo: stripDeductionMarker(r.hipotesisSujetoActivo),
        hipotesisSujetoPasivo: stripDeductionMarker(r.hipotesisSujetoPasivo),
        hechosPacificos: stripDeductionMarker(r.hechosPacificos),
        pruebasRendidas: stripDeductionMarker(r.pruebasRendidas),
        valoracionPrueba: stripDeductionMarker(r.valoracionPrueba),
        reglasDecision: stripDeductionMarker(r.reglasDecision),
        pruebaIrrelevante: stripDeductionMarker(r.pruebaIrrelevante),
      },
    };
  }, [editedData]);

  return (
    <div id="ficha-result-container" className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden print:shadow-none print:border-none">
      {/* Table Toolbar Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Ficha de Análisis y Resumen de Sentencia
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                Rol: {editedData.rol || 'Sin Rol'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {editedData.tribunal} • {editedData.nombreArchivo}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <button
              id="btn-save-edits"
              onClick={handleSaveEdits}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar Cambios
            </button>
          ) : (
            <button
              id="btn-toggle-edit"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              Editar Ficha
            </button>
          )}

          <button
            id="btn-save-history"
            onClick={() => onSaveToHistory(editedData)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              isSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${isSaved ? 'text-amber-400' : 'text-slate-400'}`} />
            {isSaved ? 'Guardado en Historial' : 'Guardar en Historial'}
          </button>

          <button
            id="btn-copy-table-md"
            onClick={handleCopyFullTableMarkdown}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Copiar tabla completa en formato Markdown"
          >
            {copiedKey === 'full-table' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{copiedKey === 'full-table' ? '¡Tabla Copiada!' : 'Copiar Tabla Markdown'}</span>
          </button>

          <button
            id="btn-download-md"
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            .MD
          </button>

          <button
            id="btn-download-pdf"
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Exportar ficha completa a PDF"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>

          <button
            id="btn-download-docx"
            onClick={handleDownloadDocx}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Exportar ficha completa a Word (.docx)"
          >
            <Download className="w-3.5 h-3.5" />
            Word
          </button>

          <button
            id="btn-print"
            onClick={handlePrint}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
              <th className="p-3.5 w-14 border-r border-slate-200 text-center">Ítem</th>
              <th className="p-3.5 w-1/4 sm:w-1/5 border-r border-slate-200">Definición</th>
              <th className="p-3.5">Contenido Extraído de la Sentencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {/* 1. ROL */}
            <tr className="hover:bg-slate-50/80 transition-colors">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                1
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900">
                <span className="font-bold block">Rol</span>
                <span className="text-xs text-slate-500 font-normal">
                  Identificación de la causa según el sistema de asignación numérica
                </span>
              </td>
              <td className="p-3.5 relative group">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.rol}
                    onChange={(e) => updateField('rol', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                        {clean.rol.text || 'No especificado'}
                      </span>
                      {clean.rol.isDeduced && <DeductionBadge />}
                    </div>
                    <button
                      onClick={() => handleCopySection('rol', editedData.rol)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity"
                      title="Copiar"
                    >
                      {copiedKey === 'rol' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* 2. TRIBUNAL */}
            <tr className="hover:bg-slate-50/80 transition-colors">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                2
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900">
                <span className="font-bold block">Tribunal</span>
                <span className="text-xs text-slate-500 font-normal">
                  Tribunal o juzgado que esté conociendo del caso
                </span>
              </td>
              <td className="p-3.5 relative group">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.tribunal}
                    onChange={(e) => updateField('tribunal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">
                        {clean.tribunal.text || 'No especificado'}
                      </span>
                      {clean.tribunal.isDeduced && <DeductionBadge />}
                    </div>
                    <button
                      onClick={() => handleCopySection('tribunal', editedData.tribunal)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity"
                    >
                      {copiedKey === 'tribunal' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* 3. PARTES */}
            <tr className="hover:bg-slate-50/80 transition-colors">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                3
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold block">Partes</span>
                  {clean.partes.isDeduced && <DeductionBadge />}
                </div>
                <span className="text-xs text-slate-500 font-normal">
                  Involucrados en el caso (demandante, demandado, querellante, imputado, etc.)
                </span>
              </td>
              <td className="p-3.5 relative group">
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editedData.partes}
                    onChange={(e) => updateField('partes', e.target.value)}
                    placeholder={'Un interviniente por línea, ej:\nDemandante: Juan Pérez\nDemandado: María López'}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <ul className="text-slate-800 leading-relaxed font-medium space-y-1.5 list-none">
                      {parsePartesList(clean.partes.text).map((item, idx) => {
                        const [role, ...rest] = item.split(':');
                        const hasRole = rest.length > 0;
                        return (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>
                              {hasRole ? (
                                <>
                                  <span className="font-bold text-emerald-800">{role.trim()}:</span>
                                  <span> {rest.join(':').trim()}</span>
                                </>
                              ) : (
                                item
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      onClick={() => handleCopySection('partes', editedData.partes)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity"
                    >
                      {copiedKey === 'partes' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* 4. TIPO DE PROCEDIMIENTO */}
            <tr className="hover:bg-slate-50/80 transition-colors">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                4
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900">
                <span className="font-bold block">Tipo de procedimiento</span>
                <span className="text-xs text-slate-500 font-normal">
                  Procedimiento de la causa
                </span>
              </td>
              <td className="p-3.5 relative group">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.tipoProcedimiento}
                    onChange={(e) => updateField('tipoProcedimiento', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 font-semibold rounded text-xs border border-slate-200">
                        {clean.tipoProcedimiento.text || 'No especificado'}
                      </span>
                      {clean.tipoProcedimiento.isDeduced && <DeductionBadge />}
                    </div>
                    <button
                      onClick={() => handleCopySection('tipoProcedimiento', editedData.tipoProcedimiento)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity"
                    >
                      {copiedKey === 'tipoProcedimiento' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* 5. HECHOS */}
            <tr className="hover:bg-slate-50/80 transition-colors">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                5
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold block">Hechos</span>
                  {clean.hechos.isDeduced && <DeductionBadge />}
                </div>
                <span className="text-xs text-slate-500 font-normal leading-normal block mt-1">
                  Resumen abreviado de los hechos que consideró el tribunal para justificar su decisión. Parte expositiva.
                </span>
              </td>
              <td className="p-3.5 relative group">
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editedData.hechos}
                    onChange={(e) => updateField('hechos', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <FormattedText
                      text={clean.hechos.text}
                      className="text-slate-800 leading-relaxed"
                    />
                    <button
                      onClick={() => handleCopySection('hechos', editedData.hechos)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity shrink-0 ml-2"
                    >
                      {copiedKey === 'hechos' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* 6. RAZONAMIENTOS (DESGLOSE 6.1 A 6.7) */}
            <tr className="bg-slate-50/90 border-t-2 border-slate-300">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 align-top">
                6
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900 align-top">
                <div className="flex items-center justify-between">
                  <span className="font-bold block text-sm">Razonamientos</span>
                  <button
                    onClick={() => setIsRazonamientosExpanded(!isRazonamientosExpanded)}
                    className="text-slate-500 hover:text-slate-900 p-1 print:hidden"
                  >
                    {isRazonamientosExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-normal leading-relaxed block mt-1">
                  Sintetiza los pasos argumentativos del tribunal diferenciando cuestiones jurídicas y decisiones.
                </span>
              </td>
              <td className="p-3.5">
                {isRazonamientosExpanded && (
                  <div className="space-y-3">
                    {/* 6.1 vs 6.2 — Comparación de hipótesis fácticas */}
                    <div className="rounded-lg border border-slate-300 overflow-hidden shadow-2xs">
                      <div className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wide px-4 py-3 leading-relaxed">
                        6.1 vs 6.2 — Comparación de Hipótesis Fácticas
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                        {/* 6.1 */}
                        <div className="p-3 bg-emerald-50/40">
                          <div className="flex items-center justify-between font-bold text-xs text-emerald-800 mb-1.5">
                            <span className="flex items-center gap-1.5 flex-wrap">
                              6.1 Sujeto Activo
                              {clean.razonamientos.hipotesisSujetoActivo.isDeduced && <DeductionBadge />}
                            </span>
                            {!isEditing && (
                              <button
                                onClick={() => handleCopySection('6.1', editedData.razonamientos.hipotesisSujetoActivo)}
                                className="text-slate-400 hover:text-slate-700"
                              >
                                {copiedKey === '6.1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <textarea
                              rows={4}
                              value={editedData.razonamientos.hipotesisSujetoActivo}
                              onChange={(e) => updateRazonamiento('hipotesisSujetoActivo', e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded text-xs"
                            />
                          ) : (
                            <FormattedText
                              text={clean.razonamientos.hipotesisSujetoActivo.text}
                              className="text-xs text-slate-700 leading-relaxed"
                            />
                          )}
                        </div>

                        {/* 6.2 */}
                        <div className="p-3 bg-blue-50/40">
                          <div className="flex items-center justify-between font-bold text-xs text-blue-800 mb-1.5">
                            <span className="flex items-center gap-1.5 flex-wrap">
                              6.2 Sujeto Pasivo
                              {clean.razonamientos.hipotesisSujetoPasivo.isDeduced && <DeductionBadge />}
                            </span>
                            {!isEditing && (
                              <button
                                onClick={() => handleCopySection('6.2', editedData.razonamientos.hipotesisSujetoPasivo)}
                                className="text-slate-400 hover:text-slate-700"
                              >
                                {copiedKey === '6.2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <textarea
                              rows={4}
                              value={editedData.razonamientos.hipotesisSujetoPasivo}
                              onChange={(e) => updateRazonamiento('hipotesisSujetoPasivo', e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded text-xs"
                            />
                          ) : (
                            <FormattedText
                              text={clean.razonamientos.hipotesisSujetoPasivo.text}
                              className="text-xs text-slate-700 leading-relaxed"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 6.3 */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-xs text-slate-800 mb-1">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          6.3 Hechos pacíficos, no controvertidos o convenciones probatorias
                          {clean.razonamientos.hechosPacificos.isDeduced && <DeductionBadge />}
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleCopySection('6.3', editedData.razonamientos.hechosPacificos)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {copiedKey === '6.3' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editedData.razonamientos.hechosPacificos}
                          onChange={(e) => updateRazonamiento('hechosPacificos', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <FormattedText
                          text={clean.razonamientos.hechosPacificos.text}
                          className="text-xs text-slate-700 leading-relaxed"
                        />
                      )}
                    </div>

                    {/* 6.4 */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-xs text-slate-800 mb-1">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          6.4 Selección de pruebas rendidas (beneficio o perjuicio de las partes)
                          {clean.razonamientos.pruebasRendidas.isDeduced && <DeductionBadge />}
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleCopySection('6.4', editedData.razonamientos.pruebasRendidas)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {copiedKey === '6.4' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editedData.razonamientos.pruebasRendidas}
                          onChange={(e) => updateRazonamiento('pruebasRendidas', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <FormattedText
                          text={clean.razonamientos.pruebasRendidas.text}
                          className="text-xs text-slate-700 leading-relaxed"
                        />
                      )}
                    </div>

                    {/* 6.5 */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-xs text-slate-800 mb-1">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          6.5 Valoración individual y conjunta de la prueba (sistema y valor)
                          {clean.razonamientos.valoracionPrueba.isDeduced && <DeductionBadge />}
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleCopySection('6.5', editedData.razonamientos.valoracionPrueba)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {copiedKey === '6.5' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editedData.razonamientos.valoracionPrueba}
                          onChange={(e) => updateRazonamiento('valoracionPrueba', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <FormattedText
                          text={clean.razonamientos.valoracionPrueba.text}
                          className="text-xs text-slate-700 leading-relaxed"
                        />
                      )}
                    </div>

                    {/* 6.6 */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-xs text-slate-800 mb-1">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          6.6 Reglas de decisión, estándar de prueba aplicable y carga de la prueba
                          {clean.razonamientos.reglasDecision.isDeduced && <DeductionBadge />}
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleCopySection('6.6', editedData.razonamientos.reglasDecision)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {copiedKey === '6.6' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editedData.razonamientos.reglasDecision}
                          onChange={(e) => updateRazonamiento('reglasDecision', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <FormattedText
                          text={clean.razonamientos.reglasDecision.text}
                          className="text-xs text-slate-700 leading-relaxed"
                        />
                      )}
                    </div>

                    {/* 6.7 */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-xs text-slate-800 mb-1">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          6.7 Prueba irrelevante, sobreabundante, inconducente o excluida
                          {clean.razonamientos.pruebaIrrelevante.isDeduced && <DeductionBadge />}
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleCopySection('6.7', editedData.razonamientos.pruebaIrrelevante)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {copiedKey === '6.7' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editedData.razonamientos.pruebaIrrelevante}
                          onChange={(e) => updateRazonamiento('pruebaIrrelevante', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <FormattedText
                          text={clean.razonamientos.pruebaIrrelevante.text}
                          className="text-xs text-slate-700 leading-relaxed"
                        />
                      )}
                    </div>
                  </div>
                )}
              </td>
            </tr>

            {/* 7. DECISIÓN */}
            <tr className="hover:bg-slate-50/80 transition-colors">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                7
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold block">Decisión</span>
                  {clean.decision.isDeduced && <DeductionBadge />}
                </div>
                <span className="text-xs text-slate-500 font-normal leading-normal block mt-1">
                  Respuesta del tribunal a las cuestiones jurídicas (términos afirmativos o negativos).
                </span>
              </td>
              <td className="p-3.5 relative group">
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editedData.decision}
                    onChange={(e) => updateField('decision', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <FormattedText
                      text={clean.decision.text}
                      className="text-slate-900 font-medium leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200 flex-1"
                    />
                    <button
                      onClick={() => handleCopySection('decision', editedData.decision)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity shrink-0 ml-2"
                    >
                      {copiedKey === 'decision' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* 8. FALLO */}
            <tr className="hover:bg-slate-50/80 transition-colors">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                8
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold block">Fallo</span>
                  {clean.fallo.isDeduced && <DeductionBadge />}
                </div>
                <span className="text-xs text-slate-500 font-normal leading-normal block mt-1">
                  Decisión de condena o absolución y pronunciamiento sobre lo solicitado por las partes.
                </span>
              </td>
              <td className="p-3.5 relative group">
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editedData.fallo}
                    onChange={(e) => updateField('fallo', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <FormattedText
                      text={clean.fallo.text}
                      className="text-slate-900 font-semibold leading-relaxed bg-emerald-50/60 p-3 rounded border border-emerald-200 flex-1"
                    />
                    <button
                      onClick={() => handleCopySection('fallo', editedData.fallo)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity shrink-0 ml-2"
                    >
                      {copiedKey === 'fallo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* 9. DOCTRINA, NORMATIVA Y JURISPRUDENCIA */}
            <tr className="hover:bg-slate-50/80 transition-colors">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                9
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold block">Doctrina, normativa y jurisprudencia</span>
                  {clean.doctrinaNormativaJurisprudencia.isDeduced && <DeductionBadge />}
                </div>
                <span className="text-xs text-slate-500 font-normal leading-normal block mt-1">
                  Leyes, códigos, normativa citada, autores/doctrina y sentencias anteriores.
                </span>
              </td>
              <td className="p-3.5 relative group">
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editedData.doctrinaNormativaJurisprudencia}
                    onChange={(e) => updateField('doctrinaNormativaJurisprudencia', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <FormattedText
                      text={clean.doctrinaNormativaJurisprudencia.text}
                      className="text-slate-800 leading-relaxed font-mono text-xs bg-slate-50 p-2.5 rounded border border-slate-200 flex-1"
                      paragraphClassName="mb-1.5 last:mb-0"
                    />
                    <button
                      onClick={() => handleCopySection('doctrinaNormativaJurisprudencia', editedData.doctrinaNormativaJurisprudencia)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity shrink-0 ml-2"
                    >
                      {copiedKey === 'doctrinaNormativaJurisprudencia' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* 10. COMENTARIO */}
            <tr className="hover:bg-slate-50/80 transition-colors">
              <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                10
              </td>
              <td className="p-3.5 border-r border-slate-200 font-medium text-slate-900">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold block">Comentario</span>
                  {clean.comentario.isDeduced && <DeductionBadge />}
                </div>
                <span className="text-xs text-slate-500 font-normal leading-normal block mt-1">
                  Breve reseña del caso con sus aspectos relevantes y aplicabilidad en casos similares.
                </span>
              </td>
              <td className="p-3.5 relative group">
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editedData.comentario}
                    onChange={(e) => updateField('comentario', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <FormattedText
                      text={clean.comentario.text}
                      className="text-slate-700 italic leading-relaxed flex-1"
                    />
                    <button
                      onClick={() => handleCopySection('comentario', editedData.comentario)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity shrink-0 ml-2"
                    >
                      {copiedKey === 'comentario' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};