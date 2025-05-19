import Handlebars from 'handlebars';

import { type ExecutionHandler } from '../execution.js';

const textHandler: ExecutionHandler = ({ addStep, node }) => {
  if (node.type === 'text') {
    addStep({
      type: 'parse-text',
      node,
      action: async ({ context }) => {
        const template = Handlebars.compile(node.value);
        const content = template(context);
        node.value = content;
      },
    });
  }
};

export { textHandler };
