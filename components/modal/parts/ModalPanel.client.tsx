import type { ReactNode, RefObject } from 'react';

import type { ModalClassNames, ModalHeadingLevel } from '../Modal.types.js';

import { ModalBody } from './ModalBody.js';
import { ModalFooter } from './ModalFooter.js';
import { ModalHeader } from './ModalHeader.client.js';

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
  id?: string;
  className?: string;
  classNames?: ModalClassNames;
  titleHeadingLevel: ModalHeadingLevel;
  closeIcon?: ReactNode;
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
  id,
  className,
  classNames,
  titleHeadingLevel,
  closeIcon,
}: ModalPanelProps) {
  return (
    <>
      <div
        data-ui-overlay-layer
        aria-hidden
        onMouseDown={(event) => { if (event.target === event.currentTarget) { event.preventDefault(); onClose(); } }}
        className={['fixed inset-0 z-100 bg-surface-scrim animate-fade-in', classNames?.backdrop].filter(Boolean).join(' ')}
      />
      <div data-ui-overlay-layer className={['pointer-events-none fixed inset-0 z-100 flex items-stretch justify-stretch lg:items-center lg:justify-center lg:p-page-margin', classNames?.viewport].filter(Boolean).join(' ')}>
        <div
          id={id}
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
            classNames?.dialog,
            className,
          ].filter(Boolean).join(' ')}
        >
          <ModalHeader
            titleId={titleId}
            descriptionId={descriptionId}
            title={title}
            closeLabel={closeLabel}
            eyebrow={eyebrow}
            description={description}
            onClose={onClose}
            classNames={classNames}
            headingLevel={titleHeadingLevel}
            closeIcon={closeIcon}
          />
          <ModalBody className={classNames?.body}>{children}</ModalBody>
          <ModalFooter className={classNames?.footer}>{footer}</ModalFooter>
        </div>
      </div>
    </>
  );
}
