import { Fragment } from 'react';
import { buildSrcSet } from '../Image.sources.js';
import type { ImageLoader, ImageSource } from '../Image.types.js';

type PictureSourcesProps = {
  src: string;
  width: number;
  height: number;
  responsive?: ImageSource[];
  loader: ImageLoader;
};

/** WebP precedes its raster fallback at every breakpoint, followed by the default WebP source. */
export function PictureSources({ src, width, height, responsive = [], loader }: PictureSourcesProps) {
  return (
    <>
      {responsive.map((rendition) => (
        <Fragment key={rendition.maxWidth}>
          <source
            media={`(max-width: ${rendition.maxWidth}px)`}
            srcSet={buildSrcSet(loader, src, rendition.width, rendition.height, 'webp')}
            type="image/webp"
          />
          <source
            media={`(max-width: ${rendition.maxWidth}px)`}
            srcSet={buildSrcSet(loader, src, rendition.width, rendition.height)}
          />
        </Fragment>
      ))}
      <source srcSet={buildSrcSet(loader, src, width, height, 'webp')} type="image/webp" />
    </>
  );
}
