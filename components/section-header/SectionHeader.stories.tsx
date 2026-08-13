import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SectionHeader } from './index';

const meta = {
  title: 'Section header',
  component: SectionHeader,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    realizationEvidence: ['section-header.heading.logical'],
    layout: 'padded',
    docs: {
      description: {
        component:
          'A section-intro block: an optional eyebrow above an h2, with optional supporting copy, aligned as one unit. The heading is an h2 (a section header never owns the page h1) and the eyebrow a p (no phantom outline level); each optional part collapses when omitted.',
      },
    },
  },
  argTypes: {
    "eyebrow": { control: false, description: "Optional. Public `eyebrow` realization prop." },
    "heading": { control: false, description: "Required. Public `heading` realization prop." },
    "description": { control: false, description: "Optional. Public `description` realization prop." },
    "alignment": { control: 'radio', options: ["left","center"], description: "Optional. Public `alignment` realization prop. Defaults to \"left\"." },
    "headingLevel": { control: 'radio', options: [2,3,4,5,6], description: "Optional. Public `headingLevel` realization prop. Defaults to 2." },
    "as": { control: 'radio', options: ["div","header"], description: "Optional. Public `as` realization prop. Defaults to \"div\"." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: {
    eyebrow: 'Our vision',
    heading: 'Building the infrastructure of the future',
    description:
      'Digital twin solutions are an essential enabler on the path to sustainable, resilient infrastructure.',
    alignment: 'left',
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /** The eyebrow is a <p> accent; the block's only heading is the <h2>. */
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { level: 2 });
    await step('section-header.heading.logical', async () => {
      await expect(heading).toHaveTextContent('Building the infrastructure of the future');
      await expect(canvas.getAllByRole('heading')).toHaveLength(1);
      await expect(canvas.getByText('Our vision')).toBeVisible();
    });
  },
};

/** Alignment applies to the whole group, not per field. */
export const Centered: Story = {
  args: { alignment: 'center' },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-component="section-header"]') as HTMLElement;
    // Assert the effect (computed cross-axis alignment), not the class name.
    await expect(getComputedStyle(root).alignItems).toBe('center');
  },
};

/** Both optional parts omitted — only the required heading renders. */
export const HeadingOnly: Story = {
  args: { eyebrow: undefined, description: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(canvas.queryByText('Our vision')).toBeNull();
  },
};

/** A link inside the description resolves and carries its own accessible name. */
export const WithInlineLink: Story = {
  args: {
    description: (
      <p>
        Explore our <a href="#approach">approach to sustainability</a> and what it means for your projects.
      </p>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'approach to sustainability' });
    await expect(link).toBeVisible();
  },
};
