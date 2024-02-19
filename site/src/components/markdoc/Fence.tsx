'use client'

import { Fragment } from 'react'
import { Highlight } from 'prism-react-renderer'
import 'prismjs';
import 'prismjs/themes/prism.css';

import Prism from 'react-prism';

export function Fence({
  children,
  language,
}: {
  children: string
  language: string
}) {
  return (
    <Prism key={language} component="pre" className={`language-${language}`}>
    {children}
  </Prism>
  )
}
