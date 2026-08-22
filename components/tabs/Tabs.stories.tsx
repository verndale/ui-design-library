import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Tabs, type TabItem } from './index';

const three: TabItem[] = [
  { id: 'overview', label: 'Overview', panel: <p>Overview panel</p> },
  { id: 'specs', label: 'Specs', panel: <p>Specifications panel</p> },
  { id: 'reviews', label: 'Reviews', panel: <p>Reviews panel</p> },
];

/** The stories assert tab/panel relationships, roving focus, and orientation-aware keys. */
const meta = {
  title: 'Tabs',
  component: Tabs,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "tabs",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/tabs",
      "privateAuditDigest": "fa6de7f9fca5107cad01f215e9b29b09ff23118d6473a35e4ceae4e3847b5c3d",
      "decisionIds": [
        "sp-tabs-001",
        "sp-tabs-002",
        "sp-tabs-003",
        "sp-tabs-004"
      ],
      "representationDecisions": [
        {
          "decisionId": "sp-tabs-002",
          "implementationKey": "tabs",
          "surfaces": [
            "ai-registry",
            "code",
            "figma",
            "storybook"
          ]
        },
        {
          "decisionId": "sp-tabs-004",
          "implementationKey": "tabs--native-select",
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
    realizationEvidence: [
      'tabs.keyboard.roving',
      'tabs.keyboard.vertical',
      'tabs.presentation.visual',
      'tabs.state.selection',
      'tabs.state.controlled',
    ],
    layout: 'padded',
    docs: {
      description: {
        component:
          'A panel-owning tab widget. The selected tab carries `aria-selected`, controls its labelled tabpanel, and is the only tab in the tab order. Orientation-aware arrows, Home, and End move selection and focus.',
      },
    },
  },
  argTypes: {
    "items": { control: 'object', description: "Required. Public `items` realization prop." },
    "ariaLabel": { control: 'text', description: "Required. Public `ariaLabel` realization prop." },
    "activeId": { control: 'text', description: "Optional. Public `activeId` realization prop." },
    "defaultActiveId": { control: 'text', description: "Optional. Public `defaultActiveId` realization prop." },
    "onSelect": { control: false, description: "Optional. Public `onSelect` realization prop." },
    "tabIdPrefix": { control: 'text', description: "Optional. Public `tabIdPrefix` realization prop. Defaults to \"tab\"." },
    "orientation": { control: 'radio', options: ["horizontal","vertical"], description: "Optional. Public `orientation` realization prop. Defaults to \"horizontal\"." },
    "presentation": { control: 'radio', options: ["pills","stroke"], description: "Optional horizontal visual treatment. Defaults to the backward-compatible `pills` presentation." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { items: three, ariaLabel: 'Product sections' },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The pill variant (the default rendering): one filled segment on an inverse surface. */
export const Default: Story = {
  args: { defaultActiveId: 'overview' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>('[data-component="tabs"]');
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const specs = canvas.getByRole('tab', { name: 'Specs' });

    await step('uses the semantic medium gap between tabs and panel', async () => {
      await expect(root).not.toBeNull();
      const styles = getComputedStyle(root!);
      const mediumGap = styles.getPropertyValue('--spacing-m').trim();
      await expect(mediumGap).not.toBe('');
      const probe = document.createElement('div');
      probe.style.width = 'var(--spacing-m)';
      root!.append(probe);
      const resolvedMediumGap = getComputedStyle(probe).width;
      probe.remove();
      await expect(styles.rowGap).toBe(resolvedMediumGap);
    });

    await step('tabs.state.selection', async () => {
      const overviewPanel = canvas.getByRole('tabpanel', { name: 'Overview' });
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      await expect(overview).toHaveAttribute('tabindex', '0');
      await expect(specs).toHaveAttribute('tabindex', '-1');
      await expect(overview).toHaveAttribute('aria-controls', overviewPanel.id);
      await expect(overviewPanel).toHaveAttribute('aria-labelledby', overview.id);
      await expect(canvas.queryByRole('tabpanel', { name: 'Specs' })).not.toBeInTheDocument();

      await userEvent.click(specs);
      await expect(specs).toHaveAttribute('aria-selected', 'true');
      await expect(overview).toHaveAttribute('aria-selected', 'false');
      await expect(canvas.getByRole('tabpanel', { name: 'Specs' })).toBeVisible();
    });
  },
};

/** Horizontal stroke is the governed visual alternate on the existing implementation. */
export const HorizontalStroke: Story = {
  args: { defaultActiveId: 'overview', presentation: 'stroke' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>('[data-component="tabs"]');
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const specs = canvas.getByRole('tab', { name: 'Specs' });

    await step('tabs.presentation.visual', async () => {
      await expect(root).toHaveAttribute('data-presentation', 'stroke');
      await expect(overview).toHaveAttribute('data-presentation', 'stroke');
      await expect(getComputedStyle(overview).borderBottomWidth).toBe('1px');
      await userEvent.click(specs);
      await expect(specs).toHaveAttribute('aria-selected', 'true');
      await expect(getComputedStyle(specs).borderBottomWidth).toBe('1px');
    });
  },
};

/** ArrowRight/ArrowLeft move selection and focus, wrapping at each end. */
export const KeyboardWraparound: Story = {
  args: { defaultActiveId: 'overview' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const reviews = canvas.getByRole('tab', { name: 'Reviews' });

    await step('tabs.keyboard.roving', async () => {
      overview.focus();
      await expect(overview).toHaveFocus();
      await userEvent.keyboard('{ArrowLeft}');
      await expect(reviews).toHaveAttribute('aria-selected', 'true');
      await expect(reviews).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      await expect(overview).toHaveFocus();
      await userEvent.keyboard('{End}');
      await expect(reviews).toHaveFocus();
      await userEvent.keyboard('{Home}');
      await expect(overview).toHaveFocus();
    });
  },
};

/** Vertical orientation uses Up/Down and ignores the horizontal pair. */
export const VerticalKeyboard: Story = {
  args: { defaultActiveId: 'overview', orientation: 'vertical' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const specs = canvas.getByRole('tab', { name: 'Specs' });

    await step('tabs.keyboard.vertical', async () => {
      overview.focus();
      await userEvent.keyboard('{ArrowDown}');
      await expect(specs).toHaveFocus();
      await expect(specs).toHaveAttribute('aria-selected', 'true');
      await userEvent.keyboard('{ArrowUp}');
      await expect(overview).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect(overview).toHaveFocus();
      await expect(overview).toHaveAttribute('aria-selected', 'true');
    });
  },
};

function ControlledTabs({ initialActiveId = 'overview' }: { initialActiveId?: string }) {
  const [activeId, setActiveId] = useState(initialActiveId);
  return <Tabs items={three} ariaLabel="Product sections" activeId={activeId} onSelect={setActiveId} />;
}

/** Controlled selection and invalid IDs use the same first-item fallback without trapping state. */
export const ControlledAndInvalidActiveId: Story = {
  render: () => <ControlledTabs initialActiveId="missing" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const specs = canvas.getByRole('tab', { name: 'Specs' });
    await step('tabs.state.controlled', async () => {
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      await userEvent.click(specs);
      await expect(specs).toHaveAttribute('aria-selected', 'true');
      await expect(canvas.getByRole('tabpanel', { name: 'Specs' })).toBeVisible();
    });
  },
};

/** An invalid uncontrolled default falls back to the first item and remains selectable. */
export const InvalidDefaultActiveId: Story = {
  args: { defaultActiveId: 'missing' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(canvas.getByRole('tab', { name: 'Reviews' }));
    await expect(canvas.getByRole('tabpanel', { name: 'Reviews' })).toBeVisible();
  },
};

/** Two tabs is the minimum that keeps keyboard navigation active. */
export const TwoTabs: Story = {
  args: {
    defaultActiveId: 'grid',
    items: [
      { id: 'grid', label: 'Grid', panel: <p>Grid panel</p> },
      { id: 'list', label: 'List', panel: <p>List panel</p> },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('tab', { name: 'Grid' });
    const list = canvas.getByRole('tab', { name: 'List' });
    grid.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(list).toHaveAttribute('aria-selected', 'true');
  },
};

/** A single item remains a valid named tab/panel relationship without keyboard movement. */
export const SingleTab: Story = {
  args: { items: [three[0]!], defaultActiveId: 'overview' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = canvas.getByRole('tab', { name: 'Overview' });
    const panel = canvas.getByRole('tabpanel', { name: 'Overview' });
    tab.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(tab).toHaveFocus();
    await expect(tab).toHaveAttribute('aria-controls', panel.id);
  },
};

/** Empty items produce no partial tab widget. */
export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-component="tabs"]')).toBeNull();
  },
};

/** Enough tabs to wrap onto a second row — layout stays centred and the wraparound still holds. */
export const ManyTabs: Story = {
  args: {
    defaultActiveId: 't0',
    items: Array.from({ length: 8 }, (_, i) => ({ id: `t${i}`, label: `Section ${i + 1}`, panel: <p>{`Panel ${i + 1}`}</p> })),
  },
};

/**
 * The colour transition is driven by `--duration-base`, so the reduced-motion
 * media query is the single switch. Re-run under emulated reduced motion by
 * `pnpm test:motion`, where the same assertion flips to `0s`.
 */
export const ReducedMotion: Story = {
  tags: ['motion'],
  args: { defaultActiveId: 'overview' },
  play: async ({ canvasElement }) => {
    const tab = within(canvasElement).getByRole('tab', { name: 'Overview' });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(tab).transitionDuration).toBe(reduced ? '0s' : '0.3s');
  },
};

