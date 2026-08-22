import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';

import { SearchOverlay } from './index';

/** A small quick-links grid for the idle state. */
function QuickLinks() {
  return (
    <nav aria-label="Quick links" className="grid grid-cols-2 gap-2xs">
      {['Products', 'Support', 'Downloads', 'Contact'].map((label) => (
        <a key={label} href="#" className="rounded-medium bg-surface-sunken px-s py-2xs text-text-primary">
          {label}
        </a>
      ))}
    </nav>
  );
}

/** A results panel for the active state — recent searches + suggestions. */
function Results() {
  return (
    <>
      <section>
        <h3 className="m-0 text-sm font-semibold text-text-secondary uppercase">Recent searches</h3>
        <ul className="m-0 mt-2xs list-none p-0">
          <li>
            <a href="#" className="text-link">
              staad pro
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h3 className="m-0 text-sm font-semibold text-text-secondary uppercase">Suggestions</h3>
        <ul className="m-0 mt-2xs list-none p-0">
          <li>
            <a href="#" className="text-link">
              STAAD.Pro structural analysis
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}

/**
 * The story file is this component's API contract. `argTypes` is what a
 * consuming agent reads to know the surface, so every prop is described here
 * rather than only in the source.
 */
const meta = {
  title: 'Search overlay',
  component: SearchOverlay,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "search-overlay",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/search-overlay",
      "privateAuditDigest": "cda45de6673e940dd388c9bdc30498f354570a3f7dafd6e7c2241aec77872ba8",
      "decisionIds": [
        "sp-search-overlay-001",
        "sp-search-overlay-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['search-overlay.focus.modal', 'search-overlay.focus.restoration', 'search-overlay.focus.background-inert', 'search-overlay.semantics.dialog', 'search-overlay.announcement.results'],
    layout: 'fullscreen',
    docs: {
      // The overlay portals into document.body and is fixed-position, so an
      // inline Docs story paints over the page. Each story gets its own iframe.
      story: { inline: false, height: '560px' },
    },
  },
  argTypes: {
    "open": { control: 'boolean', description: "Required. Public `open` realization prop." },
    "onClose": { control: false, description: "Required. Public `onClose` realization prop." },
    "title": { control: 'text', description: "Required. Public `title` realization prop." },
    "supportingCopy": { control: false, description: "Optional. Public `supportingCopy` realization prop." },
    "query": { control: 'text', description: "Required. Public `query` realization prop." },
    "onQueryChange": { control: false, description: "Required. Public `onQueryChange` realization prop." },
    "onSubmit": { control: false, description: "Optional. Public `onSubmit` realization prop." },
    "inputPlaceholder": { control: 'text', description: "Optional. Public `inputPlaceholder` realization prop." },
    "quickLinks": { control: false, description: "Optional. Public `quickLinks` realization prop." },
    "resultsPanel": { control: false, description: "Optional. Public `resultsPanel` realization prop." },
    "closeLabel": { control: 'text', description: "Optional. Public `closeLabel` realization prop. Defaults to \"Close search\"." },
    "returnFocusRef": { control: false, description: "Optional. Public `returnFocusRef` realization prop." },
    "id": { control: 'text', description: "Optional. Public `id` realization prop." },
    "titleHeadingLevel": { control: 'radio', options: [2,3,4,5,6], description: "Optional. Public `titleHeadingLevel` realization prop. Defaults to 2." },
    "closeIcon": { control: false, description: "Optional. Public `closeIcon` realization prop." },
    "inputLabel": { control: 'text', description: "Optional. Public `inputLabel` realization prop. Defaults to \"Search\"." },
    "clearLabel": { control: 'text', description: "Optional. Public `clearLabel` realization prop." },
    "submitLabel": { control: 'text', description: "Optional. Public `submitLabel` realization prop." },
    "resultsLabel": { control: 'text', description: "Optional. Public `resultsLabel` realization prop." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: {
    title: 'What are you looking for?',
    supportingCopy: 'Search products, support articles, and downloads.',
    open: false,
    query: '',
    onQueryChange: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof SearchOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opened from a trigger, which is how it behaves in a real page. */
export const Default: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-small bg-action-base px-s py-2xs text-text-inverse"
        >
          Open search
        </button>
        <SearchOverlay
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          query={query}
          onQueryChange={setQuery}
          quickLinks={<QuickLinks />}
          resultsPanel={<Results />}
        />
      </>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Open search' });

    await step('search-overlay.focus.restoration', async () => {
      await userEvent.click(trigger);
      await body.findByRole('dialog');
      await waitFor(() => expect(body.getByRole('searchbox')).toHaveFocus());
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());

      await userEvent.click(trigger);
      await userEvent.click(await body.findByRole('button', { name: 'Close search' }));
      await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());

      await userEvent.click(trigger);
      const dialog = await body.findByRole('dialog');
      const scrim = dialog.ownerDocument.querySelector('[aria-hidden].fixed.inset-0');
      await expect(scrim).toBeTruthy();
      await userEvent.click(scrim as HTMLElement);
      await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  },
};

/** Idle state: empty query shows the quick links, and no results region exists. */
export const IdleShowsQuickLinks: Story = {
  args: { open: true, query: '' },
  render: (args) => <SearchOverlay {...args} onQueryChange={() => {}} quickLinks={<QuickLinks />} resultsPanel={<Results />} />,
  play: async ({ step }) => {
    const body = within(document.body);
    await body.findByRole('dialog');

    await step('shows the quick links', async () => {
      await expect(body.getByRole('navigation', { name: 'Quick links' })).toBeInTheDocument();
    });

    await step('has no results region while idle', async () => {
      await expect(body.queryByRole('region', { name: 'Search results' })).not.toBeInTheDocument();
    });

    await step('search-overlay.semantics.dialog', async () => {
      const dialog = body.getByRole('dialog');
      const labelId = dialog.getAttribute('aria-labelledby');
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(labelId).toBeTruthy();
      await expect(document.getElementById(labelId!)).toHaveTextContent('What are you looking for?');
      await expect(body.getByRole('search', { name: 'Search' })).toBeInTheDocument();
      await expect(body.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
    });

    await step('search-overlay.focus.background-inert', async () => {
      const background = [...document.body.children].filter((child): child is HTMLElement => child instanceof HTMLElement && !child.matches('[data-ui-overlay-layer]'));
      await expect(background.length).toBeGreaterThan(0);
      await expect(background.every((child) => child.inert)).toBe(true);
    });
  },
};

/** Active state: a non-empty query swaps the quick links for the results region. */
export const ActiveShowsResults: Story = {
  args: { open: true, query: 'staad' },
  render: (args) => <SearchOverlay {...args} onQueryChange={() => {}} quickLinks={<QuickLinks />} resultsPanel={<Results />} />,
  play: async ({ step }) => {
    const body = within(document.body);
    await body.findByRole('dialog');

    await step('search-overlay.announcement.results', async () => {
      const results = await body.findByRole('region', { name: 'Search results' });
      await expect(results).toHaveAttribute('aria-live', 'polite');
      await expect(results).toHaveAttribute('aria-atomic', 'true');
    });

    await step('the quick links are gone', async () => {
      await expect(body.queryByRole('navigation', { name: 'Quick links' })).not.toBeInTheDocument();
    });
  },
};

/** Tab cycles within the overlay rather than escaping to the page behind it. */
export const TrapsFocus: Story = {
  args: { open: true, query: 'staad' },
  render: (args) => <SearchOverlay {...args} onQueryChange={() => {}} resultsPanel={<Results />} />,
  play: async ({ step }) => {
    const body = within(document.body);
    const dialog = await body.findByRole('dialog');

    // Initial focus lands on mount via SearchInput autoFocus; wait for it before
    // tabbing so this tests the trap rather than the document's tab order.
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    await step('search-overlay.focus.modal', async () => {
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
      for (let i = 0; i < 6; i += 1) {
        await userEvent.tab();
        await expect(dialog.contains(document.activeElement)).toBe(true);
      }
      for (let i = 0; i < 4; i += 1) {
        await userEvent.tab({ shift: true });
        await expect(dialog.contains(document.activeElement)).toBe(true);
      }
    });
  },
};

/** A click on the dimmed area dismisses; a click inside the panel must not. */
export const ClosesOnBackdrop: Story = {
  args: { open: true, query: '', onClose: fn() },
  render: (args) => <SearchOverlay {...args} onQueryChange={() => {}} quickLinks={<QuickLinks />} />,
  play: async ({ args, step }) => {
    const body = within(document.body);
    const dialog = await body.findByRole('dialog');

    await step('a click inside the panel is ignored', async () => {
      await userEvent.click(dialog);
      await expect(args.onClose).not.toHaveBeenCalled();
    });

    await step('a click on the scrim closes', async () => {
      const scrim = dialog.ownerDocument.querySelector('[aria-hidden].fixed.inset-0');
      await expect(scrim).toBeTruthy();
      await userEvent.click(scrim as HTMLElement);
      await expect(args.onClose).toHaveBeenCalled();
    });
  },
};

/** The entrance animation collapses under reduced motion. */
export const RespectsReducedMotion: Story = {
  tags: ['motion'],
  args: { open: true, query: '' },
  render: (args) => <SearchOverlay {...args} onQueryChange={() => {}} quickLinks={<QuickLinks />} />,
  play: async () => {
    const body = within(document.body);
    const dialog = await body.findByRole('dialog');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The panel animates via --animate-scale-in, built from --duration-base.
    // Nothing hard-codes a duration, so the media query is the single switch.
    await expect(getComputedStyle(dialog).animationDuration).toBe(reduced ? '0s' : '0.3s');
    await expect(getComputedStyle(dialog).animationName).not.toBe('none');
  },
};

function StateQuickLinks() {
  return (
    <div className="flex flex-col gap-s">
      <h3 className="m-0 text-base font-semibold text-text-primary">Popular searches</h3>
      <nav aria-label="State quick links" className="flex flex-wrap gap-2xs">
        {['Components', 'Accessibility', 'Tokens', 'Code Connect'].map((label) => (
          <a key={label} href="#" className="rounded-pill bg-surface-sunken px-s py-2xs text-sm font-semibold text-text-primary">{label}</a>
        ))}
      </nav>
    </div>
  );
}

function StateResults() {
  return (
    <>
      {[
        ['Component catalog', '23 components'],
        ['Component architecture', 'Documentation'],
        ['Component variants', 'Guidance'],
      ].map(([title, meta]) => (
        <a key={title} href="#" className="flex items-center justify-between border-b border-border-subtle py-s text-text-primary">
          <span className="text-xl font-semibold">{title}</span>
          <span className="text-sm text-text-secondary">{meta}</span>
        </a>
      ))}
    </>
  );
}

const SEARCH_OVERLAY_INTERACTION_STATES = [
  { id: 'idle', label: 'Idle', query: '', closeState: 'default' },
  { id: 'active', label: 'Active', query: 'component', closeState: 'default' },
  { id: 'close-default', label: 'Close default', query: '', closeState: 'default' },
  { id: 'close-hover', label: 'Close hover', query: '', closeState: 'hover' },
  { id: 'close-focus-visible', label: 'Close focus visible', query: '', closeState: 'focus-visible' },
] as const;

/** Code-backed specimens used to govern the Figma interaction-state presentation. */
export const InteractionStates: Story = {
  tags: ['motion'],
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '2100px' } },
    pseudo: {
      rootSelector: 'body',
      hover: '.state-search-overlay-close-hover button[aria-label="Close search"]',
      focusVisible: '.state-search-overlay-close-focus-visible button[aria-label="Close search"]',
    },
  },
  render: () => (
    <div className="min-h-screen bg-surface-sunken p-l text-sm text-text-secondary">
      Search overlay state specimens render below as static portal layers for design evidence.
      {SEARCH_OVERLAY_INTERACTION_STATES.map((state) => (
        <SearchOverlay
          key={state.id}
          open
          onClose={() => {}}
          title="What are you looking for?"
          supportingCopy="Search products, support articles, and downloads."
          query={state.query}
          onQueryChange={() => {}}
          inputPlaceholder="Search the library"
          quickLinks={<StateQuickLinks />}
          resultsPanel={<StateResults />}
          className={`state-search-overlay-${state.id} !mx-auto !max-h-none`}
          classNames={{
            backdrop: 'hidden',
            viewport: '!static !inset-auto !z-auto !block',
            results: 'flex-col',
            closeButton: state.closeState === 'hover'
              ? '!bg-action-hover'
              : state.closeState === 'focus-visible'
                ? 'outline-2 outline-solid outline-offset-2 outline-border-focus'
                : undefined,
          }}
        />
      ))}
    </div>
  ),
  play: async ({ step }) => {
    const root = (state: string) => document.body.querySelector<HTMLElement>(`.state-search-overlay-${state}`)!;
    const close = (state: string) => within(root(state)).getByRole('button', { name: 'Close search', hidden: true });

    await waitFor(() => expect(document.body.querySelectorAll('[data-component="search-overlay"]')).toHaveLength(5));

    await step('idle and active public query states remain visually distinct', async () => {
      await expect(root('idle')).toHaveTextContent('Popular searches');
      await expect(root('idle')).not.toHaveTextContent('Component catalog');
      await expect(root('active')).toHaveTextContent('Component catalog');
      await expect(root('active')).not.toHaveTextContent('Popular searches');
      await expect(within(root('active')).getByRole('searchbox', { name: 'Search', hidden: true })).toHaveValue('component');
    });

    await step('forced close hover resolves the semantic action surface', async () => {
      const baseline = close('close-default');
      const hover = close('close-hover');
      await waitFor(() => expect(hover).toHaveClass('pseudo-hover'));
      const probe = document.createElement('span');
      probe.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-action-hover');
      document.body.append(probe);
      const expectedHover = getComputedStyle(probe).backgroundColor;
      probe.remove();
      await expect(getComputedStyle(hover).backgroundColor).toBe(expectedHover);
      if (expectedHover !== getComputedStyle(baseline).backgroundColor) {
        await expect(getComputedStyle(hover).backgroundColor).not.toBe(getComputedStyle(baseline).backgroundColor);
      }
    });

    await step('forced close focus exposes the governed pill focus ring', async () => {
      const focus = close('close-focus-visible');
      await waitFor(() => expect(focus).toHaveClass('pseudo-focus-visible'));
      const style = getComputedStyle(focus);
      await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
      await expect(style.outlineStyle).not.toBe('none');
      await expect(style.outlineOffset).toBe('2px');
    });

    await step('search-overlay.close.motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      await expect(getComputedStyle(close('close-default')).transitionDuration).toBe(reduced ? '0s' : '0.15s');
      await expect(getComputedStyle(root('idle')).animationDuration).toBe(reduced ? '0s' : '0.3s');
    });
  },
};
