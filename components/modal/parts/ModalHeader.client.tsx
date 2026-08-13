import type { ReactNode } from 'react';

import { CloseButton } from '../../../src/lib/CloseButton.js';
import type { ModalClassNames, ModalHeadingLevel } from '../Modal.types.js';

type ModalHeaderProps = {
  titleId: string;
  descriptionId: string;
  title: string;
  closeLabel: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  classNames?: ModalClassNames;
  headingLevel: ModalHeadingLevel;
  closeIcon?: ReactNode;
};

export function ModalHeader({
  titleId,
  descriptionId,
  title,
  closeLabel,
  eyebrow,
  description,
  onClose,
  classNames,
  headingLevel,
  closeIcon,
}: ModalHeaderProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <header className={['relative shrink-0 px-page-margin pt-l pb-m', classNames?.header].filter(Boolean).join(' ')}>
      <div className="flex flex-col gap-3xs pe-xl">
        {eyebrow ? <div className={classNames?.eyebrow}>{eyebrow}</div> : null}
        <Heading id={titleId} className={['m-0 text-2xl font-semibold text-text-primary', classNames?.title].filter(Boolean).join(' ')}>
          {title}
        </Heading>
        {description ? (
          <div id={descriptionId} className={['text-text-secondary', classNames?.description].filter(Boolean).join(' ')}>
            {description}
          </div>
        ) : null}
      </div>
      <CloseButton label={closeLabel} onClick={onClose} icon={closeIcon} iconClassName={classNames?.closeIcon} className={['absolute end-s top-s', classNames?.closeButton].filter(Boolean).join(' ')} />
    </header>
  );
}
