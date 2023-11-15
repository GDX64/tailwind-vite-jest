import { TestMessages } from "./MessagesTest";
import { MessageDataOf, SharedKey, Talker } from "./lib";
import TestWorker from "./TestWorker?worker";
import "./style.css";

const workerClientIDMap = new Map<string, number>();

function createThreads(key: SharedKey) {
  return [...Array(10)].forEach((_, i) => {
    const worker = new TestWorker();
    const testTalker = new Talker<TestMessages>(worker, workerMessage);
    const id = testTalker.send("start", { id: i, key });
    testTalker.awaitResponse(id).then((id) => {
      workerClientIDMap.set(id, i);
    });
  });
}

const container = document.createElement("div");
container.classList.add("container-example");
document.body.appendChild(container);
const counts = document.createElement("div");
container.appendChild(counts);
const currentQueue = document.createElement("div");
container.appendChild(currentQueue);

async function appendCount(message: string) {
  const div = document.createElement("div");
  div.innerText = message;
  counts.insertBefore(div, counts.firstChild);
  await getCurrentQueue();
}

async function getCurrentQueue() {
  const onQueue = await navigator.locks.query();
  const ids =
    onQueue.pending?.map((lock) => {
      const id = workerClientIDMap.get(lock.clientId ?? "") ?? lock.clientId;
      const div = document.createElement("div");
      div.innerText = id?.toString() ?? "unknown";
      return div;
    }) ?? [];
  const hasTheLock = onQueue.held?.[0];
  if (hasTheLock) {
    const div = document.createElement("div");
    div.innerText = `${workerClientIDMap.get(
      hasTheLock.clientId ?? ""
    )} has the 🔒`;
    ids.unshift(div);
  }
  currentQueue.replaceChildren(...ids);
}

function workerMessage(data: MessageDataOf<TestMessages>) {
  switch (data.kind) {
    case "log":
      appendCount(data.data);
      break;
  }
}

const key = Talker.sharedKey(1024);
createThreads(key);

