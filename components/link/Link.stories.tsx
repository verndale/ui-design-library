import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Link } from './index';

const meta = {
  title: 'Link',
  component: Link,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "link",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/link",
      "privateAuditDigest": "7d3802ac82291a8659798275b32331948ee55571493d472fd7dc511354fdabce",
      "decisionIds": [
        "sp-link-001",
        "sp-link-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['link.keyboard.activation', 'link.state.disabled', 'link.target.size'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A text link. The underline animates on hover **and on keyboard focus**, and because it is drawn with `background-size` plus `box-decoration-break: clone`, each wrapped line gets its own underline rather than one rule spanning the inline box.',
      },
    },
  },
  argTypes: {
    "children": { control: false, description: "Required. Public `children` realization prop." },
    "size": { control: 'radio', options: ["large","medium","small"], description: "Optional. Public `size` realization prop. Defaults to \"large\"." },
    "as": { control: false, description: "Optional. Public `as` realization prop." },
    "touchTarget": { control: 'boolean', description: "Optional. Public `touchTarget` realization prop. Defaults to false." },
    "startIcon": { control: false, description: "Optional. Public `startIcon` realization prop." },
    "endIcon": { control: false, description: "Optional. Public `endIcon` realization prop." },
    "disabled": { control: 'boolean', description: "Optional. Public `disabled` realization prop. Defaults to false." },
    "href": { control: 'text', description: "Required for automated reuse. Native link destination." },
    "target": { control: 'radio', options: ["_self","_blank","_parent","_top"], description: "Optional. Native browsing context." },
    "rel": { control: 'text', description: "Optional. Native link relationship." },
    "onClick": { control: false, description: "Optional. Native activation callback." },
    "aria-label": { control: 'text', description: "Optional. Native accessible-name override." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { children: 'Read the documentation', href: '#top', size: 'large' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <Link
      {...args}
      onClick={(event) => {
        event.preventDefault();
        args.onClick?.(event);
      }}
    />
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Read the documentation' });

    await step('link.keyboard.activation', async () => {
      await expect(link.tagName.toLowerCase()).toBe('a');
      await expect(link).toHaveAttribute('href', '#top');
      link.focus();
      await userEvent.keyboard('{Enter}');
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};

/** Tab to it — the underline draws on focus, not only hover. */
export const KeyboardFocus: Story = {
  args: { children: 'Tab to me and watch the underline' },
};

/** Every wrapped line receives its own underline. */
export const WrappingText: Story = {
  render: (args) => (
    <p className="max-w-[24ch]">
      <Link {...args}>A link long enough to wrap onto several lines, each underlined separately</Link>
    </p>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    const label = link.querySelector('span');
    await expect(label).toBeTruthy();

    const style = getComputedStyle(label!);
    // WebKit still needs the prefixed property, which is not in lib.dom.
    const clone = style.boxDecorationBreak || style.getPropertyValue('-webkit-box-decoration-break');

    await expect(clone).toBe('clone');
    await expect(style.display).toBe('inline');
    // Actually wrapped, so the assertion above is being exercised.
    await expect(label!.getClientRects().length).toBeGreaterThan(1);
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-2xs">
      {(['large', 'medium', 'small'] as const).map((size) => (
        <Link key={size} {...args} size={size}>
          {size}
        </Link>
      ))}
    </div>
  ),
};

/** The hit pad extends the tap target without changing layout height. */
export const WithTouchTarget: Story = {
  args: { touchTarget: true, children: 'Standalone call to action' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Standalone call to action' });

    const pad = getComputedStyle(link, '::before');
    const touchLarge = getComputedStyle(document.documentElement).getPropertyValue('--size-touch-large').trim();

    await step('link.target.size', async () => {
      await expect(pad.content).not.toBe('none');
      await expect(parseFloat(pad.minHeight)).toBeGreaterThanOrEqual(44);
      await expect(touchLarge).toBeTruthy();
      await expect(parseFloat(getComputedStyle(link).minHeight || '0')).toBeLessThan(44);
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Unavailable', onClick: fn() },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Unavailable' });

    await step('link.state.disabled', async () => {
      await expect(link).toHaveAttribute('aria-disabled', 'true');
      await expect(getComputedStyle(link).pointerEvents).toBe('none');
      link.focus();
      await userEvent.keyboard('{Enter}');
      await expect(args.onClick).not.toHaveBeenCalled();
    });
  },
};

/** Code-backed specimens used to govern the unpublished Figma interaction-state presentation. */
export const InteractionStates: Story = {
  parameters: {
    pseudo: {
      rootSelector: 'body',
      hover: '[data-figma-link-state="hover"]',
      focusVisible: '[data-figma-link-state="focus-visible"]',
    },
  },
  render: () => (
    <div className="grid grid-cols-1 items-start gap-l xl:grid-cols-4">
      {(['default', 'hover', 'focus-visible', 'disabled'] as const).map((state) => (
        <div key={state} className="grid gap-s">
          <span className="text-sm text-text-secondary">{state}</span>
          <Link
            href="#interaction-states"
            size="medium"
            disabled={state === 'disabled'}
            data-figma-link-state={state}
            className={state === 'hover' ? 'opacity-90' : state === 'focus-visible' ? 'outline-2 outline-solid outline-offset-2 outline-border-focus' : undefined}
            classNames={{ content: state === 'hover' || state === 'focus-visible' ? 'bg-[length:100%_1px] bg-[position:0%_100%]' : undefined }}
          >
            Documentation
          </Link>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const target = (state: string) => canvasElement.querySelector<HTMLElement>(`[data-figma-link-state="${state}"]`)!;

    await step('forced hover changes opacity and draws the multiline underline', async () => {
      const baseline = target('default');
      const hover = target('hover');
      await waitFor(() => expect(hover).toHaveClass('pseudo-hover'));
      await waitFor(() => expect(parseFloat(getComputedStyle(hover).opacity)).toBeLessThan(parseFloat(getComputedStyle(baseline).opacity)));
      const baselineLabel = baseline.querySelector('span')!;
      const hoverLabel = hover.querySelector('span')!;
      await expect(getComputedStyle(hoverLabel).backgroundSize).not.toBe(getComputedStyle(baselineLabel).backgroundSize);
    });

    await step('forced focus-visible exposes the focus ring and underline', async () => {
      const focus = target('focus-visible');
      await waitFor(() => expect(focus).toHaveClass('pseudo-focus-visible'));
      const style = getComputedStyle(focus);
      await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
      await expect(style.outlineStyle).not.toBe('none');
      await expect(getComputedStyle(focus.querySelector('span')!).backgroundSize).not.toBe(
        getComputedStyle(target('default').querySelector('span')!).backgroundSize,
      );
    });

    await step('disabled remains a non-activating link state', async () => {
      const disabled = target('disabled');
      await expect(disabled).toHaveAttribute('aria-disabled', 'true');
      await expect(disabled).not.toHaveAttribute('href');
      await expect(getComputedStyle(disabled).pointerEvents).toBe('none');
    });
  },
};
