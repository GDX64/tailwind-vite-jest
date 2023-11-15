import { TestMessages } from "./MessagesTest";
import { SharedKey, Talker } from "./lib";
import TestWorker from "./TestWorker?worker";

const worker = new TestWorker();

const testTalker = new Talker<TestMessages>((data) => {
  switch (data.kind) {
    case "buff":
      break;
  }
}, worker);

async function useBuffer(arr: SharedKey) {
  await testTalker.lockOnShared(arr, (view) => {
    view[0] += 1;
    console.log("main counted", view[0]);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  });
  useBuffer(arr);
}

const arr = testTalker.sharedKey(1024);
setTimeout(() => {
  testTalker.send("buff", arr);
  useBuffer(arr);
}, 1000);

