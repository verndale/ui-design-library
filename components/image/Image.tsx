import type { ImageProps } from './Image.types';
import { buildSrcSet } from './Image.sources';
import { ImageElement } from './parts/ImageElement';
import { PictureSources } from './parts/PictureSources';

/** A responsive image whose source ordering and transform host remain framework-neutral. */
export function Image({
  src,
  alt,
  width,
  height,
  responsive,
  loader,
  loading = 'lazy',
  rounded = false,
  className,
}: ImageProps) {
  const shell = [rounded ? 'overflow-hidden rounded-medium' : '', className].filter(Boolean).join(' ');
  const image = (
    <ImageElement
      src={loader ? loader({ src, width, height }) : src}
      srcSet={loader ? buildSrcSet(loader, src, width, height) : undefined}
      width={width}
      height={height}
      alt={alt}
      loading={loading}
    />
  );

  if (!loader) {
    return (
      <div data-component="image" className={shell || undefined}>
        {image}
      </div>
    );
  }

  return (
    <picture data-component="image" className={shell || undefined}>
      <PictureSources src={src} width={width} height={height} responsive={responsive} loader={loader} />
      {image}
    </picture>
  );
}
