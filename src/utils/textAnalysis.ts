/**
 * Marker the AI is instructed (via the system prompt in server.ts) to prepend
 * to any field whose content required an inference/deduction rather than a
 * direct extraction from the sentence text.
 */
export const DEDUCTION_MARKER = '[DEDUCCIÓN]';

export interface DeductionResult {
  isDeduced: boolean;
  text: string;
}

/**
 * Detects and strips the leading deduction marker from a field's raw text.
 */
export function stripDeductionMarker(raw: string | undefined | null): DeductionResult {
  const value = raw || '';
  const trimmed = value.trimStart();
  const upperMarker = DEDUCTION_MARKER.toUpperCase();
  if (trimmed.toUpperCase().startsWith(upperMarker)) {
    return {
      isDeduced: true,
      text: trimmed.slice(DEDUCTION_MARKER.length).trimStart(),
    };
  }
  return { isDeduced: false, text: value };
}

export interface TextSegment {
  text: string;
  isCitation: boolean;
}

/**
 * Heuristic regex covering the most common ways Chilean judicial texts cite
 * normative sources: articles (with inciso/bis/ter, including comma/"y"
 * separated lists like "arts. 15 N° 1, 68, 436 inciso 1° y 439"), codes
 * (spelled out or abbreviated, e.g. "C.P.P."), laws, and the Constitution.
 */
const ARTICLE_NUM_TOKEN =
  '\\d+[°ºª]?(?:\\s*(?:bis|ter|qu[aá]ter))?(?:\\s+inc(?:iso)?\\.?\\s+[°ºª\\w]+)?(?:\\s+N[°ºª]?\\.?\\s*\\d+)?';

// Matches "artículo(s)" (full word) or the abbreviated "art." / "arts."
const ARTICLE_PREFIX = '(?:art[ií]culos?|arts?\\.?)\\s*';

const CITATION_REGEX = new RegExp(
  '\\b(' +
    // Article(s), optionally followed by a comma/"y"-separated list of more numbers.
    `${ARTICLE_PREFIX}${ARTICLE_NUM_TOKEN}(?:\\s*(?:,|y)\\s*${ARTICLE_NUM_TOKEN})*` +
    '|ley\\s+n?[°ºª]?\\.?\\s*[\\d.]+(?:-\\d+)?' +
    '|c[oó]digo\\s+(?:penal|civil|de\\s+procedimiento\\s+civil|procesal\\s+penal|del?\\s+trabajo|de\\s+comercio|tributario|sanitario|de\\s+miner[ií]a|aeron[aá]utico|de\\s+aguas)' +
    '|c\\.?\\s*p\\.?\\s*p\\.?\\b' + // C.P.P. (Código Procesal Penal)
    '|c\\.?\\s*p\\.?\\s*c\\.?\\b' + // C.P.C. (Código de Procedimiento Civil)
    '|constituci[oó]n\\s+pol[ií]tica(?:\\s+de\\s+la\\s+rep[uú]blica)?' +
    '|cpr\\b' +
    ')',
  'gi'
);

// Straight and curly/angled quote pairs used to wrap book/work titles
// (e.g. "Texto y Comentario del Código Penal Chileno"). A code/law name
// mentioned inside one of these is part of a title, not a normative citation.
const QUOTE_PAIR_REGEXES = [/"([^"]*)"/g, /'([^']*)'/g, /“([^”]*)”/g, /‘([^’]*)’/g, /«([^»]*)»/g];

function findQuotedRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const re of QUOTE_PAIR_REGEXES) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      ranges.push([m.index, m.index + m[0].length]);
      if (m[0].length === 0) re.lastIndex++; // avoid infinite loop on empty matches
    }
  }
  return ranges;
}

function isFullyInsideAnyRange(start: number, end: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([rStart, rEnd]) => start >= rStart && end <= rEnd);
}

/**
 * Splits free text into plain / citation segments so callers can render
 * normative references (articles, codes, laws) with distinct styling.
 * Matches that fall entirely within a quoted span (typically a book or
 * article title, e.g. "...del Código Penal Chileno") are treated as plain
 * text rather than citations, since they don't refer to the norm itself.
 */
export function splitByCitations(text: string): TextSegment[] {
  if (!text) return [];
  const quotedRanges = findQuotedRanges(text);
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  CITATION_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = CITATION_REGEX.exec(text)) !== null) {
    const matchEnd = match.index + match[0].length;
    const isCitation = !isFullyInsideAnyRange(match.index, matchEnd, quotedRanges);

    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isCitation: false });
    }
    segments.push({ text: match[0], isCitation });
    lastIndex = matchEnd;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isCitation: false });
  }
  return segments;
}

/**
 * Parses the "partes" field into one entry per interviniente. Prefers line
 * breaks (the format requested from the AI going forward); falls back to
 * splitting on semicolons for legacy single-paragraph output.
 */
export function parsePartesList(text: string): string[] {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, '\n').trim();

  let items = normalized
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length <= 1) {
    items = normalized
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Strip leading list markers ("-", "•", "1.") if the model added them.
  return items.map((item) => item.replace(/^[-•*]\s*|^\d+[.)]\s*/, '').trim());
}