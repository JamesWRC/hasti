import { StyledComboBoxItems } from '@/frontend/components/ui/StyledComboBox';
import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, CloudArrowDownIcon, CloudArrowUpIcon, CodeBracketIcon, QuestionMarkCircleIcon, SquaresPlusIcon, SwatchIcon, RectangleGroupIcon, FolderIcon } from '@heroicons/react/24/outline';
import { ProjectAllInfo, ProjectWithUser, getAllIoTClassificationTypes } from '@/backend/interfaces/project';
import { createAvatar } from '@dicebear/core';
import { botttsNeutral, funEmoji, shapes, bottts  } from '@dicebear/collection';
import { ProjectType } from '../../../../backend/codebase/app/interfaces/project/index';
import { IconProps, QuestionIcon } from '@primer/octicons-react';


export function getIoTClassificationComboBoxItems(): StyledComboBoxItems[] {
    let items: StyledComboBoxItems[] = []
    for( const iotType of getAllIoTClassificationTypes(false)){
        const typeString = iotType.split('_').map((word) => (word.charAt(0).toUpperCase() + word.slice(1))).join(' ')

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


export function rngAvatarBackground(projectID: string|undefined) {

    const seededRand = require('random-seed').create(projectID)

    const random = Math.floor(seededRand.random() * 3) + 1;

    const randRotate = seededRand.intBetween(0, 360)
    const randTranslateX = seededRand.intBetween(0, 30)
    const randTranslateY = seededRand.intBetween(0, 30)
    if( random === 1) {

    return createAvatar(botttsNeutral, {
        size: 50,
        seed: projectID,
        rotate: randRotate,
        translateX: randTranslateX,
        translateY: randTranslateY
        }).toDataUriSync()
    } else if (random === 2) {
        return createAvatar(funEmoji, {
            size: 50,
            seed: projectID,
            rotate: randRotate,
            translateX: randTranslateX,
            translateY: randTranslateY

            }).toDataUriSync()
    } else {
        return createAvatar(shapes, {
            size: 50,
            seed: projectID,
            rotate: randRotate,
            translateX: randTranslateX,
            translateY: randTranslateY

            }).toDataUriSync()
    }
}


export function getProjectIcon(project: ProjectAllInfo | ProjectWithUser, props: IconProps) {
    if(project === null){
        return <QuestionIcon {...props} />
    }

    switch(project.projectType){
        case ProjectType.INTEGRATION:
            return <SquaresPlusIcon {...props} />
        case ProjectType.THEME:
            return <SwatchIcon {...props} />
        case ProjectType.SCRIPT:
            return <CodeBracketIcon {...props} />
        case ProjectType.SENSOR:
            return <RectangleGroupIcon {...props} />
        case ProjectType.DIY:
            return <FolderIcon {...props} />
        default:
            return <QuestionIcon {...props} />
    }
}