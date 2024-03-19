import { upperFirst } from 'lodash';

import { Combobox, Input, InputBase, useCombobox } from '@mantine/core';

import { ProjectType, getAllProjectTypes, getProjectType } from '@/backend/interfaces/project'


const projectTypes = getAllProjectTypes()
export function ProjectTypeSelectDropdownBox({projectType, setProjectType}:{projectType:ProjectType|undefined, setProjectType: (projectType: ProjectType) => void}) {

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
                setProjectType(getProjectType(val)) ;
                combobox.closeDropdown();
            }}
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