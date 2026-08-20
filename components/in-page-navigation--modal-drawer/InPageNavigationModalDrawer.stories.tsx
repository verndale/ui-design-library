import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import {
  InPageNavigationModalDrawer,
  type InPageNavigationModalDrawerItem,
} from './index';

const sections: InPageNavigationModalDrawerItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'support', label: 'Support' },
];

const meta = {
  title: 'In-page navigation / Modal drawer',
  component: InPageNavigationModalDrawer,
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      contractVersion: 1,
      auditComponentKey: 'in-page-navigation',
      auditStatus: 'cleared',
      privateAuditRef: 'library-source-parity:2026-08-19/components/in-page-navigation',
      privateAuditDigest: '24f12352bf3b1fc547d4f3b4b656851c504b3ae8e29e6548b2885906ddd74ef4',
      decisionIds: [
        'sp-in-page-navigation-001',
        'sp-in-page-navigation-002',
        'sp-in-page-navigation-003',
      ],
      representationDecisions: [
        {
          decisionId: 'sp-in-page-navigation-002',
          implementationKey: 'in-page-navigation--modal-drawer',
          surfaces: ['ai-registry', 'code', 'figma', 'storybook'],
        },
      ],
      requiredRepresentationSurfaces: ['ai-registry', 'code', 'figma', 'storybook'],
    },
    realizationEvidence: [
      'in-page-navigation-modal.open-dismiss',
      'in-page-navigation-modal.focus.containment',
      'in-page-navigation-modal.focus.restoration',
      'in-page-navigation-modal.keyboard.escape',
      'in-page-navigation-modal.outside-dismiss',
      'in-page-navigation-modal.swipe.threshold',
      'in-page-navigation-modal.swipe.scroll',
      'in-page-navigation-modal.responsive.hidden',
      'in-page-navigation-modal.motion.reduced',
      'in-page-navigation-modal.semantics',
    ],
    layout: 'padded',
    docs: {
      description: {
        component:
          'The governed structural alternate for In-page navigation. Desktop keeps the canonical pill list; mobile opens an SSR-safe, portal-backed modal bottom drawer with shared overlay and focus behavior.',
      },
      story: { inline: false, height: '640px' },
    },
  },
  argTypes: {
    'items': { control: 'object', description: 'Required. Section IDs and labels.' },
    'ariaLabel': { control: 'text', description: 'Optional landmark and dialog name. Defaults to "On this page".' },
    'closeLabel': { control: 'text', description: 'Optional close-button name. Defaults to "Close navigation".' },
    'activeId': { control: 'text', description: 'Optional controlled active section ID.' },
    'collapsedIcon': { control: false, description: 'Optional decorative icon for the closed mobile handle.' },
    'expandedIcon': { control: false, description: 'Optional decorative icon for the open drawer handle.' },
    'className': { control: 'text', description: 'Optional root class.' },
    'classNames': { control: 'object', description: 'Optional governed slot classes.' },
  },
  args: { items: sections, activeId: 'overview' },
} satisfies Meta<typeof InPageNavigationModalDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function getTrigger(canvasElement: HTMLElement) {
  return canvasElement.querySelector('button[aria-haspopup="dialog"]') as HTMLButtonElement;
}

async function openDrawer(canvasElement: HTMLElement) {
  const trigger = getTrigger(canvasElement);
  await userEvent.click(trigger);
  const dialog = await within(document.body).findByRole('dialog', { name: 'On this page' });
  return { trigger, dialog };
}

/** The desktop copy is visible while the responsive mobile copy is not focusable. */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('in-page-navigation-modal.responsive.hidden', async () => {
      const nav = canvas.getByRole('navigation', { name: 'On this page' });
      const trigger = getTrigger(canvasElement);
      await expect(nav).toBeInTheDocument();
      await expect(canvas.getAllByRole('link')).toHaveLength(5);
      await expect(trigger.offsetParent).toBeNull();
      await expect(document.activeElement).not.toBe(trigger);
    });
  },
};

/** Click opening, close-button dismissal, and return focus are one continuous contract. */
export const OpeningAndDismissal: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const { trigger, dialog } = await openDrawer(canvasElement);
    await step('in-page-navigation-modal.open-dismiss', async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(dialog).toBeInTheDocument();
      await userEvent.click(within(dialog).getByRole('button', { name: 'Close navigation' }));
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
    });
    await step('in-page-navigation-modal.focus.restoration', async () => {
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  },
};

/** Focus cannot leave the topmost dialog; Escape closes and restores the trigger. */
export const FocusAndEscape: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const { trigger, dialog } = await openDrawer(canvasElement);
    const close = within(dialog).getByRole('button', { name: 'Close navigation' });
    const links = within(dialog).getAllByRole('link');

    await step('in-page-navigation-modal.focus.containment', async () => {
      await waitFor(() => expect(close).toHaveFocus());
      await userEvent.tab({ shift: true });
      await expect(links.at(-1)).toHaveFocus();
      await userEvent.tab();
      await expect(close).toHaveFocus();
    });
    await step('in-page-navigation-modal.keyboard.escape', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  },
};

