import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = Number(process.env.PORT) || 3000;

// API Routes
app.post('/api/analyze-sentence', async (req, res) => {
  try {
    const { text, pdfBase64, mimeType, fileName } = req.body;

    if (!text && !pdfBase64) {
      return res.status(400).json({ error: 'Se requiere el texto de la sentencia o un archivo en Base64.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'La clave de API GEMINI_API_KEY no se encuentra configurada en el servidor.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let contents: any;

    if (pdfBase64) {
      // PDF or binary document
      contents = {
        parts: [
          {
            inlineData: {
              data: pdfBase64.replace(/^data:[^;]+;base64,/, ''),
              mimeType: mimeType || 'application/pdf',
            },
          },
          {
            text: `Analiza la sentencia judicial contenida en el documento adjunto y elabora la ficha de análisis completa respondiendo rigurosamente a cada uno de los 10 ítems exigidos. Nombre de archivo: ${fileName || 'sentencia.pdf'}.`
          }
        ]
      };
    } else {
      // Plain text or Markdown
      contents = `Analiza la siguiente sentencia judicial y elabora la ficha de análisis y resumen estructurada según los criterios dados:

${text}`;
    }

    const systemInstruction = `Eres un experto jurista y analista judicial. Tu función es examinar sentencias judiciales (en materias civil, penal, laboral, constitucional, etc.) y extraer o sintetizar rigurosamente una ficha de análisis estructurada en formato JSON.

Debes completar los siguientes 10 campos según las definiciones exactas:
1. rol: Identificación de la causa según el sistema de asignación numérica (ej. 123-2026, RIT 405-2024, C-1234-2024).
2. tribunal: Tribunal o juzgado que conoce del caso (ej. 3° Juzgado Civil de Santiago).
3. partes: Involucrados en el caso expresando sus roles (ej. Demandante: ..., Demandado: ..., Querellante, Imputado, etc.). IMPORTANTE: entrega cada interviniente en su propia línea (separados por un salto de línea simple \\n), en formato "Rol: Nombre completo". No los enumeres en un mismo párrafo separados por comas o punto y coma.
4. tipoProcedimiento: Tipo de procedimiento judicial (ej. Juicio ordinario de mayor cuantía, Procedimiento abreviado, Tutela laboral).
5. hechos: Resumen abreviado de los hechos que consideró el tribunal para justificar su decisión.
6. razonamientos: Objeto con 7 sub-elementos detallados:
   - hipotesisSujetoActivo: Describir la hipótesis fáctica del sujeto activo de la acción bajo la forma de un relato (cronológico o por requisitos normativos).
   - hipotesisSujetoPasivo: Describir la hipótesis fáctica del sujeto pasivo de la acción bajo la forma de un relato.
   IMPORTANTE sobre 6.1 y 6.2: redáctalas de modo que sean directamente comparables punto por punto entre sí (se mostrarán una junto a la otra). Sigue en ambas, en lo posible, el mismo orden de ejes: (a) quién es el sujeto y su rol, (b) qué acción u omisión se le atribuye o qué defensa opone, (c) fundamento jurídico invocado (norma o calificación), (d) consecuencia o pretensión que se solicita. Mantén una extensión similar entre ambas.
   - hechosPacificos: Despejar hechos pacíficos y no controvertidos o convenciones probatorias.
   - pruebasRendidas: Seleccionar las pruebas rendidas que benefician o perjudican al sujeto activo y al sujeto pasivo.
   - valoracionPrueba: Valoración individual y conjunta de la prueba rendida, indicando el sistema de valoración (sana crítica, legal, etc.) y el valor asignado.
   - reglasDecision: Reglas de decisión, estándar de prueba aplicable (ej. más allá de toda duda razonable, preponderancia) y carga de la prueba.
   - pruebaIrrelevante: Indicar si existió prueba irrelevante, sobreabundante o inconducente, además de prueba excluida.
7. decision: Respuesta del tribunal a las cuestiones jurídicas planteadas en términos afirmativos o negativos.
8. fallo: Decisión de condena o absolución y el pronunciamiento que recae sobre todo lo solicitado por las partes.
9. doctrinaNormativaJurisprudencia: Artículos de leyes, códigos y normativa citada (nacional e internacional), referencias a textos de autores/doctrina y sentencias previas.
10. comentario: Breve reseña del caso con sus aspectos relevantes y aplicabilidad en casos similares.

REGLAS DE FORMATO Y PROFUNDIDAD (aplican a todos los campos de texto extenso: hechos, cada subcampo de razonamientos 6.1-6.7, decision, fallo, doctrinaNormativaJurisprudencia y comentario):
- Estructura el contenido en párrafos breves y temáticamente diferenciados, separados por un salto de línea doble (\\n\\n). No entregues un bloque único de texto corrido: si una idea introduce un nuevo hecho, argumento, norma o etapa procesal, ábrela en un párrafo nuevo.
- Evita párrafos de más de 4-5 líneas; si es necesario, divide la idea en varios párrafos cortos conectados lógicamente.
- Profundiza el análisis: no te limites a parafrasear la sentencia. Explica el razonamiento subyacente, conecta los hechos con la calificación jurídica aplicada, identifica expresamente normas y artículos citados (con su numeración exacta cuando estén disponibles), y contextualiza los estándares probatorios o criterios doctrinales invocados.
- En "doctrinaNormativaJurisprudencia", lista cada norma, artículo, autor o sentencia citada en una línea o párrafo separado (usa saltos de línea simples \\n dentro del listado) en vez de una enumeración continua separada solo por comas.
- En "comentario", además de la reseña, señala explícitamente: (a) la relevancia práctica del fallo, (b) posibles líneas de apelación o cuestionamiento si las hubiera, y (c) su aplicabilidad como precedente o referencia en casos similares — cada aspecto en su propio párrafo.

REGLA DE TRAZABILIDAD (deducciones): Si para completar CUALQUIER campo (rol, tribunal, partes, tipoProcedimiento, hechos, cualquier subcampo 6.1-6.7, decision, fallo, doctrinaNormativaJurisprudencia o comentario) el dato no aparece expresamente en el texto de la sentencia y debiste realizar una deducción o inferencia lógica a partir del contexto procesal, antepone al inicio del contenido de ESE campo, en su propio idioma original, el marcador exacto "[DEDUCCIÓN] " (con esas mayúsculas, corchetes y un espacio después) seguido inmediatamente del contenido deducido. Si el dato fue extraído de forma explícita y directa del texto, NO agregues ningún marcador. Usa este marcador únicamente cuando corresponda; no lo agregues por defecto a todos los campos.

Responde ÚNICAMENTE con el objeto JSON válido.`;

    const preferredModel = process.env.GEMINI_MODEL;
    const candidateModels = [
      preferredModel,
      'gemini-3-flash-preview',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-lite-latest',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
    ].filter(Boolean) as string[];
    const uniqueModels = [...new Set(candidateModels)];

    let response: any = null;
    let lastError: any = null;

    for (const modelName of uniqueModels) {
      try {
        console.log(`[IA] Procesando sentencia con modelo: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                rol: { type: Type.STRING, description: 'Identificación numérica de la causa' },
                tribunal: { type: Type.STRING, description: 'Tribunal o juzgado' },
                partes: { type: Type.STRING, description: 'Partes e involucrados' },
                tipoProcedimiento: { type: Type.STRING, description: 'Tipo de procedimiento' },
                hechos: { type: Type.STRING, description: 'Resumen abreviado de hechos probados' },
                razonamientos: {
                  type: Type.OBJECT,
                  properties: {
                    hipotesisSujetoActivo: { type: Type.STRING, description: 'Relato hipótesis sujeto activo (6.1)' },
                    hipotesisSujetoPasivo: { type: Type.STRING, description: 'Relato hipótesis sujeto pasivo (6.2)' },
                    hechosPacificos: { type: Type.STRING, description: 'Hechos no controvertidos o convenciones (6.3)' },
                    pruebasRendidas: { type: Type.STRING, description: 'Selección de pruebas rendidas (6.4)' },
                    valoracionPrueba: { type: Type.STRING, description: 'Valoración de la prueba y sistema aplicado (6.5)' },
                    reglasDecision: { type: Type.STRING, description: 'Estándar de prueba y carga de la prueba (6.6)' },
                    pruebaIrrelevante: { type: Type.STRING, description: 'Prueba irrelevante, sobreabundante o excluida (6.7)' },
                  },
                  required: [
                    'hipotesisSujetoActivo',
                    'hipotesisSujetoPasivo',
                    'hechosPacificos',
                    'pruebasRendidas',
                    'valoracionPrueba',
                    'reglasDecision',
                    'pruebaIrrelevante',
                  ],
                },
                decision: { type: Type.STRING, description: 'Respuesta a las cuestiones jurídicas' },
                fallo: { type: Type.STRING, description: 'Decisión de condena o absolución y pronunciamiento' },
                doctrinaNormativaJurisprudencia: { type: Type.STRING, description: 'Leyes, códigos, doctrina y precedentes' },
                comentario: { type: Type.STRING, description: 'Reseña del caso y aplicabilidad' },
              },
              required: [
                'rol',
                'tribunal',
                'partes',
                'tipoProcedimiento',
                'hechos',
                'razonamientos',
                'decision',
                'fallo',
                'doctrinaNormativaJurisprudencia',
                'comentario',
              ],
            },
          },
        });

        if (response && response.text) {
          console.log(`[IA] Análisis completado con éxito mediante: ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[IA] Aviso: modelo ${modelName} no disponible (${err?.message || err}).`);
        // Pausa breve de 1.5s ante errores 503 para dar tiempo a que se disipe el pico de demanda
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('No se pudo obtener respuesta de ninguno de los modelos disponibles.');
    }

    const jsonText = response.text;
    const fichaData = JSON.parse(jsonText);
    
    return res.json({
      success: true,
      data: {
        id: `ficha-${Date.now()}`,
        createdAt: new Date().toISOString(),
        nombreArchivo: fileName || 'Texto / Markdown directo',
        ...fichaData,
      }
    });

  } catch (error: any) {
    console.error('Error procesando sentencia:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Ocurrió un error inesperado durante el análisis de la sentencia.'
    });
  }
});

// Vite middleware in dev or static serving in production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Análisis Judicial ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

setupServer();