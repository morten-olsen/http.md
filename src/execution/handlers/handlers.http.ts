import Handlebars from "handlebars";
import YAML from "yaml";
import { ExecutionHandler } from "../execution.js";

const httpHandler: ExecutionHandler = ({
  node,
  addStep,
}) => {
  if (node.type !== 'code' || node.lang !== 'http') {
    return;
  }
  const optionParts = node.meta?.split(',') || [];
  const options = Object.fromEntries(
    optionParts.filter(Boolean).map((option) => {
      const [key, value] = option.split('=');
      return [key.trim(), value?.trim() || true];
    })
  );

  addStep({
    type: 'http',
    node,
    action: async ({ context }) => {
      if (options.disable === true) {
        return;
      }
      const template = Handlebars.compile(node.value);
      const content = template(context);
      const [head, body] = content.split('\n\n');
      const [top, ...headerItems] = head.split('\n');
      const [method, url] = top.split(' ');

      const headers = Object.fromEntries(
        headerItems.map((header) => {
          const [key, value] = header.split(':');
          return [key.trim(), value?.trim() || ''];
        })
      );

      let parsedBody = body;
      if (options.format === 'yaml') {
        try {
          const parsed = YAML.parse(body);
          parsedBody = JSON.stringify(parsed);
        } catch (error) {
          parsedBody = `Error parsing YAML: ${error}`;
        }
      }

      const response = await fetch(url, {
        method,
        headers,
        body
      });

      let responseText = await response.text();
      if (options.json) {
        try {
          responseText = JSON.parse(responseText);
        } catch (e) {
          responseText = `Error parsing JSON: ${e}`;
        }
      }

      node.value = content;
      node.meta = undefined;

      context.addRequest({
        id: options.id?.toString(),
        request: {
          method,
          url,
          headers,
          body,
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText,
        },
      });
    },
  });
};

export { httpHandler };
