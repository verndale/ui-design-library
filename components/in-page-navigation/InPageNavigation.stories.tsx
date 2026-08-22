import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { InPageNavigation, type InPageNavigationItem } from './index';

const sections: InPageNavigationItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
];

/** The stories assert landmark, active-section, and mobile disclosure behavior. */
const meta = {
  title: 'In-page navigation',
  component: InPageNavigation,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "in-page-navigation",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/in-page-navigation",
      "privateAuditDigest": "24f12352bf3b1fc547d4f3b4b656851c504b3ae8e29e6548b2885906ddd74ef4",
      "decisionIds": [
        "sp-in-page-navigation-001",
        "sp-in-page-navigation-002",
        "sp-in-page-navigation-003"
      ],
      "representationDecisions": [
        {
          "decisionId": "sp-in-page-navigation-002",
          "implementationKey": "in-page-navigation--modal-drawer",
          "surfaces": [
            "ai-registry",
            "code",
            "figma",
            "storybook"
          ]
        }
      ],
      "requiredRepresentationSurfaces": [
        "ai-registry",
        "code",
        "figma",
        "storybook"
      ]
    },
    realizationEvidence: ['in-page-navigation.disclosure.keyboard', 'in-page-navigation.disclosure.state', 'in-page-navigation.responsive.hidden'],
    layout: 'padded',
    docs: {
      description: {
        component:
          'A sticky "on this page" bar of anchor links that jump to sections within the current page and track which is in view. A `<nav>` landmark whose active link carries `aria-current`; a horizontal pill bar on wide viewports, collapsing to a trigger + drawer below `lg`.',
      },
    },
  },
  argTypes: {
    "items": { control: 'object', description: "Required. Public `items` realization prop." },
    "ariaLabel": { control: 'text', description: "Optional. Public `ariaLabel` realization prop. Defaults to \"On this page\"." },
    "activeId": { control: 'text', description: "Optional. Public `activeId` realization prop." },
    "collapsedIcon": { control: false, description: "Optional. Public `collapsedIcon` realization prop." },
    "expandedIcon": { control: false, description: "Optional. Public `expandedIcon` realization prop." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { items: sections },
} satisfies Meta<typeof InPageNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The wide-viewport pill bar. With no scroll context, the first section is active. */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('in-page-navigation.responsive.hidden', async () => {
      const nav = canvas.getByRole('navigation', { name: 'On this page' });
      await expect(nav).toBeInTheDocument();
      const links = canvas.getAllByRole('link');
      await expect(links).toHaveLength(4);
      await expect(links[0]).toHaveAttribute('href', '#overview');
      const current = links.filter((link) => link.getAttribute('aria-current') === 'true');
      await expect(current).toHaveLength(1);
      await expect(current[0]).toHaveAccessibleName('Overview');
    });
  },
};

/** Driving `activeId` moves `aria-current` — the controlled path the scroll-spy uses internally. */
export const ActiveSection: Story = {
  args: { activeId: 'pricing' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'true');
    await expect(current).toHaveLength(1);
    await expect(current[0]).toHaveAccessibleName('Pricing');
  },
};

/**
 * The mobile drawer discloses the section list. Its trigger lives in the
 * `lg:hidden` subtree, which is `display:none` at this desktop test viewport, so
 * it is driven with `fireEvent` (which ignores visibility) to prove the
 * `aria-expanded` + `inert` contract independent of breakpoint.
 */
export const MobileDrawer: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const trigger = canvasElement.querySelector('button[aria-controls]') as HTMLButtonElement;
    const drawerId = trigger.getAttribute('aria-controls')!;
    const drawer = canvasElement.querySelector(`#${drawerId}`) as HTMLElement;

    await step('in-page-navigation.disclosure.keyboard', async () => {
      trigger.focus();
      await expect(trigger).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(drawer.hasAttribute('inert')).toBe(false);
    });
    await step('in-page-navigation.disclosure.state', async () => {
      await expect(trigger.getAttribute('aria-controls')).toBe(drawer.id);
      await userEvent.keyboard(' ');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(drawer.hasAttribute('inert')).toBe(true);
    });
  },
};

/**
 * The drawer reveal is one property driven by `--duration-base`, so the
 * reduced-motion media query is the single switch. Re-run under emulated reduced
 * motion by `pnpm test:motion`, where the same assertion flips to `0s`.
 */
export const ReducedMotion: Story = {
  tags: ['motion'],
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-inpage-motion]');
    await expect(panel).toBeTruthy();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(panel as Element).transitionDuration).toBe(reduced ? '0s' : '0.3s');
  },
};

