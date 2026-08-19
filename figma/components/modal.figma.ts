// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=75-129
// source=components/modal/index.ts
// component=Modal
import figma from 'figma'

const instance = figma.selectedInstance
const title = instance.getString('Title')
const showEyebrow = instance.getBoolean('Show eyebrow')
const eyebrow = showEyebrow ? instance.getString('Eyebrow') : undefined
const showDescription = instance.getBoolean('Show description')
const description = showDescription ? instance.getString('Description') : undefined
const body = instance.getSlot('Body')
const footer = instance.getSlot('Footer')
const connectedFooter =
  footer?.connectedInstances.map((child) => child.executeTemplate().example) ?? []
const footerContent = connectedFooter.length > 0 ? connectedFooter : (footer ?? [])
const size = instance.getEnum('Size', {
  Medium: 'medium',
  Large: 'large',
})
const open = figma.helpers.react.identifier('open')
const onClose = figma.helpers.react.identifier('handleClose')

export default {
  example: figma.code`
    <Modal${figma.helpers.react.renderProp('open', open)}${figma.helpers.react.renderProp('onClose', onClose)}${figma.helpers.react.renderProp('title', title)}${figma.helpers.react.renderProp('eyebrow', eyebrow)}${figma.helpers.react.renderProp('description', description)}${figma.helpers.react.renderProp('footer', footerContent)}${figma.helpers.react.renderProp('size', size)}>
      ${figma.helpers.react.renderChildren(body ?? [])}
    </Modal>
  `,
  imports: ['import { Modal } from "@verndale/ui-design-library/components/modal";'],
  id: 'modal',
}
