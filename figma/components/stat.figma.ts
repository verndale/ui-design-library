// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=176-12
// source=components/stat/index.ts
// component=Stat
import figma from 'figma'

const instance = figma.selectedInstance
const value = instance.getString('Value')
const label = instance.getString('Label')
const description = instance.getString('Description') || undefined
const contentOrder = instance.getEnum('Content order', {
  'Value first': 'value-first',
  'Label first': 'label-first',
})

export default {
  example: figma.code`
    <Stat${figma.helpers.react.renderProp('value', value)}${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('description', description)}${figma.helpers.react.renderProp('contentOrder', contentOrder)} />
  `,
  imports: ['import { Stat } from "@verndale/ui-design-library/components/stat";'],
  id: 'stat',
}
