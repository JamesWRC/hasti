'use client'

import { Fragment } from 'react'
// import { Highlight } from 'prism-react-renderer'
import 'prismjs';
import 'prismjs/themes/prism.css';
import copy from 'copy-to-clipboard';

// import Prism from 'react-prism';
import { Highlight, Token, themes } from "prism-react-renderer"
import { DocumentDuplicateIcon } from '@heroicons/react/24/solid';

function getSpaces(counter: number, totalLines: number): string {
  const totalDigits = totalLines.toString().length;
  const counterDigits = counter.toString().length;
  return ' '.repeat(Math.max(totalDigits - counterDigits, 0) + 1);
}


function unEscapeTags(line: string):string {
  let retString = line
  if(line){
    retString = retString.replaceAll('\\{\\%', '{%').replaceAll('\\%\\}', '%}')  
  }else if(line === undefined){
    retString = ''
  }
return retString
}

export function Fence({ children, language }: { children: string, language: string }) {

  console.log("PRISM")
  console.log("PRISM lang", language)
  console.log("PRISM children", children)
  const code:string = unEscapeTags(children)
  console.log("PRISM children replaced", children)

  try{
    return (
      <Highlight
        theme={themes.jettwaveDark}
        code={code}
        language={language ? language : 'txt'}
      >

      {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <div className="relative">
                            <button
      onClick={() => copy(code)}
      className='absolute top-0 right-0 m-4 p-1 text-xs text-white bg-dark rounded hover:bg-gray-500'
    >
      <DocumentDuplicateIcon className='text-white h-5 w-5'/>
    </button>
          <pre key='a' style={style} className='bg-gray-100 rounded overflow-auto'>

            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {/* Make span unselectable */}
                <span className='select-none'>{getSpaces(i+1, tokens.length)}{i + 1}&nbsp; </span>
                {line.map((token:Token, key:number) => (
                  <span key={key} {...getTokenProps({token})} />
                ))}
              </div>
            ))}
          </pre>
        </div>

        )}
        </Highlight>
      )
  } catch (e) {
    console.error("Error rendering code block", e)
    return <pre>{children}</pre>
  }
  
}
