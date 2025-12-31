/**
 * Centralized logger service.
 * Currently thin wrapper around console; future: replace with structured logger client.
 */
type LogArgs = Array<unknown>;

export const logger = {
  info: (...args: LogArgs) => {
    // centralized place to adjust levels/format
    // keep minimal for now
    // eslint-disable-next-line no-console
    console.info('[info]', ...args);
  },
  warn: (...args: LogArgs) => {
    // eslint-disable-next-line no-console
    console.warn('[warn]', ...args);
  },
  error: (...args: LogArgs) => {
    // eslint-disable-next-line no-console
    console.error('[error]', ...args);
  },
};

export default logger;
