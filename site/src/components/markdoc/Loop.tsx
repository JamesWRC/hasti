import { Tag } from '@markdoc/markdoc';

export const group = {
  render: 'Group',
  attributes: {
    items: { type: Array }
  },
  transform(node:any, config:any) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    for (const item of attributes.items) {
      /* Do something with each item */
    }

    return new Tag('Group', attributes, children);
  }
};