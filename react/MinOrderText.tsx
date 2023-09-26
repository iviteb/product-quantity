import { useProduct } from "vtex.product-context"
import { MIN_QUANTITY_SPECIFICATION_NAME } from './utils/constants'
import React from "react"
import { useIntl, defineMessages } from 'react-intl'
import { useCssHandles } from "vtex.css-handles"
import ExclamationTriangle from "./icons/ExclamationTriangle"

const messages = defineMessages({
  minQuantity: { id: 'store/product-quantity.minQuantity' },
  pieces: { id: 'store/product-quantity.pieces' },
})


const CSS_HANDLES = [
  'minQuantityContainer',
  'minQuantityText',
] as const

const MinOrderText = () => {
  const { product } = useProduct()
  const { formatMessage } = useIntl()
  const handles = useCssHandles(CSS_HANDLES)

  const minQuantity = product?.properties?.find((prop: ProductSpecification) => prop?.name === MIN_QUANTITY_SPECIFICATION_NAME)?.values[0] ?? 1

  if (minQuantity > 1) {
    return <div className={handles.minQuantityContainer}>
      <ExclamationTriangle />
      <span className={handles.minQuantityText}>
        {formatMessage(messages.minQuantity)} {minQuantity} {formatMessage(messages.pieces)}
      </span>
    </div>
  }

  return null
}

export default MinOrderText