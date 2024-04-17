import Prism from 'prismjs';
import React, { ReactNode } from 'react';
import {nodes} from '@markdoc/markdoc';

interface CodeBlockProps {
   children: ReactNode;
   'data-language': string;
}

export function CodeBlock({children, 'data-language': language}: CodeBlockProps) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current, false);
  }, [children]);

  return (
    <div className="code" aria-live="polite">
      <pre
        ref={ref}
        className={`language-${language}`}
      >
        {children}
      </pre>
      <style jsx>
        {`
          .code {
            position: relative;
          }

          /* Override Prism styles */
          .code :global(pre[class*='language-']) {
            text-shadow: none;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  );
}

export const fence = {
  render: CodeBlock,
  attributes: nodes.fence.attributes,
};