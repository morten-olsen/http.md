import { ExecutionHandler } from "../execution.js";
import { fileHandler } from "./handlers.md.js";
import { httpHandler } from "./handlers.http.js";
import { inputHandler } from "./handlers.input.js";
import { rawMdHandler } from "./handlers.raw-md.js";
import { responseHandler } from "./handlers.response.js";
import { textHandler } from "./handlers.text.js";
import { codeHandler } from "./handlers.code.js";

const handlers = [
  fileHandler,
  httpHandler,
  responseHandler,
  textHandler,
  inputHandler,
  rawMdHandler,
  codeHandler,
] satisfies ExecutionHandler[];

export { handlers };
