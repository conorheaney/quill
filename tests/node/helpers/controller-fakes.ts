import type {} from "node:assert/strict";

interface FakeClock {
  cleared: number[];
  clearTimeout(timer: number): void;
  pendingCount(): number;
  runAll(): void;
  setTimeout(callback: () => void, delay: number): number;
}

interface ControllerCalls {
  errors: Array<{ error: unknown; operation: string }>;
  loaded: unknown[];
  missing: string[];
  newDocuments: number;
  saved: Array<{ context: unknown; result: unknown }>;
  toasts: Array<{ message: string; options: unknown; title: string }>;
}

interface ControllerEvents {
  onError(operation: string, error: unknown): void;
  onLoaded(result: unknown): void;
  onMissingDependency(dependency: string): void;
  onNewDocument(): void;
  onSaved(result: unknown, context: unknown): void;
  showToast(title: string, message: string, options: unknown): void;
}

function createFakeClock(): FakeClock {
  let nextTimer = 1;
  const tasks = new Map<number, { callback: () => void; delay: number }>();
  const cleared: number[] = [];

  return {
    cleared,
    clearTimeout(timer: number): void {
      if (tasks.delete(timer)) {
        cleared.push(timer);
      }
    },
    pendingCount(): number {
      return tasks.size;
    },
    runAll(): void {
      const pending = [...tasks.entries()].sort(([left], [right]) => left - right);
      tasks.clear();
      pending.forEach(([, task]) => task.callback());
    },
    setTimeout(callback: () => void, delay: number): number {
      const timer = nextTimer++;
      tasks.set(timer, { callback, delay });
      return timer;
    }
  };
}

function createControllerEvents(): { calls: ControllerCalls; events: ControllerEvents } {
  const calls = {
    errors: [] as Array<{ error: unknown; operation: string }>,
    loaded: [] as unknown[],
    missing: [] as string[],
    newDocuments: 0,
    saved: [] as Array<{ context: unknown; result: unknown }>,
    toasts: [] as Array<{ message: string; options: unknown; title: string }>
  };

  return {
    calls,
    events: {
      onError(operation: string, error: unknown): void {
        calls.errors.push({ error, operation });
      },
      onLoaded(result: unknown): void {
        calls.loaded.push(result);
      },
      onMissingDependency(dependency: string): void {
        calls.missing.push(dependency);
      },
      onNewDocument(): void {
        calls.newDocuments += 1;
      },
      onSaved(result: unknown, context: unknown): void {
        calls.saved.push({ context, result });
      },
      showToast(title: string, message: string, options: unknown): void {
        calls.toasts.push({ message, options, title });
      }
    }
  };
}

module.exports = {
  createControllerEvents,
  createFakeClock
};
