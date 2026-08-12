import type { ReactNode, RefObject } from 'react';

import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader.client';

type ModalPanelProps = {
  dialogRef: RefObject<HTMLDivElement | null>;
  titleId: string;
  descriptionId: string;
  title: string;
  closeLabel: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size: 'medium' | 'large';
  isTopmost: boolean;
  onClose: () => void;
};

const panelSizes = { medium: 'lg:max-w-[600px]', large: 'lg:max-w-[900px]' } as const;

/** Modal presentation kept separate from the portal and focus controller. */
export function ModalPanel({
  dialogRef,
  titleId,
  descriptionId,
  title,
  closeLabel,
  eyebrow,
  description,
  children,
  footer,
  size,
  isTopmost,
  onClose,
}: ModalPanelProps) {
  return (
    <>
      <div
        aria-hidden
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        className="fixed inset-0 z-100 bg-surface-scrim animate-fade-in"
      />
      <div className="pointer-events-none fixed inset-0 z-100 flex items-stretch justify-stretch lg:items-center lg:justify-center lg:p-page-margin">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal={isTopmost ? 'true' : undefined}
          aria-hidden={isTopmost ? undefined : true}
          inert={!isTopmost}
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          data-component="modal"
          className={[
            'pointer-events-auto relative flex h-dvh max-h-dvh w-full max-w-full flex-col overflow-hidden',
            'bg-surface-raised text-text-primary',
            'lg:h-auto lg:max-h-[90vh] lg:rounded-medium lg:border lg:border-border-subtle lg:shadow-overlay',
            panelSizes[size],
            'animate-scale-in',
          ].join(' ')}
        >
          <ModalHeader
            titleId={titleId}
            descriptionId={descriptionId}
            title={title}
            closeLabel={closeLabel}
            eyebrow={eyebrow}
            description={description}
            onClose={onClose}
          />
          <ModalBody>{children}</ModalBody>
          <ModalFooter>{footer}</ModalFooter>
        </div>
      </div>
    </>
  );
}
