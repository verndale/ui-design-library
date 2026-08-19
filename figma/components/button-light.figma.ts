// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=22-2
// source=components/button/index.ts
// component=Button
import figma from 'figma'

const instance = figma.selectedInstance
const label = instance.getString('Label')
const variant = instance.getEnum('Variant', {
  Primary: 'primary',
  Secondary: 'secondary',
})
const size = instance.getEnum('Size', {
  Large: 'large',
  Medium: 'medium',
  Small: 'small',
})
const disabled = instance.getEnum('Disabled', {
  False: false,
  True: true,
})
const startIcon = instance.getBoolean('Start icon')
  ? figma.helpers.react.identifier('startIcon')
  : undefined
const endIcon = instance.getBoolean('End icon')
  ? figma.helpers.react.identifier('endIcon')
  : undefined

export default {
  example: figma.code`
    <Button${figma.helpers.react.renderProp('variant', variant)}${figma.helpers.react.renderProp('size', size)}${figma.helpers.react.renderProp('surface', 'light')}${figma.helpers.react.renderProp('disabled', disabled)}${figma.helpers.react.renderProp('startIcon', startIcon)}${figma.helpers.react.renderProp('endIcon', endIcon)}>
      ${figma.helpers.react.renderChildren(label)}
    </Button>
  `,
  imports: ['import { Button } from "@verndale/ui-design-library/components/button";'],
  id: 'button-light',
  metadata: { nestable: true },
}
