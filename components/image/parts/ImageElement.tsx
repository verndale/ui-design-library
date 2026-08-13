import type { ImgHTMLAttributes } from 'react';

type ImageElementProps = Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'height' | 'loading' | 'src' | 'srcSet' | 'width'
>;

/** The final fallback element always reserves its intrinsic box and owns the accessible name. */
export function ImageElement(props: ImageElementProps) {
  return <img {...props} decoding="async" className="block h-auto max-w-full" />;
}
