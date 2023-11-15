interface Poster {
  (message: any, transfer?: Transferable[]): void;
}

interface Listener {
  addEventListener: (event: string, callback: (message: any) => void) => void;
}

export type Message<Data = any, Response = void> = {
  data: Data;
  response: Response;
};

type Messages = Record<string, Message<any, any>>;

type MessagesWithKind<M extends Messages> = {
  [K in keyof M]: M[K] & { kind: K; id: KeyFor<M[K]["response"]> };
};

export type KeyFor<T> = number & { __keyFor: T };
export type SharedKey = {
  __arr__: SharedArrayBuffer;
  key: string;
};

const responseKind = "__response__";
export class Talker<M extends Messages> {
  private eventsMap: Map<KeyFor<any>, Set<Function>> = new Map();
  constructor(
    private receive: (data: MessagesWithKind<M>[keyof M]) => void,
    private poster: Poster,
    private listener: Listener
  ) {
    this.listener.addEventListener("message", (message) => {
      if (message.data.kind === responseKind) {
        this.notifyMessage(message.data.id, message.data.data);
      } else {
        this.receive(message.data);
      }
    });
  }

  private notifyMessage<T>(key: KeyFor<T>, data: T) {
    const callbacks = this.eventsMap.get(key);
    if (!callbacks) return;
    for (const callback of callbacks) {
      callback(data);
    }
  }

  send<K extends keyof M>(
    kind: K,
    data: M[K]["data"]
  ): KeyFor<M[K]["response"]>;
  send<K extends keyof M>(
    kind: M[K]["data"] extends void ? K : never
  ): KeyFor<M[K]["response"]>;
  send(kind: any, data?: any): any {
    const id = Math.random() as any;
    this.poster({ kind, data, id });
    return id;
  }

  on<T>(key: KeyFor<T>, cb: (data: T) => void) {
    const callbacks = this.eventsMap.get(key) || new Set();
    callbacks.add(cb);
    this.eventsMap.set(key, callbacks);
    return () => this.eventsMap.get(key)?.delete(cb);
  }

  emit<T>(key: KeyFor<T>, data: T) {
    this.poster({ kind: responseKind, data, id: key });
  }

  sharedKey(size: number): SharedKey {
    const arr = new SharedArrayBuffer(size);
    return {
      __arr__: arr,
      key: Math.random().toString(),
    };
  }

  async lockOnShared<T>(
    { __arr__, key }: SharedKey,
    cb: (view: Uint8Array) => T
  ) {
    console.log("try to lock");
    navigator.locks.request(key, async () => {
      console.log("locked");
      return cb(new Uint8Array(__arr__));
    });
  }
}
