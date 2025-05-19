import React, { useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import wrapAnsi from 'wrap-ansi';
import os from 'os';
import { useTerminalHeight, useTerminalWidth } from '../hooks/terminal.js';

type ScrollableMarkdownProps = {
  markdownContent: string;
};

const renderer = new TerminalRenderer({});
marked.setOptions({ renderer: renderer as ExpectedAny });

const ScrollableMarkdown = ({ markdownContent }: ScrollableMarkdownProps) => {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const terminalHeight = useTerminalHeight();
  const terminalWidth = useTerminalWidth();
  const rendered = useMemo(() => {
    return marked(markdownContent) as string;
  }, [markdownContent]);
  const wrapped = useMemo(() => {
    return wrapAnsi(rendered, terminalWidth, {
      hard: true,
      trim: false,
      wordWrap: true,
    }).split(os.EOL);
  }, [rendered, terminalWidth]);

  const buffer = useMemo(() => {
    return wrapped.slice(scrollPosition, scrollPosition + terminalHeight).join(os.EOL);
  }, [wrapped, scrollPosition, terminalHeight]);

  useInput((input, key) => {
    if (key.downArrow) {
      setScrollPosition((prev) => prev + 1);
    }
    if (key.upArrow) {
      setScrollPosition((prev) => Math.max(0, prev - 1));
    }
    if (key.escape) {
      process.exit(0);
    }
    console.error('a', input, key);
  });

  return (
    <Box flexDirection="column" flexShrink={1} flexGrow={1} overflow="hidden">
      <Text>{buffer}</Text>
    </Box>
  );
};

export { ScrollableMarkdown };
