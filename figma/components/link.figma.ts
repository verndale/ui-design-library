// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=169-62
// source=components/link/index.ts
// component=Link
import figma from 'figma'

const instance = figma.selectedInstance
const label = instance.getString('Label')
const href = instance.getString('Href')
const touchTarget = instance.getBoolean('Touch target')
const startIcon = instance.getBoolean('Start icon') ? figma.helpers.react.identifier('startIcon') : undefined
const endIcon = instance.getBoolean('End icon') ? figma.helpers.react.identifier('endIcon') : undefined
const size = instance.getEnum('Size', { Large: 'large', Medium: 'medium', Small: 'small' })
const disabled = instance.getEnum('Disabled', { False: false, True: true })

export default {
  example: figma.code`
    <Link${figma.helpers.react.renderProp('href', href)}${figma.helpers.react.renderProp('size', size)}${figma.helpers.react.renderProp('touchTarget', touchTarget)}${figma.helpers.react.renderProp('startIcon', startIcon)}${figma.helpers.react.renderProp('endIcon', endIcon)}${figma.helpers.react.renderProp('disabled', disabled)}>
      ${figma.helpers.react.renderChildren(label)}
    </Link>
  `,
  imports: ['import { Link } from "@verndale/ui-design-library/components/link";'],
  id: 'link',
  metadata: { nestable: true },
}
