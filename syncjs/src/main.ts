import { TestMessages } from "./MessagesTest";
import { SharedKey, Talker } from "./lib";
import TestWorker from "./TestWorker?worker";

const worker1 = new TestWorker();
const worker2 = new TestWorker();
const worker3 = new TestWorker();
const testTalker1 = new Talker<TestMessages>(worker1, (data) => {});
const testTalker2 = new Talker<TestMessages>(worker2, (data) => {});
const testTalker3 = new Talker<TestMessages>(worker3, (data) => {});

async function useBuffer(arr: SharedKey) {
  await Talker.lockOnShared(arr, (view) => {
    view[0] += 1;
    console.log("main counted", view[0]);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  });
  useBuffer(arr);
}

const arr = Talker.sharedKey(1024);
setTimeout(() => {
  testTalker1.send("buff", arr);
  testTalker2.send("buff", arr);
  testTalker3.send("buff", arr);
  useBuffer(arr);
}, 1000);

