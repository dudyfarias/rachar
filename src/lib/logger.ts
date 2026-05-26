type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogEntry = {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
};

type LogSink = {
  write: (entry: LogEntry) => void;
};

const LOG_BUFFER_MAX = 200;
const buffer: LogEntry[] = [];

const consoleSink: LogSink = {
  write: (entry) => {
    if (!__DEV__) return;
    const prefix = `[${entry.level.toUpperCase()}]`;
    const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    switch (entry.level) {
      case 'error':
        console.error(`${prefix} ${entry.message}${ctx}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${entry.message}${ctx}`);
        break;
      default:
        console.log(`${prefix} ${entry.message}${ctx}`);
    }
  },
};

let remoteSink: LogSink | null = null;

export function setRemoteLogSink(sink: LogSink) {
  remoteSink = sink;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  buffer.push(entry);
  if (buffer.length > LOG_BUFFER_MAX) buffer.shift();

  consoleSink.write(entry);
  remoteSink?.write(entry);
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
};

export function getLogBuffer(): ReadonlyArray<LogEntry> {
  return buffer;
}

export function clearLogBuffer(): void {
  buffer.length = 0;
}
