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

const MODAL_DRAWER_INTERACTION_STATES = [
  { id: 'desktop-overview', label: 'Desktop · Overview active', ariaLabel: 'Desktop overview', activeId: 'overview', presentation: 'desktop' },
  { id: 'desktop-pricing', label: 'Desktop · Pricing active', ariaLabel: 'Desktop pricing', activeId: 'pricing', presentation: 'desktop' },
  { id: 'link-hover', label: 'Desktop · Inactive link hover', ariaLabel: 'Link hover', activeId: 'overview', presentation: 'desktop' },
  { id: 'link-focus-visible', label: 'Desktop · Link focus visible', ariaLabel: 'Link focus', activeId: 'overview', presentation: 'desktop' },
  { id: 'mobile-trigger', label: 'Mobile · Trigger', ariaLabel: 'Mobile trigger', activeId: 'overview', presentation: 'trigger' },
  { id: 'trigger-focus-visible', label: 'Mobile · Trigger focus visible', ariaLabel: 'Trigger focus', activeId: 'overview', presentation: 'trigger' },
  { id: 'mobile-dialog', label: 'Mobile · Dialog open', ariaLabel: 'Dialog open', activeId: 'overview', presentation: 'dialog' },
  { id: 'dialog-link-focus-visible', label: 'Mobile · Dialog link focus visible', ariaLabel: 'Dialog link focus', activeId: 'overview', presentation: 'dialog' },
  { id: 'close-hover', label: 'Mobile · Close hover', ariaLabel: 'Close hover', activeId: 'overview', presentation: 'dialog' },
  { id: 'close-focus-visible', label: 'Mobile · Close focus visible', ariaLabel: 'Close focus', activeId: 'overview', presentation: 'dialog' },
] as const;
const modalDrawerInteractionItems = sections.slice(0, 4);

