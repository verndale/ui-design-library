// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=180-82
// source=components/accordion/index.ts
// component=Accordion
import figma from 'figma'

const instance = figma.selectedInstance
const items = instance.getEnum('First item', {
  Collapsed: figma.helpers.react.identifier('accordionItems'),
  Expanded: figma.helpers.react.identifier('accordionItemsWithFirstOpen'),
})
const standalone = instance.getEnum('Standalone', { False: false, True: true })
const headingText = instance.getString('Heading')
const heading = instance.getBoolean('Show heading') ? headingText : undefined
const initialItemCount = instance.getBoolean('Show reveal control')
  ? figma.helpers.react.identifier('2')
  : undefined
const moreLabel = instance.getString('More label')
const lessLabel = instance.getString('Less label')

export default {
  example: figma.code`
    <Accordion${figma.helpers.react.renderProp('items', items)}${figma.helpers.react.renderProp('heading', heading)}${figma.helpers.react.renderProp('standalone', standalone)}${figma.helpers.react.renderProp('initialItemCount', initialItemCount)}${figma.helpers.react.renderProp('moreLabel', moreLabel)}${figma.helpers.react.renderProp('lessLabel', lessLabel)} />
  `,
  imports: ['import { Accordion } from "@verndale/ui-design-library/components/accordion";'],
  id: 'accordion',
}
