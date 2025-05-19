import { Box, render, Text, useApp, useInput } from 'ink';
import { ScrollableMarkdown } from './components/scrollable-markdown.js';
import { useStateValue, State, StateProvider } from './state/state.js';
import { useEffect } from 'react';
import { useTerminalHeight } from './hooks/terminal.js';

const MarkdownView = () => {
  const markdown = useStateValue((state) => state.markdown);
  const error = useStateValue((state) => state.error);

  return (
    <Box flexGrow={1} flexDirection="column">
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        <ScrollableMarkdown markdownContent={markdown} />
      </Box>
      {error && (
        <Box flexDirection="column" padding={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </Box>
  );
};

const App = () => {
  const { exit } = useApp();
  const height = useTerminalHeight();
  useInput((_input, key) => {
    if (key.escape) {
      process.exit(0);
    }
  });
  useEffect(() => {
    const enterAltScreenCommand = '\x1b[?1049h';
    const leaveAltScreenCommand = '\x1b[?1049l';
    process.stdout.write(enterAltScreenCommand);
    const onExit = () => {
      exit();
      process.stdout.write(leaveAltScreenCommand);
    };
    process.on('exit', onExit);
    return () => {
      process.stdout.write(leaveAltScreenCommand);
      process.off('exit', onExit);
    };
  }, []);

  return (
    <Box height={height} flexDirection="column">
      <MarkdownView />
      <Box>
        <Text>Press esc to exit</Text>
      </Box>
    </Box>
  );
};

const renderUI = (state: State<ExpectedAny>) => {
  render(
    <StateProvider state={state}>
      <App />
    </StateProvider>,
  );
};

export { renderUI, State };
