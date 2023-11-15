import { TestMessages } from "./MessagesTest";
import { SharedKey, Talker } from "./lib";

new Talker<TestMessages>(self, (data) => {
  switch (data.kind) {
    case "buff":
      useBuffer(data.data);
      break;
  }
});

async function useBuffer(key: SharedKey) {
  await Talker.lockOnShared(key, (view) => {
    view[0] += 1;
    console.log("worker counted", view[0]);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  });
  useBuffer(key);
}
