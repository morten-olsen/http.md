import { resolve } from 'path';

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';

import { Context, execute } from '../src/exports.js';

import { server } from './mocks/node.js';

describe('execute', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should correctly render the readme file', async () => {
    const context = new Context();
    const filePath = resolve(__dirname, '..', 'docs', 'README.md');
    const result = await execute(filePath, {
      context,
    });

    expect(result.markdown).toMatchSnapshot();
  }, 30000);
});
