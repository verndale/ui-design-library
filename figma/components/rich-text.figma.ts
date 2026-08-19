// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=173-62
// source=components/rich-text/index.ts
// component=RichText
import figma from 'figma'

const instance = figma.selectedInstance
const content = instance.getString('Content')
const listStyle = instance.getEnum('List style', { Default: 'default', Checkmark: 'checkmark' })

export default {
  example: figma.code`
    <RichText${figma.helpers.react.renderProp('listStyle', listStyle)}>
      ${figma.helpers.react.renderChildren(content)}
    </RichText>
  `,
  imports: ['import { RichText } from "@verndale/ui-design-library/components/rich-text";'],
  id: 'rich-text',
  metadata: { nestable: true },
}
