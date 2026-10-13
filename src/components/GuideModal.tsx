import React from 'react';
import { X, BookOpen, CheckCircle, Info } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="modal-guide-overlay" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div id="modal-guide-container" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Pauta de Parámetros para Fichas de Análisis Judicial</h2>
          </div>
          <button
            id="btn-close-guide"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start space-x-3 text-emerald-900 text-xs sm:text-sm">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Criterios de extracción automática</p>
              <p>
                El modelo de IA procesa textos de sentencias en formato <strong>.pdf</strong>, <strong>.md</strong> o <strong>texto plano</strong> para extraer de forma estructurada los 10 ítems definidos en la tabla oficial de análisis.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 border-r border-slate-200">Ítem</th>
                  <th className="p-3 border-r border-slate-200 w-1/3">Definición</th>
                  <th className="p-3">Ejemplo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">1. Rol</td>
                  <td className="p-3 border-r border-slate-200">Identificación de la causa según el sistema de asignación numérica</td>
                  <td className="p-3 font-mono text-xs">123-2026, RIT 405-2024</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">2. Tribunal</td>
                  <td className="p-3 border-r border-slate-200">Tribunal o juzgado que esté conociendo del caso</td>
                  <td className="p-3">3° Juzgado Civil de Santiago</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">3. Partes</td>
                  <td className="p-3 border-r border-slate-200">Involucrados en el caso (demandante, demandado, querellante, imputado, etc.)</td>
                  <td className="p-3">Demandante: Inversiones Norte S.A.<br />Demandado: Constructora SpA</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">4. Tipo de procedimiento</td>
                  <td className="p-3 border-r border-slate-200">Tipo de juicio o procedimiento procesal</td>
                  <td className="p-3">Juicio ordinario de mayor cuantía</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">5. Hechos</td>
                  <td className="p-3 border-r border-slate-200">
                    Resumen abreviado de los hechos que consideró el tribunal para justificar su decisión. Parte expositiva y probada.
                  </td>
                  <td className="p-3 text-xs italic">Relato de los hechos probados de las partes.</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">6. Razonamientos</td>
                  <td className="p-3 border-r border-slate-200" colSpan={2}>
                    Sintetiza los pasos argumentativos del tribunal diferenciando cuestiones jurídicas y decisiones en 7 sub-elementos:
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-xs">
                      <li><strong>6.1. Hipótesis fáctica sujeto activo:</strong> Relato cronológico o por requisitos normativos del demandante/querellante.</li>
                      <li><strong>6.2. Hipótesis fáctica sujeto pasivo:</strong> Relato cronológico o por requisitos normativos del demandado/imputado.</li>
                      <li><strong>6.3. Hechos pacíficos:</strong> Hechos no controvertidos o convenciones probatorias.</li>
                      <li><strong>6.4. Pruebas rendidas:</strong> Selección de pruebas que benefician o perjudican a las partes.</li>
                      <li><strong>6.5. Valoración de la prueba:</strong> Valoración individual y conjunta (sana crítica, legal, etc.).</li>
                      <li><strong>6.6. Reglas de decisión:</strong> Estándar de prueba aplicable y carga de la prueba.</li>
                      <li><strong>6.7. Prueba irrelevante:</strong> Prueba irrelevante, sobreabundante, inconducente o excluida.</li>
                    </ul>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">7. Decisión</td>
                  <td className="p-3 border-r border-slate-200">Respuesta del tribunal a las cuestiones jurídicas planteadas (términos afirmativos o negativos).</td>
                  <td className="p-3">El demandado no cumplió con el contrato celebrado, causando un perjuicio.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">8. Fallo</td>
                  <td className="p-3 border-r border-slate-200">Decisión de condena o absolución y pronunciamiento sobre lo solicitado por las partes.</td>
                  <td className="p-3">Acoger demanda, condenar al pago de $25.000.000.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">9. Doctrina, normativa y jurisprudencia</td>
                  <td className="p-3 border-r border-slate-200">Leyes, artículos, códigos, autores de doctrina y precedentes judiciales citados.</td>
                  <td className="p-3">Código Civil: arts. 1556, 1558.<br />Doctrina: Ramos Pazos.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200">10. Comentario</td>
                  <td className="p-3 border-r border-slate-200">Breve reseña del caso con sus aspectos relevantes y aplicabilidad en casos similares.</td>
                  <td className="p-3 text-xs italic">Análisis doctrinal y jurisprudencial sobre la relevancia del fallo.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            id="btn-close-guide-footer"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
