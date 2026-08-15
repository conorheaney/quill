function createFakeClock() {
  let nextTimer = 1;
  const tasks = new Map();
  const cleared = [];

  return {
    cleared,
    clearTimeout(timer) {
      if (tasks.delete(timer)) {
        cleared.push(timer);
      }
    },
    pendingCount() {
      return tasks.size;
    },
    runAll() {
      const pending = [...tasks.entries()].sort(([left], [right]) => left - right);
      tasks.clear();
      pending.forEach(([, task]) => task.callback());
    },
    setTimeout(callback, delay) {
      const timer = nextTimer++;
      tasks.set(timer, { callback, delay });
      return timer;
    }
  };
}

function createControllerEvents() {
  const calls = {
    errors: [],
    loaded: [],
    missing: [],
    newDocuments: 0,
    saved: [],
    toasts: []
  };

  return {
    calls,
    events: {
      onError(operation, error) {
        calls.errors.push({ error, operation });
      },
      onLoaded(result) {
        calls.loaded.push(result);
      },
      onMissingDependency(dependency) {
        calls.missing.push(dependency);
      },
      onNewDocument() {
        calls.newDocuments += 1;
      },
      onSaved(result, context) {
        calls.saved.push({ context, result });
      },
      showToast(title, message, options) {
        calls.toasts.push({ message, options, title });
      }
    }
  };
}

module.exports = {
  createControllerEvents,
  createFakeClock
};
