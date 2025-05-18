import { program } from 'commander';
import { resolve } from 'node:path';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { execute } from '../execution/execution.js';
import { Context } from '../context/context.js';
import { writeFile } from 'node:fs/promises';
import { Watcher } from '../watcher/watcher.js';
import { UI } from './ui/ui.js';
import { wrapBody } from '../theme/theme.html.js';



program
  .command('dev')
  .argument('<name>', 'http.md file name')
  .description('Run a http.md document')
  .option('-w, --watch', 'watch for changes')
  .option('-i, --input <input...>', 'input variables (-i foo=bar -i baz=qux)')
  .action(async (name, options) => {
    const marked = new Marked();
    marked.use(markedTerminal() as any);
    const {
      watch = false,
      input: i = [],
    } = options;

    const ui = new UI();

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
      ui.content = markdown;

      return {
        ...result,
        context,
      }
    }

    const result = await build();

    ui.screen.key(['r'], () => {
      build();
    });

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
  .option('-f, --format <format>', 'output format (html, markdown)')
  .option('-w, --watch', 'watch for changes')
  .option('-i, --input <input...>', 'input variables (-i foo=bar -i baz=qux)')
  .action(async (name, output, options) => {
    const {
      watch = false,
      input: i = [],
      format = 'markdown',
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

      if (format === 'html') {
        const marked = new Marked();
        const html = await marked.parse(result.markdown);
        await writeFile(output, wrapBody(html));
      } else if (format === 'markdown') {
        await writeFile(output, result.markdown);
      } else {
        throw new Error('Invalid format');
      }
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
