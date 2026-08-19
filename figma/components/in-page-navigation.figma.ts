// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=204-58
// source=components/in-page-navigation/index.ts
// component=InPageNavigation
import figma from 'figma'

const instance = figma.selectedInstance
const items = figma.helpers.react.identifier('inPageNavigationItems')
const ariaLabel = instance.getString('Aria label')
const activeId = instance.getEnum('Active section', {
  Overview: 'overview',
  Pricing: 'pricing',
})

export default {
  example: figma.code`
    <InPageNavigation${figma.helpers.react.renderProp('items', items)}${figma.helpers.react.renderProp('ariaLabel', ariaLabel)}${figma.helpers.react.renderProp('activeId', activeId)} />
  `,
  imports: ['import { InPageNavigation } from "@verndale/ui-design-library/components/in-page-navigation";'],
  id: 'in-page-navigation',
}
