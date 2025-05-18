import blessed from 'blessed';
import chalk from 'chalk';

class UI {
  #box: blessed.Widgets.BoxElement;
  #screen: blessed.Widgets.Screen;

  constructor() {
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Markdown Viewer'
    });
    const scrollableBox = blessed.box({ // Or blessed.scrollablebox
      parent: screen,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      content: '',
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      vi: true, // vi-like keybindings
      mouse: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'cyan'
        },
        style: {
          inverse: true
        }
      },
      style: {
        fg: 'white',
        bg: 'black'
      }
    });
    this.#box = scrollableBox;
    this.#screen = screen;

    screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });

    scrollableBox.focus();
    screen.render();
  }

  public get screen() {
    return this.#screen;
  }

  public set content(content: string) {
    const originalLines = content.split('\n');
    const maxLineNoDigits = String(originalLines.length).length; // For padding

    const linesWithNumbers = originalLines.map((line, index) => {
      const lineNumber = String(index + 1).padStart(maxLineNoDigits, ' ');
      const styledLineNumber = chalk.dim.yellow(`${lineNumber} | `);
      return `${styledLineNumber}${line}`;
    });

    const contentWithLineNumbers = linesWithNumbers.join('\n');
    this.#box.setContent(contentWithLineNumbers);
    this.#screen.render();
  }
}

export { UI };
