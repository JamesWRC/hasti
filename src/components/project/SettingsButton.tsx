'use client'
import { Button, Group, Skeleton, Title } from "@mantine/core";

import { createAvatar } from '@dicebear/core';
import Svg from "react-inlinesvg";

import { botttsNeutral, funEmoji, shapes, bottts  } from '@dicebear/collection';
import ColorBackground from "@/frontend/components/project/ColorBackground";
import type { ProjectWithUser } from '@/backend/clients/prisma/client'
import { IconSettings } from "@tabler/icons-react";
import { auth } from "@/frontend/app/auth";
import { useSession } from "next-auth/react";
import { useDisclosure } from "@mantine/hooks";
import AddorEditProject from "@/frontend/components/ui/AddorEditProject";

const loaded = false

function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }
  
function rngAvatarBackground(projectID: string|undefined) {

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


export default function SettingsButton({projectID}: {projectID: string}) {
    const [opened, { open, close }] = useDisclosure(false);
    const { data: session, status } = useSession()
    



    let isUserOwner = false;

    // if (userProject?.user && session?.user) {
    //   isUserOwner = session?.user?.id === userProject.user.id;
    // }

    
  return (
    <Group className='bg-slate-900 rounded-xl border-none' justify="center">

        <Button
        onClick={open}
        variant="transparent"
        leftSection={<IconSettings size={26}  className='text-white border-none ' />}
      >
        <div className='text-white'>Settings</div> 
      </Button>
      <AddorEditProject opened={opened} open={open} close={close}/>
    </Group> 
  )
}