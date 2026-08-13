import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useDialog } from '../../src/lib/dialog.client.js';
import { getFocusableElements } from '../../src/lib/focus.client.js';
import { ModalPanel } from './parts/ModalPanel.client.js';
import type { ModalProps } from './Modal.types.js';

/** A modal dialog with an SSR-safe portal, focus trap, and focus restoration. */
export function Modal({
  open,
  onClose,
  title,
  closeLabel = 'Close dialog',
  eyebrow,
  description,
  children,
  footer,
  size = 'large',
  returnFocusRef,
  id,
  className,
  classNames,
  titleHeadingLevel = 2,
  closeIcon,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { portalRoot, isTopmost } = useDialog({
    open,
    onClose,
    containerRef: dialogRef,
    returnFocusRef,
    onOpenFocus: (root) => (getFocusableElements(root)[0] ?? root).focus(),
  });

  if (!portalRoot || !open) return null;

  return createPortal(
    <ModalPanel
      dialogRef={dialogRef}
      titleId={titleId}
      descriptionId={descriptionId}
      title={title}
      closeLabel={closeLabel}
      eyebrow={eyebrow}
      description={description}
      footer={footer}
      size={size}
      isTopmost={isTopmost}
      onClose={onClose}
      id={id}
      className={className}
      classNames={classNames}
      titleHeadingLevel={titleHeadingLevel}
      closeIcon={closeIcon}
    >
      {children}
    </ModalPanel>,
    portalRoot,
  );
}
