import Handlebars from "handlebars";
import { ExecutionHandler } from "../execution.js";

const codeHandler: ExecutionHandler = ({
  node,
  addStep,
}) => {
  if (node.type !== 'code' || node.lang === 'http') {
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
    type: 'code',
    node,
    action: async ({ context }) => {
      node.meta = undefined;
      if (options['no-tmpl'] === true) {
        return;
      }
      const template = Handlebars.compile(node.value);
      const content = template(context);
      node.value = content;
    },
  });
};

export { codeHandler };
