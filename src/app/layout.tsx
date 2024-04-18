// Styles
import './globals.css'
import '@mantine/core/styles.css';

// Imports
import MainLayout from '@/frontend/app/mainLayout'
import Head from './head'

import { MantineProvider, ColorSchemeScript } from '@mantine/core';

import React from 'react';
import { auth } from "./auth"
import { SessionProvider } from "next-auth/react"

// import { NextAuthProvider } from '@/frontend/app/providers'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const session = await getServerSession(options)

  // const session = await getServerSession()
  const session = await auth()

  return (

    <html lang="en" className='bg-dark h-screen'>
          {/* <NextAuthProvider> */}
          <SessionProvider session={session}>

      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}

      <Head/>

        <body className=''>
        {/* <MantineProvider> */}
        <MantineProvider>
          <MainLayout >
          {children}
        </MainLayout>
        </MantineProvider>
        {/* </MantineProvider> */}

      </body>
      {/* </NextAuthProvider> */}
      </SessionProvider>

    </html>
  )
}
