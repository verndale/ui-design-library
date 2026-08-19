// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=177-30
// source=components/search-input/index.ts
// component=SearchInput
import figma from 'figma'

const instance = figma.selectedInstance
const placeholder = instance.getString('Placeholder')
const label = instance.getString('Label')
const query = instance.getString('Query')
const value = instance.getEnum('State', { Empty: undefined, Filled: query })
const resultsContent = instance.getString('Results content')
const showResults = instance.getBoolean('Show results')
const results = showResults ? resultsContent : undefined
const showLabel = instance.getBoolean('Show label')
const showClearButton = instance.getBoolean('Show clear button')
const showSubmitButton = instance.getBoolean('Show submit button')

export default {
  example: figma.code`
    <SearchInput${figma.helpers.react.renderProp('placeholder', placeholder)}${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('value', value)}${figma.helpers.react.renderProp('results', results)}${figma.helpers.react.renderProp('showLabel', showLabel)}${figma.helpers.react.renderProp('showClearButton', showClearButton)}${figma.helpers.react.renderProp('showSubmitButton', showSubmitButton)} />
  `,
  imports: ['import { SearchInput } from "@verndale/ui-design-library/components/search-input";'],
  id: 'search-input',
}
