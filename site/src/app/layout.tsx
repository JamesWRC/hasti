'use client'
// Styles
import './globals.css'
import '@mantine/core/styles.css';

// Imports
import MainLayout from '@/app/mainLayout'
import Head from './head'

import { MantineProvider, ColorSchemeScript } from '@mantine/core';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='bg-dark h-screen'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}

      <Head/>

        <body className='bg-blue '>
        {/* <MantineProvider> */}

          <MainLayout >
          <MantineProvider>{children}</MantineProvider>
        </MainLayout>
        {/* </MantineProvider> */}

      </body>
    </html>
  )
}
