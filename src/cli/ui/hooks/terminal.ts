import { useEffect, useState } from 'react';

const useTerminalWidth = () => {
  const [width, setWidth] = useState(process.stdout.columns || 80);

  useEffect(() => {
    const handleResize = () => {
      setWidth(process.stdout.columns);
    };

    process.stdout.on('resize', handleResize);

    return () => {
      process.stdout.off('resize', handleResize);
    };
  }, []);

  return width;
};

const useTerminalHeight = () => {
  const [height, setHeight] = useState(process.stdout.rows || 24);

  useEffect(() => {
    const handleResize = () => {
      setHeight(process.stdout.rows);
    };

    process.stdout.on('resize', handleResize);

    return () => {
      process.stdout.off('resize', handleResize);
    };
  }, []);

  return height;
};

export { useTerminalWidth, useTerminalHeight };
