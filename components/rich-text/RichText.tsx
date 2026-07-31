import type { ReactNode } from 'react';

export type RichTextListStyle = 'default' | 'checkmark';

export type RichTextProps = {
  /** The authored content to render — headings, paragraphs, lists, links, inline emphasis. */
  children: ReactNode;
  /** `checkmark` swaps the unordered-list marker for a check; ordered lists are unaffected. */
  listStyle?: RichTextListStyle;
  className?: string;
};

/**
 * Renders already-authored formatted content as one flowing block styled by the
 * design system — the read-only counterpart to a Rich text editor.
 *
 * Headings render at their authored level (never re-leveled), lists stay real
 * `ul`/`ol`/`li`, and link text is its own accessible name. Pass composed content
 * as `children`; ingesting and sanitizing a CMS HTML string is the caller's
 * concern, not this component's. The checkmark list style recolours the list
 * marker via `::marker`, so the list keeps its semantics.
 */
export function RichText({ children, listStyle = 'default', className }: RichTextProps) {
  const unordered =
    listStyle === 'checkmark'
      ? "[&_ul]:my-s [&_ul]:ps-m [&_ul>li]:marker:font-bold [&_ul>li]:marker:text-text-primary [&_ul>li]:marker:content-['✓']"
      : '[&_ul]:my-s [&_ul]:ps-m [&_ul]:list-disc';
  return (
    <div
      data-component="rich-text"
      className={[
        'text-base text-text-secondary',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        '[&_h2]:mt-l [&_h2]:mb-s [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text-primary',
        '[&_h3]:mt-m [&_h3]:mb-xs [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary',
        '[&_h4]:mt-m [&_h4]:mb-xs [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-text-primary',
        '[&_p]:my-s',
        '[&_strong]:font-semibold [&_strong]:text-text-primary',
        '[&_em]:italic',
        '[&_a]:text-link [&_a]:underline [&_a]:underline-offset-2',
        '[&_ol]:my-s [&_ol]:ps-m [&_ol]:list-decimal',
        '[&_li]:my-2xs',
        unordered,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
