import React, { FunctionComponent } from 'react'
import { NumericStepper } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { SelectedItem } from 'vtex.product-context'

import { OnChangeCallback, BaseProps } from './BaseProductQuantity'

const DEFAULT_UNIT = 'un'

interface StepperProps {
  unitMultiplier: SelectedItem['unitMultiplier']
  measurementUnit: SelectedItem['measurementUnit']
  selectedQuantity: BaseProps['selectedQuantity']
  availableQuantity: number
  onChange: (e: OnChangeCallback) => void
  size: BaseProps['size']
  showUnit: boolean
  minQuantity: number
}

const CSS_HANDLES = ['quantitySelectorStepper'] as const

const StepperProductQuantity: FunctionComponent<StepperProps> = ({
  unitMultiplier = 1,
  measurementUnit = DEFAULT_UNIT,
  size = 'small',
  selectedQuantity,
  availableQuantity,
  onChange,
  showUnit,
  minQuantity,
}) => {
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div className={handles.quantitySelectorStepper}>
      <NumericStepper
        size={size}
        minValue={minQuantity}
        unitMultiplier={unitMultiplier}
        suffix={
          showUnit && measurementUnit !== DEFAULT_UNIT
            ? measurementUnit
            : undefined
        }
        onChange={onChange}
        value={selectedQuantity}
        maxValue={availableQuantity || undefined}
      />
    </div>
  )
}

export default StepperProductQuantity
