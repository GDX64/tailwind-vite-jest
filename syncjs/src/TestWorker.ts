import { TestMessages } from "./MessagesTest";
import { SharedKey, Talker } from "./lib";

const talker = new Talker<TestMessages>(self, async (message) => {
  switch (message.kind) {
    case "start":
      self.name = `thread ${message.data.id}`;
      useBuffer(message.data.key, message.data.id);
      talker.response(message.id, await getMylockId());
      break;
  }
});

async function useBuffer(key: SharedKey, id: number) {
  talker.send("log", `thread ${id} ask the lock \u{1F64F}`);
  await Talker.lockOnShared(key, (view) => {
    talker.send("log", `thread ${id} got the lock \u{1F510}`);
    view[0] += 1;
    talker.send("log", `thread ${id} counted: ${view[0]} \u2795`);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  });
  talker.send("log", `thread ${id} release the lock \u{1F513}`);
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
  useBuffer(key, id);
}

async function getMylockId() {
  const lockName = Math.random().toString();
  const result = await navigator.locks.request(lockName, async () => {
    const { held } = await navigator.locks.query();
    return held?.find((lock) => lock.name === lockName)?.clientId;
  });
  return result ?? "unknown";
}
