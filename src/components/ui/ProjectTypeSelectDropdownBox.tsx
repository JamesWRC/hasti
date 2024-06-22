import { upperFirst } from 'lodash';

import { CloseButton, Combobox, Input, InputBase, useCombobox } from '@mantine/core';

import { ProjectType, getAllProjectTypes, getProjectType } from '@/backend/interfaces/project'
import { GetInputProps } from '@mantine/form/lib/types';


const projectTypes = getAllProjectTypes()
export function ProjectTypeSelectDropdownBox({projectType, setProjectType, inputProps, disabled}:{projectType:ProjectType|undefined, setProjectType: (projectType: ProjectType|undefined) => void, inputProps?: GetInputProps<any>, disabled:boolean}) {

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
            disabled={disabled}
            {...(inputProps && inputProps('projectType'))}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    onClick={() => combobox.toggleDropdown()}
                    rightSection={
                        projectType !== undefined ? (
                          <CloseButton
                            size="sm"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => setProjectType(undefined)}
                            aria-label="Clear value"
                          />
                        ) : (
                          <Combobox.Chevron />
                        )
                      }     
                      rightSectionPointerEvents={projectType === undefined ? 'none' : 'all'}
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