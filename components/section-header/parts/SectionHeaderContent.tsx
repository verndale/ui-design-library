import type { SectionHeaderProps } from '../SectionHeader.types.js';

export function SectionHeaderContent({
  eyebrow,
  heading,
  description,
  alignment = 'left',
  className,
  classNames,
  headingLevel = 2,
  as: Element = 'div',
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <Element
      data-component="section-header"
      className={[
        'flex flex-col',
        alignment === 'center' ? 'items-center text-center' : 'items-start text-left',
        classNames?.root,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {eyebrow ? (
        <p className={['m-0 mb-m text-sm font-semibold uppercase tracking-wide text-text-secondary', classNames?.eyebrow].filter(Boolean).join(' ')}>{eyebrow}</p>
      ) : null}
      <Heading className={['m-0 text-3xl font-bold text-balance text-text-primary', classNames?.heading].filter(Boolean).join(' ')}>{heading}</Heading>
      {description ? (
        <div className={['m-0 mt-l max-w-prose text-base text-text-secondary [&_a]:text-link [&_a]:underline [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', classNames?.description].filter(Boolean).join(' ')}>
          {description}
        </div>
      ) : null}
    </Element>
  );
}
