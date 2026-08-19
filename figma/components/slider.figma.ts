// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=178-76
// source=components/slider/index.ts
// component=Slider
import figma from 'figma'

const instance = figma.selectedInstance
const label = instance.getString('Label')
const hintText = instance.getString('Hint')
const showHint = instance.getBoolean('Show hint')
const hint = showHint ? hintText : undefined
const unit = instance.getString('Unit') || undefined
const value = instance.getEnum('Selected', {
  Small: 's',
  Medium: 'm',
  Large: 'l',
  'Extra large': 'xl',
})
const showScale = instance.getBoolean('Show scale')
const showSelectedValue = instance.getBoolean('Show selected value')
const options = figma.helpers.react.identifier('sliderOptions')

export default {
  example: figma.code`
    <Slider${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('options', options)}${figma.helpers.react.renderProp('value', value)}${figma.helpers.react.renderProp('hint', hint)}${figma.helpers.react.renderProp('unit', unit)}${figma.helpers.react.renderProp('showScale', showScale)}${figma.helpers.react.renderProp('showSelectedValue', showSelectedValue)} />
  `,
  imports: ['import { Slider } from "@verndale/ui-design-library/components/slider";'],
  id: 'slider',
}
