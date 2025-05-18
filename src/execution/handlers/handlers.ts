import { ExecutionHandler } from "../execution.js";
import { fileHandler } from "./handlers.file.js";
import { httpHandler } from "./handlers.http.js";
import { inputHandler } from "./handlers.input.js";
import { rawMdHandler } from "./handlers.raw-md.js";
import { responseHandler } from "./handlers.response.js";
import { textHandler } from "./handlers.text.js";

const handlers = [
  fileHandler,
  httpHandler,
  responseHandler,
  textHandler,
  inputHandler,
  rawMdHandler,
] satisfies ExecutionHandler[];

export { handlers };
