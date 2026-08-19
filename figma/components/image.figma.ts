// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=171-46
// source=components/image/index.ts
// component=Image
import figma from 'figma'

const instance = figma.selectedInstance
const src = instance.getString('Source')
const alt = instance.getString('Alternative text')
const width = figma.helpers.react.identifier(instance.getString('Width'))
const height = figma.helpers.react.identifier(instance.getString('Height'))
const rounded = instance.getEnum('Rounded', { False: false, True: true })

export default {
  example: figma.code`
    <Image${figma.helpers.react.renderProp('src', src)}${figma.helpers.react.renderProp('alt', alt)}${figma.helpers.react.renderProp('width', width)}${figma.helpers.react.renderProp('height', height)}${figma.helpers.react.renderProp('rounded', rounded)} />
  `,
  imports: ['import { Image } from "@verndale/ui-design-library/components/image";'],
  id: 'image',
  metadata: { nestable: true },
}
