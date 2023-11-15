import { TestMessages } from "./MessagesTest";
import { SharedKey, Talker } from "./lib";

const testTalker = new Talker<TestMessages>(
  (data) => {
    switch (data.kind) {
      case "buff":
        useBuffer(data.data);
        break;
    }
  },
  (message, transfer) =>
    (self as any as Worker).postMessage(message, transfer ?? []),
  self
);

async function useBuffer(key: SharedKey) {
  await testTalker.lockOnShared(key, (view) => {
    let sum = 0;
    for (let i = 0; i < 100_000_000; i++) {
      sum += i;
    }
    view[0] = sum;
    console.log("worker counted");
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  useBuffer(key);
}
