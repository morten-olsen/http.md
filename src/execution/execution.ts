import { readFile } from 'node:fs/promises';

import { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkDirective from 'remark-directive';
import remarkStringify from 'remark-stringify';
import behead from 'remark-behead';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { Context } from '../context/context.js';

import { handlers, postHandlers } from './handlers/handlers.js';

type BaseNode = {
  type: string;
  name?: string;
  children?: BaseNode[];
  attributes?: Record<string, string>;
  meta?: string;
  lang?: string;
  value?: string;
};

type ExecutionStepOptions = {
  file: string;
  input?: Record<string, unknown>;
  context: Context;
  root: Root;
  node: BaseNode;
};

type ExecutionStep = {
  type: string;
  node: BaseNode;
  action: (options: ExecutionStepOptions) => Promise<void>;
};

type ExecutionHandler = (options: {
  file: string;
  addStep: (step: ExecutionStep) => void;
  node: BaseNode;
  parent?: BaseNode;
  root: Root;
  index?: number;
}) => void;

type ExexutionExecuteOptions = {
  context: Context;
  behead?: number;
};

const execute = async (file: string, options: ExexutionExecuteOptions) => {
  let error: unknown | undefined;
  const { context } = options;
  context.files.add(file);
  const content = await readFile(file, 'utf-8');
  const steps = new Set<ExecutionStep>();

  const parser = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkStringify)
    .use(remarkRehype)
    .use(behead, {
      depth: options.behead,
    });
  const root = parser.parse(content);

  visit(root, (node, index, parent) => {
    for (const handler of handlers) {
      handler({
        addStep: (step) => steps.add(step),
        node: node as BaseNode,
        root,
        parent: parent as BaseNode | undefined,
        index,
        file,
      });
    }
  });
  visit(root, (node, index, parent) => {
    for (const handler of postHandlers) {
      handler({
        addStep: (step) => steps.add(step),
        node: node as BaseNode,
        root,
        parent: parent as BaseNode | undefined,
        index,
        file,
      });
    }
  });

  for (const step of steps) {
    try {
      const { node, action } = step;
      const options: ExecutionStepOptions = {
        file,
        input: {},
        context,
        node,
        root,
      };
      await action(options);
    } catch (e) {
      error = e;
      break;
    }
  }

  const markdown = parser.stringify(root);

  return {
    error,
    root,
    markdown,
  };
};

export { execute, type ExecutionHandler };
