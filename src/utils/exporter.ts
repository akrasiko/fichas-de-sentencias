import { FichaAnalisis } from '../types';
import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';
import { stripDeductionMarker, splitByCitations, parsePartesList } from './textAnalysis';

function splitParagraphs(text: string): string[] {
  if (!text) return ['N/A'];
  const normalized = text.replace(/\r\n/g, '\n').trim();
  const parts = normalized.includes('\n\n')
    ? normalized.split(/\n{2,}/)
    : normalized.split(/\n/);
  const paragraphs = parts.map((p) => p.trim()).filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : ['N/A'];
}

function safeFilename(ficha: FichaAnalisis): string {
  return `Ficha_Analisis_${(ficha.rol || 'Sentencia').replace(/[/\\?%*:|"<>]/g, '_')}`;
}

/** Strips the "[DEDUCCIÓN]" marker and annotates the text for Markdown output. */
function mdField(raw: string | undefined): string {
  const { isDeduced, text } = stripDeductionMarker(raw);
  const content = text || 'N/A';
  return isDeduced ? `⚠️ *(Deducción de la IA — verificar)* ${content}` : content;
}

function mdPartesList(raw: string | undefined): string {
  const { isDeduced, text } = stripDeductionMarker(raw);
  const items = parsePartesList(text);
  if (items.length === 0) return 'N/A';
  const prefix = isDeduced ? '⚠️ *(Deducción de la IA — verificar)*<br>' : '';
  return prefix + items.map((item) => `- ${item}`).join('<br>');
}

export function generateMarkdownTable(ficha: FichaAnalisis): string {
  return `# Ficha de Análisis y Resumen de Sentencia Judicial

| Ítem | Definición / Criterio | Contenido Extraído |
| --- | --- | --- |
| **1. Rol** | Identificación de la causa | ${mdField(ficha.rol)} |
| **2. Tribunal** | Tribunal o juzgado que conoció del caso | ${mdField(ficha.tribunal)} |
| **3. Partes** | Involucrados (Demandante, Demandado, Imputado, etc.) | ${mdPartesList(ficha.partes)} |
| **4. Tipo de procedimiento** | Tipo de procedimiento procesal | ${mdField(ficha.tipoProcedimiento)} |
| **5. Hechos** | Resumen abreviado de hechos considerados probados | ${mdField(ficha.hechos)} |
| **6. Razonamientos** | **6.1. Hipótesis fáctica sujeto activo:**<br>${mdField(ficha.razonamientos.hipotesisSujetoActivo)}<br><br>**6.2. Hipótesis fáctica sujeto pasivo:**<br>${mdField(ficha.razonamientos.hipotesisSujetoPasivo)}<br><br>**6.3. Hechos pacíficos/convenciones:**<br>${mdField(ficha.razonamientos.hechosPacificos)}<br><br>**6.4. Pruebas rendidas (pro/contra):**<br>${mdField(ficha.razonamientos.pruebasRendidas)}<br><br>**6.5. Valoración de la prueba:**<br>${mdField(ficha.razonamientos.valoracionPrueba)}<br><br>**6.6. Reglas de decisión y estándar de prueba:**<br>${mdField(ficha.razonamientos.reglasDecision)}<br><br>**6.7. Prueba irrelevante/excluida:**<br>${mdField(ficha.razonamientos.pruebaIrrelevante)} | ${ficha.razonamientos.valoracionPrueba ? 'Ver desglose detallado en la celda' : 'N/A'} |
| **7. Decisión** | Respuesta a las cuestiones jurídicas | ${mdField(ficha.decision)} |
| **8. Fallo** | Decisión de condena, absolución o pronunciamiento | ${mdField(ficha.fallo)} |
| **9. Doctrina, normativa y jurisprudencia** | Leyes, artículos, códigos, doctrina y precedentes | ${mdField(ficha.doctrinaNormativaJurisprudencia)} |
| **10. Comentario** | Reseña del caso y aplicabilidad | ${mdField(ficha.comentario)} |
`;
}

