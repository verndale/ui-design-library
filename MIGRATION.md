# Server-first component architecture migration

The package keeps its existing public component subpaths, but its implementation architecture and four APIs have changed. This guide covers the consumer work required when upgrading across that breaking release.

## Executable ESM and reuse contract v2

Package versions before `4.1.0` emitted extensionless relative specifiers that bundlers accepted but native Node ESM could not load. Version `4.1.0` and later emits explicit `.js` specifiers and verifies every packed component subpath with native dynamic import. Public directory-shaped imports do not change.

Orchestration consumers must use an exact `4.1.0` or newer dependency and require `package.json#uiDesignLibrary.reuseContractVersion === 2`. Every `component.json` now declares the primary AI candidate through `exportName` and `rendering`; secondary named exports remain available to application developers but are not separately inventoried for automatic reuse.

## Stable imports

Continue importing from the directory-shaped package subpath:

```tsx
import { Button } from '@verndale/ui-design-library/components/button';
import { Modal } from '@verndale/ui-design-library/components/modal';
```

Each subpath now resolves through that component directory's `index.ts` facade. Internal filenames and `parts/` are private implementation details. Do not import `Button.tsx`, `Modal.client.tsx`, or anything below `parts/` directly.

There is still no package-root barrel and no short alias such as `@verndale/ui-design-library/button`.

## Server and client use

Server-compatible components can be rendered directly from a React Server Component. They do not make their consumer a Client Component:

```tsx
import { Alert } from '@verndale/ui-design-library/components/alert';
import { Badge } from '@verndale/ui-design-library/components/badge';
import { Button } from '@verndale/ui-design-library/components/button';

export function SaveSummary() {
  return (
    <section>
      <Alert>Your changes are ready to save.</Alert>
      <Badge label="Draft" />
      <form action="/save">
        <Button type="submit">Save</Button>
      </form>
    </section>
  );
}
```

Accordion and In-page navigation are hybrid components. Their public trees are server-compatible and they hydrate only the disclosure or scroll-spy leaves that need browser state. Their props must still be serializable when they cross a Server-to-Client boundary.

Interactive exports belong in a Client Component when they receive event callbacks or local state:

```tsx
'use client';

import { useState } from 'react';
import { DismissibleAlert } from '@verndale/ui-design-library/components/alert';
import { DismissibleBadge } from '@verndale/ui-design-library/components/badge';

export function Filters() {
  const [showAlert, setShowAlert] = useState(true);
  const [showFilter, setShowFilter] = useState(true);

  return (
    <>
      <DismissibleAlert open={showAlert} onDismiss={() => setShowAlert(false)}>
        Your report is ready.
      </DismissibleAlert>
      {showFilter ? (
        <DismissibleBadge label="Rail freight" onRemove={() => setShowFilter(false)} />
      ) : null}
    </>
  );
}
```

Carousel, Modal, Search input, Search overlay, Slider, Tabs, and Toast remain client-only component subpaths. Their package facades carry `'use client'`, so consumers do not need to deep-import a client implementation.

## Button

`Button` is now a native, server-compatible button. The context provider, context hook, polymorphic `as`, and `href` props were removed.

Replace contextual surfaces with the explicit `surface` prop:

```tsx
// Before
<ButtonSurfaceProvider value="dark">
  <Button>Continue</Button>
</ButtonSurfaceProvider>

// After
<Button surface="dark">Continue</Button>
```

Use `Link` for navigation:

```tsx
// Before
<Button as="a" href="/reports">View reports</Button>

// After
<Link href="/reports">View reports</Link>
```

`variant`, `size`, `surface`, `startIcon`, `endIcon`, `children`, and native button attributes remain supported.

## Alert

`Alert` is now the server-compatible, non-dismissible notification. It keeps `open`, `variant`, `children`, and `className`.

Move dismissal and auto-dismiss behavior to `DismissibleAlert`:

```tsx
// Before
<Alert onDismiss={close} dismissLabel="Close" dismissMs={5000}>
  Saved.
</Alert>

// After
<DismissibleAlert onDismiss={close} dismissLabel="Close" dismissMs={5000}>
  Saved.
</DismissibleAlert>
```

`DismissibleAlert` requires `onDismiss` and also accepts every base Alert prop.

## Badge

`Badge` is now the server-compatible, non-dismissible label. Move removal behavior to `DismissibleBadge`:

```tsx
// Before
<Badge label="Rail freight" onRemove={remove} removeLabel="Remove filter" />

// After
<DismissibleBadge label="Rail freight" onRemove={remove} removeLabel="Remove filter" />
```

`DismissibleBadge` requires `onRemove` and accepts the Badge visual/content props: `label`, `disabled`, `surface`, `className`, and `startIcon`.

## Carousel

Carousel control customization now uses serializable decorative nodes instead of render callbacks. Replace `renderPrevious` and `renderNext` with `previousIcon` and `nextIcon`:

```tsx
// Before
<Carousel
  label="Featured stories"
  slides={slides}
  renderPrevious={({ disabled }) => <ChevronLeft muted={disabled} />}
  renderNext={({ disabled }) => <ChevronRight muted={disabled} />}
/>

// After
<Carousel
  label="Featured stories"
  slides={slides}
  previousIcon={<ChevronLeft />}
  nextIcon={<ChevronRight />}
/>
```

The Carousel owns disabled state and exposes it through its native disabled buttons. The supplied icons are decorative and hidden from the accessibility tree; `previousLabel` and `nextLabel` remain the controls' accessible names.

## Next.js status

The published component core remains framework-neutral:

- it does not import `next/link`, `next/image`, or another `next/*` module;
- `next` is not a runtime or peer dependency;
- router and image integration remain consumer-owned through the existing framework-neutral seams;
- Next is installed only as a development dependency for the packaged consumer fixture run by `pnpm test:next`.

`pnpm verify` runs the regular tests and package build before that Next consumer fixture. This proves the compiled package can be consumed across React Server and Client Component boundaries without turning Next into part of the public runtime contract.
