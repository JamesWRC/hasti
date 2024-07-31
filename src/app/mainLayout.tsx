'use strict'
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  RectangleGroupIcon,
  SquaresPlusIcon,
  SwatchIcon,

} from '@heroicons/react/24/outline'
import Footer from '@/frontend/components/Footer'
import { usePathname } from 'next/navigation';

import { Button, Group, Text, Collapse, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useClickOutside } from '@mantine/hooks';

import { useRouter } from 'next/navigation';

import LoginBtn from '@/frontend/components/user/LoginBtn'
import VertiNav from '@/frontend/components/ui/navigation/VertiNav'
import MobileNavi from '@/frontend/components/ui/navigation/MobileNavi'
import UserNavi from '@/frontend/components/ui/navigation/UserNavi'
import Navigation from '@/frontend/components/ui/navigation/Navigation'
import { auth } from './auth'
import { SignIn } from '@/frontend/components/authComp'
import Search from '@/frontend/components/ui/search/Search';



const navigation = [
  { name: 'Store', href: '/', icon: HomeIcon},
  { name: 'Themes', href: '/themes', icon: SwatchIcon},
  { name: 'Integrations', href: '/integrations', icon: SquaresPlusIcon},
  { name: 'adfag', href: '/integrations', icon: SquaresPlusIcon},
  { name: 'sdfgsd', href: '/integrations', icon: SquaresPlusIcon},
  { name: 'hdszxvhsd', href: '/integrations', icon: SquaresPlusIcon},
  { name: 'hdsshsd', href: '/integrations', icon: SquaresPlusIcon},
  { name: 'vv', href: '/integrations', icon: SquaresPlusIcon},
  
]
const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://avatars.githubusercontent.com/u/38713144?s=40&v=4',
  link: '/a'
}
const userNavigation = [
  { name: 'Your Profile', href: '#aa' },
  { name: 'Settings', href: '#vv' },
  { name: 'Sign out', href: '#dd' },
]

