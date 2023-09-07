import React, { FunctionComponent, useState } from 'react'
import { Dropdown, Input } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { SelectedItem } from 'vtex.product-context'
import { useDevice } from 'vtex.device-detector'

import { OnChangeCallback, BaseProps } from './BaseProductQuantity'

const MAX_DROPDOWN_VALUE = 10
const MAX_INPUT_LENGTH = 5

const DESKTOP_DROPDOWN_ID = 'quantity-dropdown'
const MOBILE_DROPDOWN_ID = 'quantity-dropdown-mobile'
const DESKTOP_INPUT_ID = 'quantity-input'
const MOBILE_INPUT_ID = 'quantity-input-mobile'

interface DropdownProps {
  itemId: SelectedItem['itemId']
  selectedQuantity: BaseProps['selectedQuantity']
  availableQuantity: number
  onChange: (e: OnChangeCallback) => void
  size: BaseProps['size']
  minQuantity: number
}

type InternalBehavior = 'dropdown' | 'input'

const normalizeValue = (value: number, maxValue: number) =>
  value > maxValue ? maxValue : value

const validateValue = (value: string, maxValue: number) => {
  const parsedValue = parseInt(value, 10)

  if (Number.isNaN(parsedValue)) {
    return 1
  }

  return normalizeValue(parseInt(value, 10), maxValue)
}

const validateDisplayValue = (value: string, maxValue: number) => {
  const parsedValue = parseInt(value, 10)

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return ''
  }

  return `${normalizeValue(parsedValue, maxValue)}`
}

const getDropdownOptions = (maxValue: number) => {
  const limit = Math.min(MAX_DROPDOWN_VALUE - 1, maxValue)
  const options = []

  for (let idx = 1; idx <= limit; ++idx) {
    options.push({ value: idx, label: `${idx}` })
  }

  if (maxValue >= MAX_DROPDOWN_VALUE) {
    options.push({
      value: MAX_DROPDOWN_VALUE,
      label: `${MAX_DROPDOWN_VALUE}+`,
    })
  }

  return options
}

const CSS_HANDLES = [
  'quantitySelectorDropdownMobileContainer',
  'quantitySelectorDropdownContainer',
  'quantitySelectorInputMobileContainer',
  'quantitySelectorInputContainer',
] as const

const DropdownProductQuantity: FunctionComponent<DropdownProps> = ({
  itemId,
  selectedQuantity,
  size = 'small',
  onChange,
  availableQuantity,
  minQuantity,
}) => {
  const [internalBehavior, setInternalBehavior] = useState<InternalBehavior>(
    'dropdown'
  )
  const [displayValue, setDisplayValue] = useState(`${selectedQuantity}`)
  const { isMobile } = useDevice()
  const handles = useCssHandles(CSS_HANDLES)
  const dropdownOptions = getDropdownOptions(availableQuantity)

  const handleChange = (value: string) => {
    if (Number(value) < minQuantity) {
      return
    }

    const newValidatedValue = validateValue(value, availableQuantity)
    const newDisplayValue = validateDisplayValue(value, availableQuantity)

    if (
      internalBehavior === 'dropdown' &&
      newValidatedValue >= Math.min(availableQuantity + 1, MAX_DROPDOWN_VALUE)
    ) {
      setInternalBehavior('input')
    }

    setDisplayValue(newDisplayValue)
    onChange({ value: newValidatedValue })
  }

  const handleInputBlur = () => {
    if (displayValue === '') {
      setDisplayValue('1')
    }

    const validatedValue = validateValue(displayValue, availableQuantity)

    if (validatedValue < Math.min(availableQuantity, MAX_DROPDOWN_VALUE)) {
      setInternalBehavior('dropdown')
    }

    onChange({ value: validatedValue })
  }

  if (internalBehavior === 'dropdown') {
    return (
      <div
        className={
          isMobile
            ? handles.quantitySelectorDropdownMobileContainer
            : handles.quantitySelectorDropdownContainer
        }>
        <Dropdown
          id={`${
            isMobile ? MOBILE_DROPDOWN_ID : DESKTOP_DROPDOWN_ID
          }-${itemId}`}
          testId={`${
            isMobile ? MOBILE_DROPDOWN_ID : DESKTOP_DROPDOWN_ID
          }-${itemId}`}
          options={dropdownOptions}
          size={size}
          value={selectedQuantity}
          onChange={event => handleChange(event.target.value)}
          placeholder=" "
        />
      </div>
    )
  }

  return (
    <div
      className={
        isMobile
          ? handles.quantitySelectorInputMobileContainer
          : handles.quantitySelectorInputContainer
      }>
      <Input
        id={`${isMobile ? MOBILE_INPUT_ID : DESKTOP_INPUT_ID}-${itemId}`}
        size={size}
        value={displayValue}
        maxLength={MAX_INPUT_LENGTH}
        onChange={event => handleChange(event.target.value)}
        onBlur={handleInputBlur}
        placeholder=""
      />
    </div>
  )
}

export default DropdownProductQuantity
