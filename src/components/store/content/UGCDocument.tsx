import React from "react";
import Markdoc from '@markdoc/markdoc';
import fs from 'fs';

import nodes from '@/frontend/markdoc/nodes';
import tags from '@/frontend/markdoc/tags';
import { Callout } from '@/frontend/components/markdoc/Callout'
import { QuickLink, QuickLinks } from '@/frontend/components/markdoc/QuickLinks'
import { type Node, Config } from '@markdoc/markdoc';
import '@/frontend/app/prism.js'
import { useEffect, useState } from 'react';
import DOMPurify from "isomorphic-dompurify";
import ReactDOMServer from 'react-dom/server';



// const config = {
//     tags: {
//       callout: {
//         attributes: {
//           title: { type: String },
//           type: {
//             type: String,
//             default: 'note',
//             matches: ['note', 'warning'],
//             errorLevel: 'critical',
//           },
//         },
//         render: Callout,
//       },
//       figure: {
//         selfClosing: true,
//         attributes: {
//           src: { type: String },
//           alt: { type: String },
//           caption: { type: String },
//         },
//         render: ({ src, alt = '', caption }) => (
//           <figure>
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img src={src} alt={alt} />
//             <figcaption>{caption}</figcaption>
//           </figure>
//         ),
//       },
//       'quick-links': {
//         render: QuickLinks,
//       },
//       'quick-link': {
//         selfClosing: true,
//         render: QuickLink,
//         attributes: {
//           title: { type: String },
//           description: { type: String },
//           icon: { type: String },
//           href: { type: String },
//         },
//       },
//     }
//   };


interface DocumentProps {
    source: string | undefined;
}

export function UGCDocument({ source }: DocumentProps) {

    const [safeHtml, setSafeHtml] = useState('');




      
    // useEffect(() => {
    //     const config  = {
    //         nodes: nodes,
    //         tags: tags,
    //     };

    //     const domPurifyConfig = {
    //         ALLOWED_TAGS: ['p']  // Only allow <p> tags
    //     };

    //     if (!source) {
    //         source = 'No content :(';
    //     }
    //     const ast = Markdoc.parse(source);

    //     // ignore type error
    //     // @ts-expect-error
    //     const content = Markdoc.transform(ast, config);
    //     const clean = DOMPurify.sanitize(Markdoc.renderers.react(content, React), domPurifyConfig);

    //     setSafeHtml(clean);
    //     console.log('safeHtml', safeHtml)
    // }, []);
  
    // return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;

    if (!source) {
        source = 'No content :(';
    }
    // const a = DOMPurify.sanitize(source, {ALLOWED_TAGS: ['p', 'div']});


    console.log('source', source)
    const ast = Markdoc.parse(source);

    // ignore type error
    // @ts-expect-error
    const content = Markdoc.transform(ast, {
        nodes: nodes,
        tags: tags,
    });
    
    const reactElement = Markdoc.renderers.react(content, React);
        // const clean = DOMPurify.sanitize(reactElement, {ALLOWED_TAGS: ['p', 'div']});
    console.log('reactElement', reactElement)
    return reactElement
    // return <div dangerouslySetInnerHTML={{ __html: reactElement }} />;
    // const html = ReactDOMServer.renderToString(reactElement);

    // return Markdoc.renderers.react(content, React).

}

export default UGCDocument;