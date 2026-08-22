import type { RichTextListStyle } from './RichText.types.js';

const base = [
  'text-base text-text-secondary',
  '[&>*]:m-0 [&>*+*]:mt-m',
  '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-text-primary',
  '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text-primary',
  '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary',
  '[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-text-primary',
  '[&_h5]:text-base [&_h5]:font-semibold [&_h5]:text-text-primary',
  '[&_h6]:text-sm [&_h6]:font-semibold [&_h6]:text-text-primary',
  '[&_strong]:font-semibold [&_strong]:text-text-primary [&_em]:italic',
  '[&_a]:text-link [&_a]:underline [&_a]:underline-offset-2',
  '[&_ol]:ps-m [&_ol]:list-decimal [&_li+li]:mt-2xs',
  '[&_li>ol]:mt-2xs [&_li>ul]:mt-2xs',
  '[&_figure]:m-0 [&_figure>*+*]:mt-xs',
  '[&_figcaption]:text-sm [&_figcaption]:text-text-secondary',
  '[&_img]:block [&_img]:h-auto [&_img]:max-w-full',
  '[&_picture]:block [&_picture]:max-w-full',
  '[&_video]:block [&_video]:h-auto [&_video]:max-w-full',
  '[&_iframe]:block [&_iframe]:max-w-full',
  '[&_table]:block [&_table]:w-full [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse',
  '[&_caption]:mb-xs [&_caption]:text-left [&_caption]:text-sm [&_caption]:font-semibold [&_caption]:text-text-primary',
  '[&_th]:border [&_th]:border-border-subtle [&_th]:bg-surface-sunken [&_th]:px-xs [&_th]:py-2xs [&_th]:text-left [&_th]:font-semibold [&_th]:text-text-primary',
  '[&_td]:border [&_td]:border-border-subtle [&_td]:px-xs [&_td]:py-2xs [&_td]:align-top [&_td]:text-text-secondary',
];

const lists: Record<RichTextListStyle, string> = {
  default: '[&_ul]:ps-m [&_ul]:list-disc',
  checkmark:
    "[&_ul]:ps-m [&_ul>li]:marker:font-bold [&_ul>li]:marker:text-text-primary [&_ul>li]:marker:content-['✓']",
};

export function richTextRecipe(listStyle: RichTextListStyle, className?: string) {
  return [...base, lists[listStyle], className].filter(Boolean).join(' ');
}
