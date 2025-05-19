import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

import { toString } from 'mdast-util-to-string';

import { execute, type ExecutionHandler } from '../execution.js';
import { FileNotFoundError } from '../../utils/errors.js';

const fileHandler: ExecutionHandler = ({ addStep, node, parent, index, file }) => {
  if (node.type === 'leafDirective' && node.name === 'md') {
    addStep({
      type: 'file',
      node,
      action: async ({ context }) => {
        const filePath = resolve(dirname(file), toString(node));
        if (!existsSync(filePath)) {
          throw new FileNotFoundError(filePath);
        }
        const { root: newRoot } = await execute(filePath, {
          context,
          behead: node.attributes?.behead ? parseInt(node.attributes.behead) : undefined,
        });
        if (!parent) {
          throw new Error('Parent node is required');
        }
        if (index === undefined) {
          throw new Error('Index is required');
        }
        if (node.attributes?.hidden === '') {
          parent.children?.splice(index, 1);
          return;
        }
        parent.children?.splice(index, 1, ...(newRoot.children as ExpectedAny[]));
      },
    });
  }
};

export { fileHandler };
