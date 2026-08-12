import type { RichTextProps } from './RichText.types';
import { RichTextContent } from './parts/RichTextContent';
import { richTextRecipe } from './RichText.styles';

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
  return <RichTextContent className={richTextRecipe(listStyle, className)}>{children}</RichTextContent>;
}
