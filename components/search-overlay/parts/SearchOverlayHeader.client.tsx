import type { ReactNode } from 'react';

import { CloseButton } from '../../../src/lib/CloseButton.js';

type SearchOverlayHeaderProps = {
  titleId: string;
  descriptionId: string;
  title: string;
  supportingCopy?: ReactNode;
  closeLabel: string;
  active: boolean;
  onClose: () => void;
};

export function SearchOverlayHeader({
  titleId,
  descriptionId,
  title,
  supportingCopy,
  closeLabel,
  active,
  onClose,
}: SearchOverlayHeaderProps) {
  return (
    <>
      <CloseButton label={closeLabel} onClick={onClose} className="absolute end-s top-s" />
      <div className="flex flex-col gap-2xs pe-xl">
        <h2 id={titleId} className="m-0 text-2xl font-semibold text-text-primary">
          {title}
        </h2>
        {!active && supportingCopy ? (
          <div id={descriptionId} className="text-text-secondary">
            {supportingCopy}
          </div>
        ) : null}
      </div>
    </>
  );
}