const footerNavigation = {
  main: [
    { name: 'About', href: '#' },
    { name: 'Support', href: '#' },
    { name: 'F.A.Q.', href: '#' },
  ],
  social: [
    {
      name: 'GitHub',
      href: '#',
      icon: (props:any) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678
            1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ]
}

function classNames(...classes: String[]) {
  return classes.filter(Boolean).join(' ')
}



export default function  MainLayout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <>
      <div className=' overflow-hidden scrollbar'>


        {/*
  This example requires updating your template:

  ```
  <html class="h-full bg-dark">
  <body class="h-full">
  ```
*/}


        {/* Static sidebar for desktop */}
        <div className="md:fixed md:inset-y-0 md:z-50 md:flex md:w-72 md:flex-col hidden ">

          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-col gap-y-5 overflow-y-auto bg-dark pr-6 pl-7 scrollbar">
            <div className="grid grid-cols-1 gap-4 place-content-between h-screen ">
              <div>

                <div className="my-10 -ml-4 flex h-16 shrink-0 items-center">
                  <img
                    className="h-28 w-auto"
                    src="/white_ha_cube_RIGHT_hasti_splled_out_op4.png"
                    alt="Hasti"
                  />
                  <div className="mt-4 max-w-[36rem] text-5xl font-extrabold tracking-tight text-white xl:max-w-[43.5rem]">
                    HASTI
                  </div>

                </div>
                {/* <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                selectedNav === item.name
                                  ? 'bg-zinc-50 text-cyan-500'
                                  : 'text-gray-100 hover:text-cyan-500 hover:bg-gray-50',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold '
                              )}
                              onClick={() => setSelectedNav(item.name)}
                            >
                              {item.icon ? <item.icon
                                className={classNames(
                                  selectedNav === item.name ? 'text-cyan-500' : 'text-white group-hover:text-cyan-500',
                                  'h-6 w-6 shrink-0'
                                )}
                                aria-hidden="true"
                              /> : null}
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav> */}
                <VertiNav />
              </div>

              <div className="">

                {/* <a
                  onClick={() => handleItemClick('/page1')}
                  className="rounded-md flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-100 hover:bg-gray-50"
                >
                  <img
                    className="h-8 w-8 rounded-full bg-gray-50"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">Tom Cook</span>
                </a> */}
                      {/* // Show this is a beta version. */}
          
        <div className="pr-0 pl-0 bg-amber-200 rounded-2xl w-full font-bold py-2 mb-2 flex items-center">
            <div className='mx-auto px-4'>Beta Version. This is not the final version. Many things are still in the works.
            Report any issues/bugs <a href='https://github.com/JamesWRC/hasti/issues' className='underline font-extrabold'>here.</a></div>
          </div>

          {/* end beta banner */}
                <LoginBtn />
                {/* md+ footer section */}
                {/* Used for small footer content */}
                <div className="mt-2 -ml-1 bg-white w-full flex justify-around  rounded-t-2xl p-0.5 pt-1 pb-2">
                    {footerNavigation.main.map((item) => (
                      <a key={item.name} className="text-sm font-semibold leading-6 text-dark first:pl-2 pt-1" href={item.href}>{item.name}</a>
                    ))}
                    {footerNavigation.social.map((item) => (
                      <a key={item.name} href={item.href} className="text-gray-500 hover:text-gray-400 px-1 pt-1">
                        <span className="sr-only">{item.name}</span>
                        <item.icon className="h-6 w-6" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                  
                {/* COMMENTED OUT TILL MORE FOOTER CONTENT EXISTS */}
                {/* <>
                <Box  ref={ref} maw={400} className='mt-10 mx-6 -mb-2 bg-white w-full flex justify-around  rounded-t-2xl'>
                  <Group>
                    <Button onClick={() => setFooterOpen(!footerOpen)} fullWidth variant="filled" color="rgba(255, 255, 255, 1)" radius="lg">
                      <h3 className={footerOpen ? "hidden" : "text-sm font-semibold leading-6 text-dark px-3"}>About</h3>
                      <h3 className={footerOpen ? "hidden" : "text-sm font-semibold leading-6 text-dark px-3"}>Support</h3>
                      <h3 className={footerOpen ? "hidden" : "text-sm font-semibold leading-6 text-dark px-3"}>F.A.Q</h3>
   

                    </Button>
                  </Group>

                  <Collapse in={footerOpen}>
                  <div className="grid grid-cols-3 my-4">
                    <div className="grid grid-cols-2">
                      <div>
                        <h3 className="text-sm font-semibold leading-5 text-dark tracking-wider uppercase">Company</h3>
                        <ul className="mt-4">
                          <li>
                            <a href="#" className="text-base leading-6 text-dark hover:text-cyan-500">
                              About
                            </a>
                          </li>

                          <li>
                            <a href="#" className="text-base leading-6 text-dark hover:text-cyan-500">
                              Support
                            </a>
                          </li>

                          <li>
                            <a href="#" className="text-base leading-6 text-dark hover:text-cyan-500">
                              F.A.Q
                            </a>
                          </li>

                          <li>
                            <a href="#" className="text-base leading-6 text-dark hover:text-cyan-500">
                              Careers
                            </a>
                          </li>
                        </ul>
                      </div>
                      
                      </div>
                      </div>
                  </Collapse>
                </Box>

                </> */}

              </div>

            </div>
          </div>
        </div>
        {/* ---========== MOBILE NAV BAR ==========--- */}
          <Navigation/>



        <main className="md:pl-72 bg-dark h-full md:h-screen p-2 pb-0 lg:pb-3">

          <div className="pr-0 pl-0 bg-white rounded-2xl w-full h-full md:h-full overflow-y-scroll overflow-x-hidden scrollbar">
                                           
          
            {children}

          </div>
          <div className="mx-auto flex place-content-between text-white text-3xs px-7">
          <div></div>
          <div className='-mr-10'>Made with ❤️ from Australia.</div>
          <div className='relative flex'>
            <span className="motion-safe:animate-ping absolute inline-flex rounded-full bg-green-500 opacity-75 h-1.5 w-1.5 -ml-4 "></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-200 -ml-4"></span>
        <a  href="https://status.hasti.app" target="_blank"  className="pl-0.5">services & status</a>
        </div>

            </div>
        </main>

      </div>
      {/* <Footer /> */}

    </>


  )
}
