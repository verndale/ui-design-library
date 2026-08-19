// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=179-52
// source=components/breadcrumbs/index.ts
// component=Breadcrumbs
import figma from 'figma'

const instance = figma.selectedInstance
const items = figma.helpers.react.identifier('breadcrumbItems')
const currentPageTitle = instance.getString('Current page')
const backLinkLabel = instance.getString('Back link label') || undefined
const presentation = instance.getEnum('Presentation', {
  'Responsive desktop': 'responsive',
  'Responsive below xl': 'responsive',
  Trail: 'trail',
  'Back link': 'back-link',
})
const surface = instance.getEnum('Surface', { Light: 'light', Dark: 'dark' })
const leadingItem = instance.getBoolean('Show leading item') ? '…' : undefined
const separator = instance.getString('Separator')
const backIcon = instance.getBoolean('Show back icon')
  ? figma.helpers.react.identifier('backIcon')
  : undefined

export default {
  example: figma.code`
    <Breadcrumbs${figma.helpers.react.renderProp('items', items)}${figma.helpers.react.renderProp('currentPageTitle', currentPageTitle)}${figma.helpers.react.renderProp('backLinkLabel', backLinkLabel)}${figma.helpers.react.renderProp('leadingItem', leadingItem)}${figma.helpers.react.renderProp('presentation', presentation)}${figma.helpers.react.renderProp('surface', surface)}${figma.helpers.react.renderProp('separator', separator)}${figma.helpers.react.renderProp('backIcon', backIcon)} />
  `,
  imports: ['import { Breadcrumbs } from "@verndale/ui-design-library/components/breadcrumbs";'],
  id: 'breadcrumbs',
}