export function generateFullMarkdown(ficha: FichaAnalisis): string {
  const partesItems = parsePartesList(stripDeductionMarker(ficha.partes).text);
  const partesDeduced = stripDeductionMarker(ficha.partes).isDeduced;
  return `# FICHA DE ANÁLISIS DE SENTENCIA JUDICIAL
**Fecha de Análisis:** ${new Date(ficha.createdAt).toLocaleDateString('es-CL')}
**Archivo Origen:** ${ficha.nombreArchivo || 'Texto / Markdown'}

---

## 1. Rol
${mdField(ficha.rol)}

## 2. Tribunal
${mdField(ficha.tribunal)}

## 3. Partes
${partesDeduced ? '⚠️ *(Deducción de la IA — verificar)*\n\n' : ''}${partesItems.map((item) => `- ${item}`).join('\n') || 'N/A'}

## 4. Tipo de procedimiento
${mdField(ficha.tipoProcedimiento)}

## 5. Hechos
${mdField(ficha.hechos)}

## 6. Razonamientos
### 6.1 vs 6.2 — Comparación de Hipótesis Fácticas

| Sujeto Activo (6.1) | Sujeto Pasivo (6.2) |
| --- | --- |
| ${mdField(ficha.razonamientos.hipotesisSujetoActivo).replace(/\n/g, '<br>')} | ${mdField(ficha.razonamientos.hipotesisSujetoPasivo).replace(/\n/g, '<br>')} |

### 6.3 Hechos pacíficos y convenciones probatorias
${mdField(ficha.razonamientos.hechosPacificos)}

### 6.4 Selección de pruebas rendidas
${mdField(ficha.razonamientos.pruebasRendidas)}

### 6.5 Valoración individual y conjunta de la prueba
${mdField(ficha.razonamientos.valoracionPrueba)}

### 6.6 Reglas de decisión, estándar y carga de la prueba
${mdField(ficha.razonamientos.reglasDecision)}

### 6.7 Prueba irrelevante, sobreabundante, inconducente o excluida
${mdField(ficha.razonamientos.pruebaIrrelevante)}

## 7. Decisión
${mdField(ficha.decision)}

## 8. Fallo
${mdField(ficha.fallo)}

## 9. Doctrina, normativa y jurisprudencia
${mdField(ficha.doctrinaNormativaJurisprudencia)}

## 10. Comentario
${mdField(ficha.comentario)}
`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      document.execCommand('copy') ? resolve() : reject(new Error('Copy command failed'));
      textArea.remove();
    });
  }
}

