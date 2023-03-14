type Waker = () => boolean;

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
    this.wakers = this.wakers.filter((waker) => waker());
  }
}

export class Computed<T> implements SignalLike<T> {
  isAwake = true;
  value = null as null | T;
  wakers: Waker[] = [];
  waker;
  constructor(public fn: (waker: Waker) => T) {
    const waker = new WeakRef(this);
    this.waker = () => waker.deref()?.awake() ?? false;
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
    this.wakers = this.wakers.filter((waker) => waker());
  }

  read() {
    if (this.isAwake) {
      this.value = this.fn(this.waker);
      this.isAwake = false;
    }
    return this.value!;
  }
}
