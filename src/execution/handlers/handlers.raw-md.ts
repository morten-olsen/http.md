import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

import { toString } from 'mdast-util-to-string';

import { Context } from '../../context/context.js';
import { execute, type ExecutionHandler } from '../execution.js';
import { FileNotFoundError } from '../../utils/errors.js';

const rawMdHandler: ExecutionHandler = ({ addStep, node, parent, index, file }) => {
  if (node.type === 'leafDirective' && node.name === 'raw-md') {
    addStep({
      type: 'raw-md',
      node,
      action: async ({ context: parentContext }) => {
        const name = resolve(dirname(file), toString(node));
        if (!existsSync(name)) {
          throw new FileNotFoundError(name);
        }
        const context = new Context({
          input: {},
        });
        let markdown = '';
        if (node.attributes?.render === '') {
          const result = await execute(name, {
            context,
          });
          markdown = result.markdown;
          for (const file of context.files) {
            parentContext.files.add(file);
          }
        } else {
          markdown = await readFile(name, 'utf-8');
          parentContext.files.add(name);
        }
        const newNode = {
          type: 'code',
          lang: 'markdown',
          value: markdown,
        };

        if (!parent || !('children' in parent) || index === undefined) {
          throw new Error('Parent node is required');
        }

        parent.children?.splice(index, 1, newNode as ExpectedAny);
      },
    });
  }
};

export { rawMdHandler };
