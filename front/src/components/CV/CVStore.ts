import { inject, provide, readonly, Ref, ref } from 'vue';
import { CVData } from './SimpleCVTypes';

function createState(cvdata: CVData) {
  type CVAction = (cv: CVData) => CVData;
  type ActionPair = { doFn: CVAction; undo: CVAction };
  const data: Ref<CVData> = ref(cvdata);

  const actionStack = [] as ActionPair[];

  function doUndo(pair: ActionPair) {
    data.value = pair.doFn(data.value);
    actionStack.push(pair);
  }

  function undo() {
    data.value = actionStack.pop()?.undo(data.value) ?? data.value;
  }

  return { doUndo, undo, data: readonly(data) };
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
