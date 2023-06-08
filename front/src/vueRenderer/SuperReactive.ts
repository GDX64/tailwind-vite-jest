export class Waker {
  wake = () => true;
  children: { destroy(): void }[] = [];
  destroyCbs: (() => void)[] = [];

  computed<T>(fn: (w: Waker) => T) {
    const comp = new Computed<T>(fn);
    this.children.push(comp);
    return comp;
  }

  onDestroy(fn: () => void) {
    this.destroyCbs.push(fn);
  }

  destroy() {
    this.children.forEach((child) => child.destroy());
    this.destroyCbs.forEach((cb) => cb());
    this.destroyCbs = [];
    this.children = [];
  }
}

interface SignalLike<T> {
  track(waker: Waker): T;
}

export class Signal<T> implements SignalLike<T> {
  wakers: Waker[] = [];
  constructor(public value: T) {}

  track(waker: Waker) {
    if (!this.wakers.includes(waker)) {
      this.wakers.push(waker);
    }
    return this.value;
  }

  write(value: T) {
    this.value = value;
    this.notify();
  }

  notify() {
    this.wakers = this.wakers.filter((waker) => waker.wake());
  }
}

export class Computed<T> implements SignalLike<T> {
  isAwake = true;
  value = null as null | T;
  wakers: Waker[] = [];
  waker = null as null | Waker;
  constructor(public fn: (waker: Waker) => T) {}

  reloadWaker() {
    if (this.waker) {
      this.waker.wake = () => false;
      this.waker.destroy();
    }
    this.waker = new Waker();
    const myRef = new WeakRef(this);
    this.waker.wake = () => myRef.deref()?.awake() ?? false;
    return this.waker;
  }

  awake() {
    this.isAwake = true;
    this.notify();
    return true;
  }

  track(waker: Waker) {
    if (!this.wakers.includes(waker)) this.wakers.push(waker);
    return this.read();
  }

  notify() {
    this.wakers = this.wakers.filter((waker) => waker.wake());
  }

  read() {
    if (this.isAwake) {
      const waker = this.reloadWaker();
      this.value = this.fn(waker);
      this.isAwake = false;
    }
    return this.value!;
  }

  destroy() {
    this.reloadWaker();
  }
}

class BuildNode {
  children = [] as Computed<BuildNode>[];

  constructor(public value?: any) {}
  static new(value?: any): BuildNode {
    return new BuildNode(value);
  }

  add(fn: (waker: Waker) => BuildNode): BuildNode {
    this.children.push(new Computed(fn));
    return this;
  }
}

function main() {
  const sig = new Signal(0);
  BuildNode.new().add((waker) => {
    return BuildNode.new(sig.track(waker));
  });
}