export function downloadFile(content: string, filename: string, type = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface PdfSection {
  numero: string;
  titulo: string;
  contenido: string;
  isDeduced: boolean;
  isPartesList?: boolean;
  color?: [number, number, number];
}

interface ComparisonData {
  activo: DeductionResultLike;
  pasivo: DeductionResultLike;
}

type DeductionResultLike = { isDeduced: boolean; text: string };

function buildComparison(ficha: FichaAnalisis): ComparisonData {
  const r = ficha.razonamientos;
  return {
    activo: stripDeductionMarker(r.hipotesisSujetoActivo),
    pasivo: stripDeductionMarker(r.hipotesisSujetoPasivo),
  };
}

/** Usado por la exportación a Word (.docx) */
function buildSections(ficha: FichaAnalisis): PdfSection[] {
  const r = ficha.razonamientos;
  const field = (raw: string | undefined) => stripDeductionMarker(raw);

  const rol = field(ficha.rol);
  const tribunal = field(ficha.tribunal);
  const partes = field(ficha.partes);
  const tipoProcedimiento = field(ficha.tipoProcedimiento);
  const hechos = field(ficha.hechos);
  const hechosPacificos = field(r.hechosPacificos);
  const pruebasRendidas = field(r.pruebasRendidas);
  const valoracionPrueba = field(r.valoracionPrueba);
  const reglasDecision = field(r.reglasDecision);
  const pruebaIrrelevante = field(r.pruebaIrrelevante);
  const decision = field(ficha.decision);
  const fallo = field(ficha.fallo);
  const doctrina = field(ficha.doctrinaNormativaJurisprudencia);
  const comentario = field(ficha.comentario);

  return [
    { numero: '1', titulo: 'Rol', contenido: rol.text || 'N/A', isDeduced: rol.isDeduced },
    { numero: '2', titulo: 'Tribunal', contenido: tribunal.text || 'N/A', isDeduced: tribunal.isDeduced },
    { numero: '3', titulo: 'Partes', contenido: partes.text || 'N/A', isDeduced: partes.isDeduced, isPartesList: true },
    { numero: '4', titulo: 'Tipo de procedimiento', contenido: tipoProcedimiento.text || 'N/A', isDeduced: tipoProcedimiento.isDeduced },
    { numero: '5', titulo: 'Hechos', contenido: hechos.text || 'N/A', isDeduced: hechos.isDeduced },
    { numero: '6.3', titulo: 'Hechos pacíficos y convenciones probatorias', contenido: hechosPacificos.text || 'N/A', isDeduced: hechosPacificos.isDeduced },
    { numero: '6.4', titulo: 'Selección de pruebas rendidas', contenido: pruebasRendidas.text || 'N/A', isDeduced: pruebasRendidas.isDeduced },
    { numero: '6.5', titulo: 'Valoración individual y conjunta de la prueba', contenido: valoracionPrueba.text || 'N/A', isDeduced: valoracionPrueba.isDeduced },
    { numero: '6.6', titulo: 'Reglas de decisión y estándar de prueba', contenido: reglasDecision.text || 'N/A', isDeduced: reglasDecision.isDeduced },
    { numero: '6.7', titulo: 'Prueba irrelevante, sobreabundante o excluida', contenido: pruebaIrrelevante.text || 'N/A', isDeduced: pruebaIrrelevante.isDeduced },
    { numero: '7', titulo: 'Decisión', contenido: decision.text || 'N/A', isDeduced: decision.isDeduced },
    { numero: '8', titulo: 'Fallo', contenido: fallo.text || 'N/A', isDeduced: fallo.isDeduced },
    { numero: '9', titulo: 'Doctrina, normativa y jurisprudencia', contenido: doctrina.text || 'N/A', isDeduced: doctrina.isDeduced },
    { numero: '10', titulo: 'Comentario', contenido: comentario.text || 'N/A', isDeduced: comentario.isDeduced },
  ];
}

/** Estructura secuencial completa para PDF que garantiza espacio amplio para 6.1 y 6.2 */
function buildPdfSections(ficha: FichaAnalisis): PdfSection[] {
  const r = ficha.razonamientos;
  const field = (raw: string | undefined) => stripDeductionMarker(raw);

  const rol = field(ficha.rol);
  const tribunal = field(ficha.tribunal);
  const partes = field(ficha.partes);
  const tipoProcedimiento = field(ficha.tipoProcedimiento);
  const hechos = field(ficha.hechos);
  const hipotesisSujetoActivo = field(r.hipotesisSujetoActivo);
  const hipotesisSujetoPasivo = field(r.hipotesisSujetoPasivo);
  const hechosPacificos = field(r.hechosPacificos);
  const pruebasRendidas = field(r.pruebasRendidas);
  const valoracionPrueba = field(r.valoracionPrueba);
  const reglasDecision = field(r.reglasDecision);
  const pruebaIrrelevante = field(r.pruebaIrrelevante);
  const decision = field(ficha.decision);
  const fallo = field(ficha.fallo);
  const doctrina = field(ficha.doctrinaNormativaJurisprudencia);
  const comentario = field(ficha.comentario);

  return [
    { numero: '1', titulo: 'Rol', contenido: rol.text || 'N/A', isDeduced: rol.isDeduced },
    { numero: '2', titulo: 'Tribunal', contenido: tribunal.text || 'N/A', isDeduced: tribunal.isDeduced },
    { numero: '3', titulo: 'Partes', contenido: partes.text || 'N/A', isDeduced: partes.isDeduced, isPartesList: true },
    { numero: '4', titulo: 'Tipo de procedimiento', contenido: tipoProcedimiento.text || 'N/A', isDeduced: tipoProcedimiento.isDeduced },
    { numero: '5', titulo: 'Hechos', contenido: hechos.text || 'N/A', isDeduced: hechos.isDeduced },
    { numero: '6.1', titulo: 'Hipótesis fáctica del sujeto activo', contenido: hipotesisSujetoActivo.text || 'N/A', isDeduced: hipotesisSujetoActivo.isDeduced, color: [4, 120, 87] },
    { numero: '6.2', titulo: 'Hipótesis fáctica del sujeto pasivo', contenido: hipotesisSujetoPasivo.text || 'N/A', isDeduced: hipotesisSujetoPasivo.isDeduced, color: [29, 78, 216] },
    { numero: '6.3', titulo: 'Hechos pacíficos y convenciones probatorias', contenido: hechosPacificos.text || 'N/A', isDeduced: hechosPacificos.isDeduced },
    { numero: '6.4', titulo: 'Selección de pruebas rendidas', contenido: pruebasRendidas.text || 'N/A', isDeduced: pruebasRendidas.isDeduced },
    { numero: '6.5', titulo: 'Valoración individual y conjunta de la prueba', contenido: valoracionPrueba.text || 'N/A', isDeduced: valoracionPrueba.isDeduced },
    { numero: '6.6', titulo: 'Reglas de decisión y estándar de prueba', contenido: reglasDecision.text || 'N/A', isDeduced: reglasDecision.isDeduced },
    { numero: '6.7', titulo: 'Prueba irrelevante, sobreabundante o excluida', contenido: pruebaIrrelevante.text || 'N/A', isDeduced: pruebaIrrelevante.isDeduced },
    { numero: '7', titulo: 'Decisión', contenido: decision.text || 'N/A', isDeduced: decision.isDeduced },
    { numero: '8', titulo: 'Fallo', contenido: fallo.text || 'N/A', isDeduced: fallo.isDeduced },
    { numero: '9', titulo: 'Doctrina, normativa y jurisprudencia', contenido: doctrina.text || 'N/A', isDeduced: doctrina.isDeduced },
    { numero: '10', titulo: 'Comentario', contenido: comentario.text || 'N/A', isDeduced: comentario.isDeduced },
  ];
}

interface StyledToken {
  text: string;
  isCitation: boolean;
  width: number;
}

function tokenizeParagraph(text: string, doc: jsPDF): StyledToken[] {
  const segments = splitByCitations(text);
  const tokens: StyledToken[] = [];

  for (const seg of segments) {
    const rawTokens = seg.text.split(/(\s+)/).filter((t) => t !== '');
    for (const rawToken of rawTokens) {
      doc.setFont('helvetica', seg.isCitation ? 'bold' : 'normal');
      doc.setFontSize(10);
      const width = doc.getTextWidth(rawToken);
      tokens.push({
        text: rawToken,
        isCitation: seg.isCitation,
        width,
      });
    }
  }

  return tokens;
}

function tokensToLines(tokens: StyledToken[], maxWidth: number): StyledToken[][] {
  const lines: StyledToken[][] = [];
  let currentLine: StyledToken[] = [];
  let currentLineWidth = 0;

  for (const token of tokens) {
    const isWhitespace = /^\s+$/.test(token.text);

    if (isWhitespace && currentLine.length === 0) {
      continue;
    }

    if (currentLineWidth + token.width <= maxWidth || currentLine.length === 0) {
      currentLine.push(token);
      currentLineWidth += token.width;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      if (isWhitespace) {
        currentLine = [];
        currentLineWidth = 0;
      } else {
        currentLine = [token];
        currentLineWidth = token.width;
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

export function exportToPdf(ficha: FichaAnalisis) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 54;
  const marginTop = 50;
  const marginBottom = 50;
  const maxWidth = pageWidth - marginX * 2;
  const lineHeight = 14;
  let y = marginTop;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
      return true;
    }
    return false;
  };

  const renderLines = (lines: StyledToken[][], xStart: number) => {
    for (const line of lines) {
      checkPageBreak(lineHeight);
      let curX = xStart;
      for (const token of line) {
        doc.setFont('helvetica', token.isCitation ? 'bold' : 'normal');
        doc.setFontSize(10);
        if (token.isCitation) {
          doc.setTextColor(146, 64, 14); // amber-800
        } else {
          doc.setTextColor(30, 41, 59); // slate-800
        }
        doc.text(token.text, curX, y);
        curX += token.width;
      }
      y += lineHeight;
    }
  };

  // Encabezado en Página 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('FICHA DE ANÁLISIS DE SENTENCIA JUDICIAL', marginX, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const metadataText = `Fecha de análisis: ${new Date(ficha.createdAt).toLocaleDateString('es-CL')}   •   Archivo origen: ${ficha.nombreArchivo || 'Texto / Markdown'}`;
  doc.text(metadataText, marginX, y);
  y += 12;

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 20;

  const pdfSections = buildPdfSections(ficha);

  for (const section of pdfSections) {
    // Evitar títulos huérfanos al final de página
    checkPageBreak(45);

    // Título de sección
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const headerColor = section.color || [4, 120, 87];
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.text(`${section.numero}. ${section.titulo}`, marginX, y);
    y += 15;

    // Aviso de deducción si aplica
    if (section.isDeduced) {
      checkPageBreak(18);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text('⚠ Contenido deducido por la IA — no consta expresamente en el texto original. Verificar.', marginX, y);
      y += 13;
    }

    if (section.isPartesList) {
      const items = parsePartesList(section.contenido);
      for (const item of items) {
        checkPageBreak(lineHeight);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(4, 120, 87);
        doc.text('•', marginX + 4, y);

        const itemTokens = tokenizeParagraph(item, doc);
        const itemLines = tokensToLines(itemTokens, maxWidth - 16);
        renderLines(itemLines, marginX + 16);
        y += 3;
      }
      y += 6;
    } else {
      const paragraphs = splitParagraphs(section.contenido);
      for (const paragraph of paragraphs) {
        const tokens = tokenizeParagraph(paragraph, doc);
        const lines = tokensToLines(tokens, maxWidth);
        renderLines(lines, marginX);
        y += 6; // Espaciado entre párrafos
      }
    }

    y += 8; // Espaciado entre secciones
  }

  // Encabezados y pie de página en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Línea divisoria de pie de página
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(marginX, pageHeight - 32, pageWidth - marginX, pageHeight - 32);

    // Texto de pie de página
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    const causaText = ficha.rol ? `Causa Rol: ${ficha.rol}` : 'Ficha de Análisis Judicial';
    doc.text(`Ficha de Análisis Judicial  •  ${causaText}`, marginX, pageHeight - 20);

    const pageStr = `Página ${p} de ${totalPages}`;
    const pageStrW = doc.getTextWidth(pageStr);
    doc.text(pageStr, pageWidth - marginX - pageStrW, pageHeight - 20);

    // Encabezado desde página 2 en adelante
    if (p > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('FICHA DE ANÁLISIS DE SENTENCIA JUDICIAL', marginX, 30);
      if (ficha.rol) {
        const rW = doc.getTextWidth(ficha.rol);
        doc.text(ficha.rol, pageWidth - marginX - rW, 30);
      }
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(marginX, 35, pageWidth - marginX, 35);
    }
  }

  const filename = `${safeFilename(ficha)}.pdf`;
  doc.save(filename);
}

/** Builds TextRun[] for a paragraph, bolding + coloring normative citations. */
function richRuns(text: string): TextRun[] {
  return splitByCitations(text).map(
    (segment) =>
      new TextRun({
        text: segment.text,
        size: 22,
        bold: segment.isCitation,
        color: segment.isCitation ? '92400E' : undefined, // amber-800
      })
  );
}

/** Builds the paragraph(s) for one column of the 6.1 vs 6.2 comparison table. */
function comparisonCellParagraphs(titulo: string, titleColor: string, data: DeductionResultLike): Paragraph[] {
  const paras: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: titulo, bold: true, size: 20, color: titleColor })],
      spacing: { after: 80 },
    }),
  ];
  if (data.isDeduced) {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '⚠ Deducido por la IA — verificar.',
            italics: true,
            size: 16,
            color: 'B45309',
          }),
        ],
        spacing: { after: 60 },
      })
    );
  }
  for (const paragraph of splitParagraphs(data.text || 'N/A')) {
    paras.push(
      new Paragraph({
        children: richRuns(paragraph),
        spacing: { after: 100 },
      })
    );
  }
  return paras;
}

