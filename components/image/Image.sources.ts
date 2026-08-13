import type { ImageLoader } from './Image.types.js';

/** Builds the ordered density candidates shared by the image and source leaves. */
export function buildSrcSet(
  loader: ImageLoader,
  src: string,
  width: number,
  height: number,
  format?: 'webp',
) {
  const at = (scale: number) =>
    `${loader({ src, width: width * scale, height: height * scale, format })} ${scale}x`;
  return `${at(1)}, ${at(2)}`;
}
