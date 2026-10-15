# Matriz de Análisis de Sentencias Judiciales mediante Inteligencia Artificial

## 1. Resumen: ¿Qué realiza el modelo? (Objetivo y Alcance)

El sistema actúa como un **asistente pericial y jurista automatizado**. Su propósito es examinar fallos y sentencias judiciales (en materias civil, penal, laboral, de familia o constitucional) y transformar resoluciones extensas y complejas en una **matriz analítica estructurada de 10 dimensiones metodológicas**, alineada con las pautas de análisis de la Academia Judicial y los tribunales superiores de justicia:

1. **Rol / Identificación:** Identificación de la causa según el sistema de asignación numérica (ej. *123-2026*, *RIT 405-2024*, *C-1234-2024*).
2. **Tribunal:** Tribunal o juzgado que conoció y falló el caso (ej. *3° Juzgado Civil de Santiago*, *Tribunal de Juicio Oral en lo Penal de Antofagasta*).
3. **Partes intervinientes:** Individualización de los intervinientes con sus roles procesales (*Demandante*, *Demandado*, *Imputado*, *Víctima*, *Defensa*, *Fiscalía*, etc.).
4. **Tipo de procedimiento:** Calificación formal del juicio (ej. *Juicio ordinario de mayor cuantía*, *Procedimiento abreviado*, *Juicio oral en lo penal*, *Tutela laboral*).
5. **Hechos probados:** Resumen de la plataforma fáctica acreditada que consideró el tribunal para fundamentar su decisión.
6. **Razonamientos judiciales (Desglose analítico en 7 subcriterios):**
   * **6.1 vs 6.2. Comparación de hipótesis fácticas:** Relatos simétricos y comparables punto por punto entre la tesis del sujeto activo (acusación / demanda) y la del sujeto pasivo (defensa / contestación).
   * **6.3. Hechos pacíficos:** Convenciones probatorias o hechos no controvertidos por las partes.
   * **6.4. Selección de pruebas rendidas:** Pruebas documentales, periciales y testimoniales que benefician o perjudican a cada parte.
   * **6.5. Valoración de la prueba:** Sistema de valoración aplicado (sana crítica, prueba legal/tasada) y mérito probatorio asignado por el juzgador.
   * **6.6. Reglas de decisión y estándar probatorio:** Carga de la prueba y estándar de convicción exigido (*"más allá de toda duda razonable"*, *"preponderancia de la evidencia"*, etc.).
   * **6.7. Prueba irrelevante o excluida:** Medios probatorios desestimados por impertinentes, sobreabundantes, inconducentes o ilícitos.
7. **Decisión:** Respuesta formal del tribunal a las cuestiones jurídicas sometidas a su conocimiento (en términos afirmativos o negativos).
8. **Fallo resolutivo:** Parte resolutiva y dispositiva (condena, absolución, acogimiento total o parcial y determinación exacta de penas, indemnizaciones o prestaciones).
9. **Doctrina, normativa y jurisprudencia:** Catálogo detallado de leyes, códigos, tratados internacionales, artículos específicos citados y autores doctrinarios invocados.
10. **Comentario experto:** Relevancia práctica del fallo, posibles líneas de impugnación o recurso y su aplicabilidad como precedente judicial.

---

## 2. ¿De qué manera lo realiza? (Flujo y Metodología Técnica)

El procesamiento sigue un conducto técnico y metodológico riguroso en **5 etapas sucesivas**:

```
[Documento PDF / Texto] 
         ↓
1. Ingesta y limpieza multimodal
         ↓
2. Regla transversal de anonimización (Iniciales)
         ↓
3. Extracción estructurada con Gemini (JSON Schema)
         ↓
4. Trazabilidad de deducciones ([DEDUCCIÓN])
         ↓
5. Maquetación y exportación documental (PDF / Word)
```

### Etapa 1: Ingesta y lectura multimodal
* La aplicación admite sentencias judiciales en formato **PDF** o **texto plano**.
* Si se proporciona un archivo PDF, se procesa directamente en Base64 sin intermediarios destructivos, permitiendo que la red neuronal examine el documento íntegro preservando la fidelidad de los considerandos y citas al pie.

