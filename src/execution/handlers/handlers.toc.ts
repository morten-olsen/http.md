import { toc } from 'mdast-util-toc';
import { type ExecutionHandler } from '../execution.js';

const tocHandler: ExecutionHandler = ({
  addStep,
  node,
  root,
  parent,
  index,
}) => {
  if (node.type === 'leafDirective' && node.name === 'toc') {
    addStep({
      type: 'toc',
      node,
      action: async () => {
        const result = toc(root, {
          tight: true,
          minDepth: 2,
        })
        if (!parent || !parent.children || index === undefined) {
          throw new Error('Parent node is not valid');
        }
        parent.children.splice(index, 1, result.map as any);
      },
    })
  }
}

export { tocHandler };
