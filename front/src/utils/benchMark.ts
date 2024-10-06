export function measureTime<T>(fn: () => T) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const elapsed = end - start;
  return { elapsed, result };
}
