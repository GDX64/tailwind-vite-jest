export type Message<Data = any, Response = void> = {
    data: Data;
    response: Response;
};
interface ListenerPoster {
    postMessage(message: any): void;
    addEventListener(event: "message", cb: (data: any) => void): void;
}
type Messages = Record<string, Message<any, any>>;
type MessagesWithKind<M extends Messages> = {
    [K in keyof M]: M[K] & {
        kind: K;
        id: KeyFor<M[K]["response"]>;
    };
};
export type KeyFor<T> = number & {
    __keyFor: T;
};
export type SharedKey = {
    __arr__: SharedArrayBuffer;
    __key__: string;
};
export type MessageDataOf<M extends Messages> = MessagesWithKind<M>[keyof M];
export declare class Talker<M extends Messages> {
    readonly channel: ListenerPoster;
    private receive;
    private eventsMap;
    constructor(channel: ListenerPoster, receive: (data: MessageDataOf<M>) => void);
    private notifyMessage;
    send<K extends keyof M>(kind: K, data: M[K]["data"]): KeyFor<M[K]["response"]>;
    send<K extends keyof M>(kind: M[K]["data"] extends void ? K : never): KeyFor<M[K]["response"]>;
    on<T>(key: KeyFor<T>, cb: (data: T) => void): () => boolean | undefined;
    awaitResponse<T>(key: KeyFor<T>): Promise<T>;
    response<T>(key: KeyFor<T>, data: T): void;
    static sharedKey(size: number): SharedKey;
    static lockOnShared<T>({ __arr__, __key__: key }: SharedKey, cb: (view: Uint8Array) => T): Promise<any>;
}
export {};
