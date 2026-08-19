// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=211-4
// source=components/carousel/index.ts
// component=Carousel
import figma from 'figma'

const instance = figma.selectedInstance
const slides = figma.helpers.react.identifier('carouselSlides')
const label = instance.getString('Label')
const loop = instance.getBoolean('Loop')
const statusSeparator = instance.getString('Status separator')

export default {
  example: figma.code`
    <Carousel${figma.helpers.react.renderProp('slides', slides)}${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('loop', loop)}${figma.helpers.react.renderProp('statusSeparator', statusSeparator)} />
  `,
  imports: ['import { Carousel } from "@verndale/ui-design-library/components/carousel";'],
  id: 'carousel',
}
