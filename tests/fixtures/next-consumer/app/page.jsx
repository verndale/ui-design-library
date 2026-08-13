import { Accordion } from '@verndale/ui-design-library/components/accordion';
import { Alert } from '@verndale/ui-design-library/components/alert';
import { Avatar } from '@verndale/ui-design-library/components/avatar';
import { Badge } from '@verndale/ui-design-library/components/badge';
import { Breadcrumbs } from '@verndale/ui-design-library/components/breadcrumbs';
import { Button } from '@verndale/ui-design-library/components/button';
import { Card, CardMedia } from '@verndale/ui-design-library/components/card';
import { Image } from '@verndale/ui-design-library/components/image';
import { InPageNavigation } from '@verndale/ui-design-library/components/in-page-navigation';
import { Link } from '@verndale/ui-design-library/components/link';
import { Quote } from '@verndale/ui-design-library/components/quote';
import { RichText } from '@verndale/ui-design-library/components/rich-text';
import { SectionHeader } from '@verndale/ui-design-library/components/section-header';
import { Stat, StatGroup } from '@verndale/ui-design-library/components/stat';

import { ClientComponents } from './ClientComponents';

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-l p-page-margin">
      <SectionHeader heading="Packed Next consumer" description="Rendered by an App Router Server Component." />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }]} currentPageTitle="Fixture" />
      <Alert>Hybrid facade imported directly by the Server Component.</Alert>
      <Badge label="Server output" />
      <Avatar className="w-12"><span className="bg-surface-sunken">A</span></Avatar>
      <Accordion items={[{ id: 'details', label: 'Details', children: 'Hydrated disclosure content.' }]} />
      <InPageNavigation items={[{ id: 'content', label: 'Content' }]} />
      <Card className="group rounded-medium">
        <CardMedia className="aspect-video">
          <div className="flex items-center justify-center bg-surface-sunken text-text-primary">Server media</div>
        </CardMedia>
        <div className="p-s text-text-secondary">Server-safe component composition.</div>
      </Card>
      <Image src="/fixture.png" alt="Fixture" width={16} height={16} />
      <Quote>Server-rendered quotation.</Quote>
      <RichText><p id="content">Server-rendered rich text.</p></RichText>
      <StatGroup heading="Fixture statistics"><Stat value="21" label="components" /></StatGroup>
      <div className="flex gap-s"><Button>Submit</Button><Link href="/">Return home</Link></div>
      <ClientComponents />
    </main>
  );
}
