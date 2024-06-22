import { upperFirst } from 'lodash';

import { Combobox, ComboboxData, ComboboxItem, ComboboxItemGroup, Input, InputBase, MultiSelect, OptionsFilter, useCombobox } from '@mantine/core';

import { HAInstallType, getAllHaInstallTypes, getHaInstallType } from '@/backend/interfaces/project'
import { GetInputProps } from '@mantine/form/lib/types';
import { useEffect, useState } from 'react'
import { InstallTypeHelp } from './HelpDialogs';


const allHAInstallTypes = getAllHaInstallTypes()
export function HAInstallTypeSelectDropdownBox({ haInstallTypes, setHaInstallTypes, inputProps }: { haInstallTypes: HAInstallType[], setHaInstallTypes: (haInstallTypes: HAInstallType[]) => void, inputProps?: GetInputProps<any> }) {
    const [tempInstallTypes, setTempInstallTypes] = useState<HAInstallType[] | undefined>(haInstallTypes)

    useEffect(() => {
        setTempInstallTypes(haInstallTypes);
    }, [haInstallTypes])

    const optionsFilter: OptionsFilter = ({ options, search }) => {
        const filtered = (options as ComboboxItem[]).filter((option) => {
            // if(tempProjectType && tempProjectType.length > 1) {
            //     option.label.toLowerCase().trim().includes(search.toLowerCase().trim())
            // }
            if (tempInstallTypes && tempInstallTypes.length > 1 && tempInstallTypes.includes(HAInstallType.ANY)) {
                return false
            } else {
                return true
            }

            console.log("option", option)
        }

        );

        // filtered.sort((a, b) => a.label.localeCompare(b.label));
        console.log("filtered", filtered)
        return filtered;
    };


    function handleChange(val: string[]) {

        // remove duplicated
        const normalizedProjectTypes = Array.from(new Set(val.flatMap(v => [
            upperFirst(getHaInstallType(v).toString().toLowerCase()),
            upperFirst(v.toLowerCase())
        ])));

        // resolve the install types, remove ANY
        let newPTypes = normalizedProjectTypes.map(v => getHaInstallType(v));
        if (newPTypes.length > 1) {
            newPTypes = newPTypes.filter(v => v !== HAInstallType.ANY);
        }

        // if any is selected (will be last in he array of chosen types), set to ANY
        if (val.length > 1 && val[val.length - 1] === upperFirst(HAInstallType.ANY.toString().toLowerCase())) {

            console.log('found any', val.length)
            console.log('found any', val[val.length])
            setTempInstallTypes([HAInstallType.ANY])

            // If all values are selected, set to ANY
        } else if (val.length === allHAInstallTypes.length - 1) {
            setTempInstallTypes([HAInstallType.ANY])
            // Set the chosen types if no other condition is met
        } else {
            setTempInstallTypes(newPTypes)
        }

    }

    function finalizeChange() {

        if (tempInstallTypes) {
            setHaInstallTypes(tempInstallTypes)
        }
    }

    useEffect(() => {
        if (tempInstallTypes) {
            setHaInstallTypes(tempInstallTypes)
        }    
    },[tempInstallTypes])


    function groupedData() {

        const regGroupItems: string[] = []
        const anyGroupItems: string[] = []

        for (const v of allHAInstallTypes) {
            if (v === upperFirst(HAInstallType.ANY.toString().toLowerCase())) {
                anyGroupItems.push(upperFirst(v.toString().toLowerCase()))
                continue
            } else {
                regGroupItems.push(upperFirst(v.toLowerCase()))

            }
        }

        let ret: ComboboxItemGroup[] = []

        ret.push({ group: 'Specific install types', items: regGroupItems })
        ret.push({ group: 'All install types', items: anyGroupItems })

        return ret
    }


    return (
        <>
        <InstallTypeHelp />
        <MultiSelect
            data={groupedData()}
            defaultValue={['Any']}
            onChange={(val) => { handleChange(val) }}
            onDropdownClose={() => finalizeChange()}
            filter={optionsFilter}
            value={tempInstallTypes?.map((v) => upperFirst(v.toLowerCase()))}
            clearable
            error={inputProps ? inputProps('haInstallTypes').error : false}
            className='text-black'

        />
        </>
        
    );
}