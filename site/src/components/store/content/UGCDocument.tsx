import React from "react";
import Markdoc from '@markdoc/markdoc';
import fs from 'fs';

import nodes from '@/markdoc/nodes';
import tags from '@/markdoc/tags';
import { Callout } from '@/components/markdoc/Callout'
import { QuickLink, QuickLinks } from '@/components/markdoc/QuickLinks'
import { type Node, Config } from '@markdoc/markdoc';


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
    source: string;
}

export function UGCDocument({ source }: DocumentProps) {
//     source = `
// ---
// title: Getting started
// ---

// Learn how to get CacheAdvance set up in your project in under thirty minutes or it's free. {% .lead %}
// {% quick-links %}
// {% quick-link title="Installation" icon="installation" href="#help" description="Step-by-step guides to setting up your system and installing the library." /%}
// {% quick-link title="Architecture guide" icon="presets" href="/" description="Learn how the internals work and contribute." /%}
// {% quick-link title="Plugins" icon="plugins" href="/" description="Extend the library with third-party plugins or write your own." /%}
// {% quick-link title="API reference" icon="theming" href="/" description="Learn to easily customize and modify your app's visual design to fit your brand." /%}
// {% /quick-links %}


// Possimus saepe veritatis sint nobis et quam eos. Architecto consequatur odit perferendis fuga eveniet possimus rerum cumque. Ea deleniti voluptatum deserunt voluptatibus ut non iste. Provident nam asperiores vel laboriosam omnis ducimus enim nesciunt quaerat. Minus tempora cupiditate est quod.

// {% callout type="warning" title="Oh no! Something bad happened!" %}
// This is what a disclaimer message looks like. You might want to include inline in it. Or maybe you’ll want to include a [link](/) in it. I don’t think we should get too carried away with other scenarios like lists or tables — that would be silly.
// {% /callout %}

// `

    console.log('UGCDocument source', source)
    
    const ast = Markdoc.parse(source);
    // ignore the error
    const config  = {
        nodes: nodes,
        tags: tags,
    };
    // ignore type error
    // @ts-expect-error
    const content = Markdoc.transform(ast, config);

    return Markdoc.renderers.react(content, React);
    
}

export default UGCDocument;