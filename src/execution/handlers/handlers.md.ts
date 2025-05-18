import { dirname, resolve } from 'path';
import { toString } from 'mdast-util-to-string'
import { execute, type ExecutionHandler } from '../execution.js';

const fileHandler: ExecutionHandler = ({
  addStep,
  node,
  parent,
  index,
  file,
}) => {
  if (node.type === 'leafDirective' && node.name === 'md') {
    addStep({
      type: 'file',
      node,
      action: async ({ context }) => {
        const filePath = resolve(
          dirname(file),
          toString(node)
        );
        if (!filePath) {
          throw new Error('File path is required');
        }
        const { root: newRoot } = await execute(filePath, {
          context,
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
        parent.children?.splice(index, 1, ...newRoot.children as any);
      },
    })
  }
}

export { fileHandler };
