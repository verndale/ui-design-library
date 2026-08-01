---
date: 2026-07-31
topics: []
plan: none
pr: https://github.com/verndale/ui-design-library/pull/13
---
# Add the Slider component

## Why

- The catalog's **Slider** canonical had no implementation here, and a mature, client-neutral one existed worth banking rather than rebuilding.
- The capture only became possible after the alias that resolves this label was applied to the catalog: before that the label was novel, so no capture could key to a canonical. This is the promote-then-capture loopback closing.
- Its value is not the styling but the announced value. A native `input[type=range]` reports its raw numeric value, so a slider over *named* options announces the index ("2") where the user sees the label ("36 inches"). `aria-valuetext` is the fix, and it is the reason to keep the implementation.

## What changed

- Added `components/slider/` — a slider over a set of named options rather than a numeric range. The native input carries the option *index* internally; the public API speaks in option *values*, so consumers never map numbers back to meaning. Controlled (`value`) and uncontrolled (`defaultValue`) both supported.
- Kept verbatim: the `aria-valuetext` composition of option label plus optional unit; the index-versus-value split; and `aria-hidden` on every decorative part — the painted track, the tick marks, and the min/max scale row — so the accessibility tree sees exactly one labelled control.
- Hardened one thing the source did at runtime: the source re-derived the input's `max` from the rendered DOM to survive a server/markup mismatch. Here `max` comes from `options.length` and the index is clamped against it, so a stale value or a shortened scale cannot point the thumb at an option that is not there.
- Dropped the hidden form-output input rather than porting it: value delivery is `onChange`, and consumers own their own form wiring. Also dropped reading the scale back off per-mark data attributes — the options are a typed prop.
- Tokens: `color-text-primary` / `color-text-secondary` for label and supporting text, `color-border-subtle` for the unfilled track, `color-action-base` for the filled portion, `color-border-focus` for the ring, `radius-pill`, and `size-touch-medium` on the control so the thumb clears the minimum target size.
- Testing note worth carrying: `user-event` does not implement the browser's default action for arrow keys on `input[type=range]` — the key events dispatch and the value never moves. The stories drive the control with a change event and assert the effect (`aria-valuetext`, the rendered description); keyboard reachability is asserted separately with a real Tab.

## Files

- components/slider/Slider.tsx, components/slider/Slider.stories.tsx, components/slider/component.json

## Follow-ups

- The component covers a single-thumb scale. A two-thumb range (min/max selection) is a different interaction contract and would need its own design, not a prop.
