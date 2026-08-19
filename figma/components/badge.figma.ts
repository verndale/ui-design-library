// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=167-80
// source=components/badge/index.ts
// component=Badge
import figma from 'figma'

const instance = figma.selectedInstance
const label = instance.getString('Label')
const surface = instance.getEnum('Surface', { Light: 'light', Dark: 'dark' })
const disabled = instance.getEnum('Disabled', { False: false, True: true })
const onRemove = instance.getEnum('Removable', {
  False: undefined,
  True: figma.helpers.react.identifier('handleRemove'),
})
const startIcon = instance.getBoolean('Start icon')
  ? figma.helpers.react.identifier('startIcon')
  : undefined
const endIcon = instance.getBoolean('End icon')
  ? figma.helpers.react.identifier('endIcon')
  : undefined

export default {
  example: figma.code`
    <Badge${figma.helpers.react.renderProp('label', label)}${figma.helpers.react.renderProp('surface', surface)}${figma.helpers.react.renderProp('disabled', disabled)}${figma.helpers.react.renderProp('startIcon', startIcon)}${figma.helpers.react.renderProp('endIcon', endIcon)}${figma.helpers.react.renderProp('onRemove', onRemove)} />
  `,
  imports: ['import { Badge } from "@verndale/ui-design-library/components/badge";'],
  id: 'badge',
  metadata: { nestable: true },
}