/** The shared modal scrim dismisses without treating panel interaction as outside. */
export const OutsideDismissal: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const { trigger, dialog } = await openDrawer(canvasElement);
    await step('panel interaction remains inside', async () => {
      await userEvent.click(dialog);
      await expect(dialog).toBeInTheDocument();
    });
    await step('in-page-navigation-modal.outside-dismiss', async () => {
      const backdrop = document.querySelector('.in-page-navigation-modal-backdrop') as HTMLElement;
      await userEvent.click(backdrop);
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  },
};

/** Exactly 48px is below the strict source boundary; 49px opens and closes. */
export const SwipeThresholds: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const trigger = getTrigger(canvasElement);
    const body = within(document.body);
    await step('in-page-navigation-modal.swipe.threshold', async () => {
      fireEvent.pointerDown(trigger, { pointerId: 1, pointerType: 'mouse', clientX: 20, clientY: 100 });
      fireEvent.pointerUp(trigger, { pointerId: 1, pointerType: 'mouse', clientX: 20, clientY: 52 });
      await expect(body.queryByRole('dialog')).not.toBeInTheDocument();

      fireEvent.pointerDown(trigger, { pointerId: 2, pointerType: 'mouse', clientX: 20, clientY: 100 });
      fireEvent.pointerUp(trigger, { pointerId: 2, pointerType: 'mouse', clientX: 20, clientY: 51 });
      const dialog = await body.findByRole('dialog');
      const handle = dialog.querySelector('[data-inpage-swipe-handle]') as HTMLElement;

      fireEvent.pointerDown(handle, { pointerId: 3, pointerType: 'mouse', clientX: 20, clientY: 20 });
      fireEvent.pointerUp(handle, { pointerId: 3, pointerType: 'mouse', clientX: 20, clientY: 68 });
      await expect(dialog).toBeInTheDocument();

      fireEvent.pointerDown(handle, { pointerId: 4, pointerType: 'mouse', clientX: 20, clientY: 20 });
      fireEvent.pointerUp(handle, { pointerId: 4, pointerType: 'mouse', clientX: 20, clientY: 69 });
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
    });
  },
};

/** The scroll region owns vertical gestures; only the dedicated handle dismisses. */
export const ScrollVersusSwipe: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const { dialog } = await openDrawer(canvasElement);
    const scrollRegion = dialog.querySelector('[data-inpage-scroll-region]') as HTMLElement;
    await step('in-page-navigation-modal.swipe.scroll', async () => {
      scrollRegion.scrollTop = 32;
      const initialScrollTop = scrollRegion.scrollTop;
      await expect(initialScrollTop).toBeGreaterThan(0);
      fireEvent.pointerDown(scrollRegion, { pointerId: 5, pointerType: 'mouse', clientX: 20, clientY: 20 });
      fireEvent.pointerUp(scrollRegion, { pointerId: 5, pointerType: 'mouse', clientX: 20, clientY: 100 });
      await expect(scrollRegion.scrollTop).toBe(initialScrollTop);
      await expect(dialog).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
    });
  },
};

/** Portal placement keeps the dialog outside the outer landmark while retaining an inner nav. */
export const LandmarkAndDialogSemantics: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const outerNavigation = canvas.getByRole('navigation', { name: 'On this page' });
    const { dialog } = await openDrawer(canvasElement);
    await step('in-page-navigation-modal.semantics', async () => {
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog).toHaveAccessibleName('On this page');
      await expect(dialog.closest('nav')).toBeNull();
      await expect(within(dialog).getByRole('navigation', { name: 'On this page' })).toBeInTheDocument();
      await expect(outerNavigation.contains(dialog)).toBe(false);
      await expect(dialog.parentElement?.parentElement).toBe(document.body);
      await expect(canvasElement.inert).toBe(true);
      await userEvent.keyboard('{Escape}');
    });
  },
};

/** Mobile keeps the desktop copy display-hidden and therefore outside the tab order. */
export const ResponsiveCopies: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    await step('in-page-navigation-modal.responsive.hidden', async () => {
      const desktopList = canvasElement.querySelector('ul.lg\\:flex') as HTMLUListElement;
      const trigger = getTrigger(canvasElement);
      await expect(desktopList.offsetParent).toBeNull();
      for (const link of desktopList.querySelectorAll('a')) await expect(link.offsetParent).toBeNull();
      await expect(trigger.offsetParent).not.toBeNull();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

/** The shared modal animation token collapses under reduced motion. */
export const ReducedMotion: Story = {
  tags: ['motion'],
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const { dialog } = await openDrawer(canvasElement);
    await step('in-page-navigation-modal.motion.reduced', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      await expect(getComputedStyle(dialog).animationDuration).toBe(reduced ? '0s' : '0.3s');
      await expect(getComputedStyle(dialog).animationName).not.toBe('none');
      await userEvent.keyboard('{Escape}');
    });
  },
};
