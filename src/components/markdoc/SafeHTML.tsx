import Prism from 'prismjs';
import React, { ReactNode } from 'react';
import {nodes} from '@markdoc/markdoc';
import DOMPurify from "isomorphic-dompurify";
import ReactDOMServer, { renderToString } from 'react-dom/server';

interface SafeHTMLProps {
   children: ReactNode;
//    'data-language': string;
}


function centerDivStyle(doc:Document) {
  const centeredDivs = doc.querySelectorAll<HTMLDivElement>('div[align="center"]')

  centeredDivs.forEach((div) => {
    // update the class for the div
    div.classList.add('flex'); 
    div.classList.add('justify-center');
    div.classList.add('gap-4');
    div.classList.add('no-underline');
  })

  return doc
}

function centerPStyle(doc:Document) {
  const centeredDivs = doc.querySelectorAll<HTMLDivElement>('p[align="center"]')

  centeredDivs.forEach((div) => {
    // update the class for the div
    div.classList.add('flex'); 
    div.classList.add('justify-center');
    div.classList.add('gap-4');
    div.classList.add('no-underline');
  })

  return doc
}

function htmlDecode(input:string) {
    var doc = new DOMParser().parseFromString(input, "text/html");
   
    return doc.documentElement.textContent;
  }

export function SafeHTML({children}: SafeHTMLProps) {
        const domPurifyConfig = {
            ALLOWED_TAGS: ['p',]  // Only allow <p> tags
        };
    console.log('SafeHTML children', children)
    const html = renderToString(<>
        {children}
    </>)
    console.log('html', html)
    const escapedHTML = htmlDecode(html);
    if(escapedHTML) {
      let doc = new DOMParser().parseFromString(escapedHTML, "text/html");

      // Update any divs to work with tailwindcss
      doc = centerDivStyle(doc);
      doc = centerPStyle(doc);

      // MUST always sanitize as the last step before rendering
      const safeHTML = DOMPurify.sanitize(doc.documentElement.innerHTML);
      return (
        <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
      );

    }else{
      console.log('Incompatible HTML:', escapedHTML)
      return <>Incompatible HTML</>
    }

}
