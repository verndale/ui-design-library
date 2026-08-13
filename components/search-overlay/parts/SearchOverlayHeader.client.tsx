import type { ReactNode } from 'react';

import { CloseButton } from '../../../src/lib/CloseButton.js';
import type { SearchOverlayClassNames, SearchOverlayHeadingLevel } from '../SearchOverlay.types.js';

type SearchOverlayHeaderProps = {
  titleId: string;
  descriptionId: string;
  title: string;
  supportingCopy?: ReactNode;
  closeLabel: string;
  active: boolean;
  onClose: () => void;
  classNames?: SearchOverlayClassNames;
  headingLevel: SearchOverlayHeadingLevel;
  closeIcon?: ReactNode;
};

export function SearchOverlayHeader({
  titleId,
  descriptionId,
  title,
  supportingCopy,
  closeLabel,
  active,
  onClose,
  classNames,
  headingLevel,
  closeIcon,
}: SearchOverlayHeaderProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <>
      <CloseButton label={closeLabel} onClick={onClose} icon={closeIcon} iconClassName={classNames?.closeIcon} className={['absolute end-s top-s', classNames?.closeButton].filter(Boolean).join(' ')} />
      <div className={['flex flex-col gap-2xs pe-xl', classNames?.header].filter(Boolean).join(' ')}>
        <Heading id={titleId} className={['m-0 text-2xl font-semibold text-text-primary', classNames?.title].filter(Boolean).join(' ')}>
          {title}
        </Heading>
        {!active && supportingCopy ? (
          <div id={descriptionId} className={['text-text-secondary', classNames?.description].filter(Boolean).join(' ')}>
            {supportingCopy}
          </div>
        ) : null}
      </div>
    </>
  );
}
