// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=184-40
// source=components/toast/index.ts
// component=Toast
import figma from 'figma'

const instance = figma.selectedInstance
const open = instance.getBoolean('Open')
const message = instance.getString('Message')
const showIcon = instance.getBoolean('Show icon')
const icon = showIcon ? undefined : figma.helpers.react.identifier('null')
const variant = instance.getEnum('Variant', {
  Neutral: 'neutral',
  Critical: 'critical',
})
const position = instance.getEnum('Position', {
  'Top start': 'top-start',
  'Top center': 'top-center',
  'Top end': 'top-end',
  'Bottom start': 'bottom-start',
  'Bottom center': 'bottom-center',
  'Bottom end': 'bottom-end',
})

export default {
  example: figma.code`
    <Toast${figma.helpers.react.renderProp('open', open)}${figma.helpers.react.renderProp('variant', variant)}${figma.helpers.react.renderProp('icon', icon)}${figma.helpers.react.renderProp('position', position)}>${message}</Toast>
  `,
  imports: ['import { Toast } from "@verndale/ui-design-library/components/toast";'],
  id: 'toast',
}
