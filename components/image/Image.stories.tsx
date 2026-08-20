import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Image, type ImageLoader } from './index';

/**
 * A stand-in transform host. Real consumers pass one that speaks their DAM's
 * query contract; the story verifies that the component never knows what
 * that contract is.
 */
const loader: ImageLoader = ({ src, width, height, format }) =>
  `${src}?w=${width}&h=${height}${format ? `&format=${format}` : ''}`;

const SRC = '/placeholder.png';

/** The stories assert alternative text, fallback behavior, and `<picture>` source order. */
const meta = {
  title: 'Image',
  component: Image,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "image",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/image",
      "privateAuditDigest": "974b795d61bc97d3dd5a5b345a8b9a2989859fa08ce7a54e82ca3c78557c973d",
      "decisionIds": [
        "sp-image-001",
        "sp-image-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['image.alternative.text', 'image.fallback.single'],
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive image. With a `loader`, renders a full `<picture>`: each breakpoint contributes a WebP source before its raster fallback, narrower renditions precede the default pair, and the `<img>` closes the list. Without one, a plain `<img>`. `width`/`height` are always emitted so the box is reserved, and `alt` is required.',
      },
    },
  },
  argTypes: {
    "src": { control: 'text', description: "Required. Public `src` realization prop." },
    "alt": { control: 'text', description: "Required. Public `alt` realization prop." },
    "width": { control: 'number', description: "Required. Public `width` realization prop." },
    "height": { control: 'number', description: "Required. Public `height` realization prop." },
    "responsive": { control: 'object', description: "Optional. Public `responsive` realization prop." },
    "loader": { control: false, description: "Optional. Public `loader` realization prop." },
    "loading": { control: 'radio', options: ["lazy","eager"], description: "Optional. Public `loading` realization prop. Defaults to \"lazy\"." },
    "rounded": { control: 'boolean', description: "Optional. Public `rounded` realization prop. Defaults to false." },
    "wrapper": { control: 'radio', options: ["auto","none"], description: "Optional. Public `wrapper` realization prop. Defaults to \"auto\"." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { src: SRC, alt: 'A short description', width: 640, height: 360 },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No loader: a plain `<img>` that still reserves its box and carries its alt. */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img', { name: 'A short description' }) as HTMLImageElement;

    await step('image.alternative.text', async () => {
      await expect(img).toHaveAttribute('alt', 'A short description');
      await expect(img.getAttribute('width')).toBe('640');
      await expect(img.getAttribute('height')).toBe('360');
      await expect(img).not.toHaveAttribute('srcset');
      await expect(canvasElement.querySelector('picture')).toBeNull();
    });
  },
};

/**
 * The ordering contract. Asserted as the actual sequence of `<source>` elements,
 * because that sequence *is* the behaviour — a passing "has a webp source" check
 * would not catch the fallback being emitted first.
 */
export const Responsive: Story = {
  args: {
    loader,
    responsive: [
      { maxWidth: 640, width: 640, height: 360 },
      { maxWidth: 1024, width: 1024, height: 576 },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const picture = canvasElement.querySelector('picture');
    await expect(picture).not.toBeNull();

    const sources = Array.from(picture!.querySelectorAll('source'));

    await step('each breakpoint emits WebP before its raster fallback', async () => {
      await expect(sources.map((s) => [s.media, s.type])).toEqual([
        ['(max-width: 640px)', 'image/webp'],
        ['(max-width: 640px)', ''],
        ['(max-width: 1024px)', 'image/webp'],
        ['(max-width: 1024px)', ''],
        ['', 'image/webp'],
      ]);
    });

    await step('image.fallback.single', async () => {
      await expect(picture!.lastElementChild?.tagName).toBe('IMG');
      await expect(picture!.querySelectorAll('img')).toHaveLength(1);
      await expect(within(picture!).getAllByRole('img', { name: 'A short description' })).toHaveLength(1);
    });

    await step('every candidate carries a 1x and a 2x descriptor', async () => {
      for (const source of sources) {
        await expect(source.srcset).toMatch(/ 1x, .+ 2x$/);
      }
    });
  },
};

/** The loader is the de-clienting seam — the component composes URLs it never authors. */
export const CustomLoader: Story = {
  args: {
    loader: ({ src, width, format }) => `https://cdn.example/${format ?? 'auto'}/${width}${src}`,
    responsive: [{ maxWidth: 640, width: 640, height: 360 }],
  },
  play: async ({ canvasElement }) => {
    const first = canvasElement.querySelector('source');
    // 2x doubles the requested width through the loader, not by string surgery.
    await expect(first!.srcset).toBe(
      'https://cdn.example/webp/640/placeholder.png 1x, https://cdn.example/webp/1280/placeholder.png 2x',
    );
  },
};

/** The visual variant — clipped to the medium radius. */
export const Rounded: Story = {
  args: { rounded: true, loader },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-component="image"]') as HTMLElement;
    const docStyle = getComputedStyle(document.documentElement);
    // Computed style reports px; the token is authored in rem, so resolve it
    // rather than comparing a class name.
    const token = docStyle.getPropertyValue('--radius-medium').trim();
    const expected = token.endsWith('rem')
      ? `${parseFloat(token) * parseFloat(docStyle.fontSize)}px`
      : token;

    await expect(getComputedStyle(root).borderTopLeftRadius).toBe(expected);
    await expect(getComputedStyle(root).overflowX).toBe('hidden');
  },
};

/**
 * A decorative image declares itself with `alt=""` and leaves the accessibility
 * tree — asserted by its absence from the img role, not by reading the attribute.
 */
export const Decorative: Story = {
  args: { alt: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('img')).toHaveLength(0);
    await expect(canvasElement.querySelector('img')).not.toBeNull();
  },
};
