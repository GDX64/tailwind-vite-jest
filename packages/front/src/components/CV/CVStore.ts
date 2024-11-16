import { inject, provide, readonly, Ref, ref } from 'vue';
import { CVData } from './SimpleCVTypes';

function createState(cvdata: CVData) {
  type CVAction = (cv: CVData) => void;
  type ActionPair = { doFn: CVAction; undo: CVAction };
  const data: Ref<CVData> = ref(cvdata);

  const actionStack = [] as ActionPair[];
  const doAgainStack = [] as ActionPair[];

  function doUndo(pair: ActionPair) {
    pair.doFn(data.value);
    actionStack.push(pair);
    doAgainStack.splice(0, doAgainStack.length);
  }

  function undo() {
    const pair = actionStack.pop();
    if (pair) {
      pair.undo(data.value);
      doAgainStack.push(pair);
    }
  }

  function doAgain() {
    const action = doAgainStack.pop();
    action && doUndo(action);
  }

  return { doUndo, undo, doAgain, data: readonly(data) };
}

export function provideCV(data: CVData) {
  const store = createState(data);
  provide('cvdata', store);
  return store;
}

export function injectCV() {
  return inject(
    'cvdata',
    createState({ name: '', arrUserInfo: [], title: '', categories: [] })
  );
}
