import type { QuoteProps } from './Quote.types.js';
import { QuoteFrame } from './parts/QuoteFrame.js';

/** A pull quote: accent rule plus display-scale typography. */
export function Quote(props: QuoteProps) {
  return <QuoteFrame {...props} />;
}
