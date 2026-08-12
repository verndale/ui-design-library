'use client';

import { useState } from 'react';
import { Carousel } from '@verndale/ui-design-library/components/carousel';
import { Modal } from '@verndale/ui-design-library/components/modal';
import { SearchInput } from '@verndale/ui-design-library/components/search-input';
import { SearchOverlay } from '@verndale/ui-design-library/components/search-overlay';
import { Slider } from '@verndale/ui-design-library/components/slider';
import { Tabs } from '@verndale/ui-design-library/components/tabs';
import { Toast } from '@verndale/ui-design-library/components/toast';

export function ClientComponents() {
  const [query, setQuery] = useState('');
  return (
    <section className="flex flex-col gap-s">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search the packed library"
        results={query ? <p>Searching for {query}</p> : undefined}
      />
      <Carousel label="Fixture slides" slides={[<span key="one">One</span>]} />
      <Slider label="Fixture option" options={[{ value: 'one', label: 'One' }]} />
      <Tabs ariaLabel="Fixture tabs" items={[{ id: 'one', label: 'One' }]} />
      <Modal open={false} onClose={() => undefined} title="Fixture modal" />
      <SearchOverlay
        open={false}
        onClose={() => undefined}
        title="Fixture search"
        query={query}
        onQueryChange={setQuery}
      />
      <Toast open={false}>Fixture toast</Toast>
    </section>
  );
}
