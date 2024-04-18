import { upperFirst } from 'lodash';

import { Combobox, Input, InputBase, useCombobox } from '@mantine/core';

import { ProjectType, getAllProjectTypes, getProjectType } from '@/backend/interfaces/project'
import { GetInputProps } from '@mantine/form/lib/types';


const projectTypes = getAllProjectTypes()
export function ProjectTypeSelectDropdownBox({projectType, setProjectType, inputProps}:{projectType:ProjectType|undefined, setProjectType: (projectType: ProjectType) => void, inputProps: GetInputProps<any>}) {

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const options = projectTypes.map((item: string, index:number) => (
         
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
                console.log(getProjectType(val))
                setProjectType(getProjectType(val)) ;
                combobox.closeDropdown();
            }}
            
            {...inputProps('projectType')}
        >
                            <Combobox.Target>
                <InputBase
                    label="Project Type" 
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