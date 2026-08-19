// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=181-70
// source=components/tabs/index.ts
// component=Tabs
import figma from 'figma'

const instance = figma.selectedInstance
const items = figma.helpers.react.identifier('tabItems')
const ariaLabel = instance.getString('Aria label')
const activeId = instance.getEnum('Active tab', {
  Overview: 'overview',
  Specs: 'specs',
  Reviews: 'reviews',
})
const orientation = instance.getEnum('Orientation', {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
})

export default {
  example: figma.code`
    <Tabs${figma.helpers.react.renderProp('items', items)}${figma.helpers.react.renderProp('ariaLabel', ariaLabel)}${figma.helpers.react.renderProp('activeId', activeId)}${figma.helpers.react.renderProp('orientation', orientation)} />
  `,
  imports: ['import { Tabs } from "@verndale/ui-design-library/components/tabs";'],
  id: 'tabs',
}
