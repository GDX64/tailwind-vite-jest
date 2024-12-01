import { Message, SharedKey } from "./talker";
export type TestMessages = {
    start: Message<{
        key: SharedKey;
        id: number;
    }, string>;
    log: Message<string, void>;
};
