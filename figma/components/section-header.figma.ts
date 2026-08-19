// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=64-99
// source=components/section-header/index.ts
// component=SectionHeader
import figma from 'figma'

const instance = figma.selectedInstance
const heading = instance.getString('Heading')
const showEyebrow = instance.getBoolean('Show eyebrow')
const eyebrow = showEyebrow ? instance.getString('Eyebrow') : undefined
const showDescription = instance.getBoolean('Show description')
const description = showDescription ? instance.getString('Description') : undefined
const alignment = instance.getEnum('Alignment', {
  Left: 'left',
  Center: 'center',
})

export default {
  example: figma.code`
    <SectionHeader${figma.helpers.react.renderProp('heading', heading)}${figma.helpers.react.renderProp('eyebrow', eyebrow)}${figma.helpers.react.renderProp('description', description)}${figma.helpers.react.renderProp('alignment', alignment)} />
  `,
  imports: [
    'import { SectionHeader } from "@verndale/ui-design-library/components/section-header";',
  ],
  id: 'section-header',
}
