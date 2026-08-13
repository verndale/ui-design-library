import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Avatar } from './index';

const meta = {
  title: 'Avatar',
  component: Avatar,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    realizationEvidence: ['avatar.semantics.content'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A square portrait frame. It guarantees the 1:1 crop and nothing else — sizing is the caller\'s, so the same component works at 40px in a byline and 280px in a profile header.',
      },
    },
  },
  argTypes: {
    "children": { control: false, description: "Required. Public `children` realization prop." },
    "id": { control: 'text', description: "Optional. Public `id` realization prop." },
    "ariaLabel": { control: 'text', description: "Optional. Public `ariaLabel` realization prop." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { className: 'w-[200px]', children: null },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const Portrait = () => (
  <img
    alt="Portrait of Jane"
    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23b9bfc8'/></svg>"
    className="size-full object-cover"
  />
);

export const Default: Story = {
  render: (args) => <Avatar {...args}><Portrait /></Avatar>,
  /** The root retains native figure semantics. */
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const figure = canvas.getByRole('figure');

    await step('avatar.semantics.content', async () => {
      await expect(figure).toHaveAttribute('data-component', 'avatar');
      await expect(figure.tagName.toLowerCase()).toBe('figure');
      await expect(figure).not.toHaveAttribute('role');
      await expect(canvas.getAllByRole('img')).toHaveLength(1);
      await expect(canvas.getByRole('img', { name: 'Portrait of Jane' })).toBeInTheDocument();
    });
  },
};

/** A described portrait stays reachable by its accessible name. */
export const WithDescribedPortrait: Story = {
  render: (args) => (
    <Avatar {...args}>
      <img
        alt="Portrait of Jane, VP of Operations"
        src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23b9bfc8'/></svg>"
        className="size-full object-cover"
      />
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('figure')).toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: 'Portrait of Jane, VP of Operations' })).toBeInTheDocument();
  },
};

/** The same component across the sizes a project actually needs. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-s">
      {['w-10', 'w-16', 'w-24', 'w-40'].map((w) => (
        <Avatar key={w} className={w}>
          <Portrait />
        </Avatar>
      ))}
    </div>
  ),
};

/** A wide child is cropped rather than distorted. */
export const CropsWideMedia: Story = {
  render: (args) => (
    <Avatar {...args}>
      <img alt="" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='150'><rect width='400' height='150' fill='%23b9bfc8'/></svg>" className="size-full object-cover" />
    </Avatar>
  ),
  /**
   * The de-clienting stripped the source's fixed min-width/height, leaving the
   * 1:1 crop as the only thing the frame still guarantees. That is now the
   * contract, so the story measures it directly.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const figure = canvas.getByRole('figure');
    const box = figure.getBoundingClientRect();

    await expect(box.width).toBeGreaterThan(0);
    await expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(1);
    await expect(getComputedStyle(figure).overflow).toBe('hidden');
  },
};
