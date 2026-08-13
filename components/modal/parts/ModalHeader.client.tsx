import type { ReactNode } from 'react';

import { CloseButton } from '../../../src/lib/CloseButton.js';

type ModalHeaderProps = {
  titleId: string;
  descriptionId: string;
  title: string;
  closeLabel: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  onClose: () => void;
};

export function ModalHeader({
  titleId,
  descriptionId,
  title,
  closeLabel,
  eyebrow,
  description,
  onClose,
}: ModalHeaderProps) {
  return (
    <header className="relative shrink-0 px-page-margin pt-l pb-m">
      <div className="flex flex-col gap-3xs pe-xl">
        {eyebrow}
        <h2 id={titleId} className="m-0 text-2xl font-semibold text-text-primary">
          {title}
        </h2>
        {description ? (
          <div id={descriptionId} className="text-text-secondary">
            {description}
          </div>
        ) : null}
      </div>
      <CloseButton label={closeLabel} onClick={onClose} className="absolute end-s top-s" />
    </header>
  );
}
