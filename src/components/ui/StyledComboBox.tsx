import { useEffect, useState } from 'react';
import { PillsInput, Pill, Combobox, CheckIcon, Group, useCombobox, InputBase, Input, CloseButton } from '@mantine/core';
import { IoTClassifications, getIoTClassificationType } from '@/backend/interfaces/project';

// interface of heroIcon and text
export interface StyledComboBoxItems {
  icon: React.ReactNode;
  text: string;
}

export function StyledComboBox({ items, value, setValue }: {items: StyledComboBoxItems[], value: IoTClassifications|undefined, setValue: (value: IoTClassifications|undefined) => void}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  useEffect(() => {
    console.log("value: ", value)
  }, [value]);
  const transformedValue = value ? value.split('_').map((word) => (word.charAt(0).toUpperCase() + word.slice(1))).join(' ') : '';

  const options = items.map((item) => (
    <Combobox.Option value={item.text} key={item.text}>
      <div className='flex'>
      <span className=''>{item.icon}</span>
      <span className='ml-2'>{item.text}</span>
      </div>
    </Combobox.Option>
  ));

  return (
    <div className='bg-white text-ellipsis overflow-hidden'>
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        setValue(getIoTClassificationType(val));
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSectionPointerEvents={value === undefined ? 'none' : 'all'}
          onClick={() => combobox.toggleDropdown()}
          rightSection={
            value !== undefined ? (
              <CloseButton
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setValue(undefined)}
                aria-label="Clear value"
              />
            ) : (
              <Combobox.Chevron />
            )
          }
        >
          {/* {items.filter(item => item.text.toString() == "Cloud Polling").map((item) => (item.text ))} */}
          {items.filter(item => item.text.toString() === transformedValue).map((item, index) => (
            
              <div className='flex' key={item.text} id={value}>
                <span className='mt-2'>{item.icon}</span>
                <span className='ml-2'>{item.text}</span>
              </div>
          )) || <Input.Placeholder>Pick value</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
    </div>
  );
}