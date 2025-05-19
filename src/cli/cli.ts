import { program } from 'commander';
import { resolve } from 'node:path';
import { execute } from '../execution/execution.js';
import { Context } from '../context/context.js';
import { writeFile } from 'node:fs/promises';
import { Watcher } from '../watcher/watcher.js';
import { wrapBody } from '../theme/theme.html.js';
import { loadInputFiles } from './utils/input.js';
import { InvalidFormatError } from '../utils/errors.js';
import { renderUI, State } from './ui/ui.js';
import { Marked } from 'marked';



program
  .command('dev')
  .argument('<name>', 'http.md file name')
  .description('Run a http.md document')
  .option('-w, --watch', 'watch for changes')
  .option('-f, --file <file...>', 'input files (-f foo.js -f bar.json)')
  .option('-i, --input <input...>', 'input variables (-i foo=bar -i baz=qux)')
  .action(async (name, options) => {
    const {
      file: f = [],
      watch = false,
      input: i = [],
    } = options;

    const input = {
      ...Object.fromEntries(
        i.map((item: string) => {
          const [key, value] = item.split('=');
          return [key, value];
        })
      ),
      ...loadInputFiles(f),
    };
    const state = new State<any>({
      markdown: 'Loading',
    });
    const filePath = resolve(process.cwd(), name);

    const build = async () => {
      const context = new Context({
        input,
      })
      const result = await execute(filePath, {
        context,
      });

      state.setState({
        error: result.error ? result.error instanceof Error ? result.error.message : result.error : undefined,
        markdown: result.markdown,
      });

      return {
        ...result,
        context,
      }
    }

    const result = await build();
    renderUI(state);

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
  .option('-f, --file <file...>', 'input files (-f foo.js -f bar.json)')
  .option('--format <format>', 'output format (html, markdown)')
  .option('-w, --watch', 'watch for changes')
  .option('-i, --input <input...>', 'input variables (-i foo=bar -i baz=qux)')
  .action(async (name, output, options) => {
    const {
      watch = false,
      file: f = [],
      input: i = [],
      format = 'markdown',
    } = options;


    const input = {
      ...Object.fromEntries(
        i.map((item: string) => {
          const [key, value] = item.split('=');
          return [key, value];
        })
      ),
      ...loadInputFiles(f),
    }
    const filePath = resolve(process.cwd(), name);

    const build = async () => {
      const context = new Context({
        input,
      })
      const result = await execute(filePath, {
        context,
      });

      if (result.error) {
        console.error(result.error);
      }

      if (format === 'html') {
        const marked = new Marked();
        const html = await marked.parse(result.markdown);
        await writeFile(output, wrapBody(html));
      } else if (format === 'markdown') {
        await writeFile(output, result.markdown);
      } else {
        throw new InvalidFormatError('Invalid format');
      }
      return {
        ...result,
        context,
      }
    }

    const result = await build();

    if (result.error && !watch) {
      process.exit(1);
    }

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
