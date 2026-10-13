import React from 'react';
import { splitByCitations } from '../utils/textAnalysis';

interface FormattedTextProps {
  text: string;
  className?: string;
  paragraphClassName?: string;
  highlightCitations?: boolean;
}

/**
 * Splits text into paragraphs on blank lines (or single line breaks as a
 * fallback) and renders each as its own <p>, so content reads as distinct
 * paragraphs instead of one dense block. Optionally highlights normative
 * citations (articles, codes, laws) found within the text.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className = '',
  paragraphClassName = 'mb-2 last:mb-0',
  highlightCitations = true,
}) => {
  if (!text) return null;

  const normalized = text.replace(/\r\n/g, '\n').trim();
  const paragraphs = normalized.includes('\n\n')
    ? normalized.split(/\n{2,}/)
    : normalized.split(/\n/);

  return (
    <div className={className}>
      {paragraphs
        .map((p) => p.trim())
        .filter(Boolean)
        .map((paragraph, idx) => (
          <p key={idx} className={paragraphClassName}>
            {highlightCitations
              ? splitByCitations(paragraph).map((segment, segIdx) =>
                  segment.isCitation ? (
                    <mark
                      key={segIdx}
                      className="bg-amber-100 text-amber-900 rounded px-1 py-0.5 font-semibold not-italic border border-amber-200/80"
                    >
                      {segment.text}
                    </mark>
                  ) : (
                    <React.Fragment key={segIdx}>{segment.text}</React.Fragment>
                  )
                )
              : paragraph}
          </p>
        ))}
    </div>
  );
};