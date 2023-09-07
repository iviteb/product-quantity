import React, { useCallback, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { DispatchFunction } from 'vtex.product-context/ProductDispatchContext'
import { ProductContext } from 'vtex.product-context'
import { useQuery } from 'react-apollo'
import { Spinner } from 'vtex.styleguide'

import DropdownProductQuantity from './DropdownProductQuantity'
import StepperProductQuantity from './StepperProductQuantity'
import { useProduct } from 'vtex.product-context'
import appSettings from '../graphql/appSettings.gql'

export type NumericSize = 'small' | 'regular' | 'large'
export type SelectorType = 'stepper' | 'dropdown'
export type QuantitySelectorStepType = 'unitMultiplier' | 'singleUnit'

export interface BaseProps {
  dispatch: DispatchFunction
  selectedItem?: ProductContext['selectedItem']
  showLabel?: boolean
  selectedQuantity: number
  selectorType?: SelectorType
  size?: NumericSize
  warningQuantityThreshold: number
  showUnit: boolean
  quantitySelectorStep?: QuantitySelectorStepType
}

const CSS_HANDLES = [
  'quantitySelectorContainer',
  'quantitySelectorTitle',
  'availableQuantityContainer',
] as const

export type OnChangeCallback = {
  value: number
}

type Property = {
  name: string
  values: string[]
}

const BaseProductQuantity: StorefrontFunctionComponent<BaseProps> = ({
  dispatch,
  selectedItem,
  size = 'small',
  showLabel = true,
  selectedQuantity,
  warningQuantityThreshold = 0,
  selectorType = 'stepper',
  showUnit = true,
  quantitySelectorStep = 'unitMultiplier',
}) => {
  const handles = useCssHandles(CSS_HANDLES)
  const { product } = useProduct()

  const {
    data: settingsData,
    loading: settingsLoading,
    error: settingsError,
  } = useQuery(appSettings)

  const { minQuantityName } = JSON.parse(
    settingsData?.publicSettingsForApp?.message || '{}'
  )
  const minQuantity = product?.properties?.find((prop: Property) => prop?.name === minQuantityName)?.values[0]

  useEffect(() => {
    if (isNaN(minQuantity)) {
      return
    }

    dispatch({
      type: 'SET_QUANTITY',
      args: { quantity: Number(minQuantity) },
    })
  }, [minQuantity])

  const onChange = useCallback(
    (e: OnChangeCallback) => {
      if (Number(e.value) < minQuantity) {
        return
      }

      dispatch({ type: 'SET_QUANTITY', args: { quantity: e.value } })
    },
    [dispatch, minQuantity]
  )

  const availableQuantity =
    selectedItem?.sellers?.find(({ sellerDefault }) => sellerDefault === true)
      ?.commertialOffer?.AvailableQuantity ?? 0

  if (availableQuantity < 1 || !selectedItem) {
    return null
  }

  const showAvailable = availableQuantity <= warningQuantityThreshold
  const unitMultiplier =
    quantitySelectorStep === 'singleUnit' ? 1 : selectedItem.unitMultiplier

  if (settingsLoading) {
    return <Spinner color="#5A2E91" size={20} />
  }

  if (settingsError) {
    console.error('App settings error:', settingsError)

    return null
  }

  return (
    <div
      className={`${handles.quantitySelectorContainer} flex flex-column mb4`}>
      {showLabel && (
        <div
          className={`${handles.quantitySelectorTitle} mb3 c-muted-2 t-body`}>
          <FormattedMessage id="store/product-quantity.quantity" />
        </div>
      )}
      {selectorType === 'stepper' && (
        <StepperProductQuantity
          showUnit={showUnit}
          size={size}
          unitMultiplier={unitMultiplier}
          measurementUnit={selectedItem.measurementUnit}
          selectedQuantity={selectedQuantity}
          availableQuantity={availableQuantity}
          onChange={onChange}
        />
      )}
      {selectorType === 'dropdown' && (
        <DropdownProductQuantity
          itemId={selectedItem.itemId}
          selectedQuantity={selectedQuantity}
          availableQuantity={availableQuantity}
          onChange={onChange}
          size={size}
          minQuantity={minQuantity}
        />
      )}
      {showAvailable && (
        <div
          className={`${handles.availableQuantityContainer} mv4 c-muted-2 t-small`}>
          <FormattedMessage
            id="store/product-quantity.quantity-available"
            values={{ availableQuantity }}
          />
        </div>
      )}
    </div>
  )
}

export default BaseProductQuantity
