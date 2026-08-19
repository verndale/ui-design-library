// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=164-45
// source=components/avatar/index.ts
// component=Avatar
import figma from 'figma'

const instance = figma.selectedInstance
const media = instance.getSlot('Media')
const connectedMedia = media?.connectedInstances.map((child) => child.executeTemplate().example) ?? []
const children = connectedMedia.length > 0 ? connectedMedia : (media ?? [])

export default {
  example: figma.code`
    <Avatar>
      ${figma.helpers.react.renderChildren(children)}
    </Avatar>
  `,
  imports: ['import { Avatar } from "@verndale/ui-design-library/components/avatar";'],
  id: 'avatar',
  metadata: { nestable: true },
}
