'use client'
import './globals.css'


import MainLayout from '@/app/mainLayout'
import Head from './head'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='bg-dark'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <Head/>
        <body className='bg-blue'>
          <MainLayout >
            {children}
        </MainLayout>
      </body>
    </html>
  )
}
