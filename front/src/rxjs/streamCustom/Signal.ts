import { Stream } from './Stream';

export class Signal<T> {
  private needsToCalc = false;
  private subscribers = [] as Signal<any>[];
  private clearFns = [] as (() => void)[];
  value;
  constructor(private calcValue: () => T) {
    this.value = calcValue();
  }

  static fromStream<T>(s: Stream<T>, initial: T): Signal<T> {
    const signal = new Signal<T>(() => initial);
    signal.clearFns = [
      s.subscribe((x) => {
        signal.value = x;
        signal.notifyChange();
      }),
    ];
    return signal;
  }

  clearCache() {
    if (!this.needsToCalc) {
      this.needsToCalc = true;
      this.notifyChange();
    }
  }

  notifyChange() {
    this.subscribers.forEach((s) => s.clearCache());
  }

  addDependencies(d: Signal<any>[]) {
    this.clearFns = d.map((s) => s.subscribe(this));
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
    return () => (this.subscribers = this.subscribers.filter((item) => item !== s));
  }

  dispose() {
    this.clearFns.forEach((fn) => fn());
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