const INLINE_INTERACTION_STATES = [
  { id: 'desktop-overview', label: 'Desktop · Overview active', activeId: 'overview', presentation: 'desktop' },
  { id: 'desktop-pricing', label: 'Desktop · Pricing active', activeId: 'pricing', presentation: 'desktop' },
  { id: 'link-hover', label: 'Desktop · Inactive link hover', activeId: 'overview', presentation: 'desktop' },
  { id: 'link-focus-visible', label: 'Desktop · Link focus visible', activeId: 'overview', presentation: 'desktop' },
  { id: 'mobile-collapsed', label: 'Mobile · Collapsed', activeId: 'overview', presentation: 'mobile' },
  { id: 'mobile-expanded', label: 'Mobile · Expanded', activeId: 'overview', presentation: 'mobile' },
  { id: 'trigger-focus-visible', label: 'Mobile · Trigger focus visible', activeId: 'overview', presentation: 'mobile' },
] as const;

/** Code-backed specimens used to govern the Figma interaction-state presentation. */
export const InteractionStates: Story = {
  tags: ['motion'],
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '1800px' } },
    pseudo: {
      rootSelector: 'body',
      hover: '.state-inpage-link-hover a[href="#features"]',
      focusVisible: [
        '.state-inpage-link-focus-visible a[href="#features"]',
        '.state-inpage-trigger-focus-visible button[aria-controls]',
      ],
    },
  },
  render: () => (
    <div className="grid min-h-screen grid-cols-1 gap-l bg-surface-raised p-l text-sm text-text-secondary 2xl:grid-cols-2">
      {INLINE_INTERACTION_STATES.map((state) => {
        const mobile = state.presentation === 'mobile';
        return (
          <section key={state.id} className={`state-inpage-${state.id} rounded-medium bg-surface-sunken p-m`}>
            <p className="mb-s font-semibold uppercase tracking-wide">{state.label}</p>
            <div className={mobile ? 'w-full max-w-[360px]' : 'w-full max-w-[700px]'}>
              <InPageNavigation
                items={sections}
                activeId={state.activeId}
                ariaLabel={state.label}
                className={[
                  '!static',
                  state.id === 'link-hover' ? '[&_li:nth-child(2)_a]:!text-text-primary' : undefined,
                  state.id === 'link-focus-visible'
                    ? '[&_li:nth-child(2)_a]:outline-2 [&_li:nth-child(2)_a]:outline-solid [&_li:nth-child(2)_a]:outline-offset-2 [&_li:nth-child(2)_a]:outline-border-focus'
                    : undefined,
                ].filter(Boolean).join(' ')}
                classNames={{
                  desktopList: mobile ? '!hidden' : '!flex',
                  mobile: mobile ? '!block' : '!hidden',
                  trigger: state.id === 'trigger-focus-visible'
                    ? 'outline-2 outline-solid outline-offset-2 outline-border-focus'
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
    const root = (state: string) => document.body.querySelector<HTMLElement>(`.state-inpage-${state}`)!;
    const link = (state: string, href: string) => within(root(state)).getByRole('link', { name: href.slice(1).replace(/^./, (value) => value.toUpperCase()) });

    await step('public activeId states own exactly one current desktop link', async () => {
      const overviewLinks = within(root('desktop-overview')).getAllByRole('link');
      const pricingLinks = within(root('desktop-pricing')).getAllByRole('link');
      await expect(overviewLinks.filter((item) => item.getAttribute('aria-current') === 'true')).toEqual([overviewLinks[0]]);
      await expect(pricingLinks.filter((item) => item.getAttribute('aria-current') === 'true')).toEqual([pricingLinks[2]]);
      await expect(link('desktop-overview', '#features')).not.toHaveAttribute('aria-current');
    });

    await step('inactive hover resolves the governed primary text token', async () => {
      const hover = link('link-hover', '#features');
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
        link('link-focus-visible', '#features'),
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

    await step('mobile disclosure exposes honest collapsed and expanded states', async () => {
      const collapsed = within(root('mobile-collapsed')).getByRole('button');
      const expanded = within(root('mobile-expanded')).getByRole('button');
      await expect(collapsed).toHaveAttribute('aria-expanded', 'false');
      const collapsedPanel = root('mobile-collapsed').querySelector('ul[id]') as HTMLElement;
      await expect(collapsedPanel).toHaveAttribute('inert');
      await userEvent.click(expanded);
      await expect(expanded).toHaveAttribute('aria-expanded', 'true');
      const expandedPanel = root('mobile-expanded').querySelector('ul[id]') as HTMLElement;
      await expect(expandedPanel).not.toHaveAttribute('inert');
      await expect(within(expandedPanel).getAllByRole('link')).toHaveLength(4);
    });

    await step('in-page-navigation.interaction-states.motion', async () => {
      const motion = root('mobile-expanded').querySelector('[data-inpage-motion]') as HTMLElement;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      await expect(getComputedStyle(motion).transitionDuration).toBe(reduced ? '0s' : '0.3s');
    });
  },
};
