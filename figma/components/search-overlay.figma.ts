// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=217-52
// source=components/search-overlay/index.ts
// component=SearchOverlay
import figma from 'figma'

const instance = figma.selectedInstance
const title = instance.getString('Title')
const supportingCopy = instance.getString('Supporting copy') || undefined
const queryText = instance.getString('Query')
const query = instance.getEnum('State', { Idle: '', Active: queryText })
const inputPlaceholder = instance.getString('Input placeholder')
const onClose = figma.helpers.react.identifier('handleClose')
const onQueryChange = figma.helpers.react.identifier('handleQueryChange')
const quickLinks = figma.helpers.react.identifier('searchQuickLinks')
const resultsPanel = figma.helpers.react.identifier('searchResults')

export default {
  example: figma.code`
    <SearchOverlay${figma.helpers.react.renderProp('open', true)}${figma.helpers.react.renderProp('onClose', onClose)}${figma.helpers.react.renderProp('title', title)}${figma.helpers.react.renderProp('supportingCopy', supportingCopy)}${figma.helpers.react.renderProp('query', query)}${figma.helpers.react.renderProp('onQueryChange', onQueryChange)}${figma.helpers.react.renderProp('inputPlaceholder', inputPlaceholder)}${figma.helpers.react.renderProp('quickLinks', quickLinks)}${figma.helpers.react.renderProp('resultsPanel', resultsPanel)} />
  `,
  imports: ['import { SearchOverlay } from "@verndale/ui-design-library/components/search-overlay";'],
  id: 'search-overlay',
}