function buildComparisonTable(comparison: ComparisonData): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            shading: { type: ShadingType.CLEAR, fill: 'ECFDF5' }, // emerald-50
            margins: { top: 160, bottom: 160, left: 140, right: 140 },
            children: comparisonCellParagraphs('Sujeto Activo (6.1)', '047857', comparison.activo),
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            shading: { type: ShadingType.CLEAR, fill: 'EFF6FF' }, // blue-50
            margins: { top: 160, bottom: 160, left: 140, right: 140 },
            children: comparisonCellParagraphs('Sujeto Pasivo (6.2)', '1D4ED8', comparison.pasivo),
          }),
        ],
      }),
    ],
  });
}

export async function exportToDocx(ficha: FichaAnalisis) {
  const sections = buildSections(ficha);
  const comparison = buildComparison(ficha);

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      text: 'FICHA DE ANÁLISIS DE SENTENCIA JUDICIAL',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Fecha de análisis: ${new Date(ficha.createdAt).toLocaleDateString('es-CL')}  •  Archivo origen: ${ficha.nombreArchivo || 'N/A'}`,
          italics: true,
          color: '666666',
          size: 18,
        }),
      ],
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 8 },
      },
      spacing: { after: 300 },
    }),
  ];

  for (const section of sections) {
    children.push(
      new Paragraph({
        text: `${section.numero}. ${section.titulo}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
      })
    );

    if (section.isDeduced) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '⚠ Contenido deducido por la IA — no consta expresamente en el texto original. Verificar.',
              italics: true,
              size: 18,
              color: 'B45309', // amber-700
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    if (section.isPartesList) {
      const items = parsePartesList(section.contenido);
      for (const item of items) {
        children.push(
          new Paragraph({
            children: richRuns(item),
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      }
    } else {
      const paragraphs = splitParagraphs(section.contenido);
      for (const paragraph of paragraphs) {
        children.push(
          new Paragraph({
            children: richRuns(paragraph),
            spacing: { after: 160 },
          })
        );
      }
    }

    // 6.1/6.2 render as a dedicated side-by-side table right after "5. Hechos".
    if (section.numero === '5') {
      children.push(
        new Paragraph({
          text: '6.1 vs 6.2 — Comparación de Hipótesis Fácticas',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 200 },
        })
      );
      children.push(buildComparisonTable(comparison));
      children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${safeFilename(ficha)}.docx`);
}