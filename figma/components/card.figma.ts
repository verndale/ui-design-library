// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=71-104
// source=components/card/index.ts
// component=Card
import figma from 'figma'

const instance = figma.selectedInstance
const content = instance.getSlot('Content')
const connectedContent =
  content?.connectedInstances.map((child) => child.executeTemplate().example) ?? []
const children = connectedContent.length > 0 ? connectedContent : (content ?? [])
const unsetBackground = instance.getEnum('Surface', {
  Raised: false,
  Unset: true,
})

export default {
  example: figma.code`
    <Card${figma.helpers.react.renderProp('unsetBackground', unsetBackground)}>
      ${figma.helpers.react.renderChildren(children)}
    </Card>
  `,
  imports: ['import { Card } from "@verndale/ui-design-library/components/card";'],
  id: 'card',
}
