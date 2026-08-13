import type { RichTextListStyle } from './RichText.types';

const base = [
  'text-base text-text-secondary',
  '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
  '[&_h2]:mt-l [&_h2]:mb-s [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text-primary',
  '[&_h3]:mt-m [&_h3]:mb-xs [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary',
  '[&_h4]:mt-m [&_h4]:mb-xs [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-text-primary',
  '[&_p]:my-s [&_strong]:font-semibold [&_strong]:text-text-primary [&_em]:italic',
  '[&_a]:text-link [&_a]:underline [&_a]:underline-offset-2',
  '[&_ol]:my-s [&_ol]:ps-m [&_ol]:list-decimal [&_li]:my-2xs',
];

const lists: Record<RichTextListStyle, string> = {
  default: '[&_ul]:my-s [&_ul]:ps-m [&_ul]:list-disc',
  checkmark:
    "[&_ul]:my-s [&_ul]:ps-m [&_ul>li]:marker:font-bold [&_ul>li]:marker:text-text-primary [&_ul>li]:marker:content-['✓']",
};

export function richTextRecipe(listStyle: RichTextListStyle, className?: string) {
  return [...base, lists[listStyle], className].filter(Boolean).join(' ');
}
