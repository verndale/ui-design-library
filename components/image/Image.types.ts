export type ImageLoaderArgs = {
  src: string;
  width: number;
  height: number;
  format?: 'webp';
};

export type ImageLoader = (args: ImageLoaderArgs) => string;

export type ImageSource = {
  maxWidth: number;
  width: number;
  height: number;
};

export type ImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  responsive?: ImageSource[];
  loader?: ImageLoader;
  loading?: 'lazy' | 'eager';
  rounded?: boolean;
  className?: string;
  classNames?: ImageClassNames;
  /** Remove the non-semantic wrapper only when no loader/picture is required. */
  wrapper?: 'auto' | 'none';
};
import type { SlotClassNames } from '../../src/lib/classNames.js';

export type ImageClassNames = SlotClassNames<'root' | 'image'>;
