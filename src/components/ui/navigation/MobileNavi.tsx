import React from 'react';
import { Fragment, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SignIn } from '../../authComp';

interface MobileNaviProps {
  // Define your component props here
}



const userNavigation = [
  { name: 'Your Profile', href: '#aa' },
  { name: 'Settings', href: '#vv' },
  { name: 'Sign out', href: '#dd' },
]

function classNames(...classes: String[]) {
  return classes.filter(Boolean).join(' ')
}

const MobileNavi: React.FC<MobileNaviProps> = (props) => {
  const router = useRouter()
  const { data: session, status } = useSession()

  const user = {
    imageUrl: session?.user.image ? session?.user.image :'https://avatars.githubusercontent.com/u/12?s=40&v=4',
  }

  const handleItemClick = (url: string) => {
    // Navigate to the specified URL
    router.push(url);
  };

  // Add your component logic here
  return (
    <div className="grid content-center">
    <div className="relative ml-4">
    <div className="flex max-w-xs items-center rounded-full bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 h-8 w-8">
      
    <a
      className="m-auto"
      href='/user/account'
      >
      <img
        className="h-8 w-8 rounded-full bg-gray-50"
        src={user.imageUrl}
        alt=""
      />
      {/* <span className="sr-only">Your profile {session.user.name}</span> */}
      {/* <span aria-hidden="true">{session.user}</span> */}
      
      {/* <SignOut session={session}/> */}

    </a>      
    </div>
      </div>
      </div>
  );
};

export default MobileNavi;