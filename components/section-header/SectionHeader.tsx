import type { SectionHeaderProps } from './SectionHeader.types.js';
import { SectionHeaderContent } from './parts/SectionHeaderContent.js';

/**
 * A section-intro block: an optional eyebrow above an `<h2>`, with an optional
 * supporting description, aligned as one unit.
 *
 * Distinct from a page Hero (the top-of-page promotional band) and a Masthead
 * (the page-identity band) — this opens a section within a page. The heading is
 * an `<h2>` and the eyebrow a `<p>` on purpose: the header repeats across a page
 * so it never owns the single `<h1>`, and the eyebrow is a visual accent that
 * must not add a phantom level to the document outline. Each optional part
 * collapses cleanly when omitted.
 */
export function SectionHeader({
  eyebrow,
  heading,
  description,
  alignment = 'left',
  className,
}: SectionHeaderProps) {
  return (
    <SectionHeaderContent
      eyebrow={eyebrow}
      heading={heading}
      description={description}
      alignment={alignment}
      className={className}
    />
  );
}
