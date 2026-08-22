import type { RichTextProps } from './RichText.types.js';
import { RichTextContent } from './parts/RichTextContent.js';
import { richTextRecipe } from './RichText.styles.js';

/**
 * Renders already-authored formatted content as one flowing block styled by the
 * design system — the read-only counterpart to a Rich text editor.
 *
 * Headings render at their authored level (never re-leveled), lists and tables
 * keep their native structure, responsive media stays within the content width,
 * and link text is its own accessible name. Pass composed content as `children`;
 * ingesting and sanitizing a CMS HTML string is the caller's concern, not this
 * component's. The checkmark list style recolours the list marker via `::marker`,
 * so the list keeps its semantics.
 */
export function RichText({ children, listStyle = 'default', className, classNames, as }: RichTextProps) {
  return <RichTextContent as={as} className={richTextRecipe(listStyle, [classNames?.root, className].filter(Boolean).join(' '))}>{children}</RichTextContent>;
}
