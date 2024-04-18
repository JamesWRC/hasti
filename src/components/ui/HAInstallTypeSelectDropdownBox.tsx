import { upperFirst } from 'lodash';

import { Combobox, Input, InputBase, useCombobox } from '@mantine/core';

import { HAInstallType, getAllHaInstallTypes, getHaInstallType } from '@/backend/interfaces/project'
import { GetInputProps } from '@mantine/form/lib/types';


const haInstallTypes = getAllHaInstallTypes()
export function HAInstallTypeSelectDropdownBox({projectType, setProjectType, inputProps}:{projectType:HAInstallType|undefined, setProjectType: (projectType: HAInstallType) => void, inputProps: GetInputProps<any>}) {

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const options = haInstallTypes.map((item: string, index:number) => (
         
         <Combobox.Option value={item} key={index}>
           

                {item}
           

        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                console.log(val)
                console.log(getHaInstallType(val))
                setProjectType(getHaInstallType(val)) ;
                combobox.closeDropdown();
            }}
            
            {...inputProps('haInstallType')}
        >
                            <Combobox.Target>
                <InputBase
                    label="Install Type" 
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    onClick={() => combobox.toggleDropdown()}
                    rightSectionPointerEvents="none"
                >
                    {upperFirst(projectType) || <Input.Placeholder>Pick Project type</Input.Placeholder>}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}