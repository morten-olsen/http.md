
import { inspect } from "node:util";
import { Context } from "./context/context.js";
import { execute } from "./execution/execution.js";

const context = new Context({
  input: {
    foo: '10',
  },
});
const result = await execute('./demo.md', {
  context,
});

console.log(result.markdown);
console.log(context.files);
