'use client'

import { FieldError, FieldLabel, ReactSelect, useField } from '@payloadcms/ui'
import { useCallback, useMemo } from 'react'

type SelectorOption = {
  label: string
  value: number
}

type SelectorGroup = {
  id: number
  label: string
  options: SelectorOption[]
}

type Props = {
  groups: SelectorGroup[]
  path: string
}

const asSelectedValues = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []

  return value.filter((item): item is number => {
    return typeof item === 'number'
  })
}

export const VariantOptionsSelectorClient: React.FC<Props> = ({ groups, path }) => {
  const { errorMessage, setValue, showError, value } = useField<number[]>({ path })

  const selectedValues = useMemo(() => asSelectedValues(value), [value])

  const optionIndex = useMemo(() => {
    const index = new Map<string, { groupID: string; option: SelectorOption }>()
    for (const group of groups) {
      const groupID = String(group.id)
      for (const option of group.options) {
        index.set(String(option.value), { groupID, option })
      }
    }
    return index
  }, [groups])

  const selectedByGroup = useMemo(() => {
    const selected = new Map<string, SelectorOption>()

    for (const value of selectedValues) {
      const optionData = optionIndex.get(String(value))
      if (!optionData || selected.has(optionData.groupID)) continue
      selected.set(optionData.groupID, optionData.option)
    }

    return selected
  }, [optionIndex, selectedValues])

  const allOptionKeys = useMemo(() => new Set(optionIndex.keys()), [optionIndex])

  const totalOptionCount = useMemo(() => {
    return groups.reduce((sum, group) => sum + group.options.length, 0)
  }, [groups])

  const handleSelectionChange = useCallback(
    (group: SelectorGroup, nextOption: SelectorOption | null) => {
      const preservedValues = selectedValues.filter((selectedValue) => !allOptionKeys.has(String(selectedValue)))
      const nextByGroup = new Map(selectedByGroup)
      const groupID = String(group.id)

      if (nextOption) {
        nextByGroup.set(groupID, nextOption)
      } else {
        nextByGroup.delete(groupID)
      }

      const orderedSelections = groups
        .map((currentGroup) => nextByGroup.get(String(currentGroup.id))?.value)
        .filter((selectedValue): selectedValue is number => {
          return typeof selectedValue === 'number'
        })

      setValue([...preservedValues, ...orderedSelections])
    },
    [allOptionKeys, groups, selectedByGroup, selectedValues, setValue],
  )

  return (
    <div className="variantOptionsSelectorError">
      <div className="variantOptionsSelectorMeta">
        <span>{`${selectedByGroup.size}/${groups.length} groups selected`}</span>
        <span>{`${totalOptionCount} options available`}</span>
      </div>
      <FieldError message={errorMessage} path={path} showError={showError} />
      <div
        className={['variantOptionsSelectorErrorWrapper', showError && 'showError']
          .filter(Boolean)
          .join(' ')}
      >
        <div className="variantOptionsSelectorList">
          {groups.map((group) => {
            const selectedOption = selectedByGroup.get(String(group.id))
            const inputID = `${path}-${String(group.id).replace(/[^a-zA-Z0-9_-]/g, '_')}`

            return (
              <div className="variantOptionsSelectorItem" key={String(group.id)}>
                <div className="variantOptionsSelectorItemHeader">
                  <FieldLabel htmlFor={inputID} label={group.label} />
                  <span className="variantOptionsSelectorItemCount">{`${group.options.length} options`}</span>
                </div>
                <ReactSelect
                  inputId={inputID}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => 'No options in this group'}
                  onChange={(next) => {
                    handleSelectionChange(group, (next as SelectorOption | null) ?? null)
                  }}
                  options={group.options}
                  placeholder={`Select ${group.label.toLowerCase()}`}
                  value={selectedOption}
                />
                <p
                  className={[
                    'variantOptionsSelectorSelection',
                    !selectedOption && 'variantOptionsSelectorSelection--empty',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {selectedOption ? `Selected: ${selectedOption.label}` : 'No option selected'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
