import { Message, SharedKey } from "./lib";

export type TestMessages = {
  start: Message<{ key: SharedKey; id: number }, string>;
  log: Message<string, void>;
};
