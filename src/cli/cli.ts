import { program } from 'commander';
import { resolve } from 'node:path';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { execute } from '../execution/execution.js';
import { Context } from '../context/context.js';
import { writeFile } from 'node:fs/promises';
import { Watcher } from '../watcher/watcher.js';


marked.use(markedTerminal() as any);

program
  .command('dev')
  .argument('<name>', 'http.md file name')
  .description('Run a http.md document')
  .option('-w, --watch', 'watch for changes')
  .option('-i, --input <input...>', 'input variables (-i foo=bar -i baz=qux)')
  .action(async (name, options) => {
    const {
      watch = false,
      input: i = [],
    } = options;

    const input = Object.fromEntries(
      i.map((item: string) => {
        const [key, value] = item.split('=');
        return [key, value];
      })
    );
    const filePath = resolve(process.cwd(), name);

    const build = async () => {
      const context = new Context({
        input,
      })
      const result = await execute(filePath, {
        context,
      });

      const markdown = await marked.parse(result.markdown);
      console.log(markdown);

      return {
        ...result,
        context,
      }
    }

    const result = await build();

    if (watch) {
      const watcher = new Watcher();
      watcher.watchFiles(Array.from(result.context.files));
      watcher.on('changed', async () => {
        const result = await build();
        watcher.watchFiles(Array.from(result.context.files));
      });
    } else {
      process.exit(0);
    }
  });

program
  .command('build')
  .argument('<name>', 'http.md file name')
  .argument('<output>', 'output file name')
  .description('Run a http.md document')
  .option('-w, --watch', 'watch for changes')
  .option('-i, --input <input...>', 'input variables (-i foo=bar -i baz=qux)')
  .action(async (name, output, options) => {
    const {
      watch = false,
      input: i = [],
    } = options;


    const input = Object.fromEntries(
      i.map((item: string) => {
        const [key, value] = item.split('=');
        return [key, value];
      })
    );
    const filePath = resolve(process.cwd(), name);

    const build = async () => {
      const context = new Context({
        input,
      })
      const result = await execute(filePath, {
        context,
      });

      await writeFile(output, result.markdown);
      return {
        ...result,
        context,
      }
    }

    const result = await build();

    if (watch) {
      const watcher = new Watcher();
      watcher.watchFiles(Array.from(result.context.files));
      watcher.on('changed', async () => {
        const result = await build();
        watcher.watchFiles(Array.from(result.context.files));
      });
    } else {
      process.exit(0);
    }
  });

await program.parseAsync(process.argv);
