import { StyledComboBoxItems } from '@/frontend/components/ui/StyledComboBox';
import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, CloudArrowDownIcon, CloudArrowUpIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { getAllIoTClassificationTypes } from '@/backend/interfaces/project';


export function getIoTClassificationComboBoxItems(): StyledComboBoxItems[] {
    let items: StyledComboBoxItems[] = []
    for( const iotType of getAllIoTClassificationTypes(false)){
        const typeString = iotType.split('_').map((word) => (word.charAt(0).toUpperCase() + word.slice(1))).join(' ')

        // let readableType: string = '';
        // for(const t of typeString){
        //     readableType += t.charAt(0).toUpperCase() + t.slice(1) + ' ';
        // }
        console.log("iotType: ", typeString)

        switch(iotType){
            case 'cloud_polling':
                items.push({ icon: <CloudArrowDownIcon height={18} width={18}/>, text: typeString });
                break;
            case 'cloud_push':
                items.push({ icon: <CloudArrowUpIcon height={18} width={18}/>, text: typeString });
                break;
            case 'local_polling':
                items.push({ icon: <ArrowDownOnSquareIcon height={18} width={18}/>, text: typeString });
                break;
            case 'local_push':
                    items.push({ icon: <ArrowUpOnSquareIcon height={18} width={18}/>, text: typeString });
                    break;
            default:
                items.push({ icon: <QuestionMarkCircleIcon height={18} width={18}/>, text: typeString });
        }
    }
    return items;
}