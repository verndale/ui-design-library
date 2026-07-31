import type { ReactNode } from 'react';

export type SectionHeaderAlignment = 'left' | 'center';

export type SectionHeaderProps = {
  /** Optional short accent label above the heading — a visual accent, not an outline level. */
  eyebrow?: ReactNode;
  /**
   * The section heading. Rendered as an `<h2>`: a section header repeats down a
   * page, so it never owns the page's single `<h1>`.
   */
  heading: ReactNode;
  /** Optional supporting copy beneath the heading; accepts inline markup (links follow the Link pattern). */
  description?: ReactNode;
  /** Aligns the eyebrow, heading, and description together as one group. */
  alignment?: SectionHeaderAlignment;
  className?: string;
};

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
  const isCenter = alignment === 'center';
  return (
    <div
      data-component="section-header"
      className={[
        'flex flex-col',
        isCenter ? 'items-center text-center' : 'items-start text-left',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {eyebrow ? (
        <p className="m-0 mb-m text-sm font-semibold uppercase tracking-wide text-text-secondary">{eyebrow}</p>
      ) : null}
      <h2 className="m-0 text-3xl font-bold text-balance text-text-primary">{heading}</h2>
      {description ? (
        <div className="m-0 mt-l max-w-prose text-base text-text-secondary [&_a]:text-link [&_a]:underline [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {description}
        </div>
      ) : null}
    </div>
  );
}
