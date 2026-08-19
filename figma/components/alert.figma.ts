// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=66-112
// source=components/alert/index.ts
// component=Alert
import figma from 'figma'

const instance = figma.selectedInstance
const message = instance.getString('Message')
const variant = instance.getEnum('Variant', {
  Positive: 'positive',
  Critical: 'critical',
})
const showAccent = instance.getBoolean('Show accent')
const icon = instance.getBoolean('Show icon')
  ? undefined
  : figma.helpers.react.identifier('null')
const onDismiss = instance.getBoolean('Dismissible')
  ? figma.helpers.react.identifier('handleDismiss')
  : undefined

export default {
  example: figma.code`
    <Alert${figma.helpers.react.renderProp('variant', variant)}${figma.helpers.react.renderProp('showAccent', showAccent)}${figma.helpers.react.renderProp('icon', icon)}${figma.helpers.react.renderProp('onDismiss', onDismiss)}>
      ${figma.helpers.react.renderChildren(message)}
    </Alert>
  `,
  imports: ['import { Alert } from "@verndale/ui-design-library/components/alert";'],
  id: 'alert',
}
