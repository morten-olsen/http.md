import { toString } from 'mdast-util-to-string';
import { type ExecutionHandler } from '../execution.js';

const inputHandler: ExecutionHandler = ({
  addStep,
  node,
  parent,
  index,
}) => {
  if (node.type === 'leafDirective' && node.name === 'input') {
    addStep({
      type: 'input',
      node,
      action: async ({ context }) => {
        const name = toString(node);

        if (node.attributes?.required === '' && context.input[name] === undefined) {
          throw new Error(`Input "${name}" is required`);
        }

        if (node.attributes?.default !== undefined && context.input[name] === undefined) {
          context.input[name] = node.attributes.default;
        }

        if (node.attributes?.format === 'number' && context.input[name] !== undefined) {
          context.input[name] = Number(context.input[name]);
          if (context.input[name] !== undefined && isNaN(Number(context.input[name]))) {
            throw new Error(`Input "${name}" must be a number, but got "${context.input[name]}"`);
          }
        }

        if (!parent || !('children' in parent) || index === undefined) {
          throw new Error('Parent node is required');
        }

        if (node.attributes?.hidden === '') {
          parent?.children?.splice(index, 1);
          return;
        }

        const newNode = {
          type: 'code',
          value: `${name}=${context.input[name] ?? '[undefined]'}`,
        };

        parent.children?.splice(
          index,
          1,
          newNode as any,
        );
      },
    })
  }
}

export { inputHandler };
