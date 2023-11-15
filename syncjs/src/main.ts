import { TestMessages } from "./MessagesTest";
import { SharedKey, Talker } from "./lib";
import TestWorker from "./TestWorker?worker";

const worker = new TestWorker();

const testTalker = new Talker<TestMessages>(
  (data) => {
    switch (data.kind) {
      case "buff":
        break;
    }
  },
  (message, transfer) => worker.postMessage(message, transfer ?? []),
  self
);

async function useBuffer(arr: SharedKey) {
  await testTalker.lockOnShared(arr, (view) => {
    let sum = 0;
    for (let i = 0; i < 100_000_000; i++) {
      sum += i;
    }
    view[0] = sum;
    console.log("main counted");
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  useBuffer(arr);
}

const arr = testTalker.sharedKey(1024);
useBuffer(arr);

