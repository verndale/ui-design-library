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
      await waitFor(() => expect(body.getByRole('textbox')).toHaveFocus());
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
      await expect(body.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
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
