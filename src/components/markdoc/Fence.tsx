'use client'

import { Fragment } from 'react'
// import { Highlight } from 'prism-react-renderer'
import 'prismjs';
import 'prismjs/themes/prism.css';

// import Prism from 'react-prism';
import { Highlight, themes } from "prism-react-renderer"

function getSpaces(counter:number, totalLines:number){
  return ' '.repeat(Math.max(Math.floor(Math.log10(totalLines)) - Math.floor(Math.log10(counter)), 1));
  // return ' '.repeat(Math.max(Math.max(Math.log10(totalLines)) - Math.floor(Math.log10(counter)), 1))
}

export function Fence({
  children,
  language,
}: {
  children: string
  language: string
}) {
  return (
    <Highlight
    theme={themes.jettwaveDark}
    code={children}
    language={language ? language : 'txt'}
  >
{({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre style={style}>
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line })}>
            {/* Make span unselectable */}
            <span className='select-none'>{getSpaces(i+1, tokens.length)}{i + 1}</span>
            {line.map((token, key) => (
              <> 
              <span key={key} {...getTokenProps({ token })} />
              </>
            ))}
          </div>
        ))}
      </pre>
    )}
    </Highlight>

  )
}
