/**
 * Arguments handed to an {@link ImageLoader}. `format` is set only for the
 * format-specific `<source>` elements; the fallback call omits it.
 */
export type ImageLoaderArgs = {
  src: string;
  width: number;
  height: number;
  format?: 'webp';
};

/**
 * Resolves a source URL at a given size and format. This is the seam that keeps
 * the component independent of any one transform host or DAM — supply one that
 * speaks your backend's query contract.
 */
export type ImageLoader = (args: ImageLoaderArgs) => string;

/** A breakpoint-specific rendition: below `maxWidth`, draw at `width`×`height`. */
export type ImageSource = {
  /** Applied as `(max-width: <maxWidth>px)`. */
  maxWidth: number;
  width: number;
  height: number;
};

export type ImageProps = {
  src: string;
  /**
   * Required. Pass `""` for a decorative image — the empty string is a deliberate
   * declaration, where a missing prop is an oversight.
   */
  alt: string;
  /** Intrinsic size. Always rendered, so the element reserves space and causes no layout shift. */
  width: number;
  height: number;
  /** Narrower renditions, largest `maxWidth` first is not required — order is preserved as given. */
  responsive?: ImageSource[];
  /**
   * Supply to emit a full `<picture>`: per-breakpoint WebP and fallback sources at
   * `1x`/`2x`. Without one there is nothing to derive alternates from, so a plain
   * `<img>` is rendered instead of claiming formats that were never generated.
   */
  loader?: ImageLoader;
  loading?: 'lazy' | 'eager';
  /** Clips the image to the medium radius. Purely visual. */
  rounded?: boolean;
  className?: string;
};

/** `1x` and `2x` candidates for one rendition, in the order browsers expect. */
function srcSet(loader: ImageLoader, src: string, width: number, height: number, format?: 'webp') {
  const at = (scale: number) =>
    `${loader({ src, width: width * scale, height: height * scale, format })} ${scale}x`;
  return `${at(1)}, ${at(2)}`;
}

/**
 * A responsive image.
 *
 * The ordering is the part worth not re-deriving: within a `<picture>`, each
 * breakpoint contributes a WebP `<source>` **before** its raster fallback, all
 * narrower renditions precede the default pair, and the `<img>` closes the list —
 * browsers take the first source they can decode, so any other order silently
 * serves the wrong file. `width`/`height` are always emitted so the box is
 * reserved before the bytes arrive, and `alt` is required rather than optional.
 */
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
  const shell = [rounded ? 'overflow-hidden rounded-medium' : '', className]
    .filter(Boolean)
    .join(' ');

  const img = (
    <img
      src={loader ? loader({ src, width, height }) : src}
      srcSet={loader ? srcSet(loader, src, width, height) : undefined}
      width={width}
      height={height}
      alt={alt}
      loading={loading}
      decoding="async"
      className="block h-auto max-w-full"
    />
  );

  // No loader means no alternates exist to point at — a bare <img> is the honest
  // rendering, and it keeps the CLS and alt guarantees either way.
  if (!loader) {
    return (
      <div data-component="image" className={shell || undefined}>
        {img}
      </div>
    );
  }

  return (
    <picture data-component="image" className={shell || undefined}>
      {/* Flattened rather than fragment-wrapped: <picture> reads its direct
          children in order, and each <source> needs its own key. */}
      {(responsive ?? []).flatMap((rendition) => [
        <source
          key={`${rendition.maxWidth}-webp`}
          media={`(max-width: ${rendition.maxWidth}px)`}
          srcSet={srcSet(loader, src, rendition.width, rendition.height, 'webp')}
          type="image/webp"
        />,
        <source
          key={`${rendition.maxWidth}-fallback`}
          media={`(max-width: ${rendition.maxWidth}px)`}
          srcSet={srcSet(loader, src, rendition.width, rendition.height)}
        />,
      ])}
      <source srcSet={srcSet(loader, src, width, height, 'webp')} type="image/webp" />
      {img}
    </picture>
  );
}
