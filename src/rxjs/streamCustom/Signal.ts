export class Signal<T> {
  private needsToCalc = false;
  subscribers = [] as Signal<any>[];
  value;
  constructor(private calcValue: () => T) {
    this.value = calcValue();
  }

  clearCache() {
    this.needsToCalc = true;
    this.notifyChange();
  }

  notifyChange() {
    this.subscribers.forEach((s) => s.clearCache());
  }

  addDependencies(d: Signal<any>[]) {
    d.forEach((s) => s.subscribe(this));
  }

  getValue() {
    if (!this.needsToCalc) {
      return this.value;
    }
    const value = this.calcValue();
    if (value !== this.value) {
      this.value = value;
      this.needsToCalc = false;
      this.notifyChange();
    }
    return this.value;
  }

  subscribe(s: Signal<any>) {
    this.subscribers.push(s);
  }
}

type SigParam<T> = T extends [infer A, ...infer B] ? [Signal<A>, ...SigParam<B>] : [];

export function combineSignals<F extends (...args: any[]) => any>(
  fn: F,
  ...args: SigParam<Parameters<F>>
): Signal<ReturnType<F>> {
  const calc = () => fn(...args.map((s: Signal<any>) => s.getValue()));
  const signal = new Signal<ReturnType<F>>(calc);
  signal.addDependencies(args);
  return signal;
}
