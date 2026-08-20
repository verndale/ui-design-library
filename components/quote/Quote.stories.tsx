import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Quote } from './index';

const meta = {
  title: 'Quote',
  component: Quote,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "quote",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/quote",
      "privateAuditDigest": "8231f0223ca38887883b576944c99402869bef5d16ce570907c4727f4353b3e3",
      "decisionIds": [
        "sp-quote-001",
        "sp-quote-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['quote.semantics.blockquote'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A pull quote. Renders a real `blockquote`, and the accent rule uses a logical inline-start border so it flips correctly in right-to-left.',
      },
    },
  },
  argTypes: {
    "children": { control: false, description: "Required. Public `children` realization prop." },
    "cite": { control: 'text', description: "Optional. Public `cite` realization prop." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { className: 'max-w-[46ch] text-xl', children: null },
} satisfies Meta<typeof Quote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Quote {...args}>Projects are temporary. Knowledge is permanent.</Quote>,
  /** A real blockquote rather than a styled div. */
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const quote = canvas.getByRole('blockquote');

    await step('quote.semantics.blockquote', async () => {
      await expect(quote).toHaveTextContent('Projects are temporary. Knowledge is permanent.');
      await expect(quote).toHaveAttribute('data-component', 'quote');
      await expect(quote.tagName).toBe('BLOCKQUOTE');
    });
  },
};

/** With attribution, which is the common real-world shape. */
export const WithAttribution: Story = {
  render: (args) => (
    <figure className="m-0">
      <Quote {...args}>The catalog defines the concept; the library implements it.</Quote>
      <figcaption className="mt-2xs ps-m text-text-secondary">— Platform documentation</figcaption>
    </figure>
  ),
};

/** The rule spans the full height of a long quote. */
export const LongForm: Story = {
  render: (args) => (
    <Quote {...args}>
      Repeated unresolved labels can identify vocabulary missing from the catalog. The retrospective records
      those labels with their project occurrences for later review.
    </Quote>
  ),
};

/** Right-to-left: the accent rule moves to the right automatically. */
export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <Quote {...args}>المشاريع مؤقتة. المعرفة دائمة.</Quote>
    </div>
  ),
  /** The accent rule must sit on the inline-start edge, which is the right in RTL. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const style = getComputedStyle(canvas.getByRole('blockquote'));

    // Asserted on the inline axis, so this stays true in both directions and
    // fails if the border ever reverts to a physical side.
    await expect(style.borderInlineStartWidth).toBe('4px');
    await expect(style.borderInlineEndWidth).toBe('0px');
    await expect(style.borderRightWidth).toBe('4px');
  },
};