const stateTabs: TabItem[] = [
  { id: 'selected', label: 'Selected', panel: <p>Selected panel</p> },
  { id: 'unselected', label: 'Unselected', panel: <p>Unselected panel</p> },
];

/** Code-backed specimens used to govern the unpublished Figma interaction-state presentation. */
export const InteractionStates: Story = {
  parameters: {
    pseudo: {
      rootSelector: 'body',
      hover: [
        '.state-tabs-pills-hover [role="tab"][aria-selected="false"]',
        '.state-tabs-stroke-hover [role="tab"][aria-selected="false"]',
      ],
      focusVisible: [
        '.state-tabs-pills-focus [role="tab"][aria-selected="true"]',
        '.state-tabs-stroke-focus [role="tab"][aria-selected="true"]',
      ],
    },
  },
  render: () => (
    <div className="grid gap-xl">
      {(['pills', 'stroke'] as const).map((presentation) => (
        <section key={presentation} className="grid gap-s">
          <h2 className="m-0 text-base font-semibold text-text-primary">{presentation}</h2>
          <div className="grid grid-cols-1 items-start gap-l xl:grid-cols-4">
            {(['selected', 'unselected', 'hover', 'focus'] as const).map((state) => (
              <div key={state} className="grid gap-s">
                <span className="text-sm text-text-secondary">{state}</span>
                <Tabs
                  items={stateTabs}
                  ariaLabel={`${presentation} ${state} states`}
                  defaultActiveId="selected"
                  presentation={presentation}
                  tabIdPrefix={`state-${presentation}-${state}`}
                  classNames={{
                    root: `state-tabs-${presentation}-${state}`,
                    panels: 'sr-only',
                    tab: state === 'hover'
                      ? presentation === 'stroke'
                        ? '[&[aria-selected=false]]:border-border-strong [&[aria-selected=false]]:text-text-primary'
                        : '[&[aria-selected=false]]:text-text-primary'
                      : state === 'focus'
                        ? 'outline-2 outline-solid outline-offset-1 outline-border-focus'
                        : undefined,
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const root = (presentation: string, state: string) =>
      canvasElement.querySelector<HTMLElement>(`.state-tabs-${presentation}-${state}`)!;

    await step('selected and unselected targets preserve the public selection state', async () => {
      for (const presentation of ['pills', 'stroke']) {
        const specimen = within(root(presentation, 'selected'));
        await expect(specimen.getByRole('tab', { name: 'Selected' })).toHaveAttribute('aria-selected', 'true');
        await expect(specimen.getByRole('tab', { name: 'Unselected' })).toHaveAttribute('aria-selected', 'false');
      }
    });

    await step('forced unselected hover changes a meaningful visual property', async () => {
      for (const presentation of ['pills', 'stroke']) {
        const baseline = within(root(presentation, 'unselected')).getByRole('tab', { name: 'Unselected' });
        const hover = within(root(presentation, 'hover')).getByRole('tab', { name: 'Unselected' });
        await waitFor(() => expect(hover).toHaveClass('pseudo-hover'));
        await waitFor(() => {
          const before = getComputedStyle(baseline);
          const after = getComputedStyle(hover);
          if (matchMedia('(forced-colors: active)').matches) expect(hover.className).toContain('text-text-primary');
          else expect([after.color, after.borderBottomColor]).not.toEqual([before.color, before.borderBottomColor]);
        });
      }
    });

    await step('forced focus-visible exposes the governed ring', async () => {
      for (const presentation of ['pills', 'stroke']) {
        const focus = within(root(presentation, 'focus')).getByRole('tab', { name: 'Selected' });
        await waitFor(() => expect(focus).toHaveClass('pseudo-focus-visible'));
        const style = getComputedStyle(focus);
        await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
        await expect(style.outlineStyle).not.toBe('none');
      }
    });
  },
};
