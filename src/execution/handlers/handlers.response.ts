import YAML from 'yaml';
import { type ExecutionHandler } from '../execution.js';

const responseHandler: ExecutionHandler = ({
  addStep,
  node,
  parent,
  index,
}) => {
  if (node.type === 'leafDirective' && node.name === 'response') {
    addStep({
      type: 'file',
      node,
      action: async ({ context }) => {
        const response = node.attributes?.id ?
          context.responses[node.attributes.id] : context.response

        if (!response) {
          return;
        }

        let body = '';

        if (response.body) {
          body = response.body;
        }
        if (typeof response.body === 'object') {
          body = JSON.stringify(response.body, null, 2);
        }
        if (node.attributes?.format === 'yaml') {
          try {
            const parsed = YAML.parse(body);
            body = YAML.stringify(parsed);
          } catch (error) {
            body = `Error parsing YAML: ${error}`;
          }
        }
        if (node.attributes?.truncate) {
          const maxLength = parseInt(node.attributes.truncate);
          if (body.length > maxLength) {
            body = body.slice(0, maxLength) + '...';
          }
        }

        const responseContent = [
          `HTTP/${response.status} ${response.statusText}`,
          ...Object.entries(response.headers).map(([key, value]) => {
            return `${key}: ${value}`;
          }),
          '',
          body || '[empty]',
        ].join('\n');

        const codeNode = {
          type: 'code',
          value: responseContent,
        };
        if (!parent || !('children' in parent) || index === undefined) {
          throw new Error('Parent node is required');
        }

        parent.children?.splice(
          index,
          1,
          codeNode as any,
        );
      },
    })
  }
}

export { responseHandler };
