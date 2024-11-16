type SubFn<T> = (x: T) => void;

export class Stream<T> {
  subscribers = [] as SubFn<T>[];
  onSubZero = () => {};
  onFirstSub = () => {};
  hasSubscribers = false;

  next(x: T) {
    this.subscribers.forEach((sub) => sub(x));
  }

  subscribe(fn: SubFn<T>) {
    this.subscribers.push(fn);
    if (!this.hasSubscribers) {
      this.onFirstSub();
      this.hasSubscribers = true;
    }
    return () => {
      this.subscribers = this.subscribers.filter((item) => item !== fn);
      if (this.subscribers.length === 0) {
        this.onSubZero();
      }
    };
  }
}

export function map<T, K>(stream: Stream<T>, fn: (x: T) => K): Stream<K> {
  const s = new Stream<K>();
  const unsub = stream.subscribe((x) => {
    s.next(fn(x));
  });
  s.onSubZero = unsub;
  return s;
}

export function switchAll<T>(stream: Stream<Stream<T>>): Stream<T> {
  const s = new Stream<T>();
  let lastUnsub = () => {};
  const unsubFirstStream = stream.subscribe((x) => {
    lastUnsub();
    lastUnsub = x.subscribe((x) => s.next(x));
  });
  s.onSubZero = () => {
    lastUnsub();
    unsubFirstStream();
  };
  return s;
}

export function of<T>(...args: T[]) {
  const s = new Stream<T>();
  s.onFirstSub = () => {
    args.forEach((arg) => s.next(arg));
  };
  return s;
}

type StreamParam<T> = T extends [infer A, ...infer B]
  ? [Stream<A>, ...StreamParam<B>]
  : [];

export function combineStreams<F extends (...args: any[]) => any>(
  fn: F,
  ...args: StreamParam<Parameters<F>>
): Stream<ReturnType<F>> {
  const s = new Stream<ReturnType<F>>();
  const values: any[] = [...Array(args.length)];
  const subs = args.map((father: Stream<any>, index) => {
    return father.subscribe((x) => {
      values[index] = x;
      if (values.every((x) => x != null)) {
        s.next(fn(...values));
      }
    });
  });
  s.onSubZero = () => subs.forEach((sub) => sub());
  return s;
}
