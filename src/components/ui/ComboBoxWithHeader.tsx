import { useState } from 'react';
import { Combobox, ScrollArea, Text, TextInput, useCombobox } from '@mantine/core';
import { HACoreVersions } from '@/backend/helpers/homeassistant';


export interface OptionType {
    text: string,
    altText?: string,
}

export function ComboBoxWithHeader({items, headerText}: {items: OptionType[], headerText: string}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState('');
  const shouldFilterOptions = !items.some((item) => item.text === value);
  const filteredOptions = shouldFilterOptions
    ? items.filter((item) => item.text.toLowerCase().includes(value.toLowerCase().trim()))
    : items;

  const options = filteredOptions.map((item) => (
    <Combobox.Option 
        value={item.text} 
        key={item.text} 
        // disabled={item === '🥕 Carrots'}
        >
      {item.text} <span className="text-xs text-gray-400 ml-2">{item.altText}</span>
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        setValue(optionValue);
        combobox.closeDropdown();
      }}
      store={combobox}
      withinPortal={false}
    >
      <Combobox.Target>
        <TextInput
          label="Pick value or type anything"
          placeholder="Pick value or type anything"
          value={value}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          <Combobox.Header>
            <Text fz="xs">{headerText}</Text>
          </Combobox.Header>
          <ScrollArea.Autosize mah={200} type="scroll">
            {options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : options}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}