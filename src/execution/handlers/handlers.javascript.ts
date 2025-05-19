import Handlebars from 'handlebars';
import YAML from 'yaml';
import { should, expect, assert } from 'chai';

import { ExecutionHandler } from '../execution.js';
import { ScriptError } from '../../utils/errors.js';

const javascriptHandler: ExecutionHandler = ({ node, parent, index, addStep }) => {
  if (node.type !== 'code' || node.lang !== 'javascript') {
    return;
  }
  const optionParts = node.meta?.split(',') || [];
  node.meta = undefined;
  const options = Object.fromEntries(
    optionParts.filter(Boolean).map((option) => {
      const [key, value] = option.split('=');
      return [key.trim(), value?.trim() || true];
    }),
  );

  addStep({
    type: 'code',
    node,
    action: async ({ context }) => {
      const template = Handlebars.compile(node.value);
      const content = template(context);
      node.value = content;
      if (options['run'] === true) {
        const api = {
          assert,
          should,
          expect,
          ...context,
        };
        try {
          const asyncFunc = new Function(...Object.keys(api), `return (async () => { ${content} })()`);
          const result = await asyncFunc(...Object.values(api));
          if (options.output === true && index !== undefined) {
            if (result !== undefined) {
              parent?.children?.splice(index + 1, 0, {
                type: 'code',
                lang: 'yaml',
                value: YAML.stringify(result, null, 2),
                meta: undefined,
              });
            }
          }
        } catch (error) {
          if (index !== undefined) {
            parent?.children?.splice(index + 1, 0, {
              type: 'code',
              value: `Error: ${error instanceof Error ? error.message : String(error)}`,
              meta: undefined,
            });
          }
          throw new ScriptError(error instanceof Error ? error.message : String(error));
        }
      }
      if (options.hidden === true && parent && index !== undefined) {
        parent.children?.splice(index, 1);
      }
    },
  });
};

export { javascriptHandler };