### Etapa 2: Anonimización y protección de datos sensibles
* **Regla estricta de protección:** Todos los nombres de personas naturales particulares (imputados, acusados, víctimas, ofendidos, testigos presenciales o referenciales, peritos privados y familiares) son convertidos obligatoriamente a sus **únicas iniciales en mayúsculas separadas por puntos** (ejemplo: *Marión Estefani Vera Vera* $\rightarrow$ `M.E.V.V.`; *Cristian Alejandro Arellano Muñoz* $\rightarrow$ `C.A.A.M.`).
* **Alcance transversal:** La anonimización se aplica de forma uniforme en **todos los campos de la ficha** (Hechos, Hipótesis 6.1 y 6.2, Pruebas rendidas, Valoración, Decisión y Fallo), impidiendo la divulgación indebida de identidades reservadas o vulnerables.
* **Excepciones garantizadas (conservan su nombre completo):**
  1. Operadores del sistema judicial en ejercicio de funciones públicas: Jueces, magistrados, fiscales del Ministerio Público (ej. *Fiscal Jorge Velozo Correa*), defensores penales públicos o licitados (ej. *defensora pública licitada Catalina Galeas Parada*) y abogados patrocinantes.
  2. Autores y juristas doctrinarios citados en obras y jurisprudencia (ej. *Jean Pierre Matus*, *Hernán Silva Silva*).
  3. Órganos del Estado, personas jurídicas e instituciones públicas o bancarias (*Gendarmería de Chile*, *Carabineros de Chile*, *Instituto de Salud Pública*, *Banco Estado*, etc.).

### Etapa 3: Razonamiento guiado y salidas estructuradas (*Structured Outputs*)
* El modelo se ejecuta sobre el SDK oficial de **Google Gemini** con un esquema forzado (`responseSchema` en JSON estricto). Esto impide alucinaciones estructurales o campos sueltos, garantizando que cada sentencia analizada mantenga exactamente los mismos 10 parámetros uniformes.
* **Orquestador resiliente:** El backend cuenta con un sistema de conmutación automática de modelos (`gemini-3-flash-preview`, `gemini-3.5-flash`, etc.) con pausas inteligentes de descongestión para disipar picos temporales de demanda en los servidores de Google (error 503).

### Etapa 4: Trazabilidad de deducciones procesales
* Cuando un dato metodológico no consta de forma explícita y literal en el texto de la resolución, pero puede desprenderse con certeza lógica a partir del contexto procesal, el sistema antepone obligatoriamente el marcador exacto `[DEDUCCIÓN]`.
* Esto otorga completa transparencia al jurista para distinguir los hechos literales de las inferencias analíticas de la IA.

### Etapa 5: Motor de maquetación y exportación documental de alta fidelidad
* **Exportador PDF propio (`exporter.ts`):**
  * **Salto de página continuo por línea:** Cada renglón evalúa la altura restante de la página; si alcanza el margen inferior, salta de hoja automáticamente sin cortar párrafos ni palabras.
  * **Hipótesis fácticas (6.1 y 6.2) a ancho completo:** Ambas hipótesis cuentan con el ancho íntegro de la página y bandas de color institucional (esmeralda para sujeto activo y azul cobalto para sujeto pasivo), permitiendo argumentaciones extensas a través de múltiples páginas.
  * **Resaltado normativo inteligente:** Las leyes, códigos y artículos citados (*artículo 11 N° 9 del Código Penal*, *Ley N° 20.000*) se destacan automáticamente en negrita y color ámbar.
  * **Foliado y membrete institucional:** Paginación formal al pie (*"Página X de Y"*) con línea divisoria y encabezado superior a partir de la página 2.
* **Exportación a Word (`.docx`):** Genera un archivo nativo de Microsoft Word con tablas estructuradas, estilos de título y formatos de párrafo listos para anexar a expedientes judiciales.

### Etapa 6: Persistencia e historial local
* Cada análisis completado se sincroniza automáticamente en el almacenamiento local del navegador (`localStorage`), permitiendo consultar, editar o volver a descargar fichas históricas sin necesidad de reanalizar el documento original.

---

## 3. Accesos y Enlaces del Proyecto

* **Repositorio de código:** [https://github.com/akrasiko/fichas-de-sentencias](https://github.com/akrasiko/fichas-de-sentencias)
* **Aplicación web en la nube (producción 24/7):** [https://fichas-de-sentencias.onrender.com](https://fichas-de-sentencias.onrender.com)
* **Carpeta local del proyecto:** `c:\Users\Alejandra Mera\Documents\analisis-de-sentencias-judiciales`
* **Paquete portátil de respaldo:** `c:\Users\Alejandra Mera\Documents\fichas-de-sentencias-judiciales.zip`
