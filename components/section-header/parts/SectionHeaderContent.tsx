import type { SectionHeaderProps } from '../SectionHeader.types';

export function SectionHeaderContent({
  eyebrow,
  heading,
  description,
  alignment = 'left',
  className,
}: SectionHeaderProps) {
  return (
    <div
      data-component="section-header"
      className={[
        'flex flex-col',
        alignment === 'center' ? 'items-center text-center' : 'items-start text-left',
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