/** Code-backed specimens used to govern the Figma interaction-state presentation. */
export const InteractionStates: Story = {
  tags: ['motion'],
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '2800px' } },
    pseudo: {
      rootSelector: 'body',
      hover: [
        '.state-inpage-modal-link-hover a[href="#features"]',
      ],
      focusVisible: [
        '.state-inpage-modal-link-focus-visible a[href="#features"]',
        '.state-inpage-modal-trigger-focus-visible button[aria-haspopup="dialog"]',
      ],
    },
  },
  render: () => (
    <div className="grid min-h-screen grid-cols-1 gap-l bg-surface-raised p-l text-sm text-text-secondary 2xl:grid-cols-2">
      {MODAL_DRAWER_INTERACTION_STATES.map((state) => {
        const desktop = state.presentation === 'desktop';
        const dialog = state.presentation === 'dialog';
        return (
          <section key={state.id} className={`state-inpage-modal-${state.id} rounded-medium bg-surface-sunken p-m`}>
            <p className="mb-s font-semibold uppercase tracking-wide">{state.label}</p>
            <div className={desktop ? 'w-full max-w-[680px]' : 'w-full max-w-[360px]'}>
              <InPageNavigationModalDrawer
                items={modalDrawerInteractionItems}
                activeId={state.activeId}
                ariaLabel={state.ariaLabel}
                className={[
                  '!static',
                  state.id === 'link-hover' ? '[&_li:nth-child(2)_a]:!text-text-primary' : undefined,
                  state.id === 'link-focus-visible'
                    ? '[&_li:nth-child(2)_a]:outline-2 [&_li:nth-child(2)_a]:outline-solid [&_li:nth-child(2)_a]:outline-offset-2 [&_li:nth-child(2)_a]:outline-border-focus'
                    : undefined,
                ].filter(Boolean).join(' ')}
                classNames={{
                  desktopList: desktop ? '!flex' : '!hidden',
                  mobile: desktop ? '!hidden' : '!block',
                  backdrop: dialog ? 'hidden' : undefined,
                  viewport: dialog ? `state-inpage-modal-viewport-${state.id} !static !inset-auto !z-auto !flex !p-0` : undefined,
                  dialog: dialog ? `state-inpage-modal-dialog-${state.id} !mx-auto !h-auto !max-h-none !w-[360px] !max-w-[360px]` : undefined,
                  closeButton: state.id === 'close-hover'
                    ? '!bg-action-hover'
                    : state.id === 'close-focus-visible'
                      ? 'outline-2 outline-solid outline-offset-2 outline-border-focus'
                      : undefined,
                  trigger: state.id === 'trigger-focus-visible'
                    ? 'outline-2 outline-solid outline-offset-2 outline-border-focus'
                    : undefined,
                  mobileList: state.id === 'dialog-link-focus-visible'
                    ? '[&_li:nth-child(2)_a]:outline-2 [&_li:nth-child(2)_a]:outline-solid [&_li:nth-child(2)_a]:outline-offset-2 [&_li:nth-child(2)_a]:outline-border-focus'
                    : undefined,
                }}
              />
            </div>
          </section>
        );
      })}
    </div>
  ),
  play: async ({ step }) => {
    const root = (state: string) => document.body.querySelector<HTMLElement>(`.state-inpage-modal-${state}`)!;
    const link = (state: string, name: string) => within(root(state)).getByRole('link', { name });
    const dialogFor = (state: string) => document.body.querySelector<HTMLElement>(`.state-inpage-modal-dialog-${state}`)!;

    await step('desktop variants expose the controlled current section', async () => {
      await expect(link('desktop-overview', 'Overview')).toHaveAttribute('aria-current', 'true');
      await expect(link('desktop-overview', 'Pricing')).not.toHaveAttribute('aria-current');
      await expect(link('desktop-pricing', 'Pricing')).toHaveAttribute('aria-current', 'true');
    });

    await step('desktop hover resolves the governed primary text token', async () => {
      const hover = link('link-hover', 'Features');
      await waitFor(() => expect(hover).toHaveClass('pseudo-hover'));
      const probe = document.createElement('span');
      probe.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary');
      document.body.append(probe);
      const expectedColor = getComputedStyle(probe).color;
      probe.remove();
      if (!matchMedia('(forced-colors: active)').matches) {
        await expect(getComputedStyle(hover).color).toBe(expectedColor);
      }
    });

    await step('desktop link and mobile trigger expose the governed focus ring', async () => {
      const targets = [
        link('link-focus-visible', 'Features'),
        within(root('trigger-focus-visible')).getByRole('button'),
      ];
      for (const target of targets) {
        await waitFor(() => expect(target).toHaveClass('pseudo-focus-visible'));
        const style = getComputedStyle(target);
        await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
        await expect(style.outlineStyle).not.toBe('none');
        await expect(style.outlineOffset).toBe('2px');
      }
    });

    await step('mobile trigger retains the source shell and control geometry', async () => {
      const trigger = within(root('mobile-trigger')).getByRole('button');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger.parentElement!.getBoundingClientRect().width).toBeCloseTo(360, 0);
      await expect(trigger.getBoundingClientRect().width).toBeCloseTo(358, 0);
      const rootFontScale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
      await expect(trigger.getBoundingClientRect().height).toBeCloseTo(52 * rootFontScale, 0);
    });

    await step('dialog presentations mount as real public modal drawers', async () => {
      for (const state of ['mobile-dialog', 'dialog-link-focus-visible', 'close-hover', 'close-focus-visible']) {
        fireEvent.click(within(root(state)).getByRole('button', { name: 'Overview' }));
        await waitFor(() => expect(dialogFor(state)).toBeInTheDocument());
        await expect(dialogFor(state)).toHaveAttribute('aria-modal', 'true');
        await waitFor(() => expect(dialogFor(state).getBoundingClientRect().width).toBeCloseTo(360, 0));
      }
    });

    await step('dialog link and close control expose governed forced states', async () => {
      const dialogLink = dialogFor('dialog-link-focus-visible').querySelector<HTMLAnchorElement>('a[href="#features"]')!;
      const closeHover = dialogFor('close-hover').querySelector<HTMLButtonElement>('button[aria-label="Close navigation"]')!;
      const closeFocus = dialogFor('close-focus-visible').querySelector<HTMLButtonElement>('button[aria-label="Close navigation"]')!;
      for (const target of [dialogLink, closeFocus]) {
        const style = getComputedStyle(target);
        await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
        await expect(style.outlineOffset).toBe('2px');
      }
      const probe = document.createElement('span');
      probe.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-action-hover');
      document.body.append(probe);
      const expectedHover = getComputedStyle(probe).backgroundColor;
      probe.remove();
      await expect(getComputedStyle(closeHover).backgroundColor).toBe(expectedHover);
    });

    await step('in-page-navigation-modal.interaction-states.motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      await expect(getComputedStyle(dialogFor('mobile-dialog')).animationDuration).toBe(reduced ? '0s' : '0.3s');
    });
  },
};
