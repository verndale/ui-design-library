import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RichText } from './index';

const meta = {
  title: 'Rich text',
  component: RichText,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "rich-text",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/rich-text",
      "privateAuditDigest": "74a0f0848c853d83fa48fa0a6b5eb99ecb236331c64427be970c0c91d59708cf",
      "decisionIds": [
        "sp-rich-text-001",
        "sp-rich-text-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['rich-text.semantics.authored'],
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders already-authored formatted content — headings, paragraphs, lists, links, inline emphasis — as one flowing block styled by the design system. The read-only counterpart to a Rich text editor. Pass composed content as children; CMS-string ingestion and sanitization are the caller’s concern.',
      },
    },
  },
  // Required `children` is supplied per story via `render`; this satisfies the type.
  argTypes: {
    "children": { control: false, description: "Required. Public `children` realization prop." },
    "listStyle": { control: 'radio', options: ["default","checkmark"], description: "Optional. Public `listStyle` realization prop. Defaults to \"default\"." },
    "as": { control: 'radio', options: ["div","article"], description: "Optional. Public `as` realization prop. Defaults to \"div\"." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { children: null },
} satisfies Meta<typeof RichText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <RichText {...args}>
      <h2>Press contacts</h2>
      <p>
        Reach the media relations team at <a href="mailto:press@example.com">press@example.com</a>.
      </p>
    </RichText>
  ),
  /** Authored heading renders at its level; the link carries its own accessible name. */
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('rich-text.semantics.authored', async () => {
      await expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent('Press contacts');
      await expect(canvas.getByRole('link', { name: 'press@example.com' })).toBeVisible();
      await expect(canvas.getByRole('heading', { level: 2 }).tagName).toBe('H2');
    });
  },
};

/** The checkmark list style recolours the marker via ::marker; the list stays a real ul/li. */
export const Checkmark: Story = {
  args: { listStyle: 'checkmark' },
  render: (args) => (
    <RichText {...args}>
      <h2>What you get</h2>
      <ul>
        <li>Unlimited seats for your whole team</li>
        <li>Priority support with a dedicated manager</li>
        <li>Access to every module</li>
      </ul>
    </RichText>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The list semantics survive the restyle — the marker is decorative CSS.
    await expect(canvas.getByRole('list')).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

/** Every supported element, in valid outline order — the KitchenSink equivalent. */
export const FullFlow: Story = {
  render: (args) => (
    <RichText {...args}>
      <h2>Heading level 2</h2>
      <p>
        A paragraph with <strong>bold</strong> and <em>italic</em> emphasis, plus an{' '}
        <a href="https://example.com">inline link</a>.
      </p>
      <h3>Heading level 3</h3>
      <ul>
        <li>Unordered item one</li>
        <li>Unordered item two</li>
      </ul>
      <ol>
        <li>Ordered item one</li>
        <li>Ordered item two</li>
      </ol>
    </RichText>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Authored headings render at their levels, in valid order (h2 then h3).
    await expect(canvas.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(canvas.getByRole('heading', { level: 3 })).toBeVisible();
    await expect(canvas.getAllByRole('list')).toHaveLength(2);
  },
};
