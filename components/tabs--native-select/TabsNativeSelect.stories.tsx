import type { Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect, useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { TabsNativeSelect, type TabsNativeSelectItem } from './index';

const items: TabsNativeSelectItem[] = [
  { id: 'overview', label: 'Overview', panel: <p>Overview panel</p> },
  { id: 'specs', label: 'Specs', panel: <p>Specifications panel</p> },
  { id: 'reviews', label: 'Reviews', panel: <p>Reviews panel</p> },
];

const meta = {
  title: 'Tabs / Native select',
  component: TabsNativeSelect,
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      contractVersion: 1,
      auditComponentKey: 'tabs',
      auditStatus: 'cleared',
      privateAuditRef: 'library-source-parity:2026-08-19/components/tabs',
      privateAuditDigest: 'fa6de7f9fca5107cad01f215e9b29b09ff23118d6473a35e4ceae4e3847b5c3d',
      decisionIds: ['sp-tabs-001', 'sp-tabs-002', 'sp-tabs-003', 'sp-tabs-004'],
      representationDecisions: [
        {
          decisionId: 'sp-tabs-002',
          implementationKey: 'tabs',
          surfaces: ['ai-registry', 'code', 'figma', 'storybook'],
        },
        {
          decisionId: 'sp-tabs-004',
          implementationKey: 'tabs--native-select',
          surfaces: ['ai-registry', 'code', 'figma', 'storybook'],
        },
      ],
      requiredRepresentationSurfaces: ['ai-registry', 'code', 'figma', 'storybook'],
    },
    realizationEvidence: [
      'tabs-native-select.responsive.hidden',
      'tabs-native-select.responsive.focus',
      'tabs-native-select.semantics',
      'tabs-native-select.state.controlled',
      'tabs-native-select.state.selection',
    ],
    layout: 'padded',
    docs: {
      description: {
        component:
          'The governed Tabs structural alternate. It preserves one selection and panel model while replacing the pill tablist below lg with a labelled native select.',
      },
    },
  },
  argTypes: {
    "items": { control: 'object', description: 'Required. Text-labelled tabs and their owned panels.' },
    "ariaLabel": { control: 'text', description: 'Required. Accessible name for the group, tablist, and native select.' },
    "activeId": { control: 'text', description: 'Optional controlled active item ID.' },
    "defaultActiveId": { control: 'text', description: 'Optional uncontrolled initial active item ID.' },
    "onSelect": { control: false, description: 'Optional selection callback.' },
    "tabIdPrefix": { control: 'text', description: 'Optional deterministic tab, panel, and select ID prefix.' },
    "className": { control: 'text', description: 'Optional root class.' },
    "classNames": { control: 'object', description: 'Optional governed slot classes.' },
  },
  args: { items, ariaLabel: 'Product sections', defaultActiveId: 'overview' },
} satisfies Meta<typeof TabsNativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At lg and above, only the pill tablist participates in layout and focus. */
export const Desktop: Story = {
  globals: { viewport: { value: 'lgBoundary', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist', { name: 'Product sections' });
    const select = canvasElement.querySelector('select')!;
    await step('tabs-native-select.responsive.hidden', async () => {
      await expect(tablist.offsetParent).not.toBeNull();
      await expect(select.offsetParent).toBeNull();
      await expect(document.activeElement).not.toBe(select);
    });
    await step('tabs-native-select.semantics', async () => {
      await expect(canvas.getByRole('group', { name: 'Product sections' })).toBeInTheDocument();
      await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
    });
  },
};

/** The wide source-parity specimen keeps the same desktop pill control. */
export const DesktopWide: Story = {
  globals: { viewport: { value: 'sourceParity1440', isRotated: false } },
};

/** Below lg, the named native select controls the same labelled panel tree. */
export const Mobile: Story = {
  globals: { viewport: { value: 'sourceParity768', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const tablist = canvasElement.querySelector<HTMLElement>('[role="tablist"]')!;
    const select = canvas.getByRole('combobox', { name: 'Product sections' });
    await step('tabs-native-select.responsive.hidden', async () => {
      await expect(tablist.offsetParent).toBeNull();
      for (const tab of tablist.querySelectorAll('button')) await expect(tab.offsetParent).toBeNull();
      await expect(select.offsetParent).not.toBeNull();
      const hiddenSelectedTab = tablist.querySelector<HTMLButtonElement>('[aria-selected="true"]')!;
      hiddenSelectedTab.focus();
      await expect(hiddenSelectedTab).not.toHaveFocus();
    });
    await step('tabs-native-select.state.selection', async () => {
      await expect(canvas.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
      await userEvent.selectOptions(select, 'specs');
      const panel = canvas.getByRole('tabpanel', { name: 'Specs' });
      const hiddenTab = tablist.querySelector<HTMLButtonElement>('[aria-selected="true"]')!;
      await expect(panel).toBeVisible();
      await expect(select).toHaveAttribute('aria-controls', panel.id);
      await expect(hiddenTab).toHaveTextContent('Specs');
      await expect(hiddenTab).toHaveAttribute('aria-controls', panel.id);
      await expect(panel).toHaveAttribute('aria-labelledby', hiddenTab.id);
    });
    await step('tabs-native-select.semantics', async () => {
      await expect(canvas.getByRole('group', { name: 'Product sections' })).toContainElement(select);
    });
  },
};

function ControlledNativeSelect({ initialActiveId = 'overview' }: { initialActiveId?: string }) {
  const [activeId, setActiveId] = useState(initialActiveId);
  return <TabsNativeSelect items={items} ariaLabel="Product sections" activeId={activeId} onSelect={setActiveId} />;
}

/** The native select follows and updates controlled state without a breakpoint-local copy. */
export const Controlled: Story = {
  globals: { viewport: { value: 'sourceParity390', isRotated: false } },
  render: () => <ControlledNativeSelect />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Product sections' });
    await step('tabs-native-select.state.controlled', async () => {
      await expect(select).toHaveValue('overview');
      await userEvent.selectOptions(select, 'reviews');
      await expect(select).toHaveValue('reviews');
      await expect(canvas.getByRole('tabpanel', { name: 'Reviews' })).toBeVisible();
    });
  },
};

/** An invalid controlled ID renders the first valid item and remains recoverable. */
export const ControlledInvalidActiveId: Story = {
  globals: { viewport: { value: 'sourceParity390', isRotated: false } },
  render: () => <ControlledNativeSelect initialActiveId="missing" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Product sections' });
    await expect(select).toHaveValue('overview');
    await userEvent.selectOptions(select, 'specs');
    await expect(select).toHaveValue('specs');
    await expect(canvas.getByRole('tabpanel', { name: 'Specs' })).toBeVisible();
  },
};

type FakeMediaQueryList = MediaQueryList & { setMatches(matches: boolean): void };

function createFakeMediaQueryList(): FakeMediaQueryList {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const media = {
    matches: true,
    media: '(min-width: 64rem)',
    onchange: null,
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => true,
    setMatches(matches: boolean) {
      media.matches = matches;
      const event = { matches, media: media.media } as MediaQueryListEvent;
      for (const listener of listeners) listener(event);
    },
  };
  return media as FakeMediaQueryList;
}

function ResponsiveFocusHarness() {
  const media = useRef(createFakeMediaQueryList());
  const root = useRef<HTMLDivElement>(null);
  const [desktop, setDesktop] = useState(true);
  useLayoutEffect(() => {
    const original = window.matchMedia;
    window.matchMedia = (query) => query === media.current.media ? media.current : original(query);
    return () => { window.matchMedia = original; };
  }, []);
  const toggle = () => {
    const next = !desktop;
    if (root.current) root.current.dataset.focusMode = next ? 'desktop' : 'mobile';
    setDesktop(next);
    media.current.setMatches(next);
  };
  return (
    <div ref={root} data-focus-mode={desktop ? 'desktop' : 'mobile'}>
      <style>{`[data-focus-mode="desktop"] [data-tabs-responsive="tablist"]{display:block!important}[data-focus-mode="desktop"] [data-tabs-responsive="select"]{display:none!important}[data-focus-mode="mobile"] [data-tabs-responsive="tablist"]{display:none!important}[data-focus-mode="mobile"] [data-tabs-responsive="select"]{display:block!important}`}</style>
      <TabsNativeSelect items={items} ariaLabel="Product sections" defaultActiveId="overview" />
      <button type="button" data-focus-toggle onClick={toggle}>Toggle breakpoint</button>
    </div>
  );
}

/** Focus moves to the equivalent active control whenever the focused copy becomes hidden. */
export const BreakpointFocusTransfer: Story = {
  render: () => <ResponsiveFocusHarness />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const select = canvasElement.querySelector('select')!;
    const toggle = canvasElement.querySelector<HTMLButtonElement>('[data-focus-toggle]')!;
    await step('tabs-native-select.responsive.focus', async () => {
      overview.focus();
      toggle.click();
      await expect(select).toHaveFocus();
      toggle.click();
      await expect(overview).toHaveFocus();
    });
  },
};

/** Invalid defaults, a single item, and empty input degrade without partial widgets. */
export const BoundaryInputs: Story = {
  args: { defaultActiveId: 'missing' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Overview', hidden: true })).toHaveAttribute('aria-selected', 'true');
  },
};

export const SingleItem: Story = {
  args: { items: [items[0]!] },
};

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-component="tabs-native-select"]')).toBeNull();
  },
};
