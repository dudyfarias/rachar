type QueuedTask<T> = {
  id: string;
  execute: () => Promise<T>;
  retries: number;
  maxRetries: number;
  backoffMs: number;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;
const MAX_CONCURRENT = 3;

const pending: QueuedTask<unknown>[] = [];
let running = 0;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function processNext() {
  if (running >= MAX_CONCURRENT || pending.length === 0) return;

  const task = pending.shift();
  if (!task) return;

  running += 1;

  try {
    const result = await task.execute();
    task.resolve(result);
  } catch (error) {
    if (task.retries < task.maxRetries) {
      task.retries += 1;
      const waitMs = task.backoffMs * Math.pow(2, task.retries - 1);
      await delay(waitMs);
      pending.unshift(task);
    } else {
      task.reject(error);
    }
  } finally {
    running -= 1;
    processNext();
  }
}

type EnqueueOptions = {
  maxRetries?: number;
  backoffMs?: number;
};

export function enqueue<T>(
  id: string,
  execute: () => Promise<T>,
  options?: EnqueueOptions,
): Promise<T> {
  const existing = pending.find((t) => t.id === id);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.resolve = resolve as (value: unknown) => void;
      existing.reject = reject;
    });
  }

  return new Promise<T>((resolve, reject) => {
    pending.push({
      id,
      execute,
      retries: 0,
      maxRetries: options?.maxRetries ?? DEFAULT_MAX_RETRIES,
      backoffMs: options?.backoffMs ?? DEFAULT_BACKOFF_MS,
      resolve: resolve as (value: unknown) => void,
      reject,
    });
    processNext();
  });
}

export function queueSize(): number {
  return pending.length + running;
}

export function clearQueue(): void {
  for (const task of pending) {
    task.reject(new Error('Queue cleared'));
  }
  pending.length = 0;
}
