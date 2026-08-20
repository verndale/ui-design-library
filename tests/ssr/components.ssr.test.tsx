import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Accordion } from '../../components/accordion/index';
import { Alert } from '../../components/alert/index';
import { Avatar } from '../../components/avatar/index';
import { Badge } from '../../components/badge/index';
import { Breadcrumbs } from '../../components/breadcrumbs/index';
import { Button } from '../../components/button/index';
import { Card } from '../../components/card/index';
import { Carousel } from '../../components/carousel/index';
import { Image } from '../../components/image/index';
import { InPageNavigation } from '../../components/in-page-navigation/index';
import { InPageNavigationModalDrawer } from '../../components/in-page-navigation--modal-drawer/index';
import { Link } from '../../components/link/index';
import { Modal } from '../../components/modal/index';
import { Quote } from '../../components/quote/index';
import { RichText } from '../../components/rich-text/index';
import { SearchInput } from '../../components/search-input/index';
import { SearchOverlay } from '../../components/search-overlay/index';
import { SectionHeader } from '../../components/section-header/index';
import { Slider } from '../../components/slider/index';
import { Stat } from '../../components/stat/index';
import { Tabs } from '../../components/tabs/index';
import { Toast } from '../../components/toast/index';

const fixtures: Array<[string, ReactElement]> = [
  ['Accordion', <Accordion items={[{ id: 'a', label: 'Question', children: 'Answer' }]} />],
  ['Alert', <Alert>Saved</Alert>],
  ['Avatar', <Avatar><span>Portrait</span></Avatar>],
  ['Badge', <Badge label="New" />],
  ['Breadcrumbs', <Breadcrumbs items={[{ label: 'Home', href: '/' }]} currentPageTitle="Current" />],
  ['Button', <Button>Continue</Button>],
  ['Card', <Card>Card body</Card>],
  ['Carousel', <Carousel label="Highlights" slides={[<span key="one">One</span>]} />],
  ['Image', <Image src="/image.png" alt="Example" width={640} height={360} />],
  ['InPageNavigation', <InPageNavigation items={[{ id: 'overview', label: 'Overview' }]} />],
  [
    'InPageNavigationModalDrawer',
    <InPageNavigationModalDrawer items={[{ id: 'overview', label: 'Overview' }]} />,
  ],
  ['Link', <Link href="/next">Next</Link>],
  ['Modal', <Modal open onClose={() => undefined} title="Dialog">Body</Modal>],
  ['Quote', <Quote>Knowledge lasts.</Quote>],
  ['RichText', <RichText><p>Formatted copy</p></RichText>],
  ['SearchInput', <SearchInput />],
  [
    'SearchOverlay',
    <SearchOverlay
      open
      onClose={() => undefined}
      title="Search"
      query=""
      onQueryChange={() => undefined}
    />,
  ],
  ['SectionHeader', <SectionHeader heading="Section" />],
  ['Slider', <Slider label="Plan" options={[{ value: 'basic', label: 'Basic' }]} />],
  ['Stat', <Stat value="98%" label="satisfaction" />],
  ['Tabs', <Tabs ariaLabel="Sections" items={[{ id: 'first', label: 'First' }]} />],
  ['Toast', <Toast open>Saved</Toast>],
];

describe('DOM-free server rendering', () => {
  for (const [name, element] of fixtures) {
    it(`renders ${name} without browser globals`, () => {
      expect(globalThis).not.toHaveProperty('document');
      expect(globalThis).not.toHaveProperty('window');
      expect(() => renderToString(element)).not.toThrow();
    });
  }
});
