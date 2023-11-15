import { TestMessages } from "./MessagesTest";
import { SharedKey, Talker } from "./lib";

const testTalker = new Talker<TestMessages>((data) => {
  switch (data.kind) {
    case "buff":
      useBuffer(data.data);
      break;
  }
}, self);

async function useBuffer(key: SharedKey) {
  await testTalker.lockOnShared(key, (view) => {
    view[0] += 1;
    console.log("worker counted", view[0]);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  });
  useBuffer(key);
}
