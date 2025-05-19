import { toString } from 'mdast-util-to-string';
import { type ExecutionHandler } from '../execution.js';
import { ParsingError, RequiredError } from '../../utils/errors.js';

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
          throw new RequiredError(name);
        }

        if (node.attributes?.default !== undefined && context.input[name] === undefined) {
          context.input[name] = node.attributes.default;
        }

        if (node.attributes?.format && context.input[name] !== undefined) {
          const format = node.attributes.format;
          if (format === 'number') {
            context.input[name] = Number(context.input[name]);
            if (context.input[name] !== undefined && isNaN(Number(context.input[name]))) {
              throw new ParsingError(`Input "${name}" must be a number, but got "${context.input[name]}"`);
            }
          }
          if (format === 'boolean') {
            context.input[name] = context.input[name] === 'true';
          }
          if (format === 'string') {
            context.input[name] = String(context.input[name]);
          }
          if (format === 'json') {
            try {
              context.input[name] = JSON.parse(String(context.input[name]));
            } catch (error) {
              throw new ParsingError(`Input "${name}" must be a valid JSON, but got "${context.input[name]}"`);
            }
          }

          if (format === 'date') {
            const date = new Date(context.input[name] as string);
            if (isNaN(date.getTime())) {
              throw new ParsingError(`Input "${name}" must be a valid date, but got "${context.input[name]}"`);
            }
            context.input[name] = date;
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
