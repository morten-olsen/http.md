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
  let id = options.id?.toString();
  const idPart = optionParts.find((option) => option.startsWith('#'));
  if (idPart) {
    id = idPart.slice(1);
  }

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
      const [method, ...urlParts] = top.split(' ');
      const url = urlParts.join(' ').trim();

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

      const rawBody = await response.text();
      let responseText = rawBody;
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
        id,
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
          rawBody: rawBody,
        },
      });
    },
  });
};

export { httpHandler };
