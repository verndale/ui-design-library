import { addons } from 'storybook/manager-api';
import type { TagBadgeParameters } from 'storybook-addon-tag-badges';

/**
 * Maturity badges in the sidebar.
 *
 * `maturity` is declared in each component.json and mirrored to a `maturity:*`
 * tag on the story meta; `pnpm contracts` fails if the two disagree. Promoting a
 * component past `candidate` is meant to be a deliberate decision, and a badge
 * on every entry is what stops "everything is still candidate" going unnoticed.
 *
 * This is manager config rather than a preview parameter — the addon reads it
 * from `addons.getConfig()`, so it does not work from preview.ts.
 */
const tagBadges: TagBadgeParameters = [
  {
    tags: { prefix: 'maturity' },
    badge: ({ getTagSuffix, tag }) => {
      const maturity = getTagSuffix(tag) ?? 'unknown';
      const style = (
        { candidate: 'orange', supported: 'green', deprecated: 'red' } as const
      )[maturity as 'candidate' | 'supported' | 'deprecated'];

      return {
        text: maturity,
        style: style ?? 'grey',
        tooltip:
          maturity === 'candidate'
            ? 'Captured and rewritten, not yet promoted. Promoting to supported is a deliberate decision, not a side effect of editing.'
            : `Maturity: ${maturity}`,
      };
    },
  },
];

addons.setConfig({ tagBadges });
