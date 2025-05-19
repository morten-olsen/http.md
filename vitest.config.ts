import { defineConfig } from 'vitest/config';

const config = defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'json-summary', 'html'],
      all: true,
      reportOnFailure: true,
      include: ['src/**/*.ts'],
      exclude: ['src/cli/**/*.ts'],
    },
  },
});

export default config;
