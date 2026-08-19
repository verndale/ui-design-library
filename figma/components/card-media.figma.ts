// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=69-90
// source=components/card/index.ts
// component=CardMedia
import figma from 'figma'

const instance = figma.selectedInstance
const media = instance.getSlot('Media')

export default {
  example: figma.code`
    <CardMedia>
      ${figma.helpers.react.renderChildren(media ?? [])}
    </CardMedia>
  `,
  imports: ['import { CardMedia } from "@verndale/ui-design-library/components/card";'],
  id: 'card-media',
  metadata: { nestable: true },
}
