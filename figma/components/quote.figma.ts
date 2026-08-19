// url=https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=172-39
// source=components/quote/index.ts
// component=Quote
import figma from 'figma'

const instance = figma.selectedInstance
const quote = instance.getString('Quote')
const cite = instance.getString('Citation') || undefined

export default {
  example: figma.code`
    <Quote${figma.helpers.react.renderProp('cite', cite)}>
      ${figma.helpers.react.renderChildren(quote)}
    </Quote>
  `,
  imports: ['import { Quote } from "@verndale/ui-design-library/components/quote";'],
  id: 'quote',
  metadata: { nestable: true },
}
